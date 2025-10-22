// ==================== IMPORT ====================
import { apiFetch, requireAuth, getUserData, getToken, handleApiError, parseJwt, removeToken, API_BASE_URL } from "../utils.js";
import { createPostCard } from "../javascript/createComponents.js";
import { initComments } from "../javascript/comments.js";

// ==================== KHỞI ĐỘNG ====================
document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  if (!token) {
    window.location.href = "../html/auth.html";
    return;
  }

  try {
    const payload = parseJwt(token);
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      removeToken();
      window.location.href = "../html/auth.html";
      return;
    }
  } catch {
    removeToken();
    window.location.href = "../html/auth.html";
    return;
  }

  requireAuth();

  const userId = getUserIdFromURL();
  const myData = getUserData();

  if (!myData || !myData.id) {
    removeToken();
    window.location.href = "../html/auth.html";
    return;
  }

  // Elements
  const usernameEl = document.querySelector(".text-wrapper-2");
  const statsEls = document.querySelectorAll(".profile-stats span");
  const followBtnWrapper = document.querySelector(".follow-button");
  const followBtn = followBtnWrapper?.querySelector(".text-wrapper-6");
  const profilePhoto = document.querySelector(".profile-photo");
  const postsSection = document.querySelector(".posts-section");

  if (!userId) {
    alert("Không tìm thấy người dùng");
    return;
  }

  try {
    const user = await apiFetch(`${API_BASE_URL}/users/${userId}`, "GET", null, token);

    // Hiển thị thông tin
    if (usernameEl) usernameEl.textContent = user.username || "Ẩn danh";

    if (profilePhoto) {
      let avatarUrl = "../assets/image/default-avatar.png";
      if (user.avatar) {
        // Nếu avatar có ký tự đặc biệt hoặc không phải link tuyệt đối
        const safeUrl = encodeURI(user.avatar);
        avatarUrl = safeUrl.startsWith("http") ? safeUrl : `${API_BASE_URL}/${safeUrl}`;
      }

      profilePhoto.style.backgroundImage = `url(${avatarUrl})`;
      profilePhoto.style.backgroundSize = "cover";
      profilePhoto.style.backgroundPosition = "center";
    }

    if (statsEls.length >= 3) {
      statsEls[0].textContent = `${user.posts?.length || 0} bài viết`;
      statsEls[1].textContent = `${user.followers?.length || 0} followers`;
      statsEls[2].textContent = `${user.following?.length || 0} đang theo dõi`;
    }

    // Follow logic
    if (myData.id === user._id.toString()) {
      if (followBtnWrapper) followBtnWrapper.style.display = "none";
    } else if (followBtn) {
      const isFollowing =
        user.followers?.some(f => f._id?.toString?.() === myData.id) ||
        user.followers?.includes(myData.id);

      followBtn.textContent = isFollowing ? "Đang theo dõi" : "Theo dõi";

      followBtnWrapper.onclick = async () => {
        try {
          const data = await apiFetch(`${API_BASE_URL}/users/${userId}/follow`, "POST", null, token);
          followBtn.textContent = data.isFollowing ? "Đang theo dõi" : "Theo dõi";
          showAlert(data.message, "info");
        } catch (err) {
          handleApiError(err);
        }
      };
    }

    // Render bài viết
    renderPosts(user.posts || [], postsSection);
  } catch (err) {
    handleApiError(err, "Không thể tải trang hồ sơ");
  }
});

// ==================== HÀM PHỤ ====================
function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function renderPosts(posts, section) {
  if (!section) return;

  if (!Array.isArray(posts) || posts.length === 0) {
    section.innerHTML = `
      <div class="rectangle-2">
        <p class="text-wrapper">Chưa có bài viết</p>
      </div>`;
    return;
  }

  const container = document.createElement("div");
  container.className = "user-posts";

  posts.forEach(p => {
    const card = createPostCard(p);
      if (!card) return;

      const commentsContainer = card.querySelector(".comments-container");
      const commentForm = card.querySelector(".comment-input");
      const commentTextarea = card.querySelector("textarea");
      
      initComments(p._id, commentsContainer, commentForm, commentTextarea);
      container.appendChild(card);
  });

  section.innerHTML = "";
  section.appendChild(container);
}
