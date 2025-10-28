const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Thiếu token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    req.user = user;
    next();
  } catch {
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

// phiên bản verify đặc biệt
authMiddleware.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "myapp",
      audience: "myapp-frontend",
    });
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify failed:", err.message);
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
