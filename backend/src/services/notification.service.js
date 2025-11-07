// services/notification.service.js
const Notification = require("../models/Notification");

const createNotification = async (userId, type, message) => {
  try {
    const noti = await Notification.create({ user: userId, type, message });
    return noti;
  } catch (err) {
    console.error("Error creating notification:", err.message);
    throw err;
  }
};

module.exports = { createNotification };
