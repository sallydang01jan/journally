// routes/posts.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const postController = require("../controllers/posts.controller");
const { validate, postSchema } = require("../utils/validators");

// ==================== Tạo bài post (có thể kèm file: image/video/audio) ====================
router.post(
  "/",
  auth,
  upload.array("file"), // multer xử lý file upload
  validate(postSchema),
  postController.createPost
);

router.get("/feed", auth, postController.getFeed);

router.post("/:id/like", auth, postController.toggleLike);

router.post("/:id/comment", auth, postController.commentPost);

module.exports = router;
