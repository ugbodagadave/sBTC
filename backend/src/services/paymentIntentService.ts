// Payment Intent service
import pool from '../config/db';
import { PaymentIntent, CreatePaymentIntentInput } from '../models/PaymentIntent';
import { v4 as uuidv4 } from 'uuid';

export class PaymentIntentService {
  /**
   * Create a new payment intent
   * @param input Payment intent creation input
   * @returns Created payment intent
   */
  static async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO payment_intents (id, merchant_id, amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, merchant_id, amount, status, created_at
    `;
    
    const values = [
      id,
      input.merchantId,
      input.amount,
      'requires_payment'
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      merchantId: row.merchant_id,
      amount: parseFloat(row.amount),
      status: row.status,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find a payment intent by ID
   * @param id Payment intent ID
   * @returns Payment intent or null if not found
   */
  static async findById(id: string): Promise<PaymentIntent | null> {
    const query = 'SELECT * FROM payment_intents WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      merchantId: row.merchant_id,
      amount: parseFloat(row.amount),
      status: row.status,
      stacksTxId: row.stacks_tx_id,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at
    };
  }
  
  /**
   * Update payment intent status
   * @param id Payment intent ID
   * @param status New status
   * @param stacksTxId Stacks transaction ID (optional)
   * @returns Updated payment intent
   */
  static async updateStatus(id: string, status: PaymentIntent['status'], stacksTxId?: string): Promise<PaymentIntent | null> {
    const query = stacksTxId 
      ? `UPDATE payment_intents 
         SET status = $1, stacks_tx_id = $2, confirmed_at = $3 
         WHERE id = $4 
         RETURNING *`
      : `UPDATE payment_intents 
         SET status = $1, confirmed_at = $2 
         WHERE id = $3 
         RETURNING *`;
    
    const values = stacksTxId
      ? [status, stacksTxId, new Date(), id]
      : [status, new Date(), id];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      merchantId: row.merchant_id,
      amount: parseFloat(row.amount),
      status: row.status,
      stacksTxId: row.stacks_tx_id,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at
    };
  }
  
  /**
   * Find all payment intents for a merchant
   * @param merchantId Merchant ID
   * @returns Array of payment intents
   */
  static async findByMerchantId(merchantId: string): Promise<PaymentIntent[]> {
    const query = 'SELECT * FROM payment_intents WHERE merchant_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [merchantId]);
    
    return result.rows.map(row => ({
      id: row.id,
      merchantId: row.merchant_id,
      amount: parseFloat(row.amount),
      status: row.status,
      stacksTxId: row.stacks_tx_id,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at
    }));
  }
}