// FILE: frontend/javascript/createComponents.js
import { loadAllComponents } from './components.js';
import { API_BASE_URL, apiFetch, getToken, escapeHTML } from './utils.js';

export async function initDynamicComponents(data = {}) {
  const { posts = [], comments = [], notifications = [] } = data;

  await loadAllComponents();

  const postContainer = document.getElementById('post-container') || document.getElementById('post-card');
  if (postContainer) {
    postContainer.innerHTML = '';
    posts.forEach((post) => postContainer.appendChild(createPostCard(post)));
    console.log('📝 Đã render xong các bài viết!');
  }

  const commentContainer = document.getElementById('comment-card');
  if (commentContainer) {
    commentContainer.innerHTML = '';
    comments.forEach((c) => commentContainer.appendChild(createCommentCard(c)));
    console.log('💬 Đã render xong các bình luận!');
  }

  const notiContainer = document.getElementById('notification-card');
  if (notiContainer) {
    notiContainer.innerHTML = '';
    notifications.forEach((n) => notiContainer.appendChild(createNotificationCard(n)));
    console.log('🔔 Đã render xong các thông báo!');
  }
}

// createPostCard
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
        <img class="profile-photo" src="${avatar}" alt="${username} profile picture" />
        <h1 class="username">${username}</h1>
      </a>
      <nav class="options" aria-label="Post options">
        <button class="options-btn" aria-expanded="false">
          <i class="fa fa-ellipsis"></i>
        </button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item edit"><img src="../assets/image/Pen tool.png" alt=""/><span>Sửa bài</span></button></li>
          <li><button class="dropdown-item delete"><img src="../assets/image/Trash.png" alt=""/><span>Xóa bài</span></button></li>
        </ul>
      </nav>
    </div>
    <section class="posts-content" aria-label="Post content"></section>
    <div class="posts-footer">
      <button class="like-button" aria-label="Like post"><img class="vector" src="../assets/image/like button.png" alt="Like"/><span class="like-count">${(post.likes && post.likes.length) || 0}</span></button>
      <a href="#" class="comments-button" data-post-id="${post._id || post.id || ''}" aria-label="Comment on post"><img class="vector" src="../assets/image/comments button.png" alt="Comment" /></a>
    </div>
  `;

  const contentEl = article.querySelector('.posts-content');
  const p = document.createElement('p');
  p.textContent = post.content || '';
  contentEl.appendChild(p);

  if (Array.isArray(post.images) && post.images[0]) {
    const img = document.createElement('img');
    img.src = post.images[0];
    img.alt = 'Ảnh bài viết';
    img.style.width = '100%';
    img.style.borderRadius = '10px';
    contentEl.appendChild(img);
  }
  if (Array.isArray(post.videos) && post.videos[0]) {
    const video = document.createElement('video');
    video.src = post.videos[0];
    video.controls = true;
    video.style.width = '100%';
    video.style.borderRadius = '10px';
    contentEl.appendChild(video);
  }
  if (post.audio) {
    const audio = document.createElement('audio');
    audio.src = post.audio;
    audio.controls = true;
    contentEl.appendChild(audio);
  }

  const likeButton = article.querySelector('.like-button');
  const likeCountEl = likeButton.querySelector('.like-count');
  likeButton.addEventListener('click', async () => {
    await toggleLike(post._id || post.id, likeCountEl);
  });

  const commentButton = article.querySelector('.comments-button');
  commentButton.addEventListener('click', (e) => {
    e.preventDefault();
    const id = commentButton.dataset.postId;
    if (id) window.location.href = `../html/posts.html?id=${id}`;
  });

  const optionsBtn = article.querySelector('.options-btn');
  const menu = article.querySelector('.dropdown-menu');
  optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('show');
    document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
    if (!isOpen) menu.classList.add('show');
  });
  document.addEventListener('click', () => menu.classList.remove('show'));

  const editBtn = article.querySelector('.dropdown-item.edit');
  const deleteBtn = article.querySelector('.dropdown-item.delete');
  editBtn.addEventListener('click', () => handleEditPost(post, p));
  deleteBtn.addEventListener('click', () => handleDeletePost(post._id || post.id, article));

  return article;
}

// createCommentCard
export function createCommentCard(comment = {}) {
  const article = document.createElement('article');
  article.classList.add('comments');

  const user = comment.userId || comment.user || {};
  const avatar = user.avatar || '/assets/image/default-avatar.png';
  const username = user.username || user.name || 'Ẩn danh';
  const text = comment.text || '';

  article.innerHTML = `
    <header class="comments__header">
      <img class="comments__avatar" src="${avatar}" alt="${username} profile picture" />
      <h2 class="comments__username">${escapeHTML(username)}</h2>
      <nav class="comments__menu"><button class="comments__menu-button" aria-label="More options"><i class="fa fa-ellipsis"></i></button></nav>
    </header>
    <p class="comments__text">${escapeHTML(text)}</p>
  `;

  return article;
}

// createNotificationCard
export function createNotificationCard(notification = {}) {
  const article = document.createElement('article');
  article.classList.add('notification');

  const user = notification.user || {};
  const avatar = user.avatar || '/assets/image/default-avatar.png';
  const username = escapeHTML(user.username || user.name || 'Người dùng');
  const message = escapeHTML(notification.message || `${username} đã tương tác`);
  const time = notification.formattedTime || '';

  article.innerHTML = `
    <button class="close-button" type="button" aria-label="Close notification"><img class="vector" src="/assets/image/cancel button.png" alt=""/></button>
    <div class="avatar"><img src="${avatar}" alt="${username}" class="notification__avatar-img"/></div>
    <div class="notification-text"><p class="text-wrapper">${message}</p><small class="text-muted">${time}</small></div>
    <button class="mark-as-read-button" type="button"><span>Đánh dấu đã đọc</span></button>
  `;

  if (notification.isRead) article.classList.add('read');

  const closeBtn = article.querySelector('.close-button');
  const markBtn = article.querySelector('.mark-as-read-button');
  closeBtn.addEventListener('click', () => article.remove());
  markBtn.addEventListener('click', () => article.classList.add('read'));

  return article;
}

// Helpers used in this module (depend on utils.js)
async function toggleLike(postId, likeCountEl) {
  const token = getToken();
  if (!postId) return;
  try {
    const res = await apiFetch(`/posts/${postId}/like`, { method: 'POST' });
    // Expect { likes: number } or updated post
    const newCount = res.likes ?? res.post?.likes?.length ?? null;
    if (newCount !== null && likeCountEl) likeCountEl.textContent = newCount;
  } catch (err) {
    console.error('Lỗi khi like:', err);
  }
}

async function handleDeletePost(postId, postElement) {
  if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
  try {
    await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
    postElement.remove();
    showAlert('Đã xóa bài thành công!', 'success');
  } catch (err) {
    console.error('Lỗi khi xóa bài:', err);
    showAlert('Không thể xóa bài viết', 'error');
  }
}

async function handleEditPost(post, textElement) {
  const newContent = prompt('Chỉnh sửa nội dung bài viết:', post.content || '');
  if (!newContent || newContent.trim() === '') return;
  try {
    const updated = await apiFetch(`/posts/${post._id || post.id}`, { method: 'PUT', body: { content: newContent } });
    textElement.textContent = updated.content || newContent;
    showAlert('Cập nhật bài viết thành công!', 'success');
  } catch (err) {
    console.error('Lỗi khi sửa bài:', err);
    showAlert('Không thể cập nhật bài viết', 'error');
  }
}