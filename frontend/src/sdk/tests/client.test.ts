import { SBTCPay } from '../src/client';
import { HTTPClient } from '../src/http';
import { CreateMerchantInput, CreatePaymentIntentInput, CreateWebhookInput } from '../src/types';

// Mock the HTTP client
jest.mock('../src/http');

describe('SBTCPay SDK', () => {
  let sbtcpay: SBTCPay;
  let mockHttpClient: jest.Mocked<HTTPClient>;

  beforeEach(() => {
    sbtcpay = new SBTCPay({ baseUrl: 'http://localhost:3000/api/v1' });
    // Get the mock instance
    mockHttpClient = (sbtcpay as any).httpClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Merchant methods', () => {
    it('should register a merchant', async () => {
      const merchantInput: CreateMerchantInput = {
        email: 'test@example.com',
        password: 'password123',
        businessName: 'Test Business'
      };

      const mockMerchant = {
        id: 'merchant_123',
        email: 'test@example.com',
        businessName: 'Test Business',
        createdAt: new Date().toISOString()
      };

      mockHttpClient.post.mockResolvedValue(mockMerchant);

      const result = await sbtcpay.registerMerchant(merchantInput);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/merchants/register', merchantInput);
      expect(result).toEqual(mockMerchant);
    });

    it('should login a merchant', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { message: 'Authentication successful' };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sbtcpay.loginMerchant(email, password);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/merchants/login', { email, password });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Payment Intent methods', () => {
    it('should create a payment intent', async () => {
      const paymentIntentInput: CreatePaymentIntentInput = {
        merchantId: 'merchant_123',
        amount: 100,
        currency: 'sbtc',
        description: 'Test payment'
      };

      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 100,
        status: 'requires_payment',
        clientSecret: 'pi_123_secret_xyz',
        paymentUrl: 'https://pay.sbtcpay.com/pi_123'
      };

      mockHttpClient.post.mockResolvedValue(mockPaymentIntent);

      const result = await sbtcpay.createPaymentIntent(paymentIntentInput);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/payment-intents', paymentIntentInput);
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should retrieve a payment intent', async () => {
      const paymentIntentId = 'pi_123';
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 100,
        status: 'succeeded',
        stacksTxId: 'tx_456',
        confirmedAt: new Date().toISOString()
      };

      mockHttpClient.get.mockResolvedValue(mockPaymentIntent);

      const result = await sbtcpay.retrievePaymentIntent(paymentIntentId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/payment-intents/${paymentIntentId}`);
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should list payment intents for a merchant', async () => {
      const merchantId = 'merchant_123';
      const mockPaymentIntents = [
        {
          id: 'pi_123',
          amount: 100,
          status: 'succeeded',
          stacksTxId: 'tx_456',
          confirmedAt: new Date().toISOString()
        }
      ];

      mockHttpClient.get.mockResolvedValue(mockPaymentIntents);

      const result = await sbtcpay.listPaymentIntents(merchantId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/payment-intents/merchant/${merchantId}`);
      expect(result).toEqual(mockPaymentIntents);
    });
  });

  describe('Webhook methods', () => {
    it('should create a webhook', async () => {
      const webhookInput: CreateWebhookInput = {
        merchantId: 'merchant_123',
        url: 'https://example.com/webhook',
        events: ['payment_intent.succeeded', 'payment_intent.failed']
      };

      const mockWebhook = {
        id: 'wh_123',
        url: 'https://example.com/webhook',
        events: ['payment_intent.succeeded', 'payment_intent.failed'],
        secret: 'whsec_abc123',
        createdAt: new Date().toISOString()
      };

      mockHttpClient.post.mockResolvedValue(mockWebhook);

      const result = await sbtcpay.createWebhook(webhookInput);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/webhooks', webhookInput);
      expect(result).toEqual(mockWebhook);
    });

    it('should list webhooks for a merchant', async () => {
      const merchantId = 'merchant_123';
      const mockWebhooks = [
        {
          id: 'wh_123',
          url: 'https://example.com/webhook',
          events: ['payment_intent.succeeded'],
          secret: 'whsec_abc123',
          createdAt: new Date().toISOString()
        }
      ];

      mockHttpClient.get.mockResolvedValue(mockWebhooks);

      const result = await sbtcpay.listWebhooks(merchantId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/webhooks/merchant/${merchantId}`);
      expect(result).toEqual(mockWebhooks);
    });

    it('should delete a webhook', async () => {
      const webhookId = 'wh_123';

      mockHttpClient.delete.mockResolvedValue(undefined);

      await sbtcpay.deleteWebhook(webhookId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(`/webhooks/${webhookId}`);
    });
  });

  describe('Configuration methods', () => {
    it('should set API key', () => {
      const apiKey = 'test_api_key';
      
      // Mock the setApiKey method of HTTPClient
      const setApiKeySpy = jest.spyOn(mockHttpClient, 'setApiKey');
      
      sbtcpay.setApiKey(apiKey);
      
      expect(setApiKeySpy).toHaveBeenCalledWith(apiKey);
    });
  });
});