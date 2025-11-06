const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Thiếu token" });
  }

  try {
    // ✅ Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id; // <-- sửa ở đây

    if (!userId) {
      return res.status(403).json({ message: "Token không hợp lệ (thiếu id)" });
    }

    // ✅ Truy vấn DB để đảm bảo user tồn tại
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // ✅ Gắn user vào request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
