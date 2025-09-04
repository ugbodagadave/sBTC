import request from 'supertest';
import app from '../src/server';
import pool from '../src/config/db';

// Mock the StacksService
jest.mock('../src/services/stacksService', () => ({
  StacksService: {
    createPaymentOnChain: jest.fn().mockResolvedValue('0x123456789abcdef'),
    getPaymentStatus: jest.fn().mockResolvedValue('completed')
  }
}));

// Mock the MerchantService
jest.mock('../src/services/merchantService', () => ({
  MerchantService: {
    findById: jest.fn().mockResolvedValue({
      id: 'merchant_123',
      name: 'Test Merchant',
      stacksAddress: 'SP1234567890ABCDEF1234567890ABCDEF12345678',
      stacksPrivateKey: 'private_key_123'
    })
  }
}));

// Mock the PaymentIntentService
jest.mock('../src/services/paymentIntentService', () => ({
  PaymentIntentService: {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'pi_123') {
        return Promise.resolve({
          id: 'pi_123',
          merchantId: 'merchant_123',
          amount: 0.01,
          status: 'requires_payment',
          stacksTxId: null,
          stacksPaymentId: null,
          createdAt: new Date()
        });
      }
      return Promise.resolve(null);
    }),
    updateStatus: jest.fn().mockImplementation((id, status, stacksTxId) => {
      return Promise.resolve({
        id: 'pi_123',
        merchantId: 'merchant_123',
        amount: 0.01,
        status: status,
        stacksTxId: stacksTxId,
        stacksPaymentId: stacksTxId ? 1 : null,
        createdAt: new Date(),
        confirmedAt: status === 'succeeded' ? new Date() : null
      });
    })
  }
}));

describe('Stacks Payment Integration', () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/v1/payment-intents/:id/submit-stacks-payment', () => {
    it('should submit a Stacks payment successfully', async () => {
      const response = await request(app)
        .post('/api/v1/payment-intents/pi_123/submit-stacks-payment')
        .send({
          senderAddress: 'SP8567890ABCDEF1234567890ABCDEF1234567890'
        })
        .expect(200);

      expect(response.body).toEqual({
        txId: '0x123456789abcdef',
        message: 'Payment submitted to Stacks blockchain'
      });
    });

    it('should return 400 if sender address is missing', async () => {
      const response = await request(app)
        .post('/api/v1/payment-intents/pi_123/submit-stacks-payment')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'Sender address is required'
      });
    });

    it('should return 404 if payment intent is not found', async () => {
      const response = await request(app)
        .post('/api/v1/payment-intents/pi_nonexistent/submit-stacks-payment')
        .send({
          senderAddress: 'SP8567890ABCDEF1234567890ABCDEF1234567890'
        })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Payment intent not found'
      });
    });
  });

  describe('POST /api/v1/payment-intents/:id/stacks-status', () => {
    it('should check Stacks transaction status', async () => {
      const response = await request(app)
        .post('/api/v1/payment-intents/pi_123/stacks-status')
        .send({
          txId: '0x123456789abcdef'
        })
        .expect(200);

      // Since we're mocking the response, we just check that it returns a valid response
      expect(response.body).toHaveProperty('confirmed');
    });

    it('should return 400 if transaction ID is missing', async () => {
      const response = await request(app)
        .post('/api/v1/payment-intents/pi_123/stacks-status')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'Transaction ID is required'
      });
    });
  });
});