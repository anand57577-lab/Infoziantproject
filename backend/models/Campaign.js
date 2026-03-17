import mongoose from 'mongoose';

const campaignSchema = mongoose.Schema(
    {
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
        },
        productLink: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ['Draft', 'Active', 'Completed'],
            default: 'Draft',
        },
        assignedInfluencers: [
            {
                influencer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                uniqueLink: {
                    type: String
                },
                trackingUrl: {
                    type: String
                },
                status: {
                    type: String,
                    enum: ['Pending', 'Accepted', 'Rejected'],
                    default: 'Pending'
                },
                rejectionReason: {
                    type: String
                }
            }
        ],
        updates: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                type: {
                    type: String,
                    enum: ['content', 'query', 'negotiation', 'other'],
                    required: true
                },
                message: {
                    type: String,
                    required: true
                },
                fileUrl: {
                    type: String
                },
                fileName: {
                    type: String
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
