const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  size: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true,
    enum: [
      "Social",
      "Entertainment",
      "Productivity",
      "Education",  
      "Communication",
      "Shopping",
      "Developer Tools",
      "All",
      "System Apps"
    ]
  },

  description: {
    type: String,
    required: true
  },

  icon: {
    type: String,   // emoji or URL
    required: true
  }
}, { timestamps: true });

// exporting model
module.exports = mongoose.model("App", appSchema);
