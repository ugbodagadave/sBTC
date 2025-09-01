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

export default router;