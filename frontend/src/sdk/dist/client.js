"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SBTCPay = void 0;
const http_1 = require("./http");
class SBTCPay {
    constructor(config = {}) {
        this.httpClient = new http_1.HTTPClient(config);
    }
    // Merchant methods
    async registerMerchant(input) {
        return this.httpClient.post('/merchants/register', input);
    }
    async loginMerchant(email, password) {
        return this.httpClient.post('/merchants/login', { email, password });
    }
    // Payment Intent methods
    async createPaymentIntent(input) {
        return this.httpClient.post('/payment-intents', input);
    }
    async retrievePaymentIntent(id) {
        return this.httpClient.get(`/payment-intents/${id}`);
    }
    async listPaymentIntents(merchantId) {
        return this.httpClient.get(`/payment-intents/merchant/${merchantId}`);
    }
    // Webhook methods
    async createWebhook(input) {
        return this.httpClient.post('/webhooks', input);
    }
    async listWebhooks(merchantId) {
        return this.httpClient.get(`/webhooks/merchant/${merchantId}`);
    }
    async deleteWebhook(id) {
        return this.httpClient.delete(`/webhooks/${id}`);
    }
    // Configuration methods
    setApiKey(apiKey) {
        this.httpClient.setApiKey(apiKey);
    }
}
exports.SBTCPay = SBTCPay;
