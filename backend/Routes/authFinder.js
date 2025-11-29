const express = require('express');
const router = express.Router();
const multer = require("multer");

const {
    createFolder,
    getFolderContents,
    getItemsByUser,
    uploadFileToManager,
    deleteFile,
    deleteFolder,
    renameItem,
    moveFolderToTrash,
    moveFileToTrash,
    getTrashContents,
    listTrashedFiles,
    moveItem,
    getFile,
    restoreItem,
    searchByName,
    sortItems,
    cutItem,
    pasteItem,
    copyItem,
    createTextFile,
    getTextFiles,
    updateTextFile,
} = require('../Controllers/authFileManager');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/folders", createFolder);
router.get("/folders/:id", getFolderContents);
router.get("/user/:userId/items", getItemsByUser);
router.post("/upload", upload.single("file"), uploadFileToManager);

router.post("/textfile", createTextFile); 
router.put("/textfile/:id", updateTextFile);
router.get("/textfiles", getTextFiles);  


router.delete("/delete/:id", deleteFile);
router.delete("/delete/folder/:id", deleteFolder); 
router.put("/rename/:id", renameItem); //remane file/folder
router.put("/trash/folder/:id", moveFolderToTrash);
router.put('/trash/file/:id', moveFileToTrash);
router.get("/trash/local", getTrashContents); // only local - like Folders 
router.get("/trash/drive", listTrashedFiles);//all trash from GoogleDrive(files)
router.put("/move/:id", moveItem);
router.get("/getfile/:id", getFile);
router.put("/restore/:id", restoreItem);
router.get('/search', searchByName);
router.get('/sort', sortItems);
router.post('/cut',cutItem);
router.post('/paste',pasteItem);
router.post('/copy',copyItem);


module.exports = router;




// GET /api/files/search?name=report
// GET /api/files/search?name=report&includeTrashed=true


// GET /api/files/sort?sortBy=name&order=asc
// GET /api/files/sort?sortBy=type&order=desc
// GET /api/files/sort?sortBy=size&includeTrashed=true


