const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate, registerSchema, loginSchema } = require("../utils/validators");

// Đăng ký
router.post("/register", validate(registerSchema), authController.register);

// Đăng nhập
router.post("/login", validate(loginSchema), authController.login);

// Đăng nhập Google
router.post("/google", authController.googleLogin);

// Lấy thông tin người dùng hiện tại
router.get("/me", authMiddleware, authController.me);

// 🔄 Làm mới token
router.post("/refresh", authController.refreshToken);

module.exports = router;
