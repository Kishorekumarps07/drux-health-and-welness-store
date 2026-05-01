const fs = require('fs');
const path = require('path');
// Using native fetch

const BASE_URL = 'http://localhost:5001/api/v1';

// Deterministic test data
const CREDENTIALS = {
  customer: { name: 'Test Customer', email: 'test_customer@druxx.com', password: 'password123', role: 'CUSTOMER' },
  vendor: { name: 'Test Vendor', email: 'test_vendor@druxx.com', password: 'password123', role: 'VENDOR' },
  admin: { name: 'Test Admin', email: 'test_admin@druxx.com', password: 'password123', role: 'ADMIN' },
};

const storeTokens = {};

let categoryId = null;
let testProductId = null;
let testOrderId = null;
let testVendorId = null;

const report = {
  pass: 0,
  fail: 0,
  bugs: [],
  security: [],
  performance: []
};

// Extractor helper
async function apiCall(method, endpoint, data = null, role = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (role && storeTokens[role]) {
    headers['Authorization'] = `Bearer ${storeTokens[role]}`;
  }

  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    });
    
    const bodyText = await response.text();
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch(e) {
      bodyJson = bodyText;
    }
    
    const time = Date.now() - start;
    if (time > 1000) {
      report.performance.push(`Endpoint ${method} ${endpoint} took ${time}ms`);
    }

    return { status: response.status, data: bodyJson };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function assertTest(name, condition, onFail) {
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    report.pass++;
  } else {
    console.log(`❌ [FAIL] ${name}`);
    report.fail++;
    report.bugs.push({ name, details: typeof onFail === 'function' ? onFail() : onFail });
  }
}

