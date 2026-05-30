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
  
  console.log("\nMaking request to GET /api/v1/orders/all ...");
  try {
    const res = await axios.get('http://localhost:5001/api/v1/orders/all?search=88dfb21a-e589-4da0-8f85-055e660d486c', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response Status:", res.status);
    console.log("Orders count:", res.data.orders ? res.data.orders.length : 0);
    if (res.data.orders) {
      res.data.orders.forEach((o, i) => {
        console.log(`[Order ${i}] ID: ${o.id}, Total: ${o.total}, User: ${JSON.stringify(o.user)}, Items Count: ${o.items?.length}, ItemsCount Field: ${o.itemsCount}`);
      });
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
