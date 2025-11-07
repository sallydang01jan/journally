// controllers/users.controller.js
const User = require("../models/User.js");
const Post = require("../models/Post");
const { createNotification } = require("../services/notification.service");
const mongoose = require("mongoose");

// ===== LẤY PROFILE =====
exports.getProfile = async (req, res, next) => {
  try {
    const targetParam = req.params.id || req.user.id; // lấy param hoặc id của user đang đăng nhập

    let user;
    // ✅ Cho phép tìm bằng _id hoặc username
    if (mongoose.Types.ObjectId.isValid(targetParam)) {
      user = await User.findById(targetParam)
        .select("-passwordHash")
        .populate("followers", "username email avatar")
        .populate("following", "username email avatar")
        .lean();
    } else {
      user = await User.findOne({ username: targetParam })
        .select("-passwordHash")
        .populate("followers", "username email avatar")
        .populate("following", "username email avatar")
        .lean();
    }

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // ✅ Thêm trường `id` để frontend đọc được (chuẩn RESTful)
    user.id = user._id;

    const posts = await Post.find({ author: user._id })
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username avatar" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ...user, posts });
  } catch (err) {
    next(err);
  }
};


// ===== CẬP NHẬT PROFILE =====
exports.updateProfile = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Không được phép update người khác" });
    }

    const { username, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, avatar },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ===== FOLLOW / UNFOLLOW =====
exports.toggleFollow = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const targetId = req.params.id;
    const target = await User.findById(targetId);

    if (!me || !target)
      return res.status(404).json({ message: "User không tồn tại" });

    if (me._id.toString() === target._id.toString()) {
      return res.status(400).json({ message: "Không thể follow chính mình" });
    }

    const isFollowing = me.following.includes(target._id);

    if (isFollowing) {
      // ✅ Unfollow
      me.following = me.following.filter(id => id.toString() !== target._id.toString());
      target.followers = target.followers.filter(id => id.toString() !== me._id.toString());
      await me.save();
      await target.save();

      return res.json({ message: "Đã unfollow", isFollowing: false });
    } else {
      // ✅ Follow
      me.following.push(target._id);
      target.followers.push(me._id);
      await me.save();
      await target.save();

      await createNotification(target._id, "follow", `${me.username} đã follow bạn`);

      return res.json({ message: "Đã follow", isFollowing: true });
    }
  } catch (err) {
    console.error("Lỗi toggleFollow:", err);
    res.status(500).json({ message: "Server error" });
  }
};
