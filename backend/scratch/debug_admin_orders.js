const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: 'backend/.env' });

async function run() {
  console.log("Generating admin JWT token for test_admin@druxx.com...");
  
  const payload = {
    id: 'ccb3f35d-0e81-4ae5-92ad-fdc2a8f8e770',
    roles: ['ADMIN'],
    jti: 'test-jti-token-uuid'
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log("Token:", token);
  
  console.log("\nMaking request to GET /api/v1/admin/orders ...");
  try {
    const res = await axios.get('http://localhost:5001/api/v1/admin/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response Status:", res.status);
    console.log("Orders count:", res.data.orders ? res.data.orders.length : 0);
    if (res.data.orders && res.data.orders.length > 0) {
      console.log("First Order:", JSON.stringify(res.data.orders[0], null, 2));
    }
  } catch (err) {
    console.error("Request Failed!");
    if (err.response) {
      console.error("Response Status:", err.response.status);
      console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error Message:", err.message);
    }
  }
}

run();
