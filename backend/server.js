import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://infoziantproject.onrender.com",
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Database Connection
connectDB();

// Basic Route Route
app.get('/', (req, res) => {
    res.send('Influencer Campaign Manager API running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(process.env.PORT || 5000, () => {console.log(`Server started on port ${PORT}`)});
