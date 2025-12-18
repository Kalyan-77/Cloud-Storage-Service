const express = require("express");
const router = express.Router();

const { 
    chatWithGemini, 
    streamChatWithGemini, 
    analyzeWithGemini 
} = require("../Controllers/geminiController");

const authMiddleware = require("../Middlewares/authMiddleware");

// Chat endpoints
router.post("/chat", chatWithGemini);
router.post("/chat/stream", streamChatWithGemini);
router.post("/analyze", analyzeWithGemini);

// Public test endpoint (no auth) - remove in production
router.post("/test", chatWithGemini);

module.exports = router;