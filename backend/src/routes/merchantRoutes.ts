// Merchant routes
import { Router } from 'express';
import { MerchantController } from '../controllers/merchantController';

const router = Router();

// Register a new merchant
router.post('/register', MerchantController.register);

// Authenticate a merchant
router.post('/login', MerchantController.login);

export default router;