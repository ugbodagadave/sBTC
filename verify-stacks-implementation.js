// Script to verify our Stacks implementation is working correctly
const http = require('http');

async function verifyStacksImplementation() {
  console.log('Verifying Stacks implementation...');
  
  // Test 1: Check if the backend server is running
  try {
    const healthCheck = await makeRequest('http://localhost:3000/health');
    console.log('✓ Backend server is running');
  } catch (error) {
    console.log('✗ Backend server is not running');
    return;
  }
  
  // Test 2: Check if we can create a merchant
  try {
    const merchantData = {
      email: `verify-${Date.now()}@example.com`,
      password: 'testpassword123',
      businessName: 'Verification Test Business'
    };
    
    const merchantResponse = await makeRequest('http://localhost:3000/api/v1/merchants/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(merchantData)
    });
    
    console.log('✓ Merchant creation API is working');
    console.log('  Merchant ID:', merchantResponse.id);
  } catch (error) {
    console.log('✗ Merchant creation API is not working');
    console.log('  Error:', error.message);
  }
  
  // Test 3: Check if we can create a payment intent
  try {
    // First create a merchant to get a valid merchant ID
    const merchantData = {
      email: `payment-${Date.now()}@example.com`,
      password: 'testpassword123',
      businessName: 'Payment Test Business'
    };
    
    const merchantResponse = await makeRequest('http://localhost:3000/api/v1/merchants/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(merchantData)
    });
    
    const paymentIntentData = {
      merchantId: merchantResponse.id,
      amount: 0.01,
      currency: 'sBTC',
      description: 'Verification test payment'
    };
    
    const paymentIntentResponse = await makeRequest('http://localhost:3000/api/v1/payment-intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentIntentData)
    });
    
    console.log('✓ Payment intent creation API is working');
    console.log('  Payment Intent ID:', paymentIntentResponse.id);
  } catch (error) {
    console.log('✗ Payment intent creation API is not working');
    console.log('  Error:', error.message);
  }
  
  console.log('Verification completed!');
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      ...options
    };
    
    const req = http.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.error || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

verifyStacksImplementation();