import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Campaign from './models/Campaign.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'anand.57@gmail.com' });
        console.log('user id', user._id);
        const campaigns = await Campaign.find({ 'assignedInfluencers.influencer': user._id });
        console.log('found campaigns', campaigns.length);
        campaigns.forEach(c => console.log(c._id.toString(), c.title));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();