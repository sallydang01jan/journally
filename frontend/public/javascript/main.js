// frontend/javascript/main.js
import { loadAllComponents } from '/components.js';
import { API_BASE_URL, apiFetch, getToken, isAuthenticated, getUserData, handleApiError, escapeHTML, showAlert } from '/utils.js';
import { createPostCard } from '/createComponents.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadAllComponents();

  const addStoryBtn = document.querySelector('.add-story .frame');
  const userNameEl = document.querySelector('.header-username');
  const postContainer = document.querySelector('#post-container');

  const token = getToken();

  if (isAuthenticated() && token) {
    try {
      const user = await getUserData();
      if (userNameEl) userNameEl.textContent = user.username || user.name || 'User';
    } catch (err) {
      console.warn('Không thể lấy user:', err);
    }
  } else {
    if (addStoryBtn) addStoryBtn.style.display = 'none';
  }

  // -------------------------
  // Upload story
  // -------------------------
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*';
  fileInput.classList.add('d-none');
  document.body.appendChild(fileInput);

  if (addStoryBtn) {
    addStoryBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch(`${API_BASE_URL}/upload/media`, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${token}` }
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload thất bại');

        const mediaUrl = uploadData.url || uploadData.file?.url || uploadData.file?.filename;
        const type = file.type.startsWith('video/') ? 'video' : 'image';

        await fetch(`${API_BASE_URL}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ mediaUrl, type, caption: '' })
        });

        showAlert('✅ Story đã được đăng!', 'success');

        // ⚡ Thông báo bài mới để các tab khác có thể reload
        localStorage.setItem('newPostEvent', Date.now());
      } catch (err) {
        console.error(err);
        showAlert('❌ Upload story thất bại', 'error');
      }
    });
  }

  // -------------------------
  // Load posts
  // -------------------------
  async function loadPosts() {
    if (!postContainer) return console.error('❌ Không tìm thấy container #post-container');

    if (!token) {
      postContainer.innerHTML = `<p class="text-warning">Vui lòng đăng nhập để xem bài viết.</p>`;
      return;
    }

    try {
      const posts = await apiFetch('/feed');
      postContainer.innerHTML = '';
      if (!Array.isArray(posts) || posts.length === 0) {
        postContainer.innerHTML = `<p class="text-muted text-center mt-3">Chưa có bài viết nào 🌙</p>`;
        return;
      }

      posts.forEach((post) => {
        if (post.content) post.content = escapeHTML(post.content);
        const card = createPostCard(post);
        postContainer.appendChild(card);
      });
    } catch (err) {
      handleApiError(err, 'Không thể tải bài viết');
      postContainer.innerHTML = `<p class="text-danger">Lỗi tải bài viết. Vui lòng thử lại sau.</p>`;
    }
  }

  // Gọi load posts lần đầu
  loadPosts();

  // -------------------------
  // 🔄 Realtime: lắng nghe bài mới từ tab khác
  // -------------------------
  window.addEventListener("storage", (e) => {
    if (e.key === "newPostEvent") {
      showAlert("🆕 Có bài viết mới trên feed!", "info");
      if (typeof loadPosts === "function") loadPosts();
    }
  });
});
