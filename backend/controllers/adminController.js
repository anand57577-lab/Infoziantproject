import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import Campaign from '../models/Campaign.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'Admin') {
                return res.status(400).json({ message: 'Cannot delete admin account' });
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all influencer profiles
// @route   GET /api/admin/profiles
// @access  Private/Admin
export const getProfiles = async (req, res) => {
    try {
        const profiles = await InfluencerProfile.find({}).populate('user', 'name email');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update influencer profile status
// @route   PUT /api/admin/profiles/:id/status
// @access  Private/Admin
export const updateProfileStatus = async (req, res) => {
    try {
        const profile = await InfluencerProfile.findById(req.params.id);
        if (profile) {
            profile.status = req.body.status || profile.status;
            const updatedProfile = await profile.save();
            res.json(updatedProfile);
        } else {
            res.status(404).json({ message: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all campaigns (Admin view)
// @route   GET /api/admin/campaigns
// @access  Private/Admin
export const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({}).populate('brand', 'name email');
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a campaign
// @route   DELETE /api/admin/campaigns/:id
// @access  Private/Admin
export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (campaign) {
            await campaign.deleteOne();
            res.json({ message: 'Campaign removed' });
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update campaign status (pause/resume)
// @route   PUT /api/admin/campaigns/:id/status
// @access  Private/Admin
export const updateCampaignStatusAdmin = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (campaign) {
            campaign.status = req.body.status || campaign.status;
            const updatedCampaign = await campaign.save();
            res.json(updatedCampaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get updates for a specific influencer
// @route   GET /api/admin/influencers/:id/updates
// @access  Private/Admin
export const getInfluencerUpdates = async (req, res) => {
    try {
        const influencerId = req.params.id;

        // Find all campaigns where this influencer is assigned
        const campaigns = await Campaign.find({
            'assignedInfluencers.influencer': influencerId
        }).populate('brand', 'name email');

        const updates = [];

        if (campaigns && campaigns.length > 0) {
            campaigns.forEach(camp => {
                if (camp.updates && camp.updates.length > 0) {
                    camp.updates.forEach(update => {
                        // Check if this update was posted by the influencer
                        if (update.sender && update.sender.toString() === influencerId) {
                            updates.push({
                                _id: update._id,
                                sender: {
                                    name: 'Influencer',
                                    role: 'Influencer'
                                },
                                type: update.type,
                                message: update.message,
                                fileUrl: update.fileUrl,
                                fileName: update.fileName,
                                createdAt: update.createdAt,
                                campaignTitle: camp.title
                            });
                        }
                    });
                }
            });
        }

        // Sort by createdAt descending
        updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(updates);
    } catch (error) {
        console.error('Error fetching influencer updates:', error);
        res.status(500).json({ message: error.message });
    }
};
