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
export interface SBTCPayConfig {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
}
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
