// routes/upload.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

// ✅ Chỉ giữ 1 route POST "/"
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file được gửi lên" });
  }

  // Trả url để frontend hiển thị preview
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, file: req.file });
});

module.exports = router;
