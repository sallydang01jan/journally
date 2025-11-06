const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🟢 Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Thiếu token Google" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name || email.split("@")[0],
        email,
        passwordHash: "",
        googleId: sub,
        avatar: picture,
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m", issuer: "myapp", audience: "myapp-frontend" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d", issuer: "myapp" }
    );

    res.json({
      message: "Đăng nhập Google thành công",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Lỗi khi xác thực Google" });
  }
};

// 🟠 Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash: hashedPassword });

    res.status(201).json({ message: "Đăng ký thành công", userId: user._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã được dùng" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// 🟣 Đăng nhập thường
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m", issuer: "myapp", audience: "myapp-frontend" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d", issuer: "myapp" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔵 Lấy thông tin chính mình
exports.me = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Chưa đăng nhập" });

    res.json({ message: "Token hợp lệ", user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔄 Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Thiếu refreshToken" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const newToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m", issuer: "myapp", audience: "myapp-frontend" }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }
};
