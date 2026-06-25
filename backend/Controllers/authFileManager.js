const dbFileService = require("../Services/dbFileService");
const googleDriveService = require("../Services/googleDriveService");

// Helper to broadcast changes via socket
const broadcastChange = (req, owner, action, itemData) => {
  const io = req.app.get("io");
  if (io) {
    io.emit("file:changed", { action, item: itemData, owner });
  }
};

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
    const driveResponse = await googleDriveService.uploadFileFromBuffer({
      originalname: fileName,
      mimetype: "text/plain",
      buffer,
    }, owner);

    // Save metadata to MongoDB
    const newFile = await dbFileService.createFileMetadata({
      name: fileName,
      type: "file",
      parentId: parentId || null,
      owner,
      googleDriveId: driveResponse.id,
      size: buffer.length,
      mimeType: "text/plain",
    });

    broadcastChange(req, owner, "create", newFile);

    res.status(201).json({
      message: "Text file created successfully",
      file: newFile,
    });
  } catch (err) {
    console.error("Error creating text file:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all text files for a user (local + Drive metadata)
exports.getTextFiles = async (req, res) => {
  try {
    const { owner } = req.query; // optional filter by owner

    const query = { mimeType: "text/plain", trashed: false };
    if (owner) query.owner = owner;

    const textFiles = await dbFileService.searchByName(".txt", false);
    const filteredFiles = owner ? textFiles.filter(f => f.owner === owner) : textFiles;

    res.status(200).json({
      message: "Text files fetched successfully",
      count: filteredFiles.length,
      files: filteredFiles,
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

    if (content === undefined) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Find file in DB
    const file = await dbFileService.getFileById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.mimeType !== "text/plain") {
      return res.status(400).json({ error: "Only text files can be updated" });
    }

    const buffer = Buffer.from(content, "utf-8");

    // Update on Google Drive
    const driveResponse = await googleDriveService.updateFileContent(
      file.googleDriveId,
      buffer,
      "text/plain",
      file.owner
    );

    // Update size in MongoDB
    file.size = buffer.length;
    await file.save();

    broadcastChange(req, file.owner, "update", file);

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

// Create a folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parentId, owner } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ message: "Name and owner are required" });
    }

    const folder = await dbFileService.createFileMetadata({
      name,
      type: "folder",
      parentId: parentId || null,
      owner
    });

    broadcastChange(req, owner, "create", folder);

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
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await dbFileService.getItemsByUser(userId, false);

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

// Get Folder contents
exports.getFolderContents = async (req, res) => {
  try {
    const { id } = req.params;
    let items;

    if (id === "root") {
      items = await dbFileService.getFolderContents("root", false);
    } else if (id === "trash") {
      items = await dbFileService.getFolderContents("trash", true);
    } else {
      items = await dbFileService.getFolderContents(id, false);
    }

    res.status(200).json({
      message: "Folder contents fetched successfully",
      folderId: id,
      items,
    });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    res.status(500).json({ message: "Server error while fetching folder contents" });
  }
};

// Upload file to Manager (combined local index + cloud storage)
exports.uploadFileToManager = async (req, res) => {
  try {
    const { parentId, owner } = req.body;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let fileBuffer = req.file.buffer;
    if (!fileBuffer && req.file.path) {
      const fs = require("fs");
      fileBuffer = fs.readFileSync(req.file.path);
    }

    // Upload file to Google Drive using the service
    const driveRes = await googleDriveService.uploadFile({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      buffer: fileBuffer
    }, owner);

    // Delete temp file from local disk if exists
    if (req.file.path) {
      const fs = require("fs");
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Temp file deletion error:", err);
      });
    }

    // Save metadata in MongoDB
    const newFile = await dbFileService.createFileMetadata({
      name: req.file.originalname,
      type: "file",
      parentId: parentId || null,
      owner,
      googleDriveId: driveRes.id,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    broadcastChange(req, owner, "create", newFile);

    res.status(201).json({
      message: "File uploaded successfully",
      fileId: driveRes.id,
      name: driveRes.name,
      webViewLink: driveRes.webViewLink,
      file: newFile
    });
  } catch (err) {
    console.error("FileManager Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Move file to trash (Bin)
exports.moveFileToTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await dbFileService.getFileById(id);
    if (!file || file.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.googleDriveId) {
      try {
        await googleDriveService.moveFileToTrash(file.googleDriveId, file.owner);
      } catch (err) {
        console.error("Error moving file to Drive trash:", err.message);
        return res.status(500).json({ error: "Failed to move file to Drive trash" });
      }
    }

    const updatedFile = await dbFileService.setItemTrashed(id, true);
    broadcastChange(req, file.owner, "trash", id);

    res.status(200).json({ message: "File moved to trash successfully", file: updatedFile });
  } catch (err) {
    console.error("Error moving file to trash:", err);
    res.status(500).json({ error: err.message });
  }
};

// Permanently delete a file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await dbFileService.getFileById(id);

    if (!file || file.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    if (!file.trashed) {
      return res.status(400).json({ error: "File must be in trash to permanently delete" });
    }

    if (file.googleDriveId) {
      try {
        await googleDriveService.deleteFile(file.googleDriveId, file.owner);
      } catch (err) {
        console.error("Error permanently deleting file from Drive:", err.message);
        return res.status(500).json({ error: "Failed to delete file from Drive permanently" });
      }
    }

    await dbFileService.deleteItemRecord(id);
    broadcastChange(req, file.owner, "delete", id);

    res.status(200).json({ message: "File permanently deleted" });
  } catch (err) {
    console.error("Error permanently deleting file:", err);
    res.status(500).json({ error: err.message });
  }
};

// Permanently delete a folder and all contents recursively
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await dbFileService.getFileById(id);

    if (!folder || folder.type !== "folder") {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Recursively collect all items inside folder
    const children = await dbFileService.getAllTrashedChildren(id);

    for (const child of children) {
      if (child.type === "file" && child.googleDriveId) {
        try {
          await googleDriveService.deleteFile(child.googleDriveId, child.owner);
        } catch (err) {
          console.error(`Error deleting child file ${child.name} from Drive:`, err.message);
        }
      }
      await dbFileService.deleteItemRecord(child._id);
    }

    // Delete the folder itself
    await dbFileService.deleteItemRecord(id);
    broadcastChange(req, folder.owner, "delete", id);

    res.status(200).json({ message: "Folder and its contents deleted successfully" });
  } catch (err) {
    console.error("Error deleting folder:", err);
    res.status(500).json({ error: err.message });
  }
};

// Rename an item (file or folder)
exports.renameItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ error: "New name is required" });
    }

    const item = await dbFileService.getFileById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.type === "file" && item.googleDriveId) {
      try {
        await googleDriveService.updateFileName(item.googleDriveId, newName, item.owner);
      } catch (err) {
        console.error("Error renaming on Google Drive:", err.message);
        return res.status(500).json({ error: "Failed to rename on Google Drive" });
      }
    }

    const updatedItem = await dbFileService.renameItem(id, newName);
    broadcastChange(req, item.owner, "update", updatedItem);

    res.status(200).json({
      message: "Item renamed successfully",
      item: updatedItem,
    });
  } catch (err) {
    console.error("Error renaming item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Move folder itself to trash
exports.moveFolderToTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await dbFileService.getFileById(id);
    if (!folder || folder.type !== "folder") {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Recursively collect children
    const children = await dbFileService.getAllTrashedChildren(id);

    for (const child of children) {
      if (child.type === "file" && child.googleDriveId) {
        try {
          await googleDriveService.moveFileToTrash(child.googleDriveId, child.owner);
        } catch (err) {
          console.error("Error moving child to Drive trash:", err.message);
        }
      }
      await dbFileService.setItemTrashed(child._id, true);
    }

    const updatedFolder = await dbFileService.setItemTrashed(id, true);
    broadcastChange(req, folder.owner, "trash", id);

    res.status(200).json({ message: "Folder and its contents moved to trash", folder: updatedFolder });
  } catch (err) {
    console.error("Error moving folder to trash:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all items in Trash
exports.getTrashContents = async (req, res) => {
  try {
    const trashedItems = await dbFileService.getFolderContents("trash", true);
    res.status(200).json({
      message: "Trash contents fetched successfully",
      items: trashedItems,
    });
  } catch (error) {
    console.error("Error fetching trash contents:", error);
    res.status(500).json({ message: "Server error while fetching trash contents" });
  }
};

// List Google Drive trashed files
exports.listTrashedFiles = async (req, res) => {
  try {
    const files = await googleDriveService.listTrashedFiles(req.session.user._id);
    res.json(files);
  } catch (err) {
    console.error("Error listing trashed files:", err);
    res.status(500).json({ error: err.message });
  }
};

// Move item (change parentId)
exports.moveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { newParentId } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Item ID is required" });
    }

    const updatedItem = await dbFileService.moveItem(id, newParentId);
    broadcastChange(req, updatedItem.owner, "update", updatedItem);

    res.status(200).json({
      message: `${updatedItem.type} moved successfully`,
      item: updatedItem,
    });
  } catch (err) {
    console.error("Error moving item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single file details
exports.getFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await dbFileService.getFileById(id);
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

    if (file.googleDriveId) {
      try {
        const driveFile = await googleDriveService.generateFileLink(file.googleDriveId, file.owner);
        fileData.viewLink = driveFile.viewLink;
        fileData.downloadLink = driveFile.downloadLink;
      } catch (err) {
        console.error("Error fetching Google Drive link info:", err.message);
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

// Restore item from trash
exports.restoreItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await dbFileService.getFileById(id);
    if (!item || !item.trashed) {
      return res.status(404).json({ error: "Item not found or not trashed" });
    }

    if (item.type === "file" && item.googleDriveId) {
      try {
        await googleDriveService.restoreFileFromTrash(item.googleDriveId, item.owner);
      } catch (err) {
        console.error("Error restoring file on Google Drive:", err.message);
      }
    } else if (item.type === "folder") {
      const children = await dbFileService.getAllTrashedChildren(item._id);
      for (const child of children) {
        if (child.type === "file" && child.googleDriveId) {
          try {
            await googleDriveService.restoreFileFromTrash(child.googleDriveId, child.owner);
          } catch (err) {
            console.error("Error restoring child file in Drive:", err.message);
          }
        }
        await dbFileService.setItemTrashed(child._id, false);
      }
    }

    const restoredItem = await dbFileService.setItemTrashed(id, false);
    broadcastChange(req, item.owner, "restore", restoredItem);

    res.status(200).json({ message: "Item restored successfully", item: restoredItem });
  } catch (err) {
    console.error("Error restoring item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Search by name
exports.searchByName = async (req, res) => {
  try {
    const { name, includeTrashed } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await dbFileService.searchByName(name, includeTrashed === "true");

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

// Sort items
exports.sortItems = async (req, res) => {
  try {
    const { sortBy, order, includeTrashed } = req.query;
    const items = await dbFileService.sortItems(sortBy, order, includeTrashed === "true");

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

// Clipboard helpers
exports.cutItem = async (req, res) => {
  try {
    const { sourceId, action } = req.body;
    const item = await dbFileService.getFileById(sourceId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
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

    const sourceItem = await dbFileService.getFileById(sourceId);
    if (!sourceItem) return res.status(404).json({ error: "Source item not found" });

    let newItem;

    if (sourceItem.type === "folder") {
      newItem = await copyFolderRecursively(sourceId, targetId, sourceItem.owner);
    } else if (sourceItem.type === "file") {
      newItem = await dbFileService.createFileMetadata({
        name: `copy_of_${sourceItem.name}`,
        type: "file",
        parentId: targetId,
        owner: sourceItem.owner,
        googleDriveId: sourceItem.googleDriveId,
        size: sourceItem.size,
        mimeType: sourceItem.mimeType
      });
    }

    broadcastChange(req, sourceItem.owner, "create", newItem);

    res.status(200).json({
      message: `${sourceItem.type} copied successfully`,
      item: newItem
    });
  } catch (err) {
    console.error("Error copying item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Recursive helper to copy folder
async function copyFolderRecursively(sourceFolderId, targetFolderId, owner) {
  const folder = await dbFileService.getFileById(sourceFolderId);
  if (!folder || folder.type !== "folder") return null;

  const folderCopy = await dbFileService.createFileMetadata({
    name: `copy_of_${folder.name}`,
    type: "folder",
    parentId: targetFolderId || null,
    owner
  });

  const children = await dbFileService.getFolderContents(sourceFolderId, false);

  for (const child of children) {
    if (child.type === "folder") {
      await copyFolderRecursively(child._id, folderCopy._id, owner);
    } else if (child.type === "file") {
      await dbFileService.createFileMetadata({
        name: `copy_of_${child.name}`,
        type: "file",
        parentId: folderCopy._id,
        owner,
        googleDriveId: child.googleDriveId,
        size: child.size,
        mimeType: child.mimeType
      });
    }
  }

  return folderCopy;
}

// Paste / Move
exports.pasteItem = async (req, res) => {
  try {
    const { sourceId, targetId } = req.body;

    const sourceItem = await dbFileService.getFileById(sourceId);
    if (!sourceItem) {
      return res.status(404).json({ error: "Source item not found" });
    }

    if (sourceItem.type === "folder") {
      await moveFolderRecursively(sourceId, targetId || null);
    } else {
      sourceItem.parentId = targetId || null;
      await sourceItem.save();
    }

    broadcastChange(req, sourceItem.owner, "update", sourceItem);

    res.status(200).json({
      message: `${sourceItem.type} moved successfully`,
      item: sourceItem
    });
  } catch (error) {
    res.status(500).json({ error: "Error pasting item", details: error.message });
  }
};

// Recursive helper to move
async function moveFolderRecursively(folderId, newParentId) {
  await dbFileService.moveItem(folderId, newParentId);
  const children = await dbFileService.getFolderContents(folderId, false);

  for (const child of children) {
    if (child.type === "folder") {
      await moveFolderRecursively(child._id, folderId);
    } else if (child.type === "file") {
      await dbFileService.moveItem(child._id, folderId);
    }
  }
}

// Stream Google Drive file
exports.displayFileContent = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }

    const { mimeType, stream } = await googleDriveService.displayFileContent(fileId, req.session.user._id);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "no-cache");
    stream.pipe(res);
  } catch (err) {
    console.error("Error displaying file content:", err);
    res.status(500).json({ error: err.message });
  }
};
