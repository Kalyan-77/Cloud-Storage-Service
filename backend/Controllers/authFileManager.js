const FileManager = require('../Models/FileManager');
const GoogleDriveController = require('./googleDriveController');


// Create a text file and save it to Google Drive + MongoDB
exports.createTextFile = async (req, res) => {
  try {
    const { name, content, parentId, owner } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ error: "Name and owner are required" });
    }

    // Ensure .txt extension
    const fileName = name.endsWith(".txt") ? name : `${name}.txt`;
    const buffer = Buffer.from(content || "", "utf-8");

    // Upload to Google Drive directly
    const driveResponse = await GoogleDriveController.uploadFileFromBuffer({
      originalname: fileName,
      mimetype: "text/plain",
      buffer,
    });

    // Save metadata to MongoDB
    const newFile = new FileManager({
      name: fileName,
      type: "file",
      parentId: parentId || null,
      owner,
      googleDriveId: driveResponse.id,
      size: buffer.length,
      mimeType: "text/plain",
    });

    await newFile.save();

    res.status(201).json({
      message: "Text file created successfully",
      file: newFile,
    });
  } catch (err) {
    console.error("Error creating text file:", err);
    res.status(500).json({ error: err.message });
  }
};


// Upload text file directly from buffer
exports.uploadFileDirect = async (fileObj) => {
  const { google } = require("googleapis");
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const stream = require("stream");
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
    fields: "id, webViewLink, webContentLink",
  });

  return {
    id: response.data.id,
    viewLink: response.data.webViewLink,
    downloadLink: response.data.webContentLink,
  };
};

// Get all text files for a user (local + Drive metadata)
exports.getTextFiles = async (req, res) => {
  try {
    const { owner } = req.query; // optional filter by owner

    const query = { mimeType: "text/plain", trashed: false };
    if (owner) query.owner = owner;

    // Fetch text files from MongoDB
    const textFiles = await FileManager.find(query).sort({ name: 1 });

    res.status(200).json({
      message: "Text files fetched successfully",
      count: textFiles.length,
      files: textFiles,
    });
  } catch (err) {
    console.error("Error fetching text files:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update an existing text file
exports.updateTextFile = async (req, res) => {
  try {
    const { id } = req.params;  // File ID in MongoDB
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Find file in DB
    const file = await FileManager.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.mimeType !== "text/plain") {
      return res.status(400).json({ error: "Only text files can be updated" });
    }

    const buffer = Buffer.from(content, "utf-8");

    // Update on Google Drive
    const driveResponse = await GoogleDriveController.updateFileContent(
      file.googleDriveId,
      buffer,
      "text/plain"
    );

    // Update size in MongoDB
    file.size = buffer.length;
    await file.save();

    res.status(200).json({
      message: "Text file updated successfully",
      file,
      drive: driveResponse,
    });
  } catch (err) {
    console.error("Error updating text file:", err);
    res.status(500).json({ error: err.message });
  }
};



//Create a folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parentId, owner } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ message: "Name and owner are required" });
    }

    const folder = new FileManager({
      name,
      type: "folder",
      parentId: parentId || null, // root if no parentId
      owner
    });

    await folder.save();

    res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Server error while creating folder" });
  }
};


// Get all files and folders for a specific user
exports.getItemsByUser = async (req, res) => {
  try {
    const { userId } = req.params; // get userId from URL

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch all items owned by the user, excluding trashed by default
    const items = await FileManager.find({ owner: userId, trashed: false }).sort({ type: -1, name: 1 });

    res.status(200).json({
      message: "User items fetched successfully",
      count: items.length,
      items
    });
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ error: err.message });
  }
};


// Get Folder
exports.getFolderContents = async (req, res) => {
  try {
    const { id } = req.params; // folder ID (ObjectId)
    let query = {};

    if (id === "root") {
      // root folder: fetch items without a parent, exclude trashed
      query = { parentId: null, trashed: false };
    } else if (id === "trash") {
      // Trash folder: fetch all trashed items
      query = { trashed: true };
    } else {
      // normal folder: fetch items with parentId = id, exclude trashed
      query = { parentId: id, trashed: false };
    }

    const contents = await FileManager.find(query).sort({ type: -1, name: 1 });

    res.status(200).json({
      message: "Folder contents fetched successfully",
      folderId: id,
      items: contents,
    });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    res.status(500).json({ message: "Server error while fetching folder contents" });
  }
};



