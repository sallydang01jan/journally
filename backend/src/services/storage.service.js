// services/storage.service.js
// Demo: giả sử file được lưu local và trả URL tĩnh
// services/storage.service.js
exports.uploadFile = async (file) => {
  // Tạo URL tĩnh cho file
  const url = `https://journally-phi.vercel.app/uploads/${file.filename}`;
  return url;
};
