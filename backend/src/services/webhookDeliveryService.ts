// Webhook delivery service
import pool from '../config/db';
import { WebhookDelivery, CreateWebhookDeliveryInput } from '../models/WebhookDelivery';
import { v4 as uuidv4 } from 'uuid';

export class WebhookDeliveryService {
  /**
   * Create a new webhook delivery
   * @param input Webhook delivery creation input
   * @returns Created webhook delivery
   */
  static async createWebhookDelivery(input: CreateWebhookDeliveryInput): Promise<WebhookDelivery> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO webhook_deliveries (id, webhook_id, event_id)
      VALUES ($1, $2, $3)
      RETURNING id, webhook_id, event_id, status, attempts, last_attempt_at, next_attempt_at, response_status, response_body, error, created_at
    `;
    
    const values = [
      id,
      input.webhookId,
      input.eventId
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      webhookId: row.webhook_id,
      eventId: row.event_id,
      status: row.status,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      nextAttemptAt: row.next_attempt_at,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      error: row.error,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find a webhook delivery by ID
   * @param id Webhook delivery ID
   * @returns Webhook delivery or null if not found
   */
  static async findById(id: string): Promise<WebhookDelivery | null> {
    const query = 'SELECT * FROM webhook_deliveries WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      webhookId: row.webhook_id,
      eventId: row.event_id,
      status: row.status,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      nextAttemptAt: row.next_attempt_at,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      error: row.error,
      createdAt: row.created_at
    };
  }
  
  /**
   * Update a webhook delivery
   * @param id Webhook delivery ID
   * @param updates Fields to update
   * @returns Updated webhook delivery
   */
  static async updateWebhookDelivery(
    id: string, 
    updates: Partial<Omit<WebhookDelivery, 'id' | 'webhookId' | 'eventId' | 'createdAt'>>
  ): Promise<WebhookDelivery | null> {
    const fields = [];
    const values = [];
    let index = 1;
    
    if (updates.status !== undefined) {
      fields.push(`status = $${index}`);
      values.push(updates.status);
      index++;
    }
    
    if (updates.attempts !== undefined) {
      fields.push(`attempts = $${index}`);
      values.push(updates.attempts);
      index++;
    }
    
    if (updates.lastAttemptAt !== undefined) {
      fields.push(`last_attempt_at = $${index}`);
      values.push(updates.lastAttemptAt);
      index++;
    }
    
    if (updates.nextAttemptAt !== undefined) {
      fields.push(`next_attempt_at = $${index}`);
      values.push(updates.nextAttemptAt);
      index++;
    }
    
    if (updates.responseStatus !== undefined) {
      fields.push(`response_status = $${index}`);
      values.push(updates.responseStatus);
      index++;
    }
    
    if (updates.responseBody !== undefined) {
      fields.push(`response_body = $${index}`);
      values.push(updates.responseBody);
      index++;
    }
    
    if (updates.error !== undefined) {
      fields.push(`error = $${index}`);
      values.push(updates.error);
      index++;
    }
    
    if (fields.length === 0) {
      return await this.findById(id);
    }
    
    values.push(id);
    const query = `
      UPDATE webhook_deliveries 
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING id, webhook_id, event_id, status, attempts, last_attempt_at, next_attempt_at, response_status, response_body, error, created_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      webhookId: row.webhook_id,
      eventId: row.event_id,
      status: row.status,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      nextAttemptAt: row.next_attempt_at,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      error: row.error,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find pending webhook deliveries
   * @param limit Number of deliveries to return (default: 100)
   * @returns Array of pending webhook deliveries
   */
  static async findPendingDeliveries(limit: number = 100): Promise<WebhookDelivery[]> {
    const query = `
      SELECT * FROM webhook_deliveries 
      WHERE status IN ('pending', 'retrying') 
      AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
      ORDER BY created_at ASC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      webhookId: row.webhook_id,
      eventId: row.event_id,
      status: row.status,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      nextAttemptAt: row.next_attempt_at,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      error: row.error,
      createdAt: row.created_at
    }));
  }
  
  /**
   * Find deliveries for a specific webhook
   * @param webhookId Webhook ID
   * @returns Array of webhook deliveries
   */
  static async findByWebhookId(webhookId: string): Promise<WebhookDelivery[]> {
    const query = 'SELECT * FROM webhook_deliveries WHERE webhook_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [webhookId]);
    
    return result.rows.map(row => ({
      id: row.id,
      webhookId: row.webhook_id,
      eventId: row.event_id,
      status: row.status,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      nextAttemptAt: row.next_attempt_at,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      error: row.error,
      createdAt: row.created_at
    }));
  }
  
  /**
   * Find deliveries for a specific event
   * @param eventId Event ID
   * @returns Array of webhook deliveries
   */
  static async findByEventId(eventId: string): Promise<WebhookDelivery[]> {
    const query = 'SELECT * FROM webhook_deliveries WHERE event_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [eventId]);
    
    return result.rows.map(row => ({
      id: row.id,
      webhookId: row.webhook_id,
      eventId: row.event_id,
      status: row.status,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      nextAttemptAt: row.next_attempt_at,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      error: row.error,
      createdAt: row.created_at
    }));
  }
}