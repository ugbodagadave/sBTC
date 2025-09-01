// Merchant types
export interface Merchant {
  id: string;
  email: string;
  businessName?: string;
  createdAt: string;
}

export interface CreateMerchantInput {
  email: string;
  password: string;
  businessName?: string;
}

// Payment Intent types
export interface PaymentIntent {
  id: string;
  amount: number;
  status: 'requires_payment' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret?: string;
  paymentUrl?: string;
  stacksTxId?: string;
  confirmedAt?: string;
}

export interface CreatePaymentIntentInput {
  merchantId: string;
  amount: number;
  currency: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Webhook types
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  createdAt: string;
}

export interface CreateWebhookInput {
  merchantId: string;
  url: string;
  events: string[];
}

// SDK configuration
export interface SBTCPayConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

// API response types
export interface APIResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}