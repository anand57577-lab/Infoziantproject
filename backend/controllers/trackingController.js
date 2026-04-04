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

        // Block tracking if campaign has expired
        if (campaign.status === 'Expired' || (campaign.endDate && new Date(campaign.endDate) < new Date())) {
            return res.status(410).send(`
                <!DOCTYPE html><html><head><title>Campaign Expired</title>
                <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa;}
                .box{text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1);}
                h1{color:#dc3545;margin-bottom:12px;}p{color:#6c757d;}</style></head>
                <body><div class="box"><h1>🚫 Campaign Expired</h1>
                <p>This promotional campaign has ended and the tracking link is no longer active.</p></div></body></html>
            `);
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
