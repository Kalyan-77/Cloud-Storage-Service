const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
    type: String,
    default: "" // image URL
  },
  about: {
    type: String,
    default: "Hey there! I am using Chat"
  }
},{timestamps: true});

module.exports = mongoose.model('Users',UserSchema);