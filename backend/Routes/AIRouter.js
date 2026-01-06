const express = require("express");
const router = express.Router();

// Controller
const { perplexityChat } = require("../Controllers/Perplexity");

// --------------------------------------
// @route   POST /api/ai/chat
// @desc    Chat with Perplexity AI
// @access  Public (make Private if needed)
// --------------------------------------
router.post("/chat/:userId", perplexityChat);

module.exports = router;
