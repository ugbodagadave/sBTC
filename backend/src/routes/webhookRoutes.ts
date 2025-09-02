// Webhook routes
import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = Router();

// Create a new webhook
router.post('/', WebhookController.create);

// List webhooks for a merchant
router.get('/merchant/:merchantId', WebhookController.list);

// Delete a webhook
router.delete('/:id', WebhookController.delete);

// Get deliveries for a webhook
router.get('/:id/deliveries', WebhookController.getDeliveries);

// Retry a failed webhook delivery
router.post('/:id/retry', WebhookController.retryDelivery);

// Send a test event to a webhook
router.post('/:id/test', WebhookController.sendTestEvent);

export default router;