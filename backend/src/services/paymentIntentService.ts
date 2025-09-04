// Payment Intent service
import pool from '../config/db';
import { PaymentIntent, CreatePaymentIntentInput } from '../models/PaymentIntent';
import { v4 as uuidv4 } from 'uuid';
import { PaymentEventService } from './paymentEventService';
import { StacksService } from './stacksService';
import { MerchantService } from './merchantService';

export class PaymentIntentService {
  /**
   * Create a new payment intent
   * @param input Payment intent creation input
   * @returns Created payment intent
   */
  static async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    const id = uuidv4();
    
    // Get merchant information including Stacks wallet details
    const merchant = await MerchantService.findById(input.merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    // Check if merchant has Stacks wallet information
    if (!merchant.stacksAddress || !merchant.stacksPrivateKey) {
      throw new Error('Merchant Stacks wallet information is missing');
    }
    
    // Convert amount to micro-STX (1 STX = 1,000,000 micro-STX)
    const amountInMicroSTX = Math.round(input.amount * 1000000);
    
    // Create payment on Stacks blockchain
    let stacksTxId: string | undefined;
    let stacksPaymentId: number | undefined;
    
    try {
      // For the demo, we'll use a placeholder for the payment ID
      // In a real implementation, the createPaymentOnChain function would return the payment ID
      stacksPaymentId = Date.now(); // Using timestamp as a placeholder payment ID
      
      // Create the payment on chain
      stacksTxId = await StacksService.createPaymentOnChain(
        merchant.stacksAddress, 
        amountInMicroSTX, 
        merchant.stacksPrivateKey
      );
      
      console.log(`Payment created on Stacks blockchain with TX ID: ${stacksTxId}`);
    } catch (error) {
      console.error('Error creating payment on Stacks blockchain:', error);
      // We'll continue with the payment intent creation even if blockchain interaction fails
      // In a real implementation, you might want to handle this differently
    }
    
    const query = `
      INSERT INTO payment_intents (id, merchant_id, amount, status, stacks_tx_id, stacks_payment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, merchant_id, amount, status, stacks_tx_id, stacks_payment_id, created_at
    `;
    
    const values = [
      id,
      input.merchantId,
      input.amount,
      stacksTxId ? 'processing' : 'requires_payment',
      stacksTxId || null,
      stacksPaymentId || null
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    const paymentIntent = {
      id: row.id,
      merchantId: row.merchant_id,
      amount: parseFloat(row.amount),
      status: row.status,
      stacksTxId: row.stacks_tx_id,
      stacksPaymentId: row.stacks_payment_id ? parseInt(row.stacks_payment_id) : undefined,
      createdAt: row.created_at
    };
    
    // Trigger payment created event
    await PaymentEventService.triggerPaymentCreated(paymentIntent);
    
    return paymentIntent;
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
      stacksPaymentId: row.stacks_payment_id ? parseInt(row.stacks_payment_id) : undefined,
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
    const paymentIntent = {
      id: row.id,
      merchantId: row.merchant_id,
      amount: parseFloat(row.amount),
      status: row.status,
      stacksTxId: row.stacks_tx_id,
      stacksPaymentId: row.stacks_payment_id ? parseInt(row.stacks_payment_id) : undefined,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at
    };
    
    // Trigger appropriate event based on status
    if (status === 'succeeded') {
      await PaymentEventService.triggerPaymentSucceeded(paymentIntent);
    } else if (status === 'failed') {
      await PaymentEventService.triggerPaymentFailed(paymentIntent);
    }
    
    return paymentIntent;
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
      stacksPaymentId: row.stacks_payment_id ? parseInt(row.stacks_payment_id) : undefined,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at
    }));
  }
  
  /**
   * Check payment status on Stacks blockchain and update local status
   * @param id Payment intent ID
   * @param paymentId Stacks payment ID
   * @returns Updated payment intent
   */
  static async checkAndUpdatePaymentStatus(id: string, paymentId: number): Promise<PaymentIntent | null> {
    try {
      // Get payment status from Stacks blockchain
      const status = await StacksService.getPaymentStatus(paymentId);
      
      // Map Stacks status to our internal status
      let internalStatus: PaymentIntent['status'] = 'requires_payment';
      
      switch (status) {
        case 'pending':
          internalStatus = 'processing';
          break;
        case 'completed':
          internalStatus = 'succeeded';
          break;
        case 'failed':
        case 'cancelled':
          internalStatus = 'failed';
          break;
        default:
          internalStatus = 'processing';
      }
      
      // Update the payment intent status in our database
      return await this.updateStatus(id, internalStatus);
    } catch (error) {
      console.error('Error checking and updating payment status:', error);
      // If there's an error checking the blockchain, we keep the current status
      return await this.findById(id);
    }
  }
}