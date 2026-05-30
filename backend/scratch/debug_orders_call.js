const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

async function run() {
  console.log("Generating custom JWT token for aureviawellness@druxx.com...");
  
  // Custom payload matching AuthService._issueTokens
  const payload = {
    id: 'b727f61f-fa95-491c-a31e-71aa4b0627bb',
    roles: ['VENDOR'],
    jti: 'test-jti-token-uuid'
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log("Token:", token);
  
  console.log("\nMaking request to GET /api/v1/orders/vendor?limit=6&status=PENDING ...");
  try {
    const res = await axios.get('http://localhost:5001/api/v1/orders/vendor?limit=6&status=PENDING', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response Status:", res.status);
    console.log("Response Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Request Failed!");
    if (err.response) {
      console.error("Response Status:", err.response.status);
      console.error("Response Headers:", err.response.headers);
      console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error Message:", err.message);
    }
  }
}

run();
