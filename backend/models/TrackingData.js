import mongoose from 'mongoose';

const trackingDataSchema = mongoose.Schema(
    {
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Campaign',
        },
        influencer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        actionType: {
            type: String,
            enum: ['Click', 'Conversion'],
            default: 'Click',
        },
        conversionValue: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

const TrackingData = mongoose.model('TrackingData', trackingDataSchema);
export default TrackingData;
