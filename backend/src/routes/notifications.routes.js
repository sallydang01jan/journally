// routes/notifications.routes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middlewares/auth.middleware");

// 📬 Lấy tất cả thông báo của user hiện tại
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar"); // Lấy thêm thông tin người gửi
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Không thể tải thông báo" });
  }
});

// ✅ Đánh dấu đã đọc
router.put("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Không thể đánh dấu đã đọc" });
  }
});

// 🗑️ Xoá thông báo
router.delete("/:id", auth, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Không thể xoá thông báo" });
  }
});

module.exports = router;