async function runTests() {
  console.log('--- STARTING DRUXX QA END-TO-END SUITE ---\n');

  // 1. Clean previous data if any (via direct login and delete if possible, or just re-register and ignore 409s)
  // Actually, we'll try to register. If it returns 409, we just login.
  for (const key of Object.keys(CREDENTIALS)) {
    const cred = CREDENTIALS[key];
    
    // Register
    const regRes = await apiCall('POST', '/auth/register', {
      name: cred.name, email: cred.email, password: cred.password, role: cred.role === 'ADMIN' ? ['ADMIN', 'CUSTOMER'] : [cred.role]
    });
    
    if (regRes.status !== 201 && regRes.status !== 409 && regRes.status !== 400) {
      report.bugs.push({ name: `Registration failed for ${key}`, details: regRes.data });
    }

    // Login
    const loginRes = await apiCall('POST', '/auth/login', {
      email: cred.email, password: cred.password
    });
    
    assertTest(`Authentication: Login as ${key}`, loginRes.status === 200, loginRes.data);
    if (loginRes.status === 200) {
      storeTokens[key] = loginRes.data.data.accessToken;
    }
  }

  // Fetch a valid category
  const catRes = await apiCall('GET', '/categories');
  assertTest('Categories: Fetch public categories', catRes.status === 200, catRes.data);
  if (catRes.data?.data?.categories?.length > 0) {
    categoryId = catRes.data.data.categories[0].id;
  }

  // 2. Vendor Flow
  console.log('\n--- VENDOR FLOW ---');
  let vendorApplyRes = await apiCall('POST', '/vendors/apply', {
    storeName: 'QA Test Store',
    storeDescription: 'Automated test store generation'
  }, 'vendor');
  
  if (vendorApplyRes.status === 409) {
    // Already applied
    console.log('Vendor already applied logic covered.');
  } else {
    assertTest('Vendor: Apply for store', vendorApplyRes.status === 201, vendorApplyRes.data);
  }

  // Let's get the vendor ID using the admin route
  let vendorsRes = await apiCall('GET', '/admin/vendors?search=QA Test Store', null, 'admin');
  assertTest('Admin: Fetch all vendors', vendorsRes.status === 200, vendorsRes.data);
  const qaVendor = vendorsRes.data?.vendors?.find(v => v.user.email === CREDENTIALS.vendor.email);
  if (qaVendor) {
    testVendorId = qaVendor.id;
    // Approve vendor
    if (qaVendor.approvalStatus !== 'ACTIVE') {
      const approveRes = await apiCall('PUT', `/admin/vendors/${qaVendor.id}/status`, { status: "ACTIVE" }, 'admin');
      assertTest('Admin: Approve Vendor', approveRes.status === 200, approveRes.data);
    }
  } else {
    console.log("Could not find QA vendor to approve.");
  }

  // Vendor create product
  if (categoryId) {
    const prodPayload = {
      title: 'QA Automated Product ' + Date.now(),
      description: 'Test Description',
      categoryId: categoryId,
      price: 199.99,
      stockQty: 50,
      sku: 'QA-SKU-' + Date.now()
    };
    const prodRes = await apiCall('POST', '/products', prodPayload, 'vendor');
    assertTest('Vendor: Create product', prodRes.status === 201, prodRes.data);
    if (prodRes.status === 201) testProductId = prodRes.data.data.product.id;
  }

  // 3. Customer Flow
  console.log('\n--- CUSTOMER FLOW ---');
  if (testProductId) {
    // Add to cart
    const cartRes = await apiCall('POST', '/cart/items', {
      productId: testProductId,
      quantity: 2
    }, 'customer');
    assertTest('Customer: Add item to cart', cartRes.status === 200, cartRes.data);

    // Get Cart
    const getCartRes = await apiCall('GET', '/cart', null, 'customer');
    assertTest('Customer: Fetch Cart', getCartRes.status === 200, getCartRes.data);

    // Create Order
    // Using fake addresses here or assuming address isn't hard enforced in /orders if we just pass a string or ID.
    const crypto = require('crypto');
    const orderRes = await apiCall('POST', '/orders', {
      addressId: crypto.randomUUID(), // Valid UUID to pass Zod schema
      paymentMethod: 'RAZORPAY'
    }, 'customer');
    // If it fails with 400 or 404 because address doesn't exist.
    if (orderRes.status === 400 || orderRes.status === 404) {
      // Create a fake address
      const addrRes = await apiCall('POST', '/users/addresses', {
        label: 'Home',
        fullName: 'Test User',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Testville',
        state: 'TestState',
        pincode: '123456',
        country: 'India'
      }, 'customer');
      if (addrRes.status === 201 || addrRes.status === 200) {
        const addrId = addrRes.data.data?.address?.id || addrRes.data.data?.id;
        const orderRes2 = await apiCall('POST', '/orders', {
          addressId: addrId,
          paymentMethod: 'RAZORPAY'
        }, 'customer');
        assertTest('Customer: Create Order with Address', orderRes2.status === 201, orderRes2.data);
        if (orderRes2.data?.data?.order?.id) testOrderId = orderRes2.data.data.order.id;
      } else {
         console.log('Failed to create address: ', addrRes);
      }
    } else {
      assertTest('Customer: Create Order', orderRes.status === 201, orderRes.data);
      if (orderRes.data?.data?.order?.id) testOrderId = orderRes.data.data.order.id;
    }
  }

  // 4. Security Flow
  console.log('\n--- SECURITY TESTING ---');
  // Attempt to access admin routes with vendor token
  const vendorToAdmin = await apiCall('GET', '/admin/vendors', null, 'vendor');
  assertTest('Security: Vendor blocked from Admin routes', vendorToAdmin.status === 403 || vendorToAdmin.status === 401, vendorToAdmin.data);
  if (vendorToAdmin.status === 200) {
    report.security.push('Vendor logic allowed access to /admin/vendors');
  }

  // Attempt to access vendor routes with customer token
  const customerToVendor = await apiCall('GET', '/vendor/analytics', null, 'customer');
  assertTest('Security: Customer blocked from Vendor routes', customerToVendor.status === 403 || customerToVendor.status === 404, customerToVendor.data);
    if (customerToVendor.status === 200) {
    report.security.push('Customer logic allowed access to /vendor/analytics');
  }

  // 5. Cleanup
  console.log('\n--- FINISHING & GENERATING REPORT ---');
  
  const reportMd = `# E2E QA Test Report
  
## Summary
- **Pass:** ${report.pass}
- **Fail:** ${report.fail}

## Bugs Found
${report.bugs.map(b => `- **${b.name}**: ${JSON.stringify(b.details)}`).join('\n') || '*None detected*'}

## Security Vulnerabilities
${report.security.map(s => `- ${s}`).join('\n') || '*None detected*'}

## Performance Observations
${report.performance.map(p => `- ${p}`).join('\n') || '*All endpoints performed within normal limits.*'}
`;

  fs.writeFileSync(path.join(__dirname, 'qa_report_output.md'), reportMd);
  console.log('Automated testing complete. Report saved to execution/qa_report_output.md');
}

runTests();
