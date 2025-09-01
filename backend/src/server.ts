import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import merchantRoutes from './routes/merchantRoutes';
import paymentIntentRoutes from './routes/paymentIntentRoutes';
import webhookRoutes from './routes/webhookRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/merchants', merchantRoutes);
app.use('/api/v1/payment-intents', paymentIntentRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'sBTCPay API Server', 
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Only start the server if this file is run directly
let server: any;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`sBTCPay API Server is running on port ${PORT}`);
  });
}

// Export for testing
export { app as default, server };