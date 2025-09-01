/**
 * Basic usage example of the sBTCPay SDK
 * 
 * This example demonstrates how to use the SDK to:
 * 1. Register a merchant
 * 2. Create a payment intent
 * 3. Set up a webhook
 */

import { SBTCPay } from '../src';

async function main() {
  // Initialize the SDK
  const sbtcpay = new SBTCPay({
    baseUrl: 'http://localhost:3000/api/v1'
  });

  try {
    // Register a new merchant
    console.log('Registering merchant...');
    const merchant = await sbtcpay.registerMerchant({
      email: 'example@example.com',
      password: 'securepassword',
      businessName: 'Example Business'
    });
    console.log('Merchant registered:', merchant.id);

    // Create a payment intent
    console.log('Creating payment intent...');
    const paymentIntent = await sbtcpay.createPaymentIntent({
      merchantId: merchant.id,
      amount: 10000000, // 0.1 sBTC (amounts are in satoshis)
      currency: 'sbtc',
      description: 'Example payment',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    });
    console.log('Payment intent created:', paymentIntent.id);
    console.log('Payment URL:', paymentIntent.paymentUrl);

    // Create a webhook
    console.log('Creating webhook...');
    const webhook = await sbtcpay.createWebhook({
      merchantId: merchant.id,
      url: 'https://example.com/webhook',
      events: ['payment_intent.succeeded', 'payment_intent.failed']
    });
    console.log('Webhook created:', webhook.id);

    // List webhooks
    console.log('Listing webhooks...');
    const webhooks = await sbtcpay.listWebhooks(merchant.id);
    console.log(`Found ${webhooks.length} webhooks`);

    // Retrieve payment intent
    console.log('Retrieving payment intent...');
    const retrievedIntent = await sbtcpay.retrievePaymentIntent(paymentIntent.id);
    console.log('Payment intent status:', retrievedIntent.status);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();