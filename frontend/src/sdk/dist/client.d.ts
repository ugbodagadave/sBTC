import { SBTCPayConfig, Merchant, CreateMerchantInput, PaymentIntent, CreatePaymentIntentInput, Webhook, CreateWebhookInput } from './types';
export declare class SBTCPay {
    private httpClient;
    constructor(config?: SBTCPayConfig);
    registerMerchant(input: CreateMerchantInput): Promise<Merchant>;
    loginMerchant(email: string, password: string): Promise<{
        message: string;
    }>;
    createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent>;
    retrievePaymentIntent(id: string): Promise<PaymentIntent>;
    listPaymentIntents(merchantId: string): Promise<PaymentIntent[]>;
    createWebhook(input: CreateWebhookInput): Promise<Webhook>;
    listWebhooks(merchantId: string): Promise<Webhook[]>;
    deleteWebhook(id: string): Promise<void>;
    setApiKey(apiKey: string): void;
}
