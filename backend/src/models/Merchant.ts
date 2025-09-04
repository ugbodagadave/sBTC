// Merchant model
export interface Merchant {
  id: string;
  email: string;
  apiKeyHash: string;
  createdAt: Date;
  businessName?: string;
  stacksAddress?: string;
  stacksPrivateKey?: string;
}

export interface CreateMerchantInput {
  email: string;
  password: string;
  businessName?: string;
  stacksAddress?: string;
  stacksPrivateKey?: string;
}

export interface MerchantCredentials {
  email: string;
  password: string;
}