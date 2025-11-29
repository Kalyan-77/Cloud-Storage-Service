const express = require('express');
const router = express.Router();
const { saveConfig, getConfig, deleteConfig } = require('../Controllers/ConfigController');

// You can add auth middleware here if needed to protect routes
// const { verifyUser } = require('../Middleware/authMiddleware');

router.post('/save/:userId', saveConfig);
router.get('/get/:userId', getConfig);

module.exports = router;
