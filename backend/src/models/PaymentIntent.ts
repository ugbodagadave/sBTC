// Payment Intent model
export interface PaymentIntent {
  id: string;
  merchantId: string;
  amount: number;
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed';
  stacksTxId?: string;
  stacksPaymentId?: number;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface CreatePaymentIntentInput {
  merchantId: string;
  amount: number;
  currency?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
}