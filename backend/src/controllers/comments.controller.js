const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ===== Thêm comment =====
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id; // lấy từ token

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Không tìm thấy post" });

    const comment = await Comment.create({ postId, userId, text });
    const populatedComment = await comment.populate("userId", "username avatar"); // ✅ populate luôn

    return res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Xóa comment =====
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });

    if (comment.userId.toString() !== userId)
      return res.status(403).json({ message: "Không có quyền xóa comment này" });

    await comment.deleteOne();
    res.json({ message: "Đã xóa comment" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Lấy tất cả comment theo postId =====
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 }); // 👈 có thể thêm sort cho đẹp
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
