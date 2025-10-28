// controllers/media.controller.js
const storageService = require("../services/storage.service");

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file nào được tải lên." });
    }

    const url = await storageService.uploadFile(req.file);
    return res.status(200).json({ 
      message: "Upload thành công", 
      url,
      filename: req.file.filename 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi upload server." });
  }
};
