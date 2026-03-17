import TrackingData from '../models/TrackingData.js';
import Campaign from '../models/Campaign.js';

// @desc    Log a click for an influencer's unique link and redirect
// @route   GET /api/tracking/:uniqueLink
// @access  Public
export const trackClick = async (req, res) => {
    try {
        const { uniqueLink } = req.params;

        // Find the campaign and the specific influencer holding this link
        const campaign = await Campaign.findOne({ 'assignedInfluencers.uniqueLink': uniqueLink });

        if (!campaign) {
            return res.status(404).json({ message: 'Invalid tracking link' });
        }

        const influencerRecord = campaign.assignedInfluencers.find(i => i.uniqueLink === uniqueLink);

        // Create tracking log
        await TrackingData.create({
            campaign: campaign._id,
            influencer: influencerRecord.influencer,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            actionType: 'Click'
        });

        // Redirect to the campaign's product link, appending the unique tracking reference
        if (campaign.productLink) {
            const separator = campaign.productLink.includes('?') ? '&' : '?';
            return res.redirect(`${campaign.productLink}${separator}ref=${uniqueLink}`);
        } else {
            // Fallback if no product link was provided
            return res.redirect(`http://localhost:5173/?ref=${uniqueLink}`);
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Log a conversion for an influencer's unique link (Simulation)
// @route   POST /api/tracking/:uniqueLink/conversion
// @access  Public
export const trackConversion = async (req, res) => {
    try {
        const { uniqueLink } = req.params;
        const { conversionValue } = req.body;

        const campaign = await Campaign.findOne({ 'assignedInfluencers.uniqueLink': uniqueLink });

        if (!campaign) {
            return res.status(404).json({ message: 'Invalid tracking link' });
        }

        const influencerRecord = campaign.assignedInfluencers.find(i => i.uniqueLink === uniqueLink);

        await TrackingData.create({
            campaign: campaign._id,
            influencer: influencerRecord.influencer,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            actionType: 'Conversion',
            conversionValue: conversionValue || 0
        });

        res.json({ message: 'Conversion recorded successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
