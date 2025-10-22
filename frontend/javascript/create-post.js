// 📁 frontend/javascript/create-post.js
import {
  API_BASE_URL,
  getToken,
  escapeHTML,
  requireAuth,
  showAlert,
  parseJwt,
  removeToken
} from "./utils.js";
import { createPostCard } from "./createComponents.js";

document.addEventListener("DOMContentLoaded", () => {
  requireAuth(); 
  const token = getToken();
  if (!token) return;

  // Kiểm tra token hết hạn
  try {
    const payload = parseJwt(token);
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      removeToken();
      window.location.href = "../html/auth.html";
    }
  } catch {
    removeToken();
    window.location.href = "../html/auth.html";
  }

  const form = document.getElementById("create-post-form");
  const contentInput = document.getElementById("post-input");
  const photosBtn = document.querySelector(".photos-icon");
  const videoBtn = document.querySelector(".video-icon");
  const musicBtn = document.querySelector(".music-icon");
  const postContainer = document.getElementById("post-container");

  const messageBox = document.createElement("p");
  const previewBox = document.createElement("div");
  previewBox.classList.add("drop-zone");
  previewBox.textContent = "Kéo thả file vào đây hoặc chọn bằng nút trên";

  let selectedFiles = [];

  messageBox.id = "post-message";
  previewBox.id = "post-preview";
  form.append(previewBox, messageBox);

  // 🖼️ Input file ẩn
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.hidden = true;
  fileInput.multiple = true;
  form.appendChild(fileInput);

  // Nút media chọn file
  const setupFilePicker = (btn, type) => {
    btn?.addEventListener("click", () => {
      fileInput.accept = `${type}/*`;
      fileInput.click();
    });
  };
  setupFilePicker(photosBtn, "image");
  setupFilePicker(videoBtn, "video");
  setupFilePicker(musicBtn, "audio");

  // 🖱️ Drag & Drop
  previewBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    previewBox.classList.add("dragover");
  });

  previewBox.addEventListener("dragleave", () => {
    previewBox.classList.remove("dragover");
  });

  previewBox.addEventListener("drop", (e) => {
    e.preventDefault();
    previewBox.classList.remove("dragover");
    handleSelectedFiles(Array.from(e.dataTransfer.files));
  });

  // Max size
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // 🧩 Xử lý file chọn
  function handleSelectedFiles(files) {
    files.forEach(file => {
      if (!["image", "video", "audio"].some(t => file.type.startsWith(t))) {
        showAlert(messageBox, "text-danger", `❌ File ${file.name} không hợp lệ.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        showAlert(messageBox, "text-danger", `❌ File ${file.name} quá lớn (>10MB).`);
        return;
      }

      selectedFiles.push(file);

      const url = URL.createObjectURL(file);
      let previewEl;

      if (file.type.startsWith("image/")) {
        previewEl = document.createElement("div");
        previewEl.className = "preview-wrapper";
        previewEl.innerHTML = `<img src="${url}" class="preview-img" alt="Ảnh tải lên">
                               <button class="remove-file-btn">❌</button>`;
      } else if (file.type.startsWith("video/")) {
        previewEl = document.createElement("div");
        previewEl.className = "preview-wrapper";
        previewEl.innerHTML = `<video controls class="preview-video">
                                <source src="${url}" type="${file.type}">
                               </video>
                               <button class="remove-file-btn">❌</button>`;
      } else if (file.type.startsWith("audio/")) {
        previewEl = document.createElement("div");
        previewEl.className = "preview-wrapper";
        previewEl.innerHTML = `<audio controls>
                                <source src="${url}" type="${file.type}">
                               </audio>
                               <button class="remove-file-btn">❌</button>`;
      }

      const removeBtn = previewEl.querySelector(".remove-file-btn");
      removeBtn.addEventListener("click", () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
        previewEl.remove();
      });

      previewBox.appendChild(previewEl);
    });
  }

  fileInput.addEventListener("change", (e) => handleSelectedFiles(Array.from(e.target.files)));

  // 📝 Gửi bài viết
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageBox.textContent = "";
    messageBox.className = "";

    const content = contentInput.value.trim();
    if (!content && !selectedFiles.length) {
      showAlert(messageBox, "text-danger", "⚠️ Vui lòng nhập nội dung hoặc chọn file.");
      return;
    }

    try {
      const formData = new FormData();
      if (content) formData.append("content", escapeHTML(content));
      selectedFiles.forEach(file => formData.append("file", file));

      showAlert(messageBox, "text-info", "⏳ Đang đăng bài...");

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(messageBox, "text-danger", `⚠️ ${data.message || "Không thể đăng bài"}`);
        throw new Error(data.message || "Không thể đăng bài");
      }

      showAlert(messageBox, "text-success", "🎉 Đăng bài thành công!");

      if (data.post && postContainer) {
        const postCard = createPostCard(data.post);
        postContainer.prepend(postCard);

        // Nút xem bài viết
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "Xem bài viết";
        viewBtn.className = "btn btn-primary mt-2";
        viewBtn.addEventListener("click", () => {
          window.location.href = `../html/posts.html?id=${data.post._id}`;
        });
        messageBox.appendChild(viewBtn);
      }

      // Reset form
      contentInput.value = "";
      previewBox.innerHTML = "";
      selectedFiles = [];
    } catch (err) {
      console.error("🔥 Lỗi khi đăng bài:", err);
      showAlert(messageBox, "text-danger", `⚠️ ${err.message || "Lỗi kết nối server."}`);
    }
  });
});
