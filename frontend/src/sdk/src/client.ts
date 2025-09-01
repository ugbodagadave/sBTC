import { HTTPClient } from './http';
import {
  SBTCPayConfig,
  Merchant,
  CreateMerchantInput,
  PaymentIntent,
  CreatePaymentIntentInput,
  Webhook,
  CreateWebhookInput
} from './types';

export class SBTCPay {
  private httpClient: HTTPClient;

  constructor(config: SBTCPayConfig = {}) {
    this.httpClient = new HTTPClient(config);
  }

  // Merchant methods
  public async registerMerchant(input: CreateMerchantInput): Promise<Merchant> {
    return this.httpClient.post<Merchant>('/merchants/register', input);
  }

  public async loginMerchant(email: string, password: string): Promise<{ message: string }> {
    return this.httpClient.post<{ message: string }>('/merchants/login', { email, password });
  }

  // Payment Intent methods
  public async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return this.httpClient.post<PaymentIntent>('/payment-intents', input);
  }

  public async retrievePaymentIntent(id: string): Promise<PaymentIntent> {
    return this.httpClient.get<PaymentIntent>(`/payment-intents/${id}`);
  }

  public async listPaymentIntents(merchantId: string): Promise<PaymentIntent[]> {
    return this.httpClient.get<PaymentIntent[]>(`/payment-intents/merchant/${merchantId}`);
  }

  // Webhook methods
  public async createWebhook(input: CreateWebhookInput): Promise<Webhook> {
    return this.httpClient.post<Webhook>('/webhooks', input);
  }

  public async listWebhooks(merchantId: string): Promise<Webhook[]> {
    return this.httpClient.get<Webhook[]>(`/webhooks/merchant/${merchantId}`);
  }

  public async deleteWebhook(id: string): Promise<void> {
    return this.httpClient.delete<void>(`/webhooks/${id}`);
  }

  // Configuration methods
  public setApiKey(apiKey: string): void {
    this.httpClient.setApiKey(apiKey);
  }
}