exports.uploadFileToManager = async (req, res) => {
  try {
    const { parentId, owner } = req.body;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Upload file to Google Drive
    await GoogleDriveController.uploadFile(req, res);

    // At this point, res.json has already been sent by uploadFile
    // So we can save metadata in MongoDB but cannot send another res
    const newFile = new FileManager({
      name: req.file.originalname,
      type: "file",
      parentId: parentId || null, // points to folder in MongoDB
      owner,
      googleDriveId: req.file.driveFileId, // temporarily store name, you can update with actual Drive ID if needed
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    await newFile.save();
    console.log("File metadata saved in MongoDB");

    // Do NOT call res.json here because GoogleDriveController.uploadFile already sent response
  } catch (err) {
    console.error("FileManager Upload Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.moveFileToTrash = async (req, res) => {
  try {
    const { id } = req.params; // MongoDB file ID

    // 1️⃣ Find the file in MongoDB
    const file = await FileManager.findById(id);
    if (!file || file.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    // 2️⃣ Move to trash in Google Drive if it has a Drive ID
    if (file.googleDriveId) {
      try {
        await GoogleDriveController.moveFileToTrash(
          { params: { fileId: file.googleDriveId } },
          { 
            status: () => ({ json: () => {} }), // dummy response
            json: () => {}
          }
        );
      } catch (err) {
        console.error("Error moving file to Drive trash:", err.message);
        return res.status(500).json({ error: "Failed to move file to Drive trash" });
      }
    }

    // 3️⃣ Mark file as trashed in MongoDB
    file.trashed = true;
    await file.save();

    res.status(200).json({ message: "File moved to trash successfully", file });
  } catch (err) {
    console.error("Error moving file to trash:", err);
    res.status(500).json({ error: err.message });
  }
};





// Permanently delete a file from Drive and MongoDB
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params; 
    const file = await FileManager.findById(id);

    if (!file || file.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    if (!file.trashed) {
      return res.status(400).json({ error: "File must be in trash to permanently delete" });
    }

    // Permanently delete from Google Drive
    if (file.googleDriveId) {
      try {
        await GoogleDriveController.deleteFile({ params: { fileId: file.googleDriveId } }, { 
          status: () => ({ json: () => {} }),
          json: () => {}
        });
      } catch (err) {
        console.error("Error permanently deleting file from Drive:", err.message);
        return res.status(500).json({ error: "Failed to delete file from Drive permanently" });
      }
    }

    // Delete from MongoDB
    await FileManager.findByIdAndDelete(id);

    res.status(200).json({ message: "File permanently deleted" });
  } catch (err) {
    console.error("Error permanently deleting file:", err);
    res.status(500).json({ error: err.message });
  }
};

// Controller: delete folder
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await FileManager.findById(id);

    if (!folder || folder.type !== "folder") {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Delete all contents recursively
    await deleteFolderContents(id);

    // Delete the folder itself
    await FileManager.findByIdAndDelete(id);

    res.status(200).json({ message: "Folder and its contents deleted successfully" });
  } catch (err) {
    console.error("Error deleting folder:", err);
    res.status(500).json({ error: err.message });
  }
};

// Recursive helper to permanently delete folder contents
async function deleteFolderContents(folderId) {
  const items = await FileManager.find({ parentId: folderId });

  for (const item of items) {
    if (item.type === "folder") {
      // recursively delete subfolder contents
      await deleteFolderContents(item._id);
      // delete the folder itself
      await FileManager.findByIdAndDelete(item._id);
    } else if (item.type === "file") {
      // delete from Google Drive if exists
      if (item.googleDriveId) {
        try {
          await GoogleDriveController.deleteFile(
            { params: { fileId: item.googleDriveId } },
            { status: () => ({ json: () => {} }), json: () => {} }
          );
        } catch (err) {
          console.error("Error deleting file from Drive:", err.message);
        }
      }
      // delete from MongoDB
      await FileManager.findByIdAndDelete(item._id);
    }
  }
}



// Rename a file or folder
exports.renameItem = async (req, res) => {
  try {
    const { id } = req.params;      // MongoDB document ID
    const { newName } = req.body;   // new name from client

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ error: "New name is required" });
    }

    // Find item in MongoDB
    const item = await FileManager.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // If it's a file stored on Google Drive, also rename there
    if (item.type === "file" && item.googleDriveId) {
      try {
        await GoogleDriveController.updateFileName(
          { params: { fileId: item.googleDriveId }, body: { name: newName } },
          {
            status: () => ({ json: () => {} }), // mock response
            json: () => {}
          }
        );
      } catch (err) {
        console.error("Error renaming on Google Drive:", err.message);
        return res.status(500).json({ error: "Failed to rename on Google Drive" });
      }
    }

    // Update MongoDB
    item.name = newName;
    await item.save();

    res.status(200).json({
      message: "Item renamed successfully",
      item,
    });
  } catch (err) {
    console.error("Error renaming item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Recursive helper: move all contents of a folder to trash
async function moveFolderContentsToTrash(folderId) {
  const items = await FileManager.find({ parentId: folderId, trashed: false });

  for (const item of items) {
    if (item.type === "folder") {
      // Recursively move subfolder to trash
      await moveFolderContentsToTrash(item._id);
      await FileManager.findByIdAndUpdate(item._id, { trashed: true });
    } else if (item.type === "file") {
      // Move file to Google Drive trash
      if (item.googleDriveId) {
        try {
          await GoogleDriveController.moveFileToTrash(
            { params: { fileId: item.googleDriveId } },
            {
              status: () => ({ json: () => {} }),
              json: () => {}
            }
          );
        } catch (err) {
          console.error("Error moving file to Drive trash:", err.message);
        }
      }
      await FileManager.findByIdAndUpdate(item._id, { trashed: true });
    }
  }
}

// Controller: move folder itself to trash
exports.moveFolderToTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await FileManager.findById(id);
    if (!folder || folder.type !== "folder") {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Move all contents to trash first
    await moveFolderContentsToTrash(id);

    // Mark folder itself as trashed
    folder.trashed = true;
    await folder.save();

    res.status(200).json({ message: "Folder and its contents moved to trash" });
  } catch (err) {
    console.error("Error moving folder to trash:", err);
    res.status(500).json({ error: err.message });
  }
};


// Get all items in Trash
exports.getTrashContents = async (req, res) => {
  try {
    // Fetch all items marked as trashed
    const trashedItems = await FileManager.find({ trashed: true }).sort({ type: -1, name: 1 });

    res.status(200).json({
      message: "Trash contents fetched successfully",
      items: trashedItems,
    });
  } catch (error) {
    console.error("Error fetching trash contents:", error);
    res.status(500).json({ message: "Server error while fetching trash contents" });
  }
};

exports.listTrashedFiles = async (req, res) => {
  try {
    // Directly call the controller function
    await GoogleDriveController.listTrashedFiles(req, res);
  } catch (err) {
    console.error("Error listing trashed files in FileManager:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};



// Move folder (or file) to another folder
exports.moveItem = async (req, res) => {
  try {
    const { id } = req.params;         // ID of folder/file to move
    const { newParentId } = req.body;  // Target folder ID (null for root)

    // Validate input
    if (!id) {
      return res.status(400).json({ error: "Item ID is required" });
    }

    // Fetch the item
    const item = await FileManager.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Optionally, check if newParentId exists (skip if null for root)
    if (newParentId) {
      const parentFolder = await FileManager.findById(newParentId);
      if (!parentFolder || parentFolder.type !== "folder") {
        return res.status(400).json({ error: "Target folder does not exist" });
      }
    }

    // Update parentId
    item.parentId = newParentId || null; // null means root folder
    await item.save();

    res.status(200).json({
      message: `${item.type} moved successfully`,
      item,
    });
  } catch (err) {
    console.error("Error moving item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single file's details and optionally content link
exports.getFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find file in MongoDB
    const file = await FileManager.findById(id);
    if (!file || file.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    let fileData = {
      id: file._id,
      name: file.name,
      type: file.type,
      parentId: file.parentId,
      owner: file.owner,
      size: file.size,
      mimeType: file.mimeType,
      googleDriveId: file.googleDriveId,
      trashed: file.trashed || false,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    };

    // If file is on Google Drive, get the download/view link
    if (file.googleDriveId) {
      try {
        const driveFile = await GoogleDriveController.getFile(file.googleDriveId);
        // getFile in GoogleDriveController should return { viewLink, downloadLink, ... }
        fileData.viewLink = driveFile.viewLink;
        fileData.downloadLink = driveFile.downloadLink;
      } catch (err) {
        console.error("Error fetching Google Drive file info:", err.message);
      }
    }

    res.status(200).json({
      message: "File fetched successfully",
      file: fileData
    });
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ error: err.message });
  }
};


// Helper to restore a file in Drive
async function restoreFileInDrive(fileId) {
  const req = { params: { fileId } };
  const res = {
    statusCode: 200,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      if (this.statusCode >= 400) throw new Error(data.error || "Error restoring file in Drive");
      return data;
    }
  };

  await GoogleDriveController.restoreFileFromTrash(req, res);
}

// Recursive helper to restore folder contents
async function restoreFolderContents(folderId) {
  const items = await FileManager.find({ parentId: folderId, trashed: true });

  for (const item of items) {
    if (item.type === "folder") {
      await restoreFolderContents(item._id);
    } else if (item.type === "file" && item.googleDriveId) {
      try {
        await restoreFileInDrive(item.googleDriveId);
      } catch (err) {
        console.error("Error restoring file in Drive:", err.message);
      }
    }

    item.trashed = false;
    await item.save();
  }
}

// Restore a file or folder from trash
exports.restoreItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FileManager.findById(id);
    if (!item || !item.trashed) {
      return res.status(404).json({ error: "Item not found or not trashed" });
    }

    // If it's a file on Google Drive, untrash there too
    if (item.type === "file" && item.googleDriveId) {
      try {
        await restoreFileInDrive(item.googleDriveId);
      } catch (err) {
        console.error("Error restoring file on Google Drive:", err.message);
      }
    }

    // If it's a folder, recursively restore its contents
    if (item.type === "folder") {
      await restoreFolderContents(item._id);
    }

    // Restore the item itself
    item.trashed = false;
    await item.save();

    res.status(200).json({ message: "Item restored successfully", item });
  } catch (err) {
    console.error("Error restoring item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Search files/folders by name
exports.searchByName = async (req, res) => {
  try {
    const { name } = req.query;
    const { includeTrashed } = req.query; // optional: "true" to include trashed items

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Build search query
    const query = {
      name: { $regex: name, $options: "i" } // case-insensitive search
    };

    // Exclude trashed items by default
    if (!includeTrashed || includeTrashed !== "true") {
      query.trashed = false;
    }

    const results = await FileManager.find(query).sort({ type: -1, name: 1 });

    res.status(200).json({
      message: "Search results fetched successfully",
      count: results.length,
      items: results
    });
  } catch (err) {
    console.error("Error searching items:", err);
    res.status(500).json({ error: err.message });
  }
};


// Sort files/folders
exports.sortItems = async (req, res) => {
  try {
    const { sortBy, order, includeTrashed } = req.query;

    // Determine sort order
    const sortOrder = order === "desc" ? -1 : 1;

    // Build sort object
    let sortObj = {};

    switch (sortBy) {
      case "name":
        sortObj = { name: sortOrder };
        break;
      case "type":
        sortObj = { type: sortOrder, name: 1 }; // folders first, then files, then name
        break;
      case "size":
        sortObj = { size: sortOrder, name: 1 }; // sort by size, then name
        break;
      default:
        sortObj = { name: 1 }; // default sort by name ascending
    }

    // Build query
    const query = {};
    if (!includeTrashed || includeTrashed !== "true") {
      query.trashed = false; // exclude trashed items by default
    }

    const items = await FileManager.find(query).sort(sortObj);

    res.status(200).json({
      message: "Items sorted successfully",
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("Error sorting items:", err);
    res.status(500).json({ error: err.message });
  }
};


// Copy an item (file or folder)
exports.cutItem = async (req, res) => {
  try {
    const { sourceId, action } = req.body;

    const item = await FileManager.findById(sourceId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // store in memory or session
    req.session.copyData = { sourceId, action };

    return res.status(200).json({ message: "Item copied successfully", copyData: req.session.copyData });
  } catch (error) {
    res.status(500).json({ message: "Error copying item", error });
  }
};


exports.copyItem = async (req, res) => {
  try {
    const { sourceId, targetId } = req.body;

    if (!sourceId) return res.status(400).json({ error: "Source ID is required" });
    if (!targetId) return res.status(400).json({ error: "Target folder ID is required" });

    const sourceItem = await FileManager.findById(sourceId);
    if (!sourceItem) return res.status(404).json({ error: "Source item not found" });

    const targetFolder = await FileManager.findById(targetId);
    if (!targetFolder || targetFolder.type !== "folder") {
      return res.status(400).json({ error: "Target folder not found" });
    }

    let newItem;

    if (sourceItem.type === "folder") {
      // Recursive copy for folders
      newItem = await copyFolderRecursively(sourceId, targetId, sourceItem.owner);
    } else if (sourceItem.type === "file") {
      newItem = new FileManager({
        name: `copy_of_${sourceItem.name}`,
        type: "file",
        parentId: targetId, // this is where the copy will go
        owner: sourceItem.owner,
        googleDriveId: sourceItem.googleDriveId,
        size: sourceItem.size,
        mimeType: sourceItem.mimeType
      });
      await newItem.save();
    }

    res.status(200).json({
      message: `${sourceItem.type} copied successfully`,
      item: newItem
    });

  } catch (err) {
    console.error("Error copying item:", err);
    res.status(500).json({ error: err.message });
  }
};


// Recursive helper to copy folder and its children
async function copyFolderRecursively(sourceFolderId, targetFolderId, owner) {
  // Find the source folder
  const folder = await FileManager.findById(sourceFolderId);
  if (!folder || folder.type !== "folder") return null;

  // Create a copy of the folder in the target folder
  const folderCopy = new FileManager({
    name: `copy_of_${folder.name}`,
    type: "folder",
    parentId: targetFolderId || null,
    owner
  });
  await folderCopy.save();

  // Find all children of the source folder
  const children = await FileManager.find({ parentId: sourceFolderId });

  // Recursively copy children
  for (const child of children) {
    if (child.type === "folder") {
      await copyFolderRecursively(child._id, folderCopy._id, owner);
    } else if (child.type === "file") {
      // Copy file
      const fileCopy = new FileManager({
        name: `copy_of_${child.name}`,
        type: "file",
        parentId: folderCopy._id,
        owner,
        googleDriveId: child.googleDriveId, // Optional: could duplicate in Drive
        size: child.size,
        mimeType: child.mimeType
      });
      await fileCopy.save();
    }
  }

  return folderCopy;
}



// Paste an item (after copy)
// Paste / Move item to existing folder
exports.pasteItem = async (req, res) => {
  try {
    const { sourceId, targetId } = req.body;

    const sourceItem = await FileManager.findById(sourceId);
    if (!sourceItem) {
      return res.status(404).json({ error: "Source item not found" });
    }

    // Check target folder
    if (targetId) {
      const targetFolder = await FileManager.findById(targetId);
      if (!targetFolder || targetFolder.type !== "folder") {
        return res.status(400).json({ error: "Target folder does not exist" });
      }
    }

    if (sourceItem.type === "folder") {
      // Move folder recursively
      await moveFolderRecursively(sourceId, targetId || null);
    } else {
      // Move file
      sourceItem.parentId = targetId || null;
      await sourceItem.save();
    }

    res.status(200).json({
      message: `${sourceItem.type} moved successfully`,
      item: sourceItem
    });
  } catch (error) {
    res.status(500).json({ error: "Error pasting item", details: error.message });
  }
};


// Recursive helper to move folder and all its children
async function moveFolderRecursively(folderId, newParentId) {
  // Move the folder itself
  await FileManager.findByIdAndUpdate(folderId, { parentId: newParentId });

  // Find all children
  const children = await FileManager.find({ parentId: folderId });

  for (const child of children) {
    if (child.type === "folder") {
      // Recursively move subfolder
      await moveFolderRecursively(child._id, folderId);
    } else if (child.type === "file") {
      // Move file
      await FileManager.findByIdAndUpdate(child._id, { parentId: folderId });
    }
  }
}


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
