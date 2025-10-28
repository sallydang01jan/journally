import { apiFetch, getToken, API_BASE_URL, handleApiError, escapeHTML } from "../javascript/utils.js";
import { createPostCard } from "../javascript/createComponents.js";
import { initComments } from "../javascript/comments.js"; // import initComments

async function loadFeed() {
  const token = getToken();
  const postContainer = document.getElementById("post-container");

  if (!token) {
    if (postContainer) postContainer.innerHTML = `<p class="text-danger">Vui lòng đăng nhập để xem bài viết.</p>`;
    return;
  }

  try {
    const posts = await apiFetch(`${API_BASE_URL}/feed`, "GET", null, token);

    if (!postContainer) return;

    postContainer.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      postContainer.innerHTML = `<p class="text-muted">Chưa có bài viết nào.</p>`;
      return;
    }

    posts.forEach(post => {
      post.content = escapeHTML(post.content);

      const card = createPostCard(post);

      // Lấy container comment + form + textarea bên trong card
      const commentsContainer = card.querySelector(".comments-container");
      const commentForm = card.querySelector(".comment-input");
      const commentTextarea = card.querySelector("textarea");

      // Khởi tạo comment cho post này
      initComments(post._id, commentsContainer, commentForm, commentTextarea);

      postContainer.appendChild(card);
    });

  } catch (err) {
    handleApiError(err, "Không thể tải bài viết");
    if (postContainer) postContainer.innerHTML = `<p class="text-danger">Không thể tải bài viết. Vui lòng thử lại sau.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadFeed);
