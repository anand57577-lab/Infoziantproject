import mongoose from 'mongoose';

const influencerProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        socialPlatforms: [
            {
                platform: { type: String, required: true }, // e.g. Instagram, YouTube
                handle: { type: String, required: true },
                followers: { type: Number, default: 0 }
            }
        ],
        niche: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
        },
        channelUrl: {
            type: String,
        },
        category: {
            type: String,
        },
        engagement: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        }
    },
    {
        timestamps: true,
    }
);

const InfluencerProfile = mongoose.model('InfluencerProfile', influencerProfileSchema);
export default InfluencerProfile;
