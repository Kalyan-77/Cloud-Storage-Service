const { google } = require('googleapis');
const fs = require('fs');
const stream = require("stream");


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

console.log("ID: " , process.env.CLIENT_ID);
console.log("Secret : " , process.env.CLIENT_SECRET);
console.log("URL : " , process.env.REDIRECT_URI);
console.log("refresh_token : " , process.env.REFRESH_TOKEN);



oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

function getDrive() {
    return google.drive({ version: 'v3', auth: oauth2Client });
}

//Display All the include trash

// exports.listAllFiles = async (req, res) => {
//   try {
//     const drive = getDrive();
//     const response = await drive.files.list({
//       pageSize: 50,
//       fields: "files(id, name, mimeType, webViewLink, webContentLink, createdTime)",
//       orderBy: "createdTime desc"  // sort by latest uploads first
//     });

//     const files = response.data.files.map(file => ({
//       id: file.id,
//       name: file.name,
//       mimeType: file.mimeType,
//       viewLink: file.webViewLink,
//       downloadLink: file.webContentLink,
//       uploadedAt: new Date(file.createdTime).toLocaleString("en-IN", { 
//         timeZone: "Asia/Kolkata"   // ✅ formatted in IST
//       })
//     }));

//     //console.log("Drive files:", files);
//     res.json(files);
//   } catch (err) {
//     console.error("Error listing files:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// List files exclude Trash
exports.listAllFiles = async (req, res) => {
  try {
    const drive = getDrive();
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      orderBy: "createdTime desc",
      q: "trashed=false"
    });

    const files = response.data.files.map(file => {
      // Ensure we have valid dates
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { 
          timeZone: "Asia/Kolkata"
        }),
        createdTime: createdTime,
        modifiedTime: modifiedTime
      };
    });

    res.json(files);
  } catch (err) {
    console.error("Error listing files:", err);
    res.status(500).json({ error: err.message });
  }
};




// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const drive = getDrive();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: "id, name, webViewLink",
    });

    // Save the actual Google Drive file ID in req.file
    req.file.driveFileId = response.data.id;

    // Delete temp file from local storage
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Temp file deletion error:", err);
    });

    // Return the Drive response
    res.json({
      message: "File uploaded successfully",
      fileId: response.data.id,
      name: response.data.name,
      webViewLink: response.data.webViewLink
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};


// Make file public
exports.makeFilePublic = async (req, res) => {
    try {
        const drive = getDrive();
        await drive.permissions.create({
            fileId: req.params.fileId,
            requestBody: { role: 'reader', type: 'anyone' },
        });
        const result = await drive.files.get({
            fileId: req.params.fileId,
            fields: 'id, name, webViewLink, webContentLink',
        });
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete file
exports.deleteFile = async (req, res) => {
    try {
        const drive = getDrive();
        await drive.files.delete({ fileId: req.params.fileId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Download file
exports.downloadFile = async (req, res) => {
    try {
        const drive = getDrive();
        const file = await drive.files.get({ fileId: req.params.fileId, fields: 'name' });
        const fileName = file.data.name;

        const driveRes = await drive.files.get(
            { fileId: req.params.fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        driveRes.data.pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// List files by type (dynamic via query param)
exports.listFilesByType = async (req, res) => {
  try {
    const fileType = req.query.type;

    let mimeTypes = {
      // Office docs
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      svg: "image/svg+xml",
      webp: "image/webp",

      // Videos
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      mkv: "video/x-matroska",
      webm: "video/webm",

      // Audio
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",
      flac: "audio/flac",

      // Text files
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      html: "text/html",
      css: "text/css",
      js: "application/javascript"
    };

    if (!mimeTypes[fileType]) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const drive = getDrive();
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: `mimeType='${mimeTypes[fileType]}' and trashed=false`,
      orderBy: "createdTime desc"
    });

    const files = response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { 
          timeZone: "Asia/Kolkata" 
        }),
        createdTime: createdTime,
        modifiedTime: modifiedTime
      };
    });

    res.json(files);
  } catch (err) {
    console.error("Error listing files:", err);
    res.status(500).json({ error: err.message });
  }
};


// List all files by general type: music, images, videos, documents, text
exports.listFilesByCategory = async (req, res) => {
  try {
    const category = req.query.category; // e.g., music, images, videos, docs
    if (!category) {
      return res.status(400).json({ error: "Category query parameter is required" });
    }

    // Define categories and corresponding mimeTypes
    const categoryMimeTypes = {
      music: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp4",
        "audio/flac"
      ],
      images: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/svg+xml",
        "image/webp"
      ],
      videos: [
        "video/mp4",
        "video/x-msvideo",
        "video/quicktime",
        "video/x-matroska",
        "video/webm"
      ],
      documents: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ],
      text: [
        "text/plain",
        "text/csv",
        "application/json",
        "text/html",
        "text/css",
        "application/javascript"
      ]
    };

    if (!categoryMimeTypes[category]) {
      return res.status(400).json({ error: "Unsupported category" });
    }

    const drive = getDrive();

    // Build query string for mimeTypes
    const mimeQuery = categoryMimeTypes[category]
      .map(mime => `mimeType='${mime}'`)
      .join(" or ");

    const response = await drive.files.list({
      pageSize: 100, // adjust as needed
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: `(${mimeQuery}) and trashed=false`,
      orderBy: "createdTime desc"
    });

    const files = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
      viewLink: file.webViewLink,
      downloadLink: file.webContentLink,
      uploadedAt: new Date(file.createdTime || new Date()).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      }),
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime
    }));

    res.json(files);
  } catch (err) {
    console.error("Error listing files by category:", err);
    res.status(500).json({ error: err.message });
  }
};



