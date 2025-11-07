// routes/auth/google.js
import express from "express";
import admin from "../../config/firebase.js"; // import admin đã init
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /auth/google
router.post("/google", async (req, res) => {
  const { token: idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Missing ID token" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true);

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

    res.json({
      message: "Google sign-in successful",
      token: appToken,
      refreshToken,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      },
    });
  } catch (err) {
    console.error("Firebase verifyIdToken error:", err);
    res.status(401).json({ message: "Invalid or expired Firebase token" });
  }
});

export default router;
