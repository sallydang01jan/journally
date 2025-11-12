// frontend/javascript/utils.js
export const API_BASE_URL = 'https://journally-xm5i.onrender.com';

export function getToken() {
  return localStorage.getItem('token');
}
export function setToken(token, refreshToken = null) {
  localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}
export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

export async function getValidToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    if (payload.exp > now) return token;
  } catch (e) {
    console.warn('Invalid token format', e);
    removeToken();
    return null;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    removeToken();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Refresh failed');
    setToken(data.token, data.refreshToken || refreshToken);
    return data.token;
  } catch (err) {
    console.error('Token refresh failed:', err);
    removeToken();
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(jsonPayload);
    payload.userId = payload.userId || payload.id;
    return payload;
  } catch (e) {
    console.error('JWT parse error:', e);
    return {};
  }
}

export function showAlert(message, type = 'info') {
  const emoji = type === 'success' ? '✨' : type === 'error' ? '⚠️' : type === 'info' ? '💬' : 'ℹ️';
  try { alert(`${emoji} ${message}`); } catch (e) { console.log(message); }
}

export function handleApiError(err, fallbackMessage = null) {
  console.error(err);
  const msg = err?.message || fallbackMessage || 'Có lỗi xảy ra, vui lòng thử lại.';
  showAlert(msg, 'error');
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function requireAuth() {
  if (!isAuthenticated()) {
    showAlert('𓆝 vui lòng đăng nhập trước khi tiếp tục ⋆｡˚ 𓆟', 'error');
    window.location.href = '../html/auth.html';
  }
}

export function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function apiFetch(endpoint, options = {}) {
  const token = await getValidToken();
  const headers = { ...(options.headers || {}) };

  let body = options.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) {
    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, { method: options.method || 'GET', headers, body, cache: 'no-store' });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.message || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  if (options.skipJson) {
    return res.clone().json().catch(() => res.text());
  }

  return res.json();
}

export const apiRequest = apiFetch;

export async function fetchData(url, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getUserData() {
  try {
    const token = getToken();
    if (!token) throw new Error('Chưa đăng nhập');
    const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể lấy thông tin người dùng`);
    const user = await res.json();
    localStorage.setItem('userData', JSON.stringify(user));
    return user;
  } catch (err) {
    console.warn('⚠️ Không thể lấy user từ API, thử lấy từ localStorage:', err.message);
    const cached = localStorage.getItem('userData');
    if (cached) return JSON.parse(cached);
    return null;
  }
}