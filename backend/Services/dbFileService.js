const FileManager = require("../Models/FileManager");

const dbFileService = {
  createFileMetadata: async ({ name, type, parentId, owner, googleDriveId, size, mimeType }) => {
    const file = new FileManager({
      name,
      type,
      parentId: parentId || null,
      owner,
      googleDriveId,
      size,
      mimeType
    });
    return await file.save();
  },

  getItemsByUser: async (userId, trashed = false) => {
    return await FileManager.find({ owner: userId, trashed }).sort({ type: -1, name: 1 });
  },

  getFolderContents: async (folderId, trashed = false) => {
    let query = {};
    if (folderId === "root") {
      query = { parentId: null, trashed };
    } else if (folderId === "trash") {
      query = { trashed: true };
    } else {
      query = { parentId: folderId, trashed };
    }
    return await FileManager.find(query).sort({ type: -1, name: 1 });
  },

  getFileById: async (id) => {
    return await FileManager.findById(id);
  },

  renameItem: async (id, newName) => {
    const item = await FileManager.findById(id);
    if (!item) throw new Error("Item not found");
    item.name = newName;
    item.updatedAt = Date.now();
    return await item.save();
  },

  moveItem: async (id, newParentId) => {
    const item = await FileManager.findById(id);
    if (!item) throw new Error("Item not found");
    item.parentId = newParentId || null;
    item.updatedAt = Date.now();
    return await item.save();
  },

  setItemTrashed: async (id, trashedState) => {
    const item = await FileManager.findById(id);
    if (!item) throw new Error("Item not found");

    // Helper to recursively update trashed status of children
    const setTrashRecursive = async (folderId, state) => {
      const children = await FileManager.find({ parentId: folderId });
      for (const child of children) {
        child.trashed = state;
        child.updatedAt = Date.now();
        await child.save();
        if (child.type === "folder") {
          await setTrashRecursive(child._id, state);
        }
      }
    };

    item.trashed = trashedState;
    item.updatedAt = Date.now();
    await item.save();

    if (item.type === "folder") {
      await setTrashRecursive(item._id, trashedState);
    }

    return item;
  },

  getAllTrashedChildren: async (folderId) => {
    const list = [];
    const collectRecursive = async (parentId) => {
      const children = await FileManager.find({ parentId });
      for (const child of children) {
        list.push(child);
        if (child.type === "folder") {
          await collectRecursive(child._id);
        }
      }
    };
    await collectRecursive(folderId);
    return list;
  },

  deleteItemRecord: async (id) => {
    return await FileManager.findByIdAndDelete(id);
  },

  searchByName: async (nameQuery, includeTrashed = false) => {
    const query = {
      name: { $regex: nameQuery, $options: "i" }
    };
    if (!includeTrashed) {
      query.trashed = false;
    }
    return await FileManager.find(query).sort({ type: -1, name: 1 });
  },

  sortItems: async (sortBy, order, includeTrashed = false) => {
    const sortOrder = order === "desc" ? -1 : 1;
    let sortObj = {};

    switch (sortBy) {
      case "name":
        sortObj = { name: sortOrder };
        break;
      case "type":
        sortObj = { type: sortOrder, name: 1 };
        break;
      case "size":
        sortObj = { size: sortOrder, name: 1 };
        break;
      default:
        sortObj = { name: 1 };
    }

    const query = {};
    if (!includeTrashed) {
      query.trashed = false;
    }

    return await FileManager.find(query).sort(sortObj);
  }
};

module.exports = dbFileService;
