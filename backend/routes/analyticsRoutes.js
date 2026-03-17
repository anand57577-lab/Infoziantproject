import express from 'express';
import { getBrandAnalytics, getBrandAnalyticsDetailed } from '../controllers/analyticsController.js';
import { protect, brand } from '../middleware/authMiddleware.js';

const router = express.Router();

// IMPORTANT: /brand/detailed must be defined BEFORE any :param routes to avoid shadowing
router.get('/brand/detailed', protect, brand, getBrandAnalyticsDetailed);
router.get('/brand',          protect, brand, getBrandAnalytics);

export default router;
