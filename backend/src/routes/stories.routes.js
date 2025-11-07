// routes/stories.routes.js
const express = require("express");
const router = express.Router();
const { createStory, getStories } = require("../controllers/stories.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, createStory); // tạo story
router.get("/", authMiddleware, getStories);   // lấy story

module.exports = router;
