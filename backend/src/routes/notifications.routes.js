const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middlewares/auth.middleware");

// Lấy tất cả notifications của user hiện tại
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar"); // Lấy thêm username và avatar
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Không thể tải thông báo" });
  }
});

// Đánh dấu đã đọc
router.put("/:id/read", auth, async (req, res) => {
  try {
    const noti = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    res.json(noti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xoá noti
router.delete("/:id", auth, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Đã xoá" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
