const express = require("express");
const router = express.Router();
const upload = require("../Middlewares/profileUpload");

const {
  getMyProfile,
  updateProfile
} = require("../Controllers/profileController");

router.get("/me", getMyProfile);
router.put("/update", upload.single("avatar"), updateProfile);

module.exports = router;
