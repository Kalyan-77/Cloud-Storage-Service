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
const geminiRoutes = require("./Routes/geminiRoutes");
const auth = require('./Routes/authRoutes');
const googledrive = require('./Routes/authGoogleDrive');
const finder = require('./Routes/authFinder');
const configRoutes  = require('./Routes/configRoutes');
const Apps = require('./Routes/appRoutes');
const chatRoutes = require("./Routes/chatRoutes");

// Models
const Message = require("./Models/Message");

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
app.use('/gemini', geminiRoutes);
app.use('/chat', chatRoutes);

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
/* ======================= SOCKET LOGIC ======================= */
io.on("connection", (socket) => {
    const user = socket.request.session?.user;

    if (!user) {
        console.log("❌ Unauthorized socket connection");
        return socket.disconnect();
    }

    console.log("🟢 User connected:", user._id);

    socket.on("join-room", (roomId) => {
        if (!roomId) return;
        socket.join(roomId);
        console.log(`👥 ${user._id} joined room ${roomId}`);
    });

    socket.on("send-message", async ({ roomId, text }) => {
        if (!roomId || !text) return;

        try {
            // Create message
            const msg = await Message.create({
                roomId,
                sender: user._id,
                type: "text",
                text
            });

            // ✅ FIX 3: Populate sender info before emitting
            await msg.populate("sender", "name email");

            // ✅ CRITICAL: Use socket.to() to emit ONLY to others (not sender)
            socket.to(roomId).emit("receive-message", msg);
            
            console.log(`📤 Message sent to room ${roomId} by ${user._id} (to others only)`);
        } catch (err) {
            console.error("❌ Message error:", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", user._id);
    });
});

/* ======================= Server ======================= */
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
