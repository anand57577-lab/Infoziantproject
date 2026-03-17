import express from 'express';
import { getCampaigns, createCampaign, assignInfluencer, respondToCampaign, getCampaignUpdates, postCampaignUpdate } from '../controllers/campaignController.js';
import { protect, brand, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
console.log('campaignRoutes loaded');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.route('/')
    .get(protect, getCampaigns)
    .post(protect, brand, createCampaign);

router.route('/:id/assign')
    .put(protect, brand, assignInfluencer);

router.route('/:id/respond')
    .put(protect, respondToCampaign);

router.route('/:id/updates')
    .get(protect, getCampaignUpdates)
    .post(protect, upload.single('file'), postCampaignUpdate);

export default router;
