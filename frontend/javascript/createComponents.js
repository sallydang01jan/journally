// FILE: frontend/javascript/createComponents.js
import { loadAllComponents } from './components.js';
import { API_BASE_URL, apiFetch, getToken, escapeHTML, showAlert } from './utils.js';

// Khởi tạo tất cả các component động
export async function initDynamicComponents(data = {}) {
  const { posts = [], comments = [], notifications = [] } = data;
  await loadAllComponents();

  // Render bài viết
  const postContainer = document.querySelector('#post-container, #post-card');
  if (postContainer) {
    postContainer.innerHTML = '';
    posts.forEach(post => postContainer.appendChild(createPostCard(post)));
    console.log('📝 Render xong bài viết!');
  }

  // Render bình luận
  const commentContainer = document.getElementById('comment-card');
  if (commentContainer) {
    commentContainer.innerHTML = '';
    comments.forEach(c => commentContainer.appendChild(createCommentCard(c)));
    console.log('💬 Render xong bình luận!');
  }

  // Render thông báo
  const notiContainer = document.getElementById('notification-card');
  if (notiContainer) {
    notiContainer.innerHTML = '';
    notifications.forEach(n => notiContainer.appendChild(createNotificationCard(n)));
    console.log('🔔 Render xong thông báo!');
  }
}

/* ---------- POST CARD ---------- */
export function createPostCard(post = {}) {
  const article = document.createElement('article');
  article.classList.add('posts');
  article.dataset.id = post._id || post.id || '';

  const user = post.userId || post.user || {};
  const avatar = user.avatar || '../assets/image/default-avatar.png';
  const username = escapeHTML(user.username || user.name || 'Ẩn danh');

  article.innerHTML = `
    <div class="posts-header">
      <a href="../html/profile.html?user=${user._id || user.id || ''}">
        <img class="profile-photo" src="${avatar}" alt="${username}" />
        <h1 class="username">${username}</h1>
      </a>
      <nav class="options" aria-label="Post options">
        <button class="options-btn"><i class="fa fa-ellipsis"></i></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item edit"><img src="../assets/image/Pen tool.png" alt=""/><span>Sửa bài</span></button></li>
          <li><button class="dropdown-item delete"><img src="../assets/image/Trash.png" alt=""/><span>Xóa bài</span></button></li>
        </ul>
      </nav>
    </div>
    <section class="posts-content"></section>
    <div class="posts-footer">
      <button class="like-button"><img class="vector" src="../assets/image/like button.png" alt="Like"/><span class="like-count">${post.likes?.length || 0}</span></button>
      <a href="#" class="comments-button" data-post-id="${post._id || post.id || ''}"><img class="vector" src="../assets/image/comments button.png" alt="Comment" /></a>
    </div>
  `;

  // Nội dung bài viết
  const contentEl = article.querySelector('.posts-content');
  const p = document.createElement('p');
  p.textContent = post.content || '';
  contentEl.appendChild(p);

  // Ảnh / video / audio
  if (Array.isArray(post.images) && post.images.length) {
    const img = document.createElement('img');
    img.src = post.images[0];
    img.alt = 'Ảnh bài viết';
    img.style.cssText = 'width:100%;border-radius:10px;';
    contentEl.appendChild(img);
  }

  if (Array.isArray(post.videos) && post.videos.length) {
    const video = document.createElement('video');
    video.src = post.videos[0];
    video.controls = true;
    video.style.cssText = 'width:100%;border-radius:10px;';
    contentEl.appendChild(video);
  }

  if (post.audio) {
    const audio = document.createElement('audio');
    audio.src = post.audio;
    audio.controls = true;
    contentEl.appendChild(audio);
  }

  // Like / comment / menu
  const likeButton = article.querySelector('.like-button');
  const likeCountEl = likeButton.querySelector('.like-count');
  likeButton.addEventListener('click', () => toggleLike(post._id || post.id, likeCountEl));

  article.querySelector('.comments-button').addEventListener('click', e => {
    e.preventDefault();
    const id = e.currentTarget.dataset.postId;
    if (id) window.location.href = `../html/posts.html?id=${id}`;
  });

  const optionsBtn = article.querySelector('.options-btn');
  const menu = article.querySelector('.dropdown-menu');
  optionsBtn.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
    menu.classList.toggle('show');
  });
  document.addEventListener('click', () => menu.classList.remove('show'));

  article.querySelector('.dropdown-item.edit').addEventListener('click', () => handleEditPost(post, p));
  article.querySelector('.dropdown-item.delete').addEventListener('click', () => handleDeletePost(post._id || post.id, article));

  return article;
}

