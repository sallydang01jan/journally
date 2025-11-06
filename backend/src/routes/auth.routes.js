// auth.routes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate, registerSchema, loginSchema } = require("../utils/validators");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", authController.googleLogin);
router.get("/me", authMiddleware, authController.me);
router.post("/refresh", authController.refreshToken);

module.exports = router;
