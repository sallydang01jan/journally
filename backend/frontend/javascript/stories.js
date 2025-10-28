// stories.js
import { API_BASE_URL, apiFetch, formatDate, getToken, escapeHTML, showAlert, handleApiError } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const addStoryBtn = document.querySelector(".add-story .frame");
  const storiesContainer = document.querySelector(".stories");

  if (!storiesContainer) return console.error("❌ Không tìm thấy container stories!");
  if (!addStoryBtn) return console.error("❌ Không tìm thấy nút thêm story!");

  // Tạo input file ẩn
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*";
  fileInput.classList.add("d-none");
  document.body.appendChild(fileInput);

  // =========================
  // 🔄 Load stories từ server
  // =========================
  async function loadStories() {
    const token = getToken();
    if (!token) {
      showAlert("Vui lòng đăng nhập để xem stories!", "warning");
      storiesContainer.innerHTML = `<p class="text-warning">Vui lòng đăng nhập</p>`;
      return;
    }

    try {
      const stories = await apiFetch(`${API_BASE_URL}/stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      renderStories(stories);
    } catch (err) {
      handleApiError(err, "Không thể tải stories");
      storiesContainer.innerHTML = `<p class="text-danger">⚠️ Không thể tải stories!</p>`;
    }
  }

  // =========================
  // 🖼 Render stories
  // =========================
  function renderStories(stories) {
    // Xóa story cũ (giữ lại nút "Tin mới")
    storiesContainer.querySelectorAll(".story").forEach(story => story.remove());

    stories.forEach(story => {
      const article = document.createElement("article");
      article.classList.add("story");

      const username = escapeHTML(story.user.username || "Ẩn danh");
      const caption = escapeHTML(story.caption || "");
      const timestamp = story.createdAt ? `<span class="timestamp">${formatDate(story.createdAt)}</span>` : "";

      if (story.type === "image") {
        article.innerHTML = `
          <img class="ellipse" src="${story.mediaUrl}" alt="${username}" />
          <span class="text-wrapper">${username}</span>
          ${timestamp}
        `;
      } else if (story.type === "video") {
        article.innerHTML = `
          <video class="ellipse" muted>
            <source src="${story.mediaUrl}" type="video/mp4">
          </video>
          <span class="text-wrapper">${username}</span>
          ${timestamp}
        `;
      }

      article.addEventListener("click", () => openStory(story));
      storiesContainer.appendChild(article);
    });
  }

  // =========================
  // 📺 Xem story (popup)
  // =========================
  function openStory(story) {
    const overlay = document.createElement("div");
    overlay.classList.add("story-overlay");

    const caption = escapeHTML(story.caption || "");
    const timestamp = story.createdAt ? formatDate(story.createdAt) : "";

    overlay.innerHTML = `
      <div class="story-view">
        ${
          story.type === "image"
            ? `<img src="${story.mediaUrl}" alt="Story" />`
            : `<video controls autoplay><source src="${story.mediaUrl}" type="video/mp4"></video>`
        }
        <p>${caption}</p>
        <p class="timestamp">${timestamp}</p>
        <button class="close-btn">×</button>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector(".close-btn").addEventListener("click", () => overlay.remove());
  }

  // =========================
  // ➕ Thêm story mới
  // =========================
  addStoryBtn.addEventListener("click", () => {
    const token = getToken();
    if (!token) {
      showAlert("Vui lòng đăng nhập để đăng story!", "warning");
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith("video/") ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload file
      const uploadData = await apiFetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const mediaUrl = uploadData.file.url || uploadData.file.filename;

      // Tạo story mới
      const token = getToken();
      await apiFetch(`${API_BASE_URL}/stories`, {
        method: "POST",
        body: { mediaUrl, type, caption: "" },
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert("✅ Tin đã được đăng!", "success");
      loadStories();
    } catch (err) {
      handleApiError(err, "Không thể đăng story");
    }
  });

  // =========================
  // 🚀 Khởi động
  // =========================
  loadStories();
});
