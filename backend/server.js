require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Routes
const auth = require('./Routes/authRoutes');
const googledrive = require('./Routes/authGoogleDrive');
const finder = require('./Routes/authFinder');
const configRoutes  = require('./Routes/configRoutes');
const Apps = require('./Routes/appRoutes');
const chatRoutes = require("./Routes/chatRoutes");
const profileRoutes = require("./Routes/profileRoutes");
const perplexityRoutes = require("./Routes/AIRouter");

// Models
const Message = require("./Models/Message");
const redisClient = require("./Config/redis");

const app = express();

/* ======================= MongoDB ======================= */
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

/* ======================= ENV ======================= */
const isProduction = process.env.NODE_ENV === 'production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MAC = process.env.MAC_URL || 'http://localhost:5174';

/* ======================= Proxy ======================= */
if (isProduction) {
    app.set('trust proxy', 1);
}

/* ======================= CORS ======================= */
app.use(cors({
    origin: [FRONTEND_URL, MAC],
    credentials: true
}));

/* ======================= Middlewares ======================= */
app.use(express.json());
app.use(cookieParser());

/* ======================= Static uploads ======================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================= Sessions ======================= */
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'Kalyan123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        touchAfter: 24 * 3600
    }),
    cookie: {
        httpOnly: true,
        secure: isProduction,           // true only on HTTPS
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24,     // 1 day
        domain: process.env.SESSION_COOKIE_DOMAIN || undefined
    },
    proxy: isProduction
});

app.use(sessionMiddleware);

/* ======================= Routes ======================= */
app.use('/auth', auth);
app.use('/cloud', googledrive);
app.use('/finder', finder);
app.use('/config', configRoutes);
app.use('/apps', Apps);
app.use('/chat', chatRoutes);
app.use("/profile", profileRoutes);
app.use("/perplexity", perplexityRoutes);

/* ======================= HTTP + SOCKET ======================= */
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [FRONTEND_URL, MAC],
        credentials: true
    }
});

/* 🔥 Make io available in controllers */
app.set("io", io);

/* 🔥 Share session with Socket.IO */
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

/* ======================= SOCKET LOGIC ======================= */

// Helper function to broadcast online users
const broadcastOnlineUsers = async (io) => {
  try {
    const onlineUserIds = await redisClient.sMembers("chat:online_users");
    io.emit("online-users", onlineUserIds);
    console.log("📡 Broadcasting online users:", onlineUserIds);
  } catch (err) {
    console.error("Error broadcasting online users:", err);
  }
};

io.on("connection", async (socket) => {
  const user = socket.request.session?.user;
  if (!user) {
    console.log("⚠️ Socket rejected (no session)");
    return socket.disconnect();
  }

  const userId = user._id.toString();
  console.log("🟢 User connected:", userId);

  /* ================= ONLINE USERS ================= */
  await redisClient.sAdd("chat:online_users", userId);
  await broadcastOnlineUsers(io);

  /* ================= USER ONLINE EVENT ================= */
  socket.on("user-online", async ({ userId: incomingUserId }) => {
    await redisClient.sAdd("chat:online_users", incomingUserId);
    await broadcastOnlineUsers(io);
  });

  /* ================= JOIN ROOM ================= */
  socket.on("join-room", async (roomId) => {
    if (!roomId) return;

    socket.join(roomId);
    console.log(`👥 ${userId} joined room ${roomId}`);

    // 🔵 RESET unread count for this room
    await redisClient.del(`chat:unread:${userId}:${roomId}`);
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
          await redisClient.incr(`chat:unread:${otherUserId}:${roomId}`);
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

    await redisClient.setEx(
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
      await redisClient.sAdd(`chat:seen:${messageId}`, userId);
      
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
    await redisClient.sRem("chat:online_users", userId);
    await broadcastOnlineUsers(io);
    console.log("🔴 User disconnected:", userId);
  });
});


/* ======================= Server ======================= */
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
