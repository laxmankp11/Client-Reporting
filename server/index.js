require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const workLogRoutes = require('./routes/workLogRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5002;
console.log('Attempting to start on port', PORT);

// Connect to Database
connectDB();

// Init Cron Jobs
require('./cron')();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // In development, allow localhost. In production, we'll allow specific domains or just reflect origin for this demo
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/worklogs', workLogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/onboarding', require('./routes/onboardingRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
