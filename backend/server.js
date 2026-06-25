require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// DB Connection
const connectDB = require('./Config/db');

// Routes
const auth = require('./Routes/authRoutes');
const googledrive = require('./Routes/authGoogleDrive');
const finder = require('./Routes/authFinder');
const configRoutes  = require('./Routes/configRoutes');
const Apps = require('./Routes/appRoutes');
const chatRoutes = require("./Routes/chatRoutes");
const profileRoutes = require("./Routes/profileRoutes");
const perplexityRoutes = require("./Routes/AIRouter");

// Config & Sockets
const passport = require('./Config/passport');
const initChatSocket = require('./Sockets/chatSocket');

const app = express();

/* ======================= MongoDB ======================= */
connectDB();

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
app.use(passport.initialize());
app.use(passport.session());

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
initChatSocket(io);

/* ======================= Server ======================= */
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});

