require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const workLogRoutes = require('./routes/workLogRoutes');
const messageRoutes = require('./routes/messageRoutes');
const competitorRoutes = require('./routes/competitorRoutes');

const app = express();
const PORT = process.env.PORT || 5002;
console.log('Attempting to start on port', PORT);

// Connect to Database
connectDB();

// Init Cron Jobs
// Init Cron Jobs
require('./cron')();

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'https://app.globalaifirst.com',
            'https://globalaifirst.com',
            'http://localhost:5173',
            'http://localhost:3000'
        ];

        // Check if origin is allowed or if it's a vercel deployment (ending in .vercel.app)
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        console.log('CORS blocked origin:', origin);
        // For debugging, temporarily allow all if needed, but best to be specific
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/worklogs', workLogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/onboarding', require('./routes/onboardingRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server only if running directly (not imported as a module)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
