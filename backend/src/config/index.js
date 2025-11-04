// config/index.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI,
    firebaseKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT,
};