import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const users = await mongoose.connection.db
    .collection('users')
    .find({ role: 'Brand' })
    .project({ name: 1, email: 1, role: 1 })
    .limit(3)
    .toArray();

console.log('BRANDS:', JSON.stringify(users, null, 2));
await mongoose.disconnect();
process.exit(0);
