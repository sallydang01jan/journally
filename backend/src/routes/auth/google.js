import express from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔹 POST /auth/google
router.post("/google", async (req, res) => {
  const { token: idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Missing ID token" });

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("Missing JWT environment variables");
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true);

    if (decoded.exp * 1000 < Date.now())
      return res.status(401).json({ message: "Expired Firebase ID token" });

    const userRecord = await admin.auth().getUser(decoded.uid);
    if (userRecord.disabled)
      return res.status(403).json({ message: "User account disabled" });

    // ✅ Tạo access + refresh token
    const appToken = jwt.sign(
      { userId: decoded.uid, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m", issuer: "myapp", audience: "myapp-frontend" }
    );

    const refreshToken = jwt.sign(
      { userId: decoded.uid, email: decoded.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d", issuer: "myapp" }
    );

    res.json({ token: appToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// 🔹 POST /auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Missing refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const appToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m", issuer: "myapp" }
    );
    res.json({ token: appToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// 🔹 GET /auth/profile → test JWT
router.get("/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// routes/auth/google.js
export const googleAuth = (req, res) => {
  res.send("Google authentication successful!");
};

export const refreshAuth = (req, res) => {
  res.send("Token refreshed successfully!");
};

export default router;
