import { WebhookDeliveryService } from '../src/services/webhookDeliveryService';
import { EventService } from '../src/services/eventService';
import { WebhookService } from '../src/services/webhookService';
import { MerchantService } from '../src/services/merchantService';
import pool from '../src/config/db';

// Generate unique identifiers for each test run
const timestamp = Date.now();

describe('Webhook Delivery Service', () => {
  let merchantId: string;
  let webhookId: string;
  let eventId: string;
  
  beforeAll(async () => {
    // Create a merchant
    const merchant = await MerchantService.createMerchant({
      email: `delivery-test-${timestamp}@example.com`,
      password: 'password123',
      businessName: 'Delivery Test Business'
    });
    merchantId = merchant.id;
    
    // Create a webhook
    const webhook = await WebhookService.createWebhook({
      merchantId,
      url: 'https://example.com/webhook',
      events: ['test.event']
    });
    webhookId = webhook.id;
    
    // Create an event
    const event = await EventService.createEvent({
      type: 'test.event',
      data: { message: 'Test event', testRun: timestamp.toString() }
    });
    eventId = event.id;
  });
  
  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM webhook_deliveries');
    await pool.query('DELETE FROM events WHERE data->>\'testRun\' = $1', [timestamp.toString()]);
    await pool.query('DELETE FROM webhooks');
    await pool.query('DELETE FROM merchants WHERE email = $1', [`delivery-test-${timestamp}@example.com`]);
    await pool.end();
  });
  
  it('should create a webhook delivery', async () => {
    const delivery = await WebhookDeliveryService.createWebhookDelivery({
      webhookId,
      eventId
    });
    
    expect(delivery.id).toBeDefined();
    expect(delivery.webhookId).toBe(webhookId);
    expect(delivery.eventId).toBe(eventId);
    expect(delivery.status).toBe('pending');
    expect(delivery.attempts).toBe(0);
    expect(delivery.createdAt).toBeDefined();
  });
  
  it('should find a webhook delivery by ID', async () => {
    // Create a delivery
    const createdDelivery = await WebhookDeliveryService.createWebhookDelivery({
      webhookId,
      eventId
    });
    
    // Find the delivery
    const foundDelivery = await WebhookDeliveryService.findById(createdDelivery.id);
    
    expect(foundDelivery).toBeDefined();
    expect(foundDelivery?.id).toBe(createdDelivery.id);
    expect(foundDelivery?.webhookId).toBe(webhookId);
    expect(foundDelivery?.eventId).toBe(eventId);
  });
  
  it('should update a webhook delivery', async () => {
    // Create a delivery
    const createdDelivery = await WebhookDeliveryService.createWebhookDelivery({
      webhookId,
      eventId
    });
    
    // Update the delivery
    const updatedDelivery = await WebhookDeliveryService.updateWebhookDelivery(createdDelivery.id, {
      status: 'success',
      attempts: 1,
      responseStatus: 200,
      responseBody: '{"success": true}'
    });
    
    expect(updatedDelivery).toBeDefined();
    expect(updatedDelivery?.status).toBe('success');
    expect(updatedDelivery?.attempts).toBe(1);
    expect(updatedDelivery?.responseStatus).toBe(200);
    expect(updatedDelivery?.responseBody).toBe('{"success": true}');
  });
  
  it('should find deliveries by webhook ID', async () => {
    // Create multiple deliveries for the same webhook
    await WebhookDeliveryService.createWebhookDelivery({
      webhookId,
      eventId
    });
    
    await WebhookDeliveryService.createWebhookDelivery({
      webhookId,
      eventId
    });
    
    // Find deliveries
    const deliveries = await WebhookDeliveryService.findByWebhookId(webhookId);
    
    expect(deliveries.length).toBeGreaterThanOrEqual(2);
    expect(deliveries.every(d => d.webhookId === webhookId)).toBe(true);
  });
  
  it('should find deliveries by event ID', async () => {
    // Create multiple deliveries for the same event
    await WebhookDeliveryService.createWebhookDelivery({
      webhookId,
      eventId
    });
    
    // Create another webhook for variety
    const otherWebhook = await WebhookService.createWebhook({
      merchantId,
      url: 'https://example.com/webhook2',
      events: ['test.event']
    });
    
    await WebhookDeliveryService.createWebhookDelivery({
      webhookId: otherWebhook.id,
      eventId
    });
    
    // Find deliveries
    const deliveries = await WebhookDeliveryService.findByEventId(eventId);
    
    expect(deliveries.length).toBeGreaterThanOrEqual(2);
    expect(deliveries.every(d => d.eventId === eventId)).toBe(true);
  });
});