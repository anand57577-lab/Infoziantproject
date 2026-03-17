// Uses Node 18+ built-in fetch
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Step 1: Get a brand user email from DB
await mongoose.connect(process.env.MONGO_URI);
const users = await mongoose.connection.db
    .collection('users')
    .find({ role: 'Brand' })
    .project({ name: 1, email: 1 })
    .limit(1)
    .toArray();
await mongoose.disconnect();

if (!users.length) { console.log('No Brand users found'); process.exit(1); }
const email = users[0].email;
console.log('Testing with brand:', email);

// Step 2: Login
const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: '123456' })
});
const loginData = await loginRes.json();

if (!loginData.token) {
    console.log('Login failed (wrong password or user):', JSON.stringify(loginData));
    // Still test if the route exists with a FAKE token
    const fakeRes = await fetch('http://localhost:5000/api/analytics/brand/detailed', {
        headers: { Authorization: 'Bearer fake_token' }
    });
    const fakeBody = await fakeRes.json();
    console.log(`Route test (fake token) -> HTTP ${fakeRes.status}:`, JSON.stringify(fakeBody));
    if (fakeRes.status === 404) console.log('FAIL: Route still not found');
    else console.log('Route EXISTS (auth middleware responded correctly)');
    process.exit(0);
}

console.log('Login OK:', loginData.name, loginData.role);

// Step 3: Call the detailed analytics endpoint
const analyticsRes = await fetch('http://localhost:5000/api/analytics/brand/detailed', {
    headers: { Authorization: `Bearer ${loginData.token}` }
});
const analyticsData = await analyticsRes.json();
console.log('\n=== Analytics Endpoint Response ===');
console.log('HTTP Status:', analyticsRes.status);
console.log('Summary:', JSON.stringify(analyticsData.summary, null, 2));
console.log('Campaigns count:', analyticsData.campaigns?.length);
if (analyticsData.campaigns?.length > 0) {
    analyticsData.campaigns.forEach(c => {
        console.log(`  Campaign: "${c.title}" | Clicks: ${c.totalClicks} | Influencers: ${c.influencerBreakdown?.length}`);
    });
}
process.exit(0);
