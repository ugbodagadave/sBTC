// Webhook service
import pool from '../config/db';
import { Webhook, CreateWebhookInput } from '../models/Webhook';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import axios from 'axios';
import { EventService } from './eventService';
import { WebhookDeliveryService } from './webhookDeliveryService';
import { QueueService } from './queueService';

export class WebhookService {
  /**
   * Create a new webhook
   * @param input Webhook creation input
   * @returns Created webhook
   */
  static async createWebhook(input: CreateWebhookInput): Promise<Webhook> {
    const id = uuidv4();
    // Generate a secret for webhook verification
    const secret = crypto.randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO webhooks (id, merchant_id, url, events, secret)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, merchant_id, url, events, secret, created_at
    `;
    
    const values = [
      id,
      input.merchantId,
      input.url,
      input.events,
      secret
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      merchantId: row.merchant_id,
      url: row.url,
      events: row.events,
      secret: row.secret,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find a webhook by ID
   * @param id Webhook ID
   * @returns Webhook or null if not found
   */
  static async findById(id: string): Promise<Webhook | null> {
    const query = 'SELECT * FROM webhooks WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      merchantId: row.merchant_id,
      url: row.url,
      events: row.events,
      secret: row.secret,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find all webhooks for a merchant
   * @param merchantId Merchant ID
   * @returns Array of webhooks
   */
  static async findByMerchantId(merchantId: string): Promise<Webhook[]> {
    const query = 'SELECT * FROM webhooks WHERE merchant_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [merchantId]);
    
    return result.rows.map(row => ({
      id: row.id,
      merchantId: row.merchant_id,
      url: row.url,
      events: row.events,
      secret: row.secret,
      createdAt: row.created_at
    }));
  }
  
  /**
   * Delete a webhook
   * @param id Webhook ID
   * @returns Boolean indicating success
   */
  static async deleteWebhook(id: string): Promise<boolean> {
    const query = 'DELETE FROM webhooks WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return (result.rowCount || 0) > 0;
  }
  
  /**
   * Send a webhook event
   * @param webhook Webhook to send to
   * @param event Event to send
   * @returns Success status and response data
   */
  static async sendWebhookEvent(webhook: Webhook, event: any): Promise<{ success: boolean; responseStatus?: number; responseBody?: string; error?: string }> {
    try {
      // Create signature
      const payload = JSON.stringify(event);
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payload)
        .digest('hex');
      
      // Send webhook
      const response = await axios.post(webhook.url, event, {
        headers: {
          'Content-Type': 'application/json',
          'X-SBTCPay-Signature': `sha256=${signature}`,
          'User-Agent': 'sBTCPay-Webhook/1.0'
        },
        timeout: 10000 // 10 second timeout
      });
      
      return {
        success: true,
        responseStatus: response.status,
        responseBody: JSON.stringify(response.data)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        responseStatus: error.response?.status,
        responseBody: error.response ? JSON.stringify(error.response.data) : undefined
      };
    }
  }
  
  /**
   * Process a webhook delivery with retry logic
   * @param deliveryId Webhook delivery ID
   */
  static async processWebhookDelivery(deliveryId: string): Promise<void> {
    const delivery = await WebhookDeliveryService.findById(deliveryId);
    if (!delivery) {
      console.error(`Webhook delivery not found: ${deliveryId}`);
      return;
    }
    
    const webhook = await this.findById(delivery.webhookId);
    if (!webhook) {
      console.error(`Webhook not found: ${delivery.webhookId}`);
      await WebhookDeliveryService.updateWebhookDelivery(deliveryId, {
        status: 'failed',
        error: 'Webhook not found'
      });
      return;
    }
    
    const event = await EventService.findById(delivery.eventId);
    if (!event) {
      console.error(`Event not found: ${delivery.eventId}`);
      await WebhookDeliveryService.updateWebhookDelivery(deliveryId, {
        status: 'failed',
        error: 'Event not found'
      });
      return;
    }
    
    // Send the webhook
    const result = await this.sendWebhookEvent(webhook, event);
    
    // Update delivery record
    const updatedAttempts = delivery.attempts + 1;
    const updateData: any = {
      attempts: updatedAttempts,
      lastAttemptAt: new Date(),
      responseStatus: result.responseStatus,
      responseBody: result.responseBody,
      error: result.error
    };
    
    if (result.success) {
      // Success
      updateData.status = 'success';
      await WebhookDeliveryService.updateWebhookDelivery(deliveryId, updateData);
    } else {
      // Failure - implement retry logic
      if (updatedAttempts < 5) { // Max 5 attempts
        // Exponential backoff: 1min, 2min, 4min, 8min, 16min
        const delayMinutes = Math.pow(2, updatedAttempts - 1);
        const nextAttemptAt = new Date(Date.now() + delayMinutes * 60 * 1000);
        
        updateData.status = 'retrying';
        updateData.nextAttemptAt = nextAttemptAt;
        await WebhookDeliveryService.updateWebhookDelivery(deliveryId, updateData);
        
        // Re-queue for retry
        await QueueService.enqueueDelivery(deliveryId);
      } else {
        // Max retries exceeded
        updateData.status = 'failed';
        await WebhookDeliveryService.updateWebhookDelivery(deliveryId, updateData);
      }
    }
  }
  
  /**
   * Trigger webhooks for an event
   * @param eventType Event type
   * @param eventData Event data
   */
  static async triggerEvent(eventType: string, eventData: any): Promise<void> {
    // Create the event
    const event = await EventService.createEvent({
      type: eventType,
      data: eventData
    });
    
    // Find webhooks that subscribe to this event type
    const query = `
      SELECT * FROM webhooks 
      WHERE $1 = ANY(events)
    `;
    
    const result = await pool.query(query, [eventType]);
    const webhooks: Webhook[] = result.rows.map(row => ({
      id: row.id,
      merchantId: row.merchant_id,
      url: row.url,
      events: row.events,
      secret: row.secret,
      createdAt: row.created_at
    }));
    
    // Create deliveries for each webhook
    for (const webhook of webhooks) {
      const delivery = await WebhookDeliveryService.createWebhookDelivery({
        webhookId: webhook.id,
        eventId: event.id
      });
      
      // Add to queue for processing
      await QueueService.enqueueDelivery(delivery.id);
    }
  }
}