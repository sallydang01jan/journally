// 📁 frontend/javascript/notification.js
import { API_BASE_URL, getAuthToken, apiFetch, formatDate, parseJwt, removeToken, } from "./utils.js";
import { createNotificationCard } from "./createComponents.js";

document.addEventListener("DOMContentLoaded", async () => {

  const token = getAuthToken();
  if (!token) {
    window.location.href = "../html/auth.html";
  } else {
    try {
      const payload = parseJwt(token);
      const now = Date.now() / 1000; // seconds
      if (payload.exp < now) {
        removeToken();
        window.location.href = "../html/auth.html";
      }
    } catch (err) {
      removeToken();
      window.location.href = "../html/auth.html";
    }
  }

  const notificationCard = document.getElementById("notification-card");

  // 🟢 Lấy danh sách thông báo
  async function fetchNotifications() {
    try {
      const notifications = await apiFetch(`${API_BASE_URL}/notifications`);
      renderNotifications(notifications);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
      notificationCard.innerHTML = `<p class="text-danger">⚠️ Không thể tải thông báo.</p>`;
    }
  }

  // 🟡 Hiển thị danh sách thông báo
  function renderNotifications(list) {
    notificationCard.innerHTML = ""; // reset trước

    if (!list.length) {
      notificationCard.innerHTML = `<p class="text-muted text-center mt-4">Chưa có thông báo nào 🌙</p>`;
      return;
    }

    list.forEach((n) => {
      // Dùng user từ backend để hiển thị đúng username/avatar
      const card = createNotificationCard({
        ...n,
        formattedTime: formatDate(n.createdAt),
        user: n.user, 
      });

      card.dataset.id = n._id;

      // Gắn event riêng cho từng notification
      const markBtn = card.querySelector(".mark-as-read-button");
      const closeBtn = card.querySelector(".close-button");

      if (markBtn) markBtn.addEventListener("click", () => handleMarkRead(n._id, card));
      if (closeBtn) closeBtn.addEventListener("click", () => handleDelete(n._id, card));

      notificationCard.appendChild(card);
    });
  }

  // 🟣 Đánh dấu đã đọc
  async function handleMarkRead(id, card) {
    try {
      await apiFetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      card.classList.add("read");
      const markBtn = card.querySelector(".mark-as-read-button");
      if (markBtn) markBtn.remove();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  }

  // 🔴 Xóa thông báo
  async function handleDelete(id, card) {
    if (!confirm("Bạn chắc chắn muốn xoá thông báo này?")) return;

    try {
      await apiFetch(`${API_BASE_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      card.remove();
    } catch (err) {
      console.error("Lỗi xoá thông báo:", err);
    }
  }

  // Gọi khi trang load
  fetchNotifications();
});
