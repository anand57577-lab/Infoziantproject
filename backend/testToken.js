import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const user = await User.findOne({ role: 'Influencer' });
        if (!user) {
            console.log('No influencer user found');
            process.exit(1);
        }
        
        const token = generateToken(user._id);
        console.log('user', user.email, 'id', user._id);
        console.log('token', token);
        process.exit(0);
    } catch (err){
        console.error(err);
        process.exit(1);
    }
};

run();