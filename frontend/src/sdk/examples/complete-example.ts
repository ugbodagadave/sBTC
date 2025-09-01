/**
 * Complete example of the sBTCPay SDK
 * 
 * This example demonstrates a complete flow:
 * 1. Merchant registration and authentication
 * 2. Creating and managing payment intents
 * 3. Setting up and managing webhooks
 */

import { SBTCPay } from '../src';
import { CreateMerchantInput, CreatePaymentIntentInput, CreateWebhookInput } from '../src/types';

async function completeExample() {
  // Initialize the SDK
  const sbtcpay = new SBTCPay({
    baseUrl: 'http://localhost:3000/api/v1'
  });

  console.log('=== sBTCPay SDK Complete Example ===\n');

  try {
    // 1. Register a new merchant
    console.log('1. Registering a new merchant...');
    
    const merchantInput: CreateMerchantInput = {
      email: `merchant-${Date.now()}@example.com`,
      password: 'securePassword123!',
      businessName: 'Example Business'
    };

    const merchant = await sbtcpay.registerMerchant(merchantInput);
    console.log(`   Merchant registered successfully with ID: ${merchant.id}\n`);

    // 2. Login as the merchant
    console.log('2. Logging in as the merchant...');
    
    const loginResponse = await sbtcpay.loginMerchant(
      merchantInput.email,
      merchantInput.password
    );
    console.log(`   ${loginResponse.message}\n`);

    // 3. Create a payment intent
    console.log('3. Creating a payment intent...');
    
    const paymentIntentInput: CreatePaymentIntentInput = {
      merchantId: merchant.id,
      amount: 50000000, // 0.5 sBTC
      currency: 'sbtc',
      description: 'Example product purchase',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    };

    const paymentIntent = await sbtcpay.createPaymentIntent(paymentIntentInput);
    console.log(`   Payment intent created with ID: ${paymentIntent.id}`);
    console.log(`   Payment URL: ${paymentIntent.paymentUrl}\n`);

    // 4. Retrieve the payment intent
    console.log('4. Retrieving the payment intent...');
    
    const retrievedIntent = await sbtcpay.retrievePaymentIntent(paymentIntent.id);
    console.log(`   Payment intent status: ${retrievedIntent.status}\n`);

    // 5. List payment intents for the merchant
    console.log('5. Listing payment intents for the merchant...');
    
    const paymentIntents = await sbtcpay.listPaymentIntents(merchant.id);
    console.log(`   Found ${paymentIntents.length} payment intent(s)\n`);

    // 6. Create a webhook
    console.log('6. Creating a webhook...');
    
    const webhookInput: CreateWebhookInput = {
      merchantId: merchant.id,
      url: 'https://example.com/webhook',
      events: ['payment_intent.succeeded', 'payment_intent.failed', 'payment_intent.cancelled']
    };

    const webhook = await sbtcpay.createWebhook(webhookInput);
    console.log(`   Webhook created with ID: ${webhook.id}`);
    console.log(`   Webhook secret: ${webhook.secret}\n`);

    // 7. List webhooks for the merchant
    console.log('7. Listing webhooks for the merchant...');
    
    const webhooks = await sbtcpay.listWebhooks(merchant.id);
    console.log(`   Found ${webhooks.length} webhook(s)\n`);

    // 8. Delete the webhook
    console.log('8. Deleting the webhook...');
    
    await sbtcpay.deleteWebhook(webhook.id);
    console.log('   Webhook deleted successfully\n');

    // 9. Verify webhook deletion
    console.log('9. Verifying webhook deletion...');
    
    const updatedWebhooks = await sbtcpay.listWebhooks(merchant.id);
    console.log(`   Found ${updatedWebhooks.length} webhook(s) after deletion\n`);

    console.log('=== Example completed successfully! ===');
    
  } catch (error: any) {
    console.error('Error occurred:', error.message);
    if (error.status) {
      console.error(`Status code: ${error.status}`);
    }
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  }
}

// Run the complete example
completeExample();