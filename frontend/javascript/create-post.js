// 📁 frontend/javascript/create-post.js
import {
  API_BASE_URL,
  getToken,
  escapeHTML,
  requireAuth,
  showAlert,
  parseJwt,
  removeToken,
} from "./utils.js";
import { createPostCard } from "./createComponents.js";

document.addEventListener("DOMContentLoaded", () => {
  // 🔐 Kiểm tra token & xác thực
  requireAuth();
  const token = getToken();
  if (!token) return redirectToAuth();

  if (isTokenExpired(token)) {
    removeToken();
    return redirectToAuth();
  }

  // 🎯 DOM elements
  const form = document.getElementById("create-post-form");
  const contentInput = document.getElementById("post-input");
  const postContainer = document.getElementById("post-container");
  const messageBox = createMessageBox();
  const previewBox = createPreviewBox();
  const fileInput = createHiddenFileInput(form);

  let selectedFiles = [];

  form.append(previewBox, messageBox);

  // 🖼️ Media buttons
  setupFilePicker(".photos-icon", "image", fileInput);
  setupFilePicker(".video-icon", "video", fileInput);
  setupFilePicker(".music-icon", "audio", fileInput);

  // 🖱️ Drag & drop
  setupDragAndDrop(previewBox, handleSelectedFiles);

  // 📂 Xử lý file
  fileInput.addEventListener("change", (e) =>
    handleSelectedFiles(Array.from(e.target.files))
  );

  // 📝 Gửi bài viết
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageBox.textContent = "";
    messageBox.className = "";

    const content = contentInput.value.trim();
    if (!content && !selectedFiles.length) {
      return showAlert(messageBox, "text-danger", "⚠️ Vui lòng nhập nội dung hoặc chọn file.");
    }

    try {
      showAlert(messageBox, "text-info", "⏳ Đang đăng bài...");

      const post = await createPost(content, selectedFiles, token);

      showAlert(messageBox, "text-success", "🎉 Đăng bài thành công!");
      if (post && postContainer) {
        const postCard = createPostCard(post);
        postContainer.prepend(postCard);
        addViewPostButton(messageBox, post._id);
      }

      resetForm(contentInput, previewBox);
      selectedFiles = [];
    } catch (err) {
      console.error("🔥 Lỗi khi đăng bài:", err);
      showAlert(messageBox, "text-danger", `⚠️ ${err.message || "Lỗi kết nối server."}`);
    }
  });

  // 📦 Các hàm phụ
  function handleSelectedFiles(files) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    files.forEach((file) => {
      if (!["image", "video", "audio"].some((t) => file.type.startsWith(t))) {
        return showAlert(messageBox, "text-danger", `❌ File ${file.name} không hợp lệ.`);
      }
      if (file.size > MAX_SIZE) {
        return showAlert(messageBox, "text-danger", `❌ File ${file.name} quá lớn (>10MB).`);
      }

      selectedFiles.push(file);
      previewBox.appendChild(createPreviewItem(file, () => {
        selectedFiles = selectedFiles.filter((f) => f !== file);
      }));
    });
  }
});

// 🔧 HÀM TIỆN ÍCH ---------------------------------------------------
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

  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
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

async function createPost(content, files, token) {
  const formData = new FormData();
  if (content) formData.append("content", escapeHTML(content));
  files.forEach((file) => formData.append("file", file));

  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không thể đăng bài");
  return data.post;
}

function addViewPostButton(container, postId) {
  const btn = document.createElement("button");
  btn.textContent = "Xem bài viết";
  btn.className = "btn btn-primary mt-2";
  btn.addEventListener("click", () => {
    window.location.href = `../html/posts.html?id=${postId}`;
  });
  container.appendChild(btn);
}

function resetForm(input, previewBox) {
  input.value = "";
  previewBox.innerHTML = "";
}
