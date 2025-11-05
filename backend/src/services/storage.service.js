// services/storage.service.js
exports.uploadFile = async (file) => {
  const url = `https://journally-backend.onrender.com/uploads/${file.filename}`;
  return url;
};
