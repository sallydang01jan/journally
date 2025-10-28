// server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const logger = require("./utils/logger.js");
const helpers = require("./utils/helpers.js");
const app = require("./app.js");

dotenv.config();

const cors = require ("cors")
app.use(cors());

const PORT = process.env.PORT || 5000;

logger.info("Server starting...");
console.log(helpers.formatDate(new Date()));

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  });
