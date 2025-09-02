// Payment event service
import { WebhookService } from './webhookService';
import { PaymentIntent } from '../models/PaymentIntent';

export class PaymentEventService {
  /**
   * Trigger payment created event
   * @param paymentIntent Payment intent
   */
  static async triggerPaymentCreated(paymentIntent: PaymentIntent): Promise<void> {
    await WebhookService.triggerEvent('payment.created', {
      id: paymentIntent.id,
      object: 'event',
      type: 'payment.created',
      created: paymentIntent.createdAt,
      data: {
        object: {
          id: paymentIntent.id,
          object: 'payment_intent',
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          merchantId: paymentIntent.merchantId,
          createdAt: paymentIntent.createdAt
        }
      }
    });
  }
  
  /**
   * Trigger payment succeeded event
   * @param paymentIntent Payment intent
   */
  static async triggerPaymentSucceeded(paymentIntent: PaymentIntent): Promise<void> {
    await WebhookService.triggerEvent('payment.succeeded', {
      id: paymentIntent.id,
      object: 'event',
      type: 'payment.succeeded',
      created: paymentIntent.confirmedAt || new Date(),
      data: {
        object: {
          id: paymentIntent.id,
          object: 'payment_intent',
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          merchantId: paymentIntent.merchantId,
          stacksTxId: paymentIntent.stacksTxId,
          confirmedAt: paymentIntent.confirmedAt,
          createdAt: paymentIntent.createdAt
        }
      }
    });
  }
  
  /**
   * Trigger payment failed event
   * @param paymentIntent Payment intent
   * @param reason Failure reason
   */
  static async triggerPaymentFailed(paymentIntent: PaymentIntent, reason?: string): Promise<void> {
    await WebhookService.triggerEvent('payment.failed', {
      id: paymentIntent.id,
      object: 'event',
      type: 'payment.failed',
      created: new Date(),
      data: {
        object: {
          id: paymentIntent.id,
          object: 'payment_intent',
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          merchantId: paymentIntent.merchantId,
          createdAt: paymentIntent.createdAt,
          reason: reason || 'Payment failed'
        }
      }
    });
  }
}