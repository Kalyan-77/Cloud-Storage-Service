const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  }]
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
