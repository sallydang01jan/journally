// frontend/javascript/upload.js
import { apiFetch, showAlert, requireAuth, getValidToken } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = await getValidToken();
  if (!token) return requireAuth();

  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('file-preview');

  if (!uploadForm || !fileInput || !preview) {
    console.error('❌ Không tìm thấy các element cần thiết cho upload!');
    return;
  }

  // 🔍 Xem trước file
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    preview.innerHTML = '';
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) preview.innerHTML = `<img src="${url}" alt="Preview" class="preview-img">`;
    else if (file.type.startsWith('video/')) preview.innerHTML = `<video controls class="preview-video"><source src="${url}" type="${file.type}"></video>`;
    else if (file.type.startsWith('audio/')) preview.innerHTML = `<audio controls><source src="${url}" type="${file.type}"></audio>`;
    else showAlert('❌ File không hợp lệ.', 'error');
  });

  // 📤 Upload file
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return showAlert('⚠️ Vui lòng chọn file.', 'warning');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiFetch('/upload/media', { method: 'POST', body: formData });
      showAlert('✅ Tải lên thành công!', 'success');
      if (data?.url) preview.innerHTML += `<p><a href="${data.url}" target="_blank">${data.url}</a></p>`;
      fileInput.value = '';
    } catch (err) {
      console.error('🔥 Lỗi upload:', err);
      showAlert(`❌ Lỗi: ${err.message || 'Upload thất bại'}`, 'error');
    }
  });
});
