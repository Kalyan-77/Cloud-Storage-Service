const Message = require("../Models/Message");
const redisService = require("../Services/redisService");

// Helper function to broadcast online users
const broadcastOnlineUsers = async (io) => {
  try {
    const onlineUserIds = await redisService.sMembers("chat:online_users");
    io.emit("online-users", onlineUserIds);
    console.log("📡 Broadcasting online users:", onlineUserIds);
  } catch (err) {
    console.error("Error broadcasting online users:", err);
  }
};

const initChatSocket = (io) => {
  io.on("connection", async (socket) => {
    const user = socket.request.session?.user;
    if (!user) {
      console.log("⚠️ Socket rejected (no session)");
      return socket.disconnect();
    }

    const userId = user._id.toString();
    console.log("🟢 User connected:", userId);

    /* ================= ONLINE USERS ================= */
    await redisService.sAdd("chat:online_users", userId);
    await broadcastOnlineUsers(io);

    /* ================= USER ONLINE EVENT ================= */
    socket.on("user-online", async ({ userId: incomingUserId }) => {
      await redisService.sAdd("chat:online_users", incomingUserId);
      await broadcastOnlineUsers(io);
    });

    /* ================= JOIN ROOM ================= */
    socket.on("join-room", async (roomId) => {
      if (!roomId) return;

      socket.join(roomId);
      console.log(`👥 ${userId} joined room ${roomId}`);

      // 🔵 RESET unread count for this room
      await redisService.del(`chat:unread:${userId}:${roomId}`);
    });

    /* ================= SEND MESSAGE ================= */
    socket.on("send-message", async ({ roomId, text }) => {
      if (!roomId || !text) return;

      try {
        // 1️⃣ Save message
        const msg = await Message.create({
          roomId,
          sender: userId,
          type: "text",
          text,
          delivered: false,
          seenBy: []
        });

        await msg.populate("sender", "name email avatar");

        // 2️⃣ Emit message to room (including sender for instant update)
        io.to(roomId).emit("receive-message", msg);

        // 3️⃣ DELIVERED status (check if receiver is in the room)
        const socketsInRoom = await io.in(roomId).fetchSockets();
        const deliveredToUsers = [];

        for (const s of socketsInRoom) {
          const otherUserId = s.request.session?.user?._id?.toString();

          if (otherUserId && otherUserId !== userId) {
            deliveredToUsers.push(otherUserId);
            
            // 🔴 Increment per-room unread count
            await redisService.incr(`chat:unread:${otherUserId}:${roomId}`);
          }
        }

        // Update message as delivered
        if (deliveredToUsers.length > 0) {
          await Message.findByIdAndUpdate(msg._id, { 
            delivered: true,
            deliveredTo: deliveredToUsers 
          });
        }

        console.log(`📤 Message sent in room ${roomId}`);
      } catch (err) {
        console.error("Message error:", err.message);
      }
    });

    /* ================= TYPING INDICATOR ================= */
    socket.on("typing", async ({ roomId }) => {
      if (!roomId) return;

      await redisService.setEx(
        `chat:typing:${roomId}:${userId}`,
        3,
        "typing"
      );

      socket.to(roomId).emit("user-typing", {
        userId,
        roomId
      });
      
      console.log(`⌨️ User ${userId} typing in room ${roomId}`);
    });

    socket.on("stop-typing", ({ roomId }) => {
      if (!roomId) return;
      
      socket.to(roomId).emit("user-stop-typing", {
        userId,
        roomId
      });
      
      console.log(`⌨️ User ${userId} stopped typing in room ${roomId}`);
    });

    /* ================= MESSAGE SEEN ================= */
    socket.on("message-seen", async ({ messageId }) => {
      if (!messageId) return;

      try {
        // Add to Redis seen set
        await redisService.sAdd(`chat:seen:${messageId}`, userId);
        
        // Update message in database
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { seenBy: userId }
        });

        // Get the message to find its room
        const message = await Message.findById(messageId);
        if (message) {
          // Broadcast to the room
          io.to(message.roomId.toString()).emit("message-seen-update", {
            messageId,
            userId
          });
          
          console.log(`✅ Message ${messageId} seen by ${userId}`);
        }
      } catch (err) {
        console.error("Message seen error:", err);
      }
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", async () => {
      await redisService.sRem("chat:online_users", userId);
      await broadcastOnlineUsers(io);
      console.log("🔴 User disconnected:", userId);
    });
  });
};

module.exports = initChatSocket;
