// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        avatar: {type: String, default: ""},
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", UserSchema)