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

// Middleware
app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session
app.use(session({
    secret: 'Kalyan123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true, 
        secure: false, //change to true while deploying
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: 'lax', //(Cross-site cookies need none)
    }
}));

// Routes
app.use('/auth', auth);
app.use('/cloud', googledrive);
app.use('/finder', finder);
app.use('/config', configRoutes);


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
