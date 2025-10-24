// 📁 frontend/javascript/main.js
import { loadAllComponents } from "./components.js";
import {
  API_BASE_URL,
  getAuthToken,
  fetchData,
  isAuthenticated,
  getUserData,
  handleApiError,
  escapeHTML,
  showAlert
} from "./utils.js";
import { createPostCard } from "./createComponents.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllComponents();

  const addStoryBtn = document.querySelector(".add-story .frame");
  const userNameEl = document.querySelector(".header-username");
  const postContainer = document.querySelector("#post-container");

  const token = getAuthToken();
  if (isAuthenticated() && token) {
    const user = getUserData();
    if (userNameEl) userNameEl.textContent = user.username || "User";
  } else {
    if (addStoryBtn) addStoryBtn.style.display = "none";
  }

  // Input ẩn upload story
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*";
  fileInput.classList.add("d-none");
  document.body.appendChild(fileInput);

  // =======================
  // 🔄 Load posts
  // =======================
  async function loadPosts() {
    if (!postContainer) return console.error("❌ Không tìm thấy container #post-container");

    if (!token) {
      postContainer.innerHTML = `<p class="text-warning">Vui lòng đăng nhập để xem bài viết.</p>`;
      return;
    }

    try {
      const posts = await fetchData(`${API_BASE_URL}/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!Array.isArray(posts) || posts.length === 0) {
        postContainer.innerHTML = `<p class="text-muted text-center mt-3">Chưa có bài viết nào 🌙</p>`;
        return;
      }

      postContainer.innerHTML = "";
      posts.forEach(post => {
        if (post.content) post.content = escapeHTML(post.content);
        postContainer.appendChild(createPostCard(post));
      });
    } catch (err) {
      handleApiError(err, "Không thể tải bài viết");
      postContainer.innerHTML = `<p class="text-danger">Lỗi tải bài viết. Vui lòng thử lại sau.</p>`;
    }
  }

  // =======================
  // ➕ Thêm story
  // =======================
  if (addStoryBtn) {
    addStoryBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        // 1️⃣ Upload file
        const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${token}` }
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Upload thất bại");

        const mediaUrl = uploadData.url;
        const type = file.type.startsWith("video/") ? "video" : "image";

        // 2️⃣ Tạo story
        const storyRes = await fetch(`${API_BASE_URL}/stories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ mediaUrl, type, caption: "" })
        });
        const storyData = await storyRes.json();
        if (!storyRes.ok) throw new Error(storyData.message || "Tạo story thất bại");

        showAlert("✅ Story đã được đăng!", "success");
      } catch (err) {
        console.error(err);
        showAlert("❌ Upload story thất bại", "error");
      }
    });
  }

  loadPosts();
});
