// frontend/javascript/create-post.js
import {
  getToken,
  escapeHTML,
  requireAuth,
  showAlert,
  parseJwt,
  removeToken,
  apiFetch,
} from "./utils.js";
import { createPostCard } from "./createComponents.js";

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const token = getToken();
  if (!token) return redirectToAuth();
  if (isTokenExpired(token)) return handleExpiredToken();

  const form = document.getElementById("create-post-form");
  const contentInput = document.getElementById("post-input");
  const postContainer = document.getElementById("post-container");

  const messageBox = createMessageBox();
  const previewBox = createPreviewBox();
  const fileInput = createHiddenFileInput(form);

  let selectedFiles = [];

  form.append(previewBox, messageBox);

  setupFilePicker(".photos-icon", "image", fileInput);
  setupFilePicker(".video-icon", "video", fileInput);
  setupFilePicker(".music-icon", "audio", fileInput);
  setupDragAndDrop(previewBox, handleSelectedFiles);

  fileInput.addEventListener("change", (e) =>
    handleSelectedFiles(Array.from(e.target.files))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetMessageBox();

    const content = contentInput.value.trim();
    if (!content && !selectedFiles.length) {
      return showAlert("⚠️ Vui lòng nhập nội dung hoặc chọn file.", "error");
    }

    try {
      showAlert("⏳ Đang đăng bài...", "info");
      const post = await createPost(content, selectedFiles);

      showAlert("🎉 Đăng bài thành công!", "success");

      // 🔔 Thông báo bài mới cho tab khác
      localStorage.setItem("newPostEvent", Date.now());

      if (post && postContainer) {
        const postCard = createPostCard(post);
        postContainer.prepend(postCard);
      }

      resetForm();
    } catch (err) {
      console.error("Lỗi khi đăng bài:", err);
      if (err.status === 401 || /token/i.test(err.message)) {
        handleExpiredToken();
      } else {
        showAlert(err.message || "Lỗi khi đăng bài", "error");
      }
    }
  });

  // -----------------------------
  // Functions
  // -----------------------------
  function handleSelectedFiles(files) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    files.forEach((file) => {
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        return showAlert(`⚠️ File ${file.name} đã được chọn.`, "warning");
      }

      if (!["image", "video", "audio"].some((t) => file.type.startsWith(t))) {
        return showAlert(`❌ File ${file.name} không hợp lệ.`, "error");
      }

      if (file.size > MAX_SIZE) {
        return showAlert(`❌ File ${file.name} quá lớn (>10MB).`, "error");
      }

      selectedFiles.push(file);
      previewBox.appendChild(createPreviewItem(file, () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
      }));
    });
  }

  function resetForm() {
    contentInput.value = "";
    previewBox.innerHTML = "";
    selectedFiles = [];
    resetMessageBox();
  }

  function resetMessageBox() {
    messageBox.textContent = "";
    messageBox.className = "";
  }
});

// -----------------------------
// Helpers
// -----------------------------
function redirectToAuth() {
  window.location.href = "../html/auth.html";
}

function handleExpiredToken() {
  removeToken();
  showAlert("🔒 Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", "warning");
  setTimeout(() => redirectToAuth(), 1500);
}

function isTokenExpired(token) {
  try {
    const payload = parseJwt(token);
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

function createMessageBox() {
  const p = document.createElement("p");
  p.id = "post-message";
  return p;
}

function createPreviewBox() {
  const div = document.createElement("div");
  div.id = "post-preview";
  div.classList.add("drop-zone");
  div.textContent = "Kéo thả file vào đây hoặc chọn bằng nút trên";
  return div;
}

function createHiddenFileInput(form) {
  const input = document.createElement("input");
  input.type = "file";
  input.hidden = true;
  input.multiple = true;
  form.appendChild(input);
  return input;
}

function setupFilePicker(selector, type, input) {
  const btn = document.querySelector(selector);
  btn?.addEventListener("click", () => {
    input.accept = `${type}/*`;
    input.click();
  });
}

function setupDragAndDrop(dropZone, onDropFiles) {
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragover")
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    onDropFiles(Array.from(e.dataTransfer.files));
  });
}

function createPreviewItem(file, onRemove) {
  const url = URL.createObjectURL(file);
  const wrapper = document.createElement("div");
  wrapper.className = "preview-wrapper";

  let mediaHTML = "";
  if (file.type.startsWith("image/")) {
    mediaHTML = `<img src="${url}" class="preview-img" alt="Ảnh tải lên">`;
  } else if (file.type.startsWith("video/")) {
    mediaHTML = `<video controls class="preview-video"><source src="${url}" type="${file.type}"></video>`;
  } else if (file.type.startsWith("audio/")) {
    mediaHTML = `<audio controls><source src="${url}" type="${file.type}"></audio>`;
  }

  wrapper.innerHTML = `${mediaHTML}<button class="remove-file-btn">❌</button>`;
  wrapper.querySelector(".remove-file-btn").addEventListener("click", () => {
    onRemove();
    wrapper.remove();
  });

  return wrapper;
}

// -----------------------------
// API
// -----------------------------
async function createPost(content, files) {
  const token = getToken();
  if (!token) throw new Error("Vui lòng đăng nhập trước khi đăng bài.");

  const mediaUrls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/upload/media", {
        method: "POST",
        body: formData,
        skipJson: true,
      });

      if (!res || res.status === 401) throw { status: 401, message: "Token expired" };
      const data = await res.json?.() || res;
      mediaUrls.push(data.url || data.file?.url || data.file?.filename);
    } catch (err) {
      console.error(`❌ Lỗi upload file ${file.name}:`, err);
      showAlert(`❌ Lỗi upload file ${file.name}`, "error");
    }
  }

  const payload = {
    content: content ? escapeHTML(content) : "",
    media: mediaUrls.length ? mediaUrls : undefined,
  };

  const created = await apiFetch("/posts", { method: "POST", body: payload });
  return created.post || created;
}
