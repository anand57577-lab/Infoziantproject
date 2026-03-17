import InfluencerProfile from '../models/InfluencerProfile.js';

// @desc    Submit or Update Influencer Profile
// @route   POST /api/profiles
// @access  Private/Influencer
export const submitProfile = async (req, res) => {
    try {
        const { platform, handle, followers, niche, bio, channelUrl, category, engagement } = req.body;

        let profile = await InfluencerProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update existing
            profile.socialPlatforms = [{ platform, handle, followers }];
            profile.niche = niche;
            profile.bio = bio;
            profile.channelUrl = channelUrl;
            profile.category = category;
            profile.engagement = engagement;
            profile.status = 'Pending'; // Resubmit puts it back to pending
            const updatedProfile = await profile.save();
            return res.json(updatedProfile);
        }

        // Create new
        profile = await InfluencerProfile.create({
            user: req.user._id,
            socialPlatforms: [{ platform, handle, followers }],
            niche,
            bio,
            channelUrl,
            category,
            engagement,
            status: 'Pending'
        });

        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in influencer profile
// @route   GET /api/profiles/me
// @access  Private/Influencer
export const getMyProfile = async (req, res) => {
    try {
        const profile = await InfluencerProfile.findOne({ user: req.user._id }).populate('user', 'name email');
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all approved influencers (for Brands)
// @route   GET /api/profiles/approved
// @access  Private/Brand
export const getApprovedInfluencers = async (req, res) => {
    try {
        const profiles = await InfluencerProfile.find({ status: 'Approved' }).populate('user', 'name email');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
