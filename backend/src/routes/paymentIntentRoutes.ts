// Payment Intent routes
import { Router } from 'express';
import { PaymentIntentController } from '../controllers/paymentIntentController';

const router = Router();

// Create a new payment intent
router.post('/', PaymentIntentController.create);

// Retrieve a payment intent
router.get('/:id', PaymentIntentController.retrieve);

// List payment intents for a merchant
router.get('/merchant/:merchantId', PaymentIntentController.list);

// Submit a Stacks payment for a payment intent
router.post('/:id/submit-stacks-payment', PaymentIntentController.submitStacksPayment);

// Check Stacks transaction status for a payment intent
router.post('/:id/stacks-status', PaymentIntentController.checkStacksStatus);

export default router;