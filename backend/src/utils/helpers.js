// utils/helpers.js
const crypto = require("crypto");

const helpers = {
  formatDate: (date = new Date()) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  },
    generateId: (prefix = "id") => {
    return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
  },
};

module.exports = helpers;