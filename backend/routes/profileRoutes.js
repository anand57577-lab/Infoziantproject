import express from 'express';
import { submitProfile, getMyProfile, getApprovedInfluencers } from '../controllers/profileController.js';
import { protect, influencer, brand } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, influencer, submitProfile);
router.get('/me', protect, influencer, getMyProfile);
router.get('/approved', protect, brand, getApprovedInfluencers);

export default router;
