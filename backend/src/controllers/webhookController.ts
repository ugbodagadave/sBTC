// Webhook controller
import { Request, Response } from 'express';
import { WebhookService } from '../services/webhookService';
import { CreateWebhookInput } from '../models/Webhook';
import { WebhookDeliveryService } from '../services/webhookDeliveryService';
import { EventService } from '../services/eventService';

export class WebhookController {
  /**
   * Create a new webhook
   * @param req Express request
   * @param res Express response
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId, url, events } = req.body;
      
      // Validate input
      if (!merchantId || !url || !events) {
        res.status(400).json({
          error: 'merchantId, url, and events are required'
        });
        return;
      }
      
      // Validate events is an array
      if (!Array.isArray(events)) {
        res.status(400).json({
          error: 'events must be an array'
        });
        return;
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        res.status(400).json({
          error: 'Invalid URL format'
        });
        return;
      }
      
      // Create webhook
      const input: CreateWebhookInput = {
        merchantId,
        url,
        events
      };
      
      const webhook = await WebhookService.createWebhook(input);
      
      res.status(201).json({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        createdAt: webhook.createdAt
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * List webhooks for a merchant
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
      
      // Find webhooks
      const webhooks = await WebhookService.findByMerchantId(merchantId);
      
      res.status(200).json(webhooks);
    } catch (error) {
      console.error('Error listing webhooks:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Delete a webhook
   * @param req Express request
   * @param res Express response
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Webhook ID is required'
        });
        return;
      }
      
      // Delete webhook
      const success = await WebhookService.deleteWebhook(id);
      
      if (!success) {
        res.status(404).json({
          error: 'Webhook not found'
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Get deliveries for a webhook
   * @param req Express request
   * @param res Express response
   */
  static async getDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Webhook ID is required'
        });
        return;
      }
      
      // Check if webhook exists
      const webhook = await WebhookService.findById(id);
      if (!webhook) {
        res.status(404).json({
          error: 'Webhook not found'
        });
        return;
      }
      
      // Find deliveries
      const deliveries = await WebhookDeliveryService.findByWebhookId(id);
      
      res.status(200).json(deliveries);
    } catch (error) {
      console.error('Error getting webhook deliveries:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Retry a failed webhook delivery
   * @param req Express request
   * @param res Express response
   */
  static async retryDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { deliveryId } = req.body;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Webhook ID is required'
        });
        return;
      }
      
      if (!deliveryId) {
        res.status(400).json({
          error: 'Delivery ID is required'
        });
        return;
      }
      
      // Check if webhook exists
      const webhook = await WebhookService.findById(id);
      if (!webhook) {
        res.status(404).json({
          error: 'Webhook not found'
        });
        return;
      }
      
      // Check if delivery exists
      const delivery = await WebhookDeliveryService.findById(deliveryId);
      if (!delivery) {
        res.status(404).json({
          error: 'Webhook delivery not found'
        });
        return;
      }
      
      // Verify delivery belongs to webhook
      if (delivery.webhookId !== id) {
        res.status(400).json({
          error: 'Delivery does not belong to this webhook'
        });
        return;
      }
      
      // Reset delivery for retry
      const updatedDelivery = await WebhookDeliveryService.updateWebhookDelivery(deliveryId, {
        status: 'pending',
        attempts: 0,
        lastAttemptAt: null,
        nextAttemptAt: null,
        responseStatus: null,
        responseBody: null,
        error: null
      });
      
      // Add to queue for processing
      // Note: In a production environment, you might want to use a more robust queuing system
      setTimeout(async () => {
        await WebhookService.processWebhookDelivery(deliveryId);
      }, 1000);
      
      res.status(200).json(updatedDelivery);
    } catch (error) {
      console.error('Error retrying webhook delivery:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Send a test event to a webhook
   * @param req Express request
   * @param res Express response
   */
  static async sendTestEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({
          error: 'Webhook ID is required'
        });
        return;
      }
      
      // Check if webhook exists
      const webhook = await WebhookService.findById(id);
      if (!webhook) {
        res.status(404).json({
          error: 'Webhook not found'
        });
        return;
      }
      
      // Create a test event
      const testEvent = {
        id: 'test_event_' + Date.now(),
        type: 'test.event',
        created: new Date().toISOString(),
        data: {
          message: 'This is a test event',
          webhookId: id
        },
        webhookId: id
      };
      
      // Send the test event
      const result = await WebhookService.sendWebhookEvent(webhook, testEvent);
      
      res.status(200).json({
        success: result.success,
        responseStatus: result.responseStatus,
        responseBody: result.responseBody,
        error: result.error
      });
    } catch (error) {
      console.error('Error sending test event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}