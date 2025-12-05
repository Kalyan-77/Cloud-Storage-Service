const express = require("express");
const router = express.Router();
const {createApp, 
    getAllApps, 
    getAppById, 
    updateApp,
    deleteApp} = require("../Controllers/appController");

router.post("/create", createApp);
router.get("/all", getAllApps);
router.get("/:id", getAppById);
router.put("/update/:id", updateApp);
router.delete("/delete/:id", deleteApp);

module.exports = router;
