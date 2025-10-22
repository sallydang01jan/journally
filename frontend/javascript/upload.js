// frontend/javascript/upload.js
import { apiFetch, showAlert, requireAuth, getToken, parseJwt, removeToken } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // ✅ Kiểm tra token + auth
  // =========================
  const token = getToken();
  if (!token) {
    window.location.href = "../html/auth.html";
  } else {
    try {
      const payload = parseJwt(token);
      const now = Date.now() / 1000;
      if (payload.exp < now) {
        removeToken();
        window.location.href = "../html/auth.html";
      }
    } catch (err) {
      removeToken();
      window.location.href = "../html/auth.html";
    }
  }

  // Chặn người dùng chưa đăng nhập
  requireAuth();

  // =========================
  // 🔹 Lấy element
  // =========================
  const uploadForm = document.getElementById("upload-form");
  const fileInput = document.getElementById("file-input");
  const preview = document.getElementById("file-preview");

  if (!uploadForm || !fileInput || !preview) {
    console.error("❌ Không tìm thấy các element cần thiết cho upload!");
    return;
  }

  // =========================
  // 🔹 Preview file
  // =========================
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    preview.innerHTML = "";
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      preview.innerHTML = `<img src="${url}" alt="Preview" class="preview-img">`;
    } else if (file.type.startsWith("video/")) {
      preview.innerHTML = `<video controls class="preview-video"><source src="${url}" type="${file.type}"></video>`;
    } else if (file.type.startsWith("audio/")) {
      preview.innerHTML = `<audio controls><source src="${url}" type="${file.type}"></audio>`;
    } else {
      showAlert("❌ File không hợp lệ.", "danger");
    }
  });

  // =========================
  // 🔹 Upload file
  // =========================
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      showAlert("⚠️ Vui lòng chọn file.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Thêm token Authorization để hợp với media.routes.js
      const data = await apiFetch(`${API_BASE_URL}/media/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      showAlert("✅ Tải lên thành công!", "success");

      if (data.url) {
        preview.innerHTML += `<p><a href="${data.url}" target="_blank">${data.url}</a></p>`;
      }

      fileInput.value = ""; // reset input
    } catch (err) {
      console.error("🔥 Lỗi upload:", err);
      showAlert(`❌ Lỗi: ${err.message || "Upload thất bại"}`, "danger");
    }
  });
});
