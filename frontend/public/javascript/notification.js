// frontend/javascript/notification.js
import { getToken, apiFetch, formatDate, requireAuth, showAlert, handleApiError } from "/utils.js";
import { createNotificationCard } from "/createComponents.js";

document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();

  const token = getToken();
  const notificationCard = document.getElementById("notification-card");
  const notifBtn = document.querySelector(".notification-button");

  // Ẩn nút nếu chưa đăng nhập
  if (!token && notifBtn) {
    notifBtn.style.display = "none";
  }

  // 🔔 Lấy danh sách thông báo
  async function fetchNotifications() {
    try {
      const notifications = await apiFetch(`/notifications`);
      renderNotifications(notifications || []);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
      if (notificationCard) {
        notificationCard.innerHTML = `<p class="text-danger">⚠️ Không thể tải thông báo.</p>`;
      }
      handleApiError(err);
    }
  }

  // 🎨 Hiển thị danh sách
  function renderNotifications(list) {
    if (!notificationCard) return;
    notificationCard.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
      notificationCard.innerHTML = `<p class="text-muted text-center mt-4">Chưa có thông báo nào 🌙</p>`;
      return;
    }

    list.forEach((n) => {
      const card = createNotificationCard({
        ...n,
        formattedTime: formatDate(n.createdAt),
        user: n.user,
      });

      card.dataset.id = n._id;

      const markBtn = card.querySelector(".mark-as-read-button");
      const closeBtn = card.querySelector(".close-button");

      if (markBtn) markBtn.addEventListener("click", () => handleMarkRead(n._id, card));
      if (closeBtn) closeBtn.addEventListener("click", () => handleDelete(n._id, card));

      notificationCard.appendChild(card);
    });
  }

  // ✅ Đánh dấu đã đọc
  async function handleMarkRead(id, card) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PUT" });
      card.classList.add("read");
      const markBtn = card.querySelector(".mark-as-read-button");
      if (markBtn) markBtn.remove();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
      handleApiError(err);
    }
  }

  // 🗑️ Xóa thông báo
  async function handleDelete(id, card) {
    if (!confirm("Bạn chắc chắn muốn xoá thông báo này?")) return;
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      card.remove();
      showAlert("Đã xoá thông báo", "success");
    } catch (err) {
      console.error("Lỗi xoá thông báo:", err);
      handleApiError(err);
    }
  }

  fetchNotifications();
});
