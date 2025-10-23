// 📁 frontend/javascript/main.js
import { loadAllComponents } from "./components.js";
import {
  API_BASE_URL,
  getAuthToken,
  fetchData,
  isAuthenticated,
  getUserData,
  handleApiError,
  escapeHTML
} from "./utils.js";
import { createPostCard } from "./createComponents.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 🧩 Bước 1: Load toàn bộ component trước
  await loadAllComponents();

  // 🧩 Bước 2: Tiếp tục logic sau khi component đã sẵn sàng
  const addStoryBtn = document.querySelector(".add-story .frame");
  const userNameEl = document.querySelector(".header-username");
  const postContainer = document.querySelector("#post-container");

  // 🔹 Hiển thị tên người dùng nếu đăng nhập
  const token = getAuthToken();
  if (isAuthenticated() && token) {
    const user = getUserData();
    if (userNameEl) userNameEl.textContent = user.username || "User";
  } else {
    if (addStoryBtn) addStoryBtn.style.display = "none";
  }

  // 🔹 Tạo input ẩn cho upload story
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*";
  fileInput.classList.add("d-none");
  document.body.appendChild(fileInput);

  // 🔄 Load posts
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

  // 🔽 Cuối cùng: gọi hàm loadPosts()
  loadPosts();
});
