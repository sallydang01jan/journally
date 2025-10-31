// FILE: frontend/javascript/stories.js
import { apiFetch, formatDate, getToken, escapeHTML, showAlert, handleApiError } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const addStoryBtn = document.querySelector('.add-story .frame');
  const storiesContainer = document.querySelector('.stories');
  if (!storiesContainer) return console.error('❌ Không tìm thấy container stories!');
  if (!addStoryBtn) return console.error('❌ Không tìm thấy nút thêm story!');

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*';
  fileInput.classList.add('d-none');
  document.body.appendChild(fileInput);

  async function loadStories() {
    const token = getToken();
    if (!token) {
      showAlert('Vui lòng đăng nhập để xem stories!', 'warning');
      storiesContainer.innerHTML = `<p class="text-warning">Vui lòng đăng nhập</p>`;
      return;
    }

    try {
      const stories = await apiFetch('/stories');
      renderStories(stories || []);
    } catch (err) {
      handleApiError(err, 'Không thể tải stories');
      storiesContainer.innerHTML = `<p class="text-danger">⚠️ Không thể tải stories!</p>`;
    }
  }

  function renderStories(stories) {
    storiesContainer.querySelectorAll('.story').forEach(s => s.remove());
    stories.forEach(story => {
      const article = document.createElement('article');
      article.classList.add('story');

      const username = escapeHTML(story.user?.username || 'Ẩn danh');
      const caption = escapeHTML(story.caption || '');
      const timestamp = story.createdAt ? `<span class="timestamp">${formatDate(story.createdAt)}</span>` : '';

      article.innerHTML = story.type === 'video'
        ? `<video class="ellipse" muted><source src="${story.mediaUrl}" type="video/mp4"></video><span class="text-wrapper">${username}</span>${timestamp}`
        : `<img class="ellipse" src="${story.mediaUrl}" alt="${username}" /><span class="text-wrapper">${username}</span>${timestamp}`;

      article.addEventListener('click', () => openStory(story));
      storiesContainer.appendChild(article);
    });
  }

  function openStory(story) {
    const overlay = document.createElement('div');
    overlay.classList.add('story-overlay');
    const caption = escapeHTML(story.caption || '');
    const timestamp = story.createdAt ? formatDate(story.createdAt) : '';

    overlay.innerHTML = `
      <div class="story-view">
        ${story.type === 'image'
          ? `<img src="${story.mediaUrl}" alt="Story" />`
          : `<video controls autoplay><source src="${story.mediaUrl}" type="video/mp4"></video>`}
        <p>${caption}</p>
        <p class="timestamp">${timestamp}</p>
        <button class="close-btn">×</button>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
  }

  addStoryBtn.addEventListener('click', () => {
    const token = getToken();
    if (!token) {
      showAlert('Vui lòng đăng nhập để đăng story!', 'warning');
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadData = await apiFetch('/media/upload', { method: 'POST', body: formData });
      const mediaUrl = uploadData.url || uploadData.file?.url || uploadData.file?.filename;

      await apiFetch('/stories', { method: 'POST', body: { mediaUrl, type, caption: '' } });

      showAlert('✅ Tin đã được đăng!', 'success');
      loadStories();
    } catch (err) {
      handleApiError(err, 'Không thể đăng story');
    }
  });

  loadStories();
});
