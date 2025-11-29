const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["file", "folder"], required: true },
    parentId: { type: mongoose.Schema.Types.Mixed, ref: "Item", default: null },
    owner: { type: String, required: true },

    // For files only
    googleDriveId: { type: String },
    size: { type: Number },
    mimeType: { type: String },

    // Common
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    trashed: { type: Boolean, default: false }

});

module.exports = mongoose.model("FileManager", itemSchema);