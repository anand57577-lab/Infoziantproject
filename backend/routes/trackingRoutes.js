import express from 'express';
import { trackClick, trackConversion } from '../controllers/trackingController.js';

const router = express.Router();

router.get('/:uniqueLink', trackClick);
router.post('/:uniqueLink/conversion', trackConversion);

export default router;