// Count all files
exports.countAllFiles = async (req, res) => {
  try {
    const drive = getDrive();
    const response = await drive.files.list({
      pageSize: 1000, // Google Drive API max is 1000 per request
      fields: "files(id)"
    });

    const count = response.data.files.length;
    res.json({ totalFiles: count });
  } catch (err) {
    console.error("Error counting files:", err);
    res.status(500).json({ error: err.message });
  }
};

//Count By File Type
exports.countFilesByType = async (req, res) => {
  try {
    const fileType = req.query.type; // e.g., pdf, jpg
    let mimeTypes = {
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      jpg: "image/jpeg",
      png: "image/png",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      txt: "text/plain"
    };

    if (!mimeTypes[fileType]) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const drive = getDrive();
    const response = await drive.files.list({
      pageSize: 1000,
      fields: "files(id)",
      q: `mimeType='${mimeTypes[fileType]}'`
    });

    const count = response.data.files.length;
    res.json({ fileType, totalFiles: count });
  } catch (err) {
    console.error("Error counting files by type:", err);
    res.status(500).json({ error: err.message });
  }
};

//Total Storage Used
// Get total storage used in Google Drive
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

exports.getStorageUsage = async (req, res) => {
  try {
    const drive = getDrive();
    const response = await drive.about.get({ fields: "storageQuota" });
    const quota = response.data.storageQuota;

    res.json({
      usage: formatBytes(parseInt(quota.usage)),
      limit: formatBytes(parseInt(quota.limit)),
      usageInDrive: formatBytes(parseInt(quota.usageInDrive)),
      usageInDriveTrash: formatBytes(parseInt(quota.usageInDriveTrash))
    });
  } catch (err) {
    console.error("Error fetching storage usage:", err);
    res.status(500).json({ error: err.message });
  }
};


// Helper: convert bytes to human readable
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper to format bytes into human-readable sizes
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

exports.getStorageByType = async (req, res) => {
  try {
    const drive = getDrive();
    const { type } = req.query; // <-- query param like ?type=ppt or ?type=png

    // Fetch files with size + mimeType
    const response = await drive.files.list({
      pageSize: 1000,
      fields: "files(id, name, mimeType, size)"
    });

    const files = response.data.files;
    let totalSize = 0;

    files.forEach(file => {
      const size = parseInt(file.size || 0);
      if (!file.mimeType) return;

      // skip Google Docs native formats
      if (file.mimeType.includes("application/vnd.google-apps")) return;

      // check if user asked for ppt
      if (type === "ppt" && 
          (file.mimeType.includes("presentation") || file.mimeType.includes("powerpoint"))) {
        totalSize += size;
      }
      // check if user asked for pdf
      else if (type === "pdf" && file.mimeType.includes("application/pdf")) {
        totalSize += size;
      }
      // check if user asked for png
      else if (type === "png" && file.mimeType === "image/png") {
        totalSize += size;
      }
      // check if user asked for jpg/jpeg
      else if (type === "jpg" && (file.mimeType === "image/jpeg")) {
        totalSize += size;
      }
      // check if user asked for mp4 video
      else if (type === "mp4" && file.mimeType === "video/mp4") {
        totalSize += size;
      }
      // check if user asked for mp3 audio
      else if (type === "mp3" && file.mimeType === "audio/mpeg") {
        totalSize += size;
      }
      // check if user asked for txt
      else if (type === "txt" && file.mimeType === "text/plain") {
        totalSize += size;
      }
    });

    res.json({
      type: type || "not provided",
      storage: formatBytes(totalSize)
    });
  } catch (err) {
    console.error("Error fetching storage by type:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.searchFilesByName = async (req, res) => {
  try {
    const searchName = req.query.name;
    if (!searchName) {
      return res.status(400).json({ error: "Please provide a name to search" });
    }

    const drive = getDrive();
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: `name contains '${searchName}' and trashed=false`,
      orderBy: "createdTime desc"
    });

    const files = response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { 
          timeZone: "Asia/Kolkata" 
        }),
        createdTime: createdTime,
        modifiedTime: modifiedTime
      };
    });

    res.json(files);
  } catch (err) {
    console.error("Error searching files:", err);
    res.status(500).json({ error: err.message });
  }
};

