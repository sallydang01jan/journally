// ==================== IMPORT ====================
import {
  apiFetch,
  requireAuth,
  getUserData,
  getToken,
  handleApiError,
  parseJwt,
  removeToken,
  API_BASE_URL,
  showAlert,
} from "../utils.js";
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

  // ✅ Nếu không có userId -> xem hồ sơ chính mình
  const endpoint = userId ? `/users/${userId}` : "/users/me";

  try {
    const user = await apiFetch(`${API_BASE_URL}${endpoint}`, "GET", null, token);

    // ==================== HIỂN THỊ THÔNG TIN ====================
    if (usernameEl) usernameEl.textContent = user.username || "Ẩn danh";

    if (profilePhoto) {
      let avatarUrl = "../assets/image/default-avatar.png";
      if (user.avatar) {
        const safeUrl = encodeURI(user.avatar);
        avatarUrl = safeUrl.startsWith("http")
          ? safeUrl
          : `${API_BASE_URL}/${safeUrl}`;
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

    // ==================== FOLLOW LOGIC ====================
    const viewedUserId = user._id || user.id;
    if (String(myData.id) === String(viewedUserId)) {
      if (followBtnWrapper) followBtnWrapper.style.display = "none";
    } else if (followBtn) {
      const isFollowing =
        user.followers?.some((f) => f._id?.toString?.() === myData.id) ||
        user.followers?.includes(myData.id);

      followBtn.textContent = isFollowing ? "Đang theo dõi" : "Theo dõi";

      followBtnWrapper.onclick = async () => {
        try {
          const data = await apiFetch(
            `${API_BASE_URL}/users/${viewedUserId}/follow`,
            "POST",
            null,
            token
          );

          if (data.message.toLowerCase().includes("bỏ theo dõi")) {
            followBtn.textContent = "Theo dõi";
          } else {
            followBtn.textContent = "Đang theo dõi";
          }

          showAlert(data.message, "info");
        } catch (err) {
          handleApiError(err);
        }
      };
    }

    // ==================== HIỂN THỊ BÀI VIẾT ====================
    renderPosts(user.posts || [], postsSection);
  } catch (err) {
    handleApiError(err, "Không thể tải trang hồ sơ");
  }

  // ==================== HEADER PROFILE (GÓC PHẢI) ====================
  const profileLink = document.getElementById("profile-link");
  const profileAvatar = document.getElementById("profile-avatar");

  const myDataHeader = myData; // dùng lại, tránh gọi lại getUserData()
  if (myDataHeader) {
    let avatarUrl = "../assets/image/default-avatar.png";
    if (myDataHeader.avatar) {
      const safeUrl = encodeURI(myDataHeader.avatar);
      avatarUrl = safeUrl.startsWith("http")
        ? safeUrl
        : `${API_BASE_URL}/${safeUrl}`;
    }

    if (profileAvatar) profileAvatar.src = avatarUrl;
    if (profileLink)
      profileLink.href = `../html/profile.html?user=${myDataHeader.id}`;
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

  posts.forEach((p) => {
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
