// frontend/javascript/profile.js
import {
  apiFetch,
  requireAuth,
  getUserData,
  getToken,
  handleApiError,
  parseJwt,
  removeToken,
  showAlert,
} from "./utils.js";
import { createPostCard } from "./createComponents.js";
import { initComments } from "./comments.js";

document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();
  const token = getToken();
  if (!token) return redirectToAuth();

  if (isTokenExpired(token)) return;

  const userId = getUserIdFromURL();
  const myData = await getUserData();
  if (!myData?.id) return redirectToAuth();

  // DOM elements
  const usernameEl = document.querySelector(".text-wrapper-2");
  const statsEls = document.querySelectorAll(".profile-stats span");
  const followBtnWrapper = document.querySelector(".follow-button");
  const followBtn = followBtnWrapper?.querySelector(".text-wrapper-6");
  const profilePhoto = document.querySelector(".profile-photo");
  const postsSection = document.querySelector(".posts-section");

  const endpoint = userId ? `/users/${userId}` : "/users/me";

  try {
    const user = await apiFetch(endpoint);

    displayUserInfo(user, usernameEl, statsEls, profilePhoto);

    setupFollowButton(user, myData.id, followBtnWrapper, followBtn);

    renderPosts(user.posts || [], postsSection);
  } catch (err) {
    handleApiError(err, "Không thể tải trang hồ sơ");
  }

  // Avatar ở header
  updateHeaderAvatar(myData);

  // 🔄 Lắng nghe bài mới từ tab khác để tự reload hồ sơ
  window.addEventListener("storage", (e) => {
    if (e.key === "newPostEvent") {
      showAlert("🆕 Bạn vừa đăng bài mới! Đang cập nhật hồ sơ...", "info");
      apiFetch(endpoint)
        .then((user) => {
          renderPosts(user.posts || [], postsSection);
        })
        .catch((err) => console.error("Không thể reload profile:", err));
    }
  });
});

// ================================
// Helpers
// ================================

function redirectToAuth() {
  removeToken();
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

function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function displayUserInfo(user, usernameEl, statsEls, profilePhoto) {
  if (usernameEl) usernameEl.textContent = user.username || "Ẩn danh";

  if (profilePhoto) {
    let avatarUrl = "../assets/image/default-avatar.png";
    if (user.avatar) {
      const safeUrl = encodeURI(user.avatar);
      avatarUrl = safeUrl.startsWith("http") ? safeUrl : safeUrl;
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
}

function setupFollowButton(user, myId, followBtnWrapper, followBtn) {
  const viewedUserId = user._id || user.id;

  if (String(myId) === String(viewedUserId)) {
    if (followBtnWrapper) followBtnWrapper.style.display = "none";
    return;
  }

  let isFollowing = user.followers?.some(f => f._id?.toString?.() === myId) || user.followers?.includes(myId);
  if (followBtn) followBtn.textContent = isFollowing ? "Đang theo dõi" : "Theo dõi";

  if (followBtnWrapper) {
    followBtnWrapper.onclick = async () => {
      try {
        const data = await apiFetch(`/users/${viewedUserId}/follow`, { method: "POST" });
        
        // Cập nhật trạng thái dựa vào isFollowing từ backend
        isFollowing = data.isFollowing;
        if (followBtn) followBtn.textContent = isFollowing ? "Đang theo dõi" : "Theo dõi";

        showAlert(data.message, "info");
      } catch (err) {
        handleApiError(err);
      }
    };
  }
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

function updateHeaderAvatar(myData) {
  const profileLink = document.getElementById("profile-link");
  const profileAvatar = document.getElementById("profile-avatar");

  if (!myData) return;

  let avatarUrl = "../assets/image/default-avatar.png";
  if (myData.avatar) {
    const safeUrl = encodeURI(myData.avatar);
    avatarUrl = safeUrl.startsWith("http") ? safeUrl : safeUrl;
  }
  if (profileAvatar) profileAvatar.src = avatarUrl;
  if (profileLink) profileLink.href = `../html/profile.html?user=${myData.id}`;
}
