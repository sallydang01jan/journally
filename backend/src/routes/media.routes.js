// routes/media.routes.js
const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/media.controller");
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware"); // multer/busboy

// bảo vệ route bằng auth
router.post("/upload", auth, upload.single("file"), mediaController.uploadMedia);

module.exports = router;