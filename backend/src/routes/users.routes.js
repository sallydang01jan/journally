// routes/users.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const auth = require("../middlewares/auth.middleware");

router.get("/me", auth, userController.getProfile);
router.get("/:id", authMiddleware, userController.getProfile);
router.put("/:id", authMiddleware, userController.updateProfile);
router.post("/:id/follow", authMiddleware, userController.toggleFollow);

module.exports = router;
