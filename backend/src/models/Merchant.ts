// Merchant model
export interface Merchant {
  id: string;
  email: string;
  apiKeyHash: string;
  createdAt: Date;
  businessName?: string;
}

export interface CreateMerchantInput {
  email: string;
  password: string;
  businessName?: string;
}

export interface MerchantCredentials {
  email: string;
  password: string;
}