import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YWMyMTBjNTk4MjFmZTY1ZGY0ZDQ4YSIsImlhdCI6MTc3MjkwNTc4OSwiZXhwIjoxNzc1NDk3Nzg5fQ.yDvlOvO1O_od95aIYPVgAhvrmZ6lAWs6E3cFd5zREXg';
const campaignId = '69ac5a82dd1a3c3e37ef029e';

(async () => {
  try {
    const res = await axios.put(`http://localhost:5000/api/campaigns/${campaignId}/respond`,
      { status: 'Accepted' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('response data', res.data);
  } catch (err) {
    if (err.response) {
      console.log('status', err.response.status);
      console.log('data', err.response.data);
    } else {
      console.error('error', err.message);
    }
  }
})();