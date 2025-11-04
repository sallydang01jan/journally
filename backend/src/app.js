// app.js
const express = require("express");
const app = express();
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// ✅ Nạp biến môi trường
dotenv.config();

// --- CORS setup ---
app.use(
  cors({
    origin: "https://journally-phi.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// --- Firebase Admin (an toàn, không file JSON) ---
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

// ✅ Google auth (CommonJS)
const { googleAuth, refreshAuth } = require("./routes/auth/google.js");

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
app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/stories", storyRoutes);

// --- Google routes ---
app.post("/api/auth/google", googleAuth);
app.post("/api/auth/refresh", refreshAuth);

module.exports = app;
