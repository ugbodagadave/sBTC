// Webhook controller
import { Request, Response } from 'express';
import { WebhookService } from '../services/webhookService';
import { CreateWebhookInput } from '../models/Webhook';

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
}