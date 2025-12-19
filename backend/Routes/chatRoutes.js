const express = require("express");
const router = express.Router();
const upload = require("../Middlewares/chatUpload");
const chat = require("../Controllers/chatController");

router.get("/users", chat.getUsers);
router.post("/room", chat.getOrCreateRoom);
router.get("/messages/:roomId", chat.getMessages);

// 🔥 FILE MESSAGE
router.post(
  "/upload",
  upload.single("file"),
  chat.sendFileMessage
);

router.delete(
  "/message/me/:messageId",
  chat.deleteMessageForMe
);

router.delete(
  "/message/everyone/:messageId",
  chat.deleteMessageForEveryone
);

router.delete("/chat/me/:roomId", chat.deleteChatForMe);

module.exports = router;
