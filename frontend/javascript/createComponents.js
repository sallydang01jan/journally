// 📁 frontend/javascript/createComponents.js
import { loadAllComponents } from "./components.js";
import { API_BASE_URL, apiRequest, getToken } from "./utils.js";

// ==================== KHỞI TẠO COMPONENT ====================
export async function initDynamicComponents(data = {}) {
  const { posts = [], comments = [], notifications = [] } = data;

  await loadAllComponents();

  // 1️⃣ Render bài viết
  const postContainer = document.getElementById("post-card");
  if (postContainer) {
    postContainer.innerHTML = "";
    posts.forEach((post) => postContainer.appendChild(createPostCard(post)));
    console.log("📝 Đã render xong các bài viết!");
  }

  // 2️⃣ Render bình luận
  const commentContainer = document.getElementById("comment-card");
  if (commentContainer) {
    commentContainer.innerHTML = "";
    comments.forEach((c) => commentContainer.appendChild(createCommentCard(c)));
    console.log("💬 Đã render xong các bình luận!");
  }

  // 3️⃣ Render thông báo
  const notiContainer = document.getElementById("notification-card");
  if (notiContainer) {
    notiContainer.innerHTML = "";
    notifications.forEach((n) => notiContainer.appendChild(createNotificationCard(n)));
    console.log("🔔 Đã render xong các thông báo!");
  }

  console.log("🌸 Tất cả component động đã hoàn tất!");
}

// ==================== HÀM TẠO POST CARD ====================
export function createPostCard(post) {
  const article = document.createElement("article");
  article.classList.add("posts");
  article.dataset.id = post._id;

  article.innerHTML = `
    <div class="posts-header">
      <a href="../pages/profile.html?user=${post.userId?._id}">
        <img
          class="profile-photo"
          src="${post.userId?.avatar || "../assets/image/default-avatar.png"}"
          alt="${post.userId?.username || "Ẩn danh"} profile picture"
        />
        <h1 class="username">${post.userId?.username || "Ẩn danh"}</h1>
      </a>
      <nav class="options" aria-label="Post options">
        <button class="options-btn" aria-expanded="false">
          <i class="fa fa-ellipsis"></i>
        </button>
        <ul class="dropdown-menu">
          <li>
            <button class="dropdown-item edit">
              <img src="../assets/image/Pen tool.png" alt="" />
              <span>Sửa bài</span>
            </button>
          </li>
          <li>
            <button class="dropdown-item delete">
              <img src="../assets/image/Trash.png" alt="" />
              <span>Xóa bài</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <section class="posts-content" aria-label="Post content"></section>

    <div class="posts-footer">
      <button class="like-button" aria-label="Like post">
        <img class="vector" src="../assets/image/like button.png" alt="Like" />
        <span class="like-count">${post.likes?.length || 0}</span>
      </button>

      <a href="#" 
        class="comments-button" 
        data-post-id="${post._id}" 
        aria-label="Comment on post">
        <img class="vector" src="../assets/image/comments button.png" alt="Comment" />
      </a>
    </div>
  `;

  // --- CONTENT ---
  const content = article.querySelector(".posts-content");
  const text = document.createElement("p");
  text.textContent = post.content || "";
  content.appendChild(text);

  if (post.images?.length) {
    const img = document.createElement("img");
    img.src = post.images[0];
    img.alt = "Ảnh bài viết";
    img.style.width = "100%";
    img.style.borderRadius = "10px";
    content.appendChild(img);
  }

  if (post.videos?.length) {
    const video = document.createElement("video");
    video.src = post.videos[0];
    video.controls = true;
    video.style.width = "100%";
    video.style.borderRadius = "10px";
    content.appendChild(video);
  }

  if (post.audio) {
    const audio = document.createElement("audio");
    audio.src = post.audio;
    audio.controls = true;
    audio.style.width = "100%";
    content.appendChild(audio);
  }

  // --- FOOTER EVENTS ---
  const likeButton = article.querySelector(".like-button");
  const likeCount = likeButton.querySelector(".like-count");
  likeButton.addEventListener("click", async () => {
    await toggleLike(post._id, likeCount);
  });

  const commentButton = article.querySelector(".comments-button");
  commentButton.addEventListener("click", (e) => {
    e.preventDefault();
    const postId = commentButton.dataset.postId;
    window.location.href = `../html/posts.html?id=${postId}`;
  });

  // --- DROPDOWN MENU ---
  const optionsBtn = article.querySelector(".options-btn");
  const menu = article.querySelector(".dropdown-menu");

  optionsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains("show");
    document.querySelectorAll(".dropdown-menu.show").forEach(m => m.classList.remove("show"));
    if (!isOpen) menu.classList.add("show");
  });
  document.addEventListener("click", () => menu.classList.remove("show"));

  // --- SỬA / XÓA ---
  const editBtn = menu.querySelector(".dropdown-item.edit");
  const deleteBtn = menu.querySelector(".dropdown-item.delete");

  editBtn.addEventListener("click", () => handleEditPost(post, text));
  deleteBtn.addEventListener("click", () => handleDeletePost(post._id, article));

  return article;
}

