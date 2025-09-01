import pool from '../src/config/db';
import { MerchantService } from '../src/services/merchantService';
import { PaymentIntentService } from '../src/services/paymentIntentService';
import { WebhookService } from '../src/services/webhookService';

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    const client = await pool.connect();
    expect(client).toBeDefined();
    client.release();
  });

  it('should execute a simple query', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
  });
});

describe('Merchant Service', () => {
  it('should create and retrieve a merchant', async () => {
    // Create a merchant
    const merchant = await MerchantService.createMerchant({
      email: 'test1@example.com',
      password: 'password123',
      businessName: 'Test Business'
    });
    
    expect(merchant).toBeDefined();
    expect(merchant.email).toBe('test1@example.com');
    expect(merchant.businessName).toBe('Test Business');
    
    // Retrieve the merchant by email
    const retrievedMerchant = await MerchantService.findByEmail('test1@example.com');
    expect(retrievedMerchant).toBeDefined();
    expect(retrievedMerchant?.id).toBe(merchant.id);
    
    // Retrieve the merchant by ID
    const retrievedMerchantById = await MerchantService.findById(merchant.id);
    expect(retrievedMerchantById).toBeDefined();
    expect(retrievedMerchantById?.email).toBe('test1@example.com');
  });
  
  it('should validate merchant credentials', async () => {
    // Create a merchant
    await MerchantService.createMerchant({
      email: 'test2@example.com',
      password: 'password123',
      businessName: 'Test Business 2'
    });
    
    // Validate correct credentials
    const isValid = await MerchantService.validateCredentials('test2@example.com', 'password123');
    expect(isValid).toBe(true);
    
    // Validate incorrect credentials
    const isInvalid = await MerchantService.validateCredentials('test2@example.com', 'wrongpassword');
    expect(isInvalid).toBe(false);
  });
});

describe('Payment Intent Service', () => {
  let merchantId: string;
  
  beforeAll(async () => {
    // Create a merchant for testing with a unique email
    const merchant = await MerchantService.createMerchant({
      email: 'payment-test3@example.com',
      password: 'password123',
      businessName: 'Payment Test Business'
    });
    merchantId = merchant.id;
  });
  
  it('should create and retrieve a payment intent', async () => {
    // Create a payment intent
    const paymentIntent = await PaymentIntentService.createPaymentIntent({
      merchantId,
      amount: 0.01,
      currency: 'sBTC',
      description: 'Test payment'
    });
    
    expect(paymentIntent).toBeDefined();
    expect(paymentIntent.amount).toBe(0.01);
    expect(paymentIntent.status).toBe('requires_payment');
    
    // Retrieve the payment intent
    const retrievedPaymentIntent = await PaymentIntentService.findById(paymentIntent.id);
    expect(retrievedPaymentIntent).toBeDefined();
    expect(retrievedPaymentIntent?.amount).toBe(0.01);
  });
  
  it('should update payment intent status', async () => {
    // Create a payment intent
    const paymentIntent = await PaymentIntentService.createPaymentIntent({
      merchantId,
      amount: 0.02,
      currency: 'sBTC',
      description: 'Test payment 2'
    });
    
    // Update status
    const updatedPaymentIntent = await PaymentIntentService.updateStatus(
      paymentIntent.id, 
      'succeeded', 
      '0x123456789'
    );
    
    expect(updatedPaymentIntent).toBeDefined();
    expect(updatedPaymentIntent?.status).toBe('succeeded');
    expect(updatedPaymentIntent?.stacksTxId).toBe('0x123456789');
  });
  
  it('should list payment intents for a merchant', async () => {
    // List payment intents
    const paymentIntents = await PaymentIntentService.findByMerchantId(merchantId);
    expect(paymentIntents).toBeDefined();
    expect(paymentIntents.length).toBeGreaterThan(0);
  });
});

describe('Webhook Service', () => {
  let merchantId: string;
  
  beforeAll(async () => {
    // Create a merchant for testing with a unique email
    const merchant = await MerchantService.createMerchant({
      email: 'webhook-test4@example.com',
      password: 'password123',
      businessName: 'Webhook Test Business'
    });
    merchantId = merchant.id;
  });
  
  it('should create and retrieve a webhook', async () => {
    // Create a webhook
    const webhook = await WebhookService.createWebhook({
      merchantId,
      url: 'https://example.com/webhook',
      events: ['payment_intent.succeeded', 'payment_intent.failed']
    });
    
    expect(webhook).toBeDefined();
    expect(webhook.url).toBe('https://example.com/webhook');
    expect(webhook.events).toEqual(['payment_intent.succeeded', 'payment_intent.failed']);
    expect(webhook.secret).toBeDefined();
    
    // Retrieve the webhook
    const retrievedWebhook = await WebhookService.findById(webhook.id);
    expect(retrievedWebhook).toBeDefined();
    expect(retrievedWebhook?.url).toBe('https://example.com/webhook');
  });
  
  it('should list webhooks for a merchant', async () => {
    // List webhooks
    const webhooks = await WebhookService.findByMerchantId(merchantId);
    expect(webhooks).toBeDefined();
    expect(webhooks.length).toBeGreaterThan(0);
  });
  
  it('should delete a webhook', async () => {
    // Create a merchant for the webhook to delete with a unique email
    const merchant = await MerchantService.createMerchant({
      email: 'webhook-delete-test5@example.com',
      password: 'password123',
      businessName: 'Webhook Delete Test Business'
    });
    
    // Create a webhook to delete
    const webhook = await WebhookService.createWebhook({
      merchantId: merchant.id,
      url: 'https://example.com/webhook2',
      events: ['payment_intent.succeeded']
    });
    
    // Delete the webhook
    const success = await WebhookService.deleteWebhook(webhook.id);
    expect(success).toBe(true);
    
    // Try to retrieve the deleted webhook
    const retrievedWebhook = await WebhookService.findById(webhook.id);
    expect(retrievedWebhook).toBeNull();
  });
});