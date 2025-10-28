const { createNotification } = require("../services/notification.service");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Tạo bài đăng
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const newPost = new Post({ content, author: req.user.id });

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const mime = file.mimetype;
        if (mime.startsWith("image/")) newPost.images.push(file.path);
        else if (mime.startsWith("video/")) newPost.videos.push(file.path);
        else if (mime.startsWith("audio/")) {
          if (!newPost.audio) newPost.audio = []; // khởi tạo mảng nếu chưa có
          newPost.audio.push(file.path);
        }
      });
    }

    await newPost.save();
    res.status(201).json({ post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tạo bài đăng", error: err.message });
  }
};


// Lấy feed
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy feed", error });
  }
};

// Like / Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
      await post.save();
      res.json({ message: "Đã like", likes: post.likes.length });
    } else {
      post.likes.splice(index, 1);
      await post.save();
      res.json({ message: "Đã unlike", likes: post.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi like/unlike", error });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const me = req.user;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const { text } = req.body;
    const comment = new Comment({ postId: post._id, userId: me._id, text });
    await comment.save();

    if (post.author.toString() !== me._id.toString()) {
      await createNotification(
        post.author,
        "comment",
        `${me.username} đã comment bài viết của bạn`
      );
    }

    return res.json({ message: "Đã comment", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};