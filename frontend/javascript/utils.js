// utils.js — nơi chứa helper chung cho toàn frontend

// =============== CẤU HÌNH API ===============
export const API_BASE_URL = "https://journally-mocha.vercel.app";


// =============== TOKEN ===============
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token, refreshToken = null) {
  localStorage.setItem("token", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

export async function getValidToken() {
  const token = getToken();
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const now = Date.now() / 1000;

  // Nếu JWT còn hạn, dùng luôn
  if (payload.exp > now) return token;

  // Nếu hết hạn → thử refresh
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    removeToken();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Refresh token failed");

    setToken(data.token);
    return data.token;
  } catch (err) {
    console.error("Token refresh failed:", err);
    removeToken();
    return null;
  }
}

// =============== AUTH ===============
export function isAuthenticated() {
  return !!getToken();
}

// =============== JWT PARSER ===============
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    payload.userId = payload.userId || payload.id; // fallback
    return payload;
  } catch (e) {
    console.error("JWT parse error:", e);
    return {};
  }
}


// =============== FETCH WRAPPER ===============
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "⋆.˚ ☔︎︎ lỗi kết nối API ⋆.˚ ☔︎︎");
  }

  return res.json();
}


// =============== HỖ TRỢ GIAO DIỆN ===============
export function showAlert(message, type = "info") {
  // có thể thay bằng toast sau này
  const emoji = type === "success" ? "✨" : type === "error" ? "⚠️" : "💬";
  alert(`${emoji} ${message}`);
}

// =============== ĐỊNH DẠNG THỜI GIAN ===============
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// =============== KIỂM TRA LOGIN ===============
export function requireAuth() {
  if (!isAuthenticated()) {
    showAlert("𓆝 vui lòng đăng nhập trước khi tiếp tục ⋆｡˚ 𓆟", "error");
    window.location.href = "../html/login.html";
  }
}

export function handleApiError(err) {
  console.error(err);
  alert(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
}

/**
 * Gửi request với fetch + token
 */
export async function fetchData(url, method = "GET", data = null, token = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (token) options.headers["Authorization"] = `Bearer ${token}`;
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return await response.json();
}

/**
 * Escape ký tự đặc biệt trong HTML
 */
export function escapeHTML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Lấy postId từ URL query
 */
export function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("postId");
}

/**
 * Tạo phần tử comment từ dữ liệu
 */
export function renderComment(comment, container, isNew = false) {
  const article = document.createElement("article");
  article.classList.add("comments");
  if (isNew) article.classList.add("fade-in");

  article.setAttribute("role", "article");
  article.setAttribute("aria-label", "User comment");

  const avatar = comment.userId?.avatar || "/images/default-avatar.png";
  const username = comment.userId?.username || "Người dùng ẩn danh";
  const text = escapeHTML(comment.text || "");

  article.innerHTML = `
    <header class="comments__header">
      <img class="comments__avatar" src="${avatar}" alt="${username} avatar" />
      <h2 class="comments__username">${username}</h2>
      <nav class="comments__menu" aria-label="Comment actions">
        <button class="comments__menu-button" aria-label="More options" type="button">
          <i class="fa fa-ellipsis"></i>
        </button>
      </nav>
    </header>
    <p class="comments__text">${text}</p>
  `;

  container.prepend(article);
}
// Lấy thông tin người dùng hiện tại từ server hoặc localStorage/
export async function getUserData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể lấy thông tin người dùng`);

    const user = await res.json();
    localStorage.setItem("userData", JSON.stringify(user));
    return user;
  } catch (err) {
    console.warn("⚠️ Không thể lấy user từ API, thử lấy từ localStorage:", err.message);
    const cached = localStorage.getItem("userData");
    if (cached) return JSON.parse(cached);
    return null;
  }
}

export const apiRequest = fetchData;