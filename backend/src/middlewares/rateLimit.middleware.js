// middlewares/rateLimit.middleware.js
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn 100 request / 15 phút
  message: { error: "Quá nhiều request, thử lại sau" },
});

module.exports = apiLimiter;