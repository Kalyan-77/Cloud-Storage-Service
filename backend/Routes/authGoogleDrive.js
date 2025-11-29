const express = require("express");
const { listAllFiles, 
    listFilesByType, 
    uploadFile,
    makeFilePublic,
    deleteFile, 
    downloadFile, 
    countAllFiles, 
    countFilesByType, 
    getStorageUsage, 
    getStorageByType, 
    searchFilesByName,
    generateFileLink,
    updateFileName,
    listTrashedFiles,
    moveFileToTrash,
    restoreFileFromTrash,
    displayFileContent,
    listFilesByCategory,
  } = require("../Controllers/googleDriveController");
const multer = require("multer");
const { route } = require("./authRoutes");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/files", listAllFiles);
router.post("/upload", upload.single("file"), uploadFile);
router.post("/public/:fileId", makeFilePublic);
router.delete("/deletefiles/:fileId", deleteFile);
router.get("/download/:fileId", downloadFile);
router.get("/files/type",listFilesByType);
router.get("/filesCount",countAllFiles);
router.get("/filesCount/type",countFilesByType);
router.get("/totalStorage",getStorageUsage);
router.get("/StorageByType/type",getStorageByType);
router.get("/search", searchFilesByName);
router.get("/generate-link/:fileId", generateFileLink);
router.put("/updateFileName/:fileId",updateFileName);
router.get("/bin",listTrashedFiles);
router.put("/trash/:fileId",moveFileToTrash);
router.put('/restore/:fileId',restoreFileFromTrash);
router.get("/display/:fileId", displayFileContent);
router.get("/files/category", listFilesByCategory);




module.exports = router;
