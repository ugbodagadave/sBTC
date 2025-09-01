// Webhook model
export interface Webhook {
  id: string;
  merchantId: string;
  url: string;
  events: string[];
  secret: string;
  createdAt: Date;
}

export interface CreateWebhookInput {
  merchantId: string;
  url: string;
  events: string[];
}