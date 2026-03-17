import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Get brand user
const user = await mongoose.connection.db
    .collection('users')
    .findOne({ role: 'Brand' });

if (!user) { console.log('NO_BRAND_USER'); process.exit(1); }

// Generate JWT same way the auth controller does
const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });

console.log('USER_ID=' + user._id.toString());
console.log('NAME=' + user.name);
console.log('TOKEN=' + token);

await mongoose.disconnect();
process.exit(0);