/* ---------- COMMENT CARD ---------- */
export function createCommentCard(comment = {}) {
  const article = document.createElement('article');
  article.classList.add('comments');

  const user = comment.userId || comment.user || {};
  const avatar = user.avatar || '/assets/image/default-avatar.png';
  const username = escapeHTML(user.username || user.name || 'Ẩn danh');

  article.innerHTML = `
    <header class="comments__header">
      <img class="comments__avatar" src="${avatar}" alt="${username}" />
      <h2 class="comments__username">${username}</h2>
      <button class="comments__menu-button"><i class="fa fa-ellipsis"></i></button>
    </header>
    <p class="comments__text">${escapeHTML(comment.text || '')}</p>
  `;

  return article;
}

/* ---------- NOTIFICATION CARD ---------- */
export function createNotificationCard(notification = {}) {
  const article = document.createElement('article');
  article.classList.add('notification');
  if (notification.isRead) article.classList.add('read');

  const user = notification.user || {};
  const avatar = user.avatar || '/assets/image/default-avatar.png';
  const username = escapeHTML(user.username || user.name || 'Người dùng');
  const message = escapeHTML(notification.message || `${username} đã tương tác`);
  const time = notification.formattedTime || '';

  article.innerHTML = `
    <button class="close-button"><img class="vector" src="/assets/image/cancel button.png" alt=""/></button>
    <div class="avatar"><img src="${avatar}" alt="${username}" class="notification__avatar-img"/></div>
    <div class="notification-text"><p class="text-wrapper">${message}</p><small class="text-muted">${time}</small></div>
    <button class="mark-as-read-button"><span>Đánh dấu đã đọc</span></button>
  `;

  article.querySelector('.close-button').addEventListener('click', () => article.remove());
  article.querySelector('.mark-as-read-button').addEventListener('click', () => article.classList.add('read'));

  return article;
}

/* ---------- HELPERS ---------- */
async function toggleLike(postId, likeCountEl) {
  if (!postId) return;
  try {
    const res = await apiFetch(`${API_BASE_URL}/posts/${postId}/like`, { method: 'POST' });
    const newCount = res.likes ?? res.post?.likes?.length ?? null;
    if (newCount !== null) likeCountEl.textContent = newCount;
  } catch (err) {
    console.error('Lỗi khi like:', err);
  }
}

async function handleDeletePost(postId, postElement) {
  if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
  try {
    await apiFetch(`${API_BASE_URL}/posts/${postId}`, { method: 'DELETE' });
    postElement.remove();
    showAlert('🗑️ Đã xóa bài thành công!', 'success');
  } catch (err) {
    console.error('Lỗi khi xóa bài:', err);
    showAlert('❌ Không thể xóa bài viết', 'error');
  }
}

async function handleEditPost(post, textElement) {
  const newContent = prompt('Chỉnh sửa nội dung bài viết:', post.content || '');
  if (!newContent?.trim()) return;
  try {
    const updated = await apiFetch(`${API_BASE_URL}/posts/${post._id || post.id}`, {
      method: 'PUT',
      body: { content: newContent.trim() },
    });
    textElement.textContent = updated.content || newContent.trim();
    showAlert('✅ Cập nhật bài viết thành công!', 'success');
  } catch (err) {
    console.error('Lỗi khi sửa bài:', err);
    showAlert('❌ Không thể cập nhật bài viết', 'error');
  }
}
