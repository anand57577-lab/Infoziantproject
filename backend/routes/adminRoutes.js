import express from 'express';
import {
    getUsers,
    deleteUser,
    getProfiles,
    updateProfileStatus,
    getAllCampaigns,
    deleteCampaign,
    updateCampaignStatusAdmin,
    getInfluencerUpdates
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect and admin middleware to all routes
router.use(protect, admin);

router.route('/users')
    .get(getUsers);

router.route('/users/:id')
    .delete(deleteUser);

router.route('/profiles')
    .get(getProfiles);

router.route('/profiles/:id/status')
    .put(updateProfileStatus);

router.route('/campaigns')
    .get(getAllCampaigns);

router.route('/campaigns/:id')
    .delete(deleteCampaign);

router.route('/campaigns/:id/status')
    .put(updateCampaignStatusAdmin);

router.route('/influencers/:id/updates')
    .get(getInfluencerUpdates);

export default router;
