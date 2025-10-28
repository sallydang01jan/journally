const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Thêm comment vào post
router.post("/:postId", authMiddleware, commentsController.addComment);

// Xóa comment theo id
router.delete("/:commentId", authMiddleware, commentsController.deleteComment);

// Lấy tất cả comments của 1 post
router.get("/:postId", authMiddleware, commentsController.getCommentsByPost);

module.exports = router;
