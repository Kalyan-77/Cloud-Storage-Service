const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },

  type: {
    type: String,
    enum: ["text", "image", "video", "audio", "file"],
    default: "text"
  },

  text: String,

  file: {
    url: String,
    name: String,
    mimeType: String,
    size: Number
  },

  /* 🔥 DELETE LOGIC */
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  }],

  deletedForEveryone: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
