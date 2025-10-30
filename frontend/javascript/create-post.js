// frontend/javascript/create-post.js
import {
  API_BASE_URL,
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

  if (isTokenExpired(token)) {
    removeToken();
    return redirectToAuth();
  }

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
    messageBox.textContent = "";
    messageBox.className = "";

    const content = contentInput.value.trim();
    if (!content && !selectedFiles.length) {
      return showAlert("⚠️ Vui lòng nhập nội dung hoặc chọn file.", "error");
    }

    try {
      showAlert("⏳ Đang đăng bài...", "info");

      const post = await createPost(content, selectedFiles);

      showAlert("🎉 Đăng bài thành công!", "success");
      if (post && postContainer) {
        const postCard = createPostCard(post);
        postContainer.prepend(postCard);
      }

      resetForm(contentInput, previewBox);
      selectedFiles = [];
    } catch (err) {
      console.error("Lỗi khi đăng bài:", err);
      showAlert(err.message || "Lỗi khi đăng bài", "error");
    }
  });

  function handleSelectedFiles(files) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    files.forEach((file) => {
      if (!["image", "video", "audio"].some((t) => file.type.startsWith(t))) {
        return showAlert(`❌ File ${file.name} không hợp lệ.`, "error");
      }
      if (file.size > MAX_SIZE) {
        return showAlert(`❌ File ${file.name} quá lớn (>10MB).`, "error");
      }

      selectedFiles.push(file);
      previewBox.appendChild(
        createPreviewItem(file, () => {
          selectedFiles = selectedFiles.filter((f) => f !== file);
        })
      );
    });
  }
});

// helpers
function redirectToAuth() {
  window.location.href = "../html/auth.html";
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
  wrapper
    .querySelector(".remove-file-btn")
    .addEventListener("click", () => {
      onRemove();
      wrapper.remove();
    });

  return wrapper;
}

async function createPost(content, files) {
  const token = getToken();
  if (!token) throw new Error("Vui lòng đăng nhập trước khi đăng bài.");

  // upload files first if any (assume backend accepts /media/upload)
  const mediaUrls = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    // use fetch here so we can send FormData; apiFetch could be extended to accept FormData too
    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload thất bại");
    // assume backend returns { url }
    mediaUrls.push(data.url || data.file?.url || data.file?.filename);
  }

  const payload = {
    content: content ? escapeHTML(content) : "",
    media: mediaUrls.length ? mediaUrls : undefined,
  };

  const created = await apiFetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    body: payload,
  });

  // backend should return post in created
  return created.post || created;
}

function resetForm(input, previewBox) {
  input.value = "";
  previewBox.innerHTML = "";
}
