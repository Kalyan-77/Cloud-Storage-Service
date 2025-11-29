require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const auth = require('./Routes/authRoutes');
const googledrive = require('./Routes/authGoogleDrive');
const finder = require('./Routes/authFinder');
const configRoutes  = require('./Routes/configRoutes');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('Error Connecting MongoDB:', err));

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Frontend origin (set this to your Vercel app URL in production)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MAC = process.env.MAC_URL || 'http://localhost:5174';

// When running behind a proxy (Render, etc.) express needs to trust the proxy
if (isProduction) {
    app.set('trust proxy', 1);
}

// CORS: allow only the frontend origin and enable credentials for cookies/sessions
app.use(cors({
    origin: FRONTEND_URL,
    origin: MAC,
    credentials: true,
}));

// app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'Kalyan123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        touchAfter: 24 * 3600 // lazy session update (in seconds)
    }),
    cookie: {
        httpOnly: true,
        secure: isProduction, // true in production (requires HTTPS)
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site cookies
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        // Optional: set cookie domain via env if needed (e.g. '.yourdomain.com')
        domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
    },
    proxy: isProduction // trust proxy in production
}));

// Routes
app.use('/auth', auth);
app.use('/cloud', googledrive);
app.use('/finder', finder);
app.use('/config', configRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});