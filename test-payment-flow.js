// Test script to create a merchant and payment intent for testing the Stacks payment flow
const http = require('http');
const { Client } = require('pg');

async function testPaymentFlow() {
  let merchantId;
  
  try {
    console.log('Creating merchant through API...');
    
    // Create a merchant through the API
    const merchantData = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      businessName: 'Test Business'
    };
    
    const merchantResponse = await makeRequest('http://localhost:3000/api/v1/merchants/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(merchantData)
    });
    
    console.log('Merchant created:', merchantResponse);
    merchantId = merchantResponse.id;
    
    // Update the merchant with Stacks information directly in the database
    console.log('Updating merchant with Stacks wallet information...');
    
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'sbtcpay',
      user: 'sbtcpay_user',
      password: 'sbtcpay_password'
    });
    
    await client.connect();
    
    const updateQuery = `
      UPDATE merchants 
      SET stacks_address = $1, stacks_private_key = $2 
      WHERE id = $3
    `;
    
    await client.query(updateQuery, [
      'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8',
      'be254442a95ec011468e0e0f0d47c5e752a758b16585be83d6d30d09f68383d801',
      merchantId
    ]);
    
    await client.end();
    
    console.log('Merchant updated with Stacks information');
    
    console.log('Creating payment intent...');
    
    // Create a payment intent
    const paymentIntentData = {
      merchantId: merchantId,
      amount: 0.01, // 0.01 sBTC
      currency: 'sBTC',
      description: 'Test payment for Stacks integration'
    };
    
    const paymentIntentResponse = await makeRequest('http://localhost:3000/api/v1/payment-intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentIntentData)
    });
    
    console.log('Payment intent created:', paymentIntentResponse);
    
    console.log('\n=== DEMO INSTRUCTIONS ===');
    console.log('To test the complete payment flow:');
    console.log('1. Open the Stacks payment example HTML file:');
    console.log('   file:///' + process.cwd() + '/frontend/src/widget/examples/stacks-payment-example.html');
    console.log('2. Or use this payment intent ID in your widget initialization:');
    console.log('   paymentIntentId:', paymentIntentResponse.id);
    console.log('3. Connect your Leather wallet');
    console.log('4. Click "Pay with sBTC"');
    console.log('5. Confirm the transaction in your wallet');
    console.log('6. The transaction will be submitted to the Stacks testnet');
    
  } catch (error) {
    console.error('Error in test flow:', error);
  }
}

function makeRequest(url, options) {
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

testPaymentFlow();