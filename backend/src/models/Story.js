const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true }, // link ảnh hoặc video (Firebase)
  type: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 } 
  // story tự xóa sau 24h (TTL index của MongoDB)
});

module.exports = mongoose.model("Story", StorySchema);