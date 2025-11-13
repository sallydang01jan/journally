// app.js
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

// ✅ Nạp biến môi trường
dotenv.config();

// --- CORS setup ---
app.use(
  cors({
    origin: "https://journally-rho.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes & middlewares ---
const errorHandler = require("./middlewares/error.middleware.js");
const logger = require("./utils/logger.js");
const helpers = require("./utils/helpers.js");
const apiLimiter = require("./middlewares/rateLimit.middleware");

const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/users.routes.js");
const postsRoutes = require("./routes/posts.routes.js");
const commentsRoutes = require("./routes/comments.routes.js");
const uploadRoutes = require("./routes/upload.routes.js");
const notificationsRoutes = require("./routes/notifications.routes.js");
const storyRoutes = require("./routes/stories.routes.js");
const mediaRoutes = require("./routes/media.routes");

const googleAuthRouter = require("./routes/auth/google.js").default;

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is alive 🚀" });
});

// --- Apply middlewares & routes ---
app.use(errorHandler);
app.use("/api", apiLimiter); // <--- dòng này giữ nguyên

logger.info("Server starting...");
console.log(helpers.formatDate(new Date()));

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRouter);
app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/media", mediaRoutes);

// --- Google routes ---

module.exports = app;