// ==================== LIKE / UNLIKE ====================
async function toggleLike(postId, likeCountElement) {
  const token = getToken();
  try {
    const res = await apiRequest(`${API_BASE_URL}/posts/${postId}/like`, "POST", null, token);
    if (res.likes !== undefined) likeCountElement.textContent = res.likes;
  } catch (err) {
    console.error("Lỗi khi like:", err);
  }
}

// ==================== XÓA BÀI ====================
async function handleDeletePost(postId, postElement) {
  if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
  const token = getToken();
  try {
    await apiRequest(`${API_BASE_URL}/posts/${postId}`, "DELETE", null, token);
    postElement.remove();
    alert("Đã xóa bài thành công!");
  } catch (err) {
    console.error("Lỗi khi xóa bài:", err);
    alert("Không thể xóa bài viết");
  }
}

// ==================== SỬA BÀI ====================
async function handleEditPost(post, textElement) {
  const newContent = prompt("Chỉnh sửa nội dung bài viết:", post.content);
  if (!newContent || newContent.trim() === "") return;
  const token = getToken();
  try {
    const updated = await apiRequest(`${API_BASE_URL}/posts/${post._id}`, "PUT", { content: newContent }, token);
    textElement.textContent = updated.content;
    alert("Cập nhật bài viết thành công!");
  } catch (err) {
    console.error("Lỗi khi sửa bài:", err);
    alert("Không thể cập nhật bài viết");
  }
}

// ==================== COMMENT CARD ====================
export function createCommentCard(comment) {
  const article = document.createElement("article");
  article.classList.add("comments");

  article.innerHTML = `
    <header class="comments__header">
      <img
        class="comments__avatar"
        src="${comment.userId?.avatar || "/assets/image/default-avatar.png"}"
        alt="${comment.userId?.username || "Ẩn danh"} profile picture"
      />
      <h2 class="comments__username">${comment.userId?.username || "Ẩn danh"}</h2>
      <nav class="comments__menu">
        <button class="comments__menu-button" aria-label="More options" type="button">
          <i class="fa fa-ellipsis"></i>
        </button>
      </nav>
    </header>
    <p class="comments__text">${comment.text}</p>
  `;

  return article;
}

// ==================== NOTIFICATION CARD ====================
export function createNotificationCard(notification) {
  const article = document.createElement("article");
  article.classList.add("notification");

  article.innerHTML = `
    <button class="close-button" type="button" aria-label="Close notification">
      <img class="vector" src="/assets/image/cancel button.png" alt="" />
    </button>
    <div class="avatar">
      <img
        src="${notification.userId?.avatar || "/assets/image/default-avatar.png"}"
        alt="${notification.userId?.username || "Ẩn danh"}"
        class="notification__avatar-img"
      />
    </div>
    <div class="notification-text">
      <p class="text-wrapper">
        ${notification.message || `${notification.userId?.username || "Người dùng"} đã theo dõi bạn`}
      </p>
    </div>
    <button class="mark-as-read-button" type="button">
      <span class="div">Đánh dấu đã đọc</span>
    </button>
  `;

  if (notification.isRead) article.classList.add("read");

  article.querySelector(".close-button").addEventListener("click", () => {
    article.remove();
  });

  article.querySelector(".mark-as-read-button").addEventListener("click", () => {
    article.classList.add("read");
  });

  return article;
}
