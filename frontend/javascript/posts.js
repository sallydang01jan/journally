import {
  apiFetch,
  getToken,
  API_BASE_URL,
  handleApiError,
  escapeHTML,
  removeToken,
  parseJwt,
  showAlert,
} from "./utils.js";
import { createPostCard } from "./createComponents.js";
import { initComments } from "./comments.js";

document.addEventListener("DOMContentLoaded", loadFeed);

async function loadFeed() {
  const token = getToken();
  const postContainer = document.getElementById("post-container");

  if (!postContainer) return;

  if (!token) {
    postContainer.innerHTML = `<p class="text-danger">Vui lòng đăng nhập để xem bài viết.</p>`;
    return;
  }

  if (isTokenExpired(token)) {
    handleExpiredToken();
    return;
  }

  try {
    const posts = await apiFetch(`${API_BASE_URL}/feed`);

    postContainer.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      postContainer.innerHTML = `<p class="text-muted">Chưa có bài viết nào.</p>`;
      return;
    }

    posts.forEach((post) => {
      if (post.content) post.content = escapeHTML(post.content);

      const card = createPostCard(post);

      // Gắn khối comment cho từng bài
      const commentsContainer = card.querySelector(".comments-container");
      const commentForm = card.querySelector(".comment-input");
      const commentTextarea = card.querySelector("textarea");

      initComments(post._id, commentsContainer, commentForm, commentTextarea);

      postContainer.appendChild(card);
    });
  } catch (err) {
    if (err.status === 401 || /token/i.test(err.message)) {
      handleExpiredToken();
    } else {
      handleApiError(err, "Không thể tải bài viết");
      postContainer.innerHTML = `<p class="text-danger">Không thể tải bài viết. Vui lòng thử lại sau.</p>`;
    }
  }
}

/* ================================
   Helpers
================================ */
function isTokenExpired(token) {
  try {
    const payload = parseJwt(token);
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

function handleExpiredToken() {
  removeToken();
  showAlert("🔒 Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", "warning");
  setTimeout(() => {
    window.location.href = "../html/auth.html";
  }, 1500);
}
