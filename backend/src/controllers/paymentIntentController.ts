// Payment Intent controller
import { Request, Response } from 'express';
import { PaymentIntentService } from '../services/paymentIntentService';
import { CreatePaymentIntentInput } from '../models/PaymentIntent';

export class PaymentIntentController {
  /**
   * Create a new payment intent
   * @param req Express request
   * @param res Express response
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId, amount, currency, description, successUrl, cancelUrl } = req.body;
      
      // Validate input
      if (!merchantId || !amount || !currency) {
        res.status(400).json({
          error: 'merchantId, amount, and currency are required'
        });
        return;
      }
      
      // Validate amount
      if (amount <= 0) {
        res.status(400).json({
          error: 'Amount must be greater than 0'
        });
        return;
      }
      
      // Create payment intent
      const input: CreatePaymentIntentInput = {
        merchantId,
        amount,
        currency,
        description,
        successUrl,
        cancelUrl
      };
      
      const paymentIntent = await PaymentIntentService.createPaymentIntent(input);
      
      res.status(201).json({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        clientSecret: `pi_${paymentIntent.id}_secret_${Math.random().toString(36).substring(2, 15)}`,
        paymentUrl: `https://pay.sbtcpay.com/pi_${paymentIntent.id}`
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Retrieve a payment intent
   * @param req Express request
   * @param res Express response
   */
  static async retrieve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Payment intent ID is required'
        });
        return;
      }
      
      // Find payment intent
      const paymentIntent = await PaymentIntentService.findById(id);
      
      if (!paymentIntent) {
        res.status(404).json({
          error: 'Payment intent not found'
        });
        return;
      }
      
      res.status(200).json({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        stacksTxId: paymentIntent.stacksTxId,
        confirmedAt: paymentIntent.confirmedAt
      });
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * List payment intents for a merchant
   * @param req Express request
   * @param res Express response
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId } = req.params;
      
      // Validate input
      if (!merchantId) {
        res.status(400).json({
          error: 'Merchant ID is required'
        });
        return;
      }
      
      // Find payment intents
      const paymentIntents = await PaymentIntentService.findByMerchantId(merchantId);
      
      res.status(200).json(paymentIntents);
    } catch (error) {
      console.error('Error listing payment intents:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}