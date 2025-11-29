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

// CORS configuration
// const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:5174',
//     'https://cloud-storage-service.vercel.app'
// ];

// Middleware
app.use(cors({
    origin: "*",
    // credentials: true
}));
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
        secure: isProduction, // true in production, false in development
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site, 'lax' for same-site
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        domain: isProduction ? '.onrender.com' : undefined // allow cross-subdomain in production
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