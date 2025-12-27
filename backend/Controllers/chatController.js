const ChatRoom = require("../Models/ChatRoom");
const Message = require("../Models/Message");
const Users = require("../Models/Users");
const redisClient = require("../Config/redis");

// Get all users except self
exports.getUsers = async (req, res) => {
  const users = await Users.find({
    _id: { $ne: req.session.user._id }
  }).select("_id name email avatar about");

  res.json(users);
};

// Create or get room
exports.getOrCreateRoom = async (req, res) => {
  const { otherUserId } = req.body;
  const myId = req.session.user._id;

  let room = await ChatRoom.findOne({
    participants: { $all: [myId, otherUserId] }
  });

  if (!room) {
    room = await ChatRoom.create({
      participants: [myId, otherUserId]
    });
  }

  res.json(room);
};

// Get messages - 🔥 FIX: Populate sender info
// exports.getMessages = async (req, res) => {
//   const messages = await Message.find({ roomId: req.params.roomId })
//     .populate("sender", "name email avatar")
//     .sort({ createdAt: 1 }); // Sort by oldest first

//   res.json(messages);
// };

exports.getMessages = async (req, res) => {
  const userId = req.session.user._id;
  const roomId = req.params.roomId;

  try {
    await redisClient.del(`chat:unread:${userId}:${roomId}`);
  } catch {
    console.warn("Redis unavailable, unread reset skipped");
  }


  const messages = await Message.find({ roomId })
    .populate("sender", "name email avatar")
    .sort({ createdAt: 1 });

  res.json(messages);
};


// ✅ FIX 3: Send file message - backend emits receive-message
exports.sendFileMessage = async (req, res) => {
  const { roomId } = req.body;
  const userId = req.session.user._id;
  const file = req.file;

  if (!roomId || !file) {
    return res.status(400).json({ message: "Room or file missing" });
  }

  const type = file.mimetype.startsWith("image")
    ? "image"
    : file.mimetype.startsWith("video")
    ? "video"
    : file.mimetype.startsWith("audio")
    ? "audio"
    : "file";

  const message = await Message.create({
    roomId,
    sender: userId,
    type,
    file: {
      url: `/uploads/chat/${file.filename}`,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }
  });

  // ✅ Populate sender info
  await message.populate("sender", "name email avatar");

  // ✅ FIX: Get all sockets in the room and emit to others (not uploader)
  const io = req.app.get("io");
  const socketsInRoom = await io.in(roomId).fetchSockets();
  
  // Emit to everyone in the room EXCEPT the uploader
  socketsInRoom.forEach(socket => {
    if (socket.request.session?.user?._id?.toString() !== userId.toString()) {
      socket.emit("receive-message", message);
    }
  });

  console.log(`📎 File message sent to room ${roomId} by ${userId}`);

  // Send populated message back to uploader
  res.json(message);
};

exports.deleteMessageForMe = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.session.user._id;

  await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedFor: userId } }
  );

  res.json({ success: true });
};

exports.deleteMessageForEveryone = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.session.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  if (message.sender.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Not allowed" });
  }

  message.deletedForEveryone = true;
  await message.save();

  // 🔥 Real-time update
  req.app.get("io").to(message.roomId.toString()).emit(
    "message-deleted",
    { messageId }
  );

  res.json({ success: true });
};

exports.deleteChatForMe = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.session.user._id;

  await Message.updateMany(
    { roomId },
    { $addToSet: { deletedFor: userId } }
  );

  res.json({ success: true });
};

exports.getUnreadCountByRoom = async (req, res) => {
  const userId = req.session.user._id;
  const { roomId } = req.params;

  try {
    const count = await redisClient.get(`chat:unread:${userId}:${roomId}`);
    res.json({ unread: Number(count) || 0 });
  } catch {
    res.json({ unread: 0 });
  }
};
