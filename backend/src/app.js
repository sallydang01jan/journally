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
app.use("/api", apiLimiter);

logger.info("Server starting...");
console.log(helpers.formatDate(new Date()));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/upload", uploadRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/stories", storyRoutes);

// --- Google routes ---
app.post("/auth/google", googleAuth);
app.post("/auth/refresh", refreshAuth);

module.exports = app;
