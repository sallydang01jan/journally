// FILE: frontend/javascript/stories.js
import { API_BASE_URL, apiFetch, formatDate, getToken, escapeHTML, showAlert, handleApiError } from './utils.js';

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

      const username = escapeHTML(story.user.username || 'Ẩn danh');
      const caption = escapeHTML(story.caption || '');
      const timestamp = story.createdAt ? `<span class="timestamp">${formatDate(story.createdAt)}</span>` : '';

      if (story.type === 'image') {
        article.innerHTML = `\n          <img class="ellipse" src="${story.mediaUrl}" alt="${username}" />\n          <span class="text-wrapper">${username}</span>\n          ${timestamp}\n        `;
      } else if (story.type === 'video') {
        article.innerHTML = `\n          <video class="ellipse" muted><source src="${story.mediaUrl}" type="video/mp4"></video>\n          <span class="text-wrapper">${username}</span>\n          ${timestamp}\n        `;
      }

      article.addEventListener('click', () => openStory(story));
      storiesContainer.appendChild(article);
    });
  }

  function openStory(story) {
    const overlay = document.createElement('div');
    overlay.classList.add('story-overlay');
    const caption = escapeHTML(story.caption || '');
    const timestamp = story.createdAt ? formatDate(story.createdAt) : '';

    overlay.innerHTML = `\n      <div class="story-view">\n        ${story.type === 'image' ? `<img src="${story.mediaUrl}" alt="Story" />` : `<video controls autoplay><source src="${story.mediaUrl}" type="video/mp4"></video>`}\n        <p>${caption}</p>\n        <p class="timestamp">${timestamp}</p>\n        <button class="close-btn">×</button>\n      </div>\n    `;

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
      const uploadRes = await fetch(`${API_BASE_URL}/media/upload`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');

      const mediaUrl = uploadData.url || uploadData.file?.url || uploadData.file?.filename;
      const token = getToken();

      await fetch(`${API_BASE_URL}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mediaUrl, type, caption: '' })
      });

      showAlert('✅ Tin đã được đăng!', 'success');
      loadStories();
    } catch (err) {
      handleApiError(err, 'Không thể đăng story');
    }
  });

  loadStories();
});