// Generate public link for a file
exports.generateFileLink = async (req, res) => {
  try {
    const drive = getDrive();
    const fileId = req.params.fileId;

    // Make file public (anyone with link can view)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    // Fetch file info
    const result = await drive.files.get({
      fileId: fileId,
      fields: "id, name, webViewLink, webContentLink",
    });

    res.json({
      id: result.data.id,
      name: result.data.name,
      viewLink: result.data.webViewLink,      // open in browser
      downloadLink: result.data.webContentLink // direct download
    });
  } catch (err) {
    console.error("Error generating file link:", err);
    res.status(500).json({ error: err.message });
  }
};


// Update file name
exports.updateFileName = async (req, res) => {
  try {
    const drive = getDrive();
    const fileId = req.params.fileId;
    const newName = req.body.name; // send { "name": "newFileName.txt" } in body

    if (!newName) {
      return res.status(400).json({ error: "New file name is required" });
    }

    // Update file metadata
    const response = await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newName,
      },
      fields: "id, name, mimeType, webViewLink, webContentLink",
    });

    res.json({
      message: "File renamed successfully",
      file: response.data
    });
  } catch (err) {
    console.error("Error renaming file:", err);
    res.status(500).json({ error: err.message });
  }
};

// List all trashed files (files in Bin)
exports.listTrashedFiles = async (req, res) => {
  try {
    const drive = getDrive();
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: "trashed = true",
      orderBy: "createdTime desc"
    });

    const files = response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { 
          timeZone: "Asia/Kolkata"
        }),
        createdTime: createdTime,
        modifiedTime: modifiedTime
      };
    });

    res.json(files);
  } catch (err) {
    console.error("Error listing trashed files:", err);
    res.status(500).json({ error: err.message });
  }
};
// Move a file to trash (Bin)
exports.moveFileToTrash = async (req, res) => {
  try {
    const drive = getDrive();
    const fileId = req.params.fileId;

    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }

    // Update the file's trashed property
    const response = await drive.files.update({
      fileId: fileId,
      requestBody: { trashed: true },
      fields: "id, name, trashed, webViewLink, webContentLink"
    });

    res.json({
      message: "File moved to trash successfully",
      file: response.data
    });
  } catch (err) {
    console.error("Error moving file to trash:", err);
    res.status(500).json({ error: err.message });
  }
};


// Restore file from trash
exports.restoreFileFromTrash = async (req, res) => {
  try {
    const drive = getDrive(); // use your existing getDrive function
    const fileId = req.params.fileId;

    const response = await drive.files.update({
      fileId: fileId,
      requestBody: { trashed: false },
      fields: "id, name, trashed, webViewLink, webContentLink"
    });

    res.json({
      message: "File restored from trash successfully",
      file: response.data
    });
  } catch (err) {
    console.error("Error restoring file from trash:", err);
    res.status(500).json({ error: err.message });
  }
};


// Upload file directly from buffer (for text file creation)
exports.uploadFileFromBuffer = async (fileObj) => {
  try {
    const drive = getDrive();

    // Convert Buffer → Stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObj.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileObj.originalname,
        mimeType: fileObj.mimetype,
      },
      media: {
        mimeType: fileObj.mimetype,
        body: bufferStream,
      },
      fields: "id, name, webViewLink, webContentLink",
    });

    return {
      id: response.data.id,
      name: response.data.name,
      viewLink: response.data.webViewLink,
      downloadLink: response.data.webContentLink
    };
  } catch (err) {
    console.error("GoogleDriveController.uploadFileFromBuffer Error:", err);
    throw err;
  }
};

// Update file content on Google Drive
exports.updateFileContent = async (fileId, buffer, mimeType) => {
  try {
    const drive = getDrive();

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const response = await drive.files.update({
      fileId,
      media: {
        mimeType,
        body: bufferStream,
      },
    });

    return response.data;
  } catch (err) {
    console.error("GoogleDriveController.updateFileContent Error:", err);
    throw err;
  }
};


// Stream or display file content (images, videos, text, etc.)
exports.displayFileContent = async (req, res) => {
  try {
    const drive = getDrive();
    const fileId = req.params.fileId;

    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }

    // Get metadata to know file type
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: "id, name, mimeType"
    });

    const mimeType = metadata.data.mimeType || "application/octet-stream";

    // Stream file content
    const fileStream = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "no-cache");

    // Stream directly to browser
    fileStream.data.pipe(res);
  } catch (err) {
    console.error("Error displaying file content:", err);
    res.status(500).json({ error: err.message });
  }
};
