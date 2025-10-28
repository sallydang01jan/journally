// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB dream comes true: ${conn.connection.host}`);
    console.log("📌 Database name:", conn.connection.name);
  } catch (error) {
    console.error(`Connection error and guess I was just your experiment: ${error.message}`);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  }
};

module.exports = connectDB;
