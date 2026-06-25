const { google } = require("googleapis");
const stream = require("stream");
const Users = require("../Models/Users");

// Helper to format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const googleDriveService = {
  getDrive: async (userId) => {
    const user = await Users.findById(userId);
    if (!user) throw new Error("User not found");
    if (!user.googleRefreshToken) {
      const err = new Error("Google Drive not connected");
      err.code = "DRIVE_NOT_CONNECTED";
      throw err;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken
    });

    return google.drive({
      version: "v3",
      auth: oauth2Client
    });
  },

  listAllFiles: async (userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      orderBy: "createdTime desc",
      q: "trashed=false"
    });

    return response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdTime,
        modifiedTime
      };
    });
  },

  uploadFile: async (fileObj, userId) => {
    const drive = await googleDriveService.getDrive(userId);
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
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };
  },

  makeFilePublic: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });
    const result = await drive.files.get({
      fileId,
      fields: "id, name, webViewLink, webContentLink",
    });
    return result.data;
  },

  deleteFile: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    await drive.files.delete({ fileId });
    return { success: true };
  },

  downloadFile: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const file = await drive.files.get({ fileId, fields: "name" });
    const name = file.data.name;

    const streamResponse = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return {
      name,
      stream: streamResponse.data
    };
  },

  listFilesByType: async (fileType, userId) => {
    const mimeTypes = {
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      svg: "image/svg+xml",
      webp: "image/webp",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      mkv: "video/x-matroska",
      webm: "video/webm",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",
      flac: "audio/flac",
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      html: "text/html",
      css: "text/css",
      js: "application/javascript"
    };

    const mime = mimeTypes[fileType];
    if (!mime) throw new Error("Unsupported file type");

    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: `mimeType='${mime}' and trashed=false`,
      orderBy: "createdTime desc"
    });

    return response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdTime,
        modifiedTime
      };
    });
  },

  listFilesByCategory: async (category, userId) => {
    const categoryMimeTypes = {
      music: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac"],
      images: ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/svg+xml", "image/webp"],
      videos: ["video/mp4", "video/x-msvideo", "video/quicktime", "video/x-matroska", "video/webm"],
      documents: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ],
      text: ["text/plain", "text/csv", "application/json", "text/html", "text/css", "application/javascript"]
    };

    const mimes = categoryMimeTypes[category];
    if (!mimes) throw new Error("Unsupported category");

    const drive = await googleDriveService.getDrive(userId);
    const mimeQuery = mimes.map(m => `mimeType='${m}'`).join(" or ");

    const response = await drive.files.list({
      pageSize: 100,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: `(${mimeQuery}) and trashed=false`,
      orderBy: "createdTime desc"
    });

    return response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
      viewLink: file.webViewLink,
      downloadLink: file.webContentLink,
      uploadedAt: new Date(file.createdTime || new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime
    }));
  },

  countAllFiles: async (userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 1000,
      fields: "files(id)"
    });
    return { totalFiles: response.data.files.length };
  },

  countFilesByType: async (fileType, userId) => {
    const mimeTypes = {
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

    const mime = mimeTypes[fileType];
    if (!mime) throw new Error("Unsupported file type");

    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 1000,
      fields: "files(id)",
      q: `mimeType='${mime}'`
    });
    return { fileType, totalFiles: response.data.files.length };
  },

  getStorageUsage: async (userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.about.get({ fields: "storageQuota" });
    const quota = response.data.storageQuota;

    return {
      usage: formatBytes(parseInt(quota.usage)),
      limit: formatBytes(parseInt(quota.limit)),
      usageInDrive: formatBytes(parseInt(quota.usageInDrive)),
      usageInDriveTrash: formatBytes(parseInt(quota.usageInDriveTrash))
    };
  },

  getStorageByType: async (type, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 1000,
      fields: "files(id, name, mimeType, size)"
    });

    const files = response.data.files;
    let totalSize = 0;

    files.forEach(file => {
      const size = parseInt(file.size || 0);
      if (!file.mimeType) return;
      if (file.mimeType.includes("application/vnd.google-apps")) return;

      if (type === "ppt" && (file.mimeType.includes("presentation") || file.mimeType.includes("powerpoint"))) {
        totalSize += size;
      } else if (type === "pdf" && file.mimeType.includes("application/pdf")) {
        totalSize += size;
      } else if (type === "png" && file.mimeType === "image/png") {
        totalSize += size;
      } else if (type === "jpg" && file.mimeType === "image/jpeg") {
        totalSize += size;
      } else if (type === "mp4" && file.mimeType === "video/mp4") {
        totalSize += size;
      } else if (type === "mp3" && file.mimeType === "audio/mpeg") {
        totalSize += size;
      } else if (type === "txt" && file.mimeType === "text/plain") {
        totalSize += size;
      }
    });

    return {
      type: type || "not provided",
      storage: formatBytes(totalSize)
    };
  },

  searchFilesByName: async (searchName, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: `name contains '${searchName}' and trashed=false`,
      orderBy: "createdTime desc"
    });

    return response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdTime,
        modifiedTime
      };
    });
  },

  generateFileLink: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });
    const result = await drive.files.get({
      fileId,
      fields: "id, name, webViewLink, webContentLink",
    });
    return {
      id: result.data.id,
      name: result.data.name,
      viewLink: result.data.webViewLink,
      downloadLink: result.data.webContentLink
    };
  },

  updateFileName: async (fileId, newName, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.update({
      fileId,
      requestBody: { name: newName },
      fields: "id, name, mimeType, webViewLink, webContentLink",
    });
    return response.data;
  },

  listTrashedFiles: async (userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
      q: "trashed = true",
      orderBy: "createdTime desc"
    });

    return response.data.files.map(file => {
      const createdTime = file.createdTime || new Date().toISOString();
      const modifiedTime = file.modifiedTime || file.createdTime || new Date().toISOString();
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? formatBytes(parseInt(file.size)) : "0 B",
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
        uploadedAt: new Date(createdTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdTime,
        modifiedTime
      };
    });
  },

  moveFileToTrash: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.update({
      fileId,
      requestBody: { trashed: true },
      fields: "id, name, trashed, webViewLink, webContentLink"
    });
    return response.data;
  },

  restoreFileFromTrash: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const response = await drive.files.update({
      fileId,
      requestBody: { trashed: false },
      fields: "id, name, trashed, webViewLink, webContentLink"
    });
    return response.data;
  },

  displayFileContent: async (fileId, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const metadata = await drive.files.get({
      fileId,
      fields: "id, name, mimeType"
    });
    const mimeType = metadata.data.mimeType || "application/octet-stream";

    const fileStream = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return {
      mimeType,
      stream: fileStream.data
    };
  },

  uploadFileFromBuffer: async ({ originalname, mimetype, buffer }, userId) => {
    const drive = await googleDriveService.getDrive(userId);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
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
  },

  updateFileContent: async (fileId, buffer, mimeType, userId) => {
    const drive = await googleDriveService.getDrive(userId);
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
  }
};

module.exports = googleDriveService;
