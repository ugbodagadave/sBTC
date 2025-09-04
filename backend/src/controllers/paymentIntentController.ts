// Payment Intent controller
import { Request, Response } from 'express';
import { PaymentIntentService } from '../services/paymentIntentService';
import { CreatePaymentIntentInput } from '../models/PaymentIntent';
import { MerchantService } from '../services/merchantService';
import { StacksService } from '../services/stacksService';

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
  
  /**
   * Submit a Stacks payment for a payment intent
   * @param req Express request
   * @param res Express response
   */
  static async submitStacksPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { senderAddress } = req.body;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Payment intent ID is required'
        });
        return;
      }
      
      if (!senderAddress) {
        res.status(400).json({
          error: 'Sender address is required'
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
      
      // Get merchant information
      const merchant = await MerchantService.findById(paymentIntent.merchantId);
      if (!merchant) {
        res.status(404).json({
          error: 'Merchant not found'
        });
        return;
      }
      
      // Check if merchant has Stacks wallet information
      if (!merchant.stacksAddress || !merchant.stacksPrivateKey) {
        res.status(400).json({
          error: 'Merchant Stacks wallet information is missing'
        });
        return;
      }
      
      // Convert amount to micro-STX (1 STX = 1,000,000 micro-STX)
      const amountInMicroSTX = Math.round(paymentIntent.amount * 1000000);
      
      // Submit payment to Stacks blockchain
      const stacksTxId = await StacksService.createPaymentOnChain(
        merchant.stacksAddress,
        amountInMicroSTX,
        merchant.stacksPrivateKey
      );
      
      // Update payment intent with transaction ID
      await PaymentIntentService.updateStatus(id, 'processing', stacksTxId);
      
      res.status(200).json({
        txId: stacksTxId,
        message: 'Payment submitted to Stacks blockchain'
      });
    } catch (error) {
      console.error('Error submitting Stacks payment:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Check Stacks transaction status for a payment intent
   * @param req Express request
   * @param res Express response
   */
  static async checkStacksStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { txId } = req.body;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Payment intent ID is required'
        });
        return;
      }
      
      if (!txId) {
        res.status(400).json({
          error: 'Transaction ID is required'
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
      
      // In a real implementation, we would check the transaction status on the Stacks blockchain
      // For now, we'll simulate this with a placeholder implementation
      // TODO: Implement actual Stacks transaction status checking
      
      // Simulate checking the transaction status
      const isConfirmed = Math.random() > 0.5; // 50% chance of confirmation for demo
      
      if (isConfirmed) {
        // Update payment intent status to succeeded
        await PaymentIntentService.updateStatus(id, 'succeeded', txId);
        
        res.status(200).json({
          confirmed: true,
          message: 'Payment confirmed on Stacks blockchain'
        });
      } else {
        res.status(200).json({
          confirmed: false,
          pending: true,
          message: 'Payment still pending on Stacks blockchain'
        });
      }
    } catch (error) {
      console.error('Error checking Stacks status:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

}
