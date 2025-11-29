const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },

  // Global configurations
  ipAddress: {
    type: String,
    default: ''
  },

  // Cloud storage configurations
  storageConfigs: [
    {
      type: {
        type: String,
        enum: ['GoogleDrive', 'LocalStorage'],
        required: true
      },
      googleDrive: {
        clientId: String,
        clientSecret: String,
        refreshToken: String,
        redirectUrl: String
      },
      localStorage: {
        storagePath: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Installed macOS-like desktop apps
  desktopApps: [String]
});

module.exports = mongoose.model('Configuration', configSchema);
