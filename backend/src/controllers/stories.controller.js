// controllers/stories.controller.js
const Story = require("../models/Story");

exports.createStory = async (req, res) => {
  try {
    const { mediaUrl, type, caption } = req.body;
    const userId = req.user.id; // từ authMiddleware

    if (!mediaUrl || !type) {
      return res.status(400).json({ message: "Thiếu thông tin story" });
    }

    const story = await Story.create({ user: userId, mediaUrl, type, caption });
    res.status(201).json(story);
  } catch (err) {
    console.error("❌ Lỗi createStory:", err);
    res.status(500).json({ message: "Lỗi server khi tạo story" });
  }
};

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error("❌ Lỗi getStories:", err);
    res.status(500).json({ message: "Lỗi server khi lấy stories" });
  }
};

