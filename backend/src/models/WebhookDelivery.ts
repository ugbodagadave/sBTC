// WebhookDelivery model
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  lastAttemptAt: Date | null;
  nextAttemptAt: Date | null;
  responseStatus: number | null;
  responseBody: string | null;
  error: string | null;
  createdAt: Date;
}

export interface CreateWebhookDeliveryInput {
  webhookId: string;
  eventId: string;
}