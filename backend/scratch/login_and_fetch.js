const axios = require('axios');

async function run() {
  console.log("Logging in via /api/v1/auth/login as test_admin@druxx.com...");
  try {
    const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'test_admin@druxx.com',
      password: 'Admin@123'
    });
    
    console.log("Login Successful! Status:", loginRes.status);
    console.log("Login Response Data:", JSON.stringify(loginRes.data, null, 2));
    const token = loginRes.data.data.token || loginRes.data.token || loginRes.data.accessToken || (loginRes.data.data && loginRes.data.data.accessToken);
    console.log("Access Token received:", token ? token.slice(0, 15) + "..." : "undefined");
    
    console.log("\n1. Fetching GET /api/v1/orders/all ...");
    const ordersAllRes = await axios.get('http://localhost:5001/api/v1/orders/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Response /orders/all status:", ordersAllRes.status);
    if (ordersAllRes.data.orders && ordersAllRes.data.orders.length > 0) {
      console.log("First Order user:", JSON.stringify(ordersAllRes.data.orders[0].user));
      console.log("First Order items length:", ordersAllRes.data.orders[0].items?.length);
    }
    
    console.log("\n2. Fetching GET /api/v1/admin/orders ...");
    const adminOrdersRes = await axios.get('http://localhost:5001/api/v1/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Response /admin/orders status:", adminOrdersRes.status);
    if (adminOrdersRes.data.orders && adminOrdersRes.data.orders.length > 0) {
      console.log("First Order user:", JSON.stringify(adminOrdersRes.data.orders[0].user));
      console.log("First Order items length:", adminOrdersRes.data.orders[0].items?.length);
    }

  } catch (err) {
    console.error("Failed!");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error:", err.message);
    }
  }
}

run();
