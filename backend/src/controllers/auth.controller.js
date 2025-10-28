const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🟢 Đăng nhập qua Google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Thiếu token Google" });

    // Xác minh token từ Google / Firebase
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Tìm hoặc tạo người dùng
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

    // Tạo JWT của hệ thống
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: "1d",
});

    res.json({
      message: "Đăng nhập Google thành công",
      token: jwtToken,
      user: { userId: user._id, email: user.email, name: user.username },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Lỗi khi xác thực Google" });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
    });

    res.status(201).json({ message: "Đăng ký thành công", userId: user._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã được dùng" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Chưa đăng nhập" });

    // Nếu middleware verifyToken đã gán user vào req.user
    res.json({
      message: "Token hợp lệ",
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};