const googleDriveService = require("../Services/googleDriveService");

exports.listAllFiles = async (req, res) => {
  try {
    const files = await googleDriveService.listAllFiles(req.session.user._id);
    res.json(files);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error listing files:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const driveRes = await googleDriveService.uploadFile(req.file, req.session.user._id);

    // Save the actual Google Drive file ID in req.file for potential chain calls
    req.file.driveFileId = driveRes.id;

    res.json({
      message: "File uploaded successfully",
      fileId: driveRes.id,
      name: driveRes.name,
      webViewLink: driveRes.webViewLink
    });
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.makeFilePublic = async (req, res) => {
  try {
    const result = await googleDriveService.makeFilePublic(req.params.fileId, req.session.user._id);
    res.json(result);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const result = await googleDriveService.deleteFile(req.params.fileId, req.session.user._id);
    res.json(result);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { name, stream } = await googleDriveService.downloadFile(req.params.fileId, req.session.user._id);
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    stream.pipe(res);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.listFilesByType = async (req, res) => {
  try {
    const files = await googleDriveService.listFilesByType(req.query.type, req.session.user._id);
    res.json(files);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.listFilesByCategory = async (req, res) => {
  try {
    const files = await googleDriveService.listFilesByCategory(req.query.category, req.session.user._id);
    res.json(files);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.countAllFiles = async (req, res) => {
  try {
    const countData = await googleDriveService.countAllFiles(req.session.user._id);
    res.json(countData);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error counting files:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.countFilesByType = async (req, res) => {
  try {
    const countData = await googleDriveService.countFilesByType(req.query.type, req.session.user._id);
    res.json(countData);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error counting files by type:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getStorageUsage = async (req, res) => {
  try {
    const usageData = await googleDriveService.getStorageUsage(req.session.user._id);
    res.json(usageData);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error fetching storage usage:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getStorageByType = async (req, res) => {
  try {
    const storageData = await googleDriveService.getStorageByType(req.query.type, req.session.user._id);
    res.json(storageData);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error fetching storage by type:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.searchFilesByName = async (req, res) => {
  try {
    const files = await googleDriveService.searchFilesByName(req.query.name, req.session.user._id);
    res.json(files);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error searching files:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.generateFileLink = async (req, res) => {
  try {
    const linkData = await googleDriveService.generateFileLink(req.params.fileId, req.session.user._id);
    res.json(linkData);
  } catch (err) {
    console.error("Error generating file link:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateFileName = async (req, res) => {
  try {
    const fileData = await googleDriveService.updateFileName(req.params.fileId, req.body.name, req.session.user._id);
    res.json({
      message: "File renamed successfully",
      file: fileData
    });
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error renaming file:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.listTrashedFiles = async (req, res) => {
  try {
    const files = await googleDriveService.listTrashedFiles(req.session.user._id);
    res.json(files);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error listing trashed files:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.moveFileToTrash = async (req, res) => {
  try {
    const fileData = await googleDriveService.moveFileToTrash(req.params.fileId, req.session.user._id);
    res.json({
      message: "File moved to trash successfully",
      file: fileData
    });
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error moving file to trash:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.restoreFileFromTrash = async (req, res) => {
  try {
    const fileData = await googleDriveService.restoreFileFromTrash(req.params.fileId, req.session.user._id);
    res.json({
      message: "File restored from trash successfully",
      file: fileData
    });
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error restoring file from trash:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.displayFileContent = async (req, res) => {
  try {
    const { mimeType, stream } = await googleDriveService.displayFileContent(req.params.fileId, req.session.user._id);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "no-cache");
    stream.pipe(res);
  } catch (err) {
    if (err.code === "DRIVE_NOT_CONNECTED") {
      return res.status(400).json({ connected: false, message: "Google Drive not connected" });
    }
    console.error("Error displaying file content:", err);
    res.status(500).json({ error: err.message });
  }
};
