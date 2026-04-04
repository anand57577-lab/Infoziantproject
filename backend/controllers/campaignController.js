import Campaign from '../models/Campaign.js';
import crypto from 'crypto';

// Helper: auto-expire campaigns whose endDate has passed
const autoExpireCampaigns = async (campaigns) => {
    const now = new Date();
    const toExpire = campaigns.filter(
        c => c.endDate && new Date(c.endDate) < now && c.status === 'Active'
    );
    if (toExpire.length > 0) {
        await Campaign.updateMany(
            { _id: { $in: toExpire.map(c => c._id) }, status: 'Active' },
            { $set: { status: 'Expired' } }
        );
        toExpire.forEach(c => { c.status = 'Expired'; });
    }
    return campaigns;
};

// @desc    Get all campaigns (Admin can see all, Brand can see theirs, Influencer can see assigned)
// @route   GET /api/campaigns
// @access  Private
export const getCampaigns = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'Brand') {
            filter.brand = req.user._id;
        } else if (req.user.role === 'Influencer') {
            filter['assignedInfluencers.influencer'] = req.user._id;
        }

        let campaigns = await Campaign.find(filter)
            .populate('brand', 'name email')
            .populate('assignedInfluencers.influencer', 'name email');

        // Auto-expire any campaigns past their end date
        campaigns = await autoExpireCampaigns(campaigns);

        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private/Brand
export const createCampaign = async (req, res) => {
    try {
        const { title, description, budget, productLink, startDate, endDate } = req.body;

        // Validate dates if both are provided
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'End date cannot be earlier than start date' });
        }

        const campaign = new Campaign({
            brand: req.user._id,
            title,
            description,
            budget,
            productLink,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : undefined,
            status: 'Active'
        });

        const createdCampaign = await campaign.save();
        res.status(201).json(createdCampaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an existing campaign (Brand only)
// @route   PUT /api/campaigns/:id
// @access  Private/Brand
export const updateCampaign = async (req, res) => {
    try {
        const { title, description, budget, productLink, endDate } = req.body;
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Ensure only the owning brand (or admin) can update
        if (campaign.brand.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to modify this campaign' });
        }

        // Validate endDate if provided
        if (endDate && new Date(endDate) < new Date(campaign.startDate)) {
            return res.status(400).json({ message: 'End date cannot be earlier than start date' });
        }

        // Apply updates
        if (title !== undefined) campaign.title = title;
        if (description !== undefined) campaign.description = description;
        if (budget !== undefined) campaign.budget = budget;
        if (productLink !== undefined) campaign.productLink = productLink;
        if (endDate !== undefined) campaign.endDate = endDate ? new Date(endDate) : undefined;

        // Re-check expiry after editing
        const now = new Date();
        if (campaign.endDate && new Date(campaign.endDate) < now && campaign.status === 'Active') {
            campaign.status = 'Expired';
        } else if (campaign.endDate && new Date(campaign.endDate) >= now && campaign.status === 'Expired') {
            campaign.status = 'Active';
        }

        const updatedCampaign = await campaign.save();
        res.json(updatedCampaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign an influencer to a campaign
// @route   PUT /api/campaigns/:id/assign
// @access  Private/Brand
export const assignInfluencer = async (req, res) => {
    try {
        const { influencerId } = req.body;
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            if (campaign.brand.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to modify this campaign' });
            }

            const isAssigned = campaign.assignedInfluencers.find(i => i.influencer.toString() === influencerId);
            if (isAssigned) {
                return res.status(400).json({ message: 'Influencer already assigned' });
            }

            const uniqueLink = crypto.randomBytes(8).toString('hex');
            const trackingUrl = `http://localhost:5000/api/tracking/${uniqueLink}`;

            campaign.assignedInfluencers.push({
                influencer: influencerId,
                uniqueLink,
                trackingUrl,
                status: 'Pending'
            });

            const updatedCampaign = await campaign.save();
            res.json(updatedCampaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept or Reject campaign assignment
// @route   PUT /api/campaigns/:id/respond
// @access  Private/Influencer
export const respondToCampaign = async (req, res) => {
    console.log('respondToCampaign called with body:', req.body, 'and user', req.user._id);
    try {
        const { status, reason } = req.body;
        console.log('campaignId', req.params.id, 'status', status, 'reason', reason);
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            console.log('campaign found, assignedInfluencers:', campaign.assignedInfluencers);
            const assignmentIndex = campaign.assignedInfluencers.findIndex(i => {
                try {
                    return i.influencer.toString() === req.user._id.toString();
                } catch (e) {
                    console.error('error converting influencer id', i, e);
                    return false;
                }
            });

            if (assignmentIndex === -1) {
                console.log('assignmentIndex not found for user', req.user._id);
                return res.status(404).json({ message: 'Assignment not found' });
            }

            campaign.assignedInfluencers[assignmentIndex].status = status;
            if (status === 'Rejected' && reason) {
                campaign.assignedInfluencers[assignmentIndex].rejectionReason = reason;
            }

            const updatedCampaign = await campaign.save();
            res.json(updatedCampaign);
        } else {
            console.log('campaign not found');
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        console.error('respondToCampaign error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get campaign updates
// @route   GET /api/campaigns/:id/updates
// @access  Private
export const getCampaignUpdates = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            // Check if user is assigned to this campaign
            const isAssigned = campaign.assignedInfluencers.some(i =>
                i.influencer.toString() === req.user._id.toString()
            ) || campaign.brand.toString() === req.user._id.toString();

            if (!isAssigned && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to view this campaign' });
            }

            // Populate sender info
            await campaign.populate('updates.sender', 'name email role');

            res.json(campaign.updates || []);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Post campaign update
// @route   POST /api/campaigns/:id/updates
// @access  Private
export const postCampaignUpdate = async (req, res) => {
    try {
        const { type, message } = req.body;
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            // Block updates on expired campaigns
            if (campaign.status === 'Expired') {
                return res.status(403).json({ message: 'This campaign has expired. Updates are no longer allowed.' });
            }

            // Check if user is assigned to this campaign
            const isAssigned = campaign.assignedInfluencers.some(i =>
                i.influencer.toString() === req.user._id.toString()
            ) || campaign.brand.toString() === req.user._id.toString();

            if (!isAssigned && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this campaign' });
            }

            const update = {
                sender: req.user._id,
                type,
                message,
                createdAt: new Date()
            };

            // Handle file upload if present
            if (req.file) {
                update.fileUrl = `/uploads/${req.file.filename}`;
                update.fileName = req.file.originalname;
            }

            if (!campaign.updates) {
                campaign.updates = [];
            }

            campaign.updates.push(update);
            const updatedCampaign = await campaign.save();

            // Populate sender info for response
            await updatedCampaign.populate('updates.sender', 'name email role');

            res.status(201).json(updatedCampaign.updates[updatedCampaign.updates.length - 1]);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
