// Webhook service
import pool from '../config/db';
import { Webhook, CreateWebhookInput } from '../models/Webhook';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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
}