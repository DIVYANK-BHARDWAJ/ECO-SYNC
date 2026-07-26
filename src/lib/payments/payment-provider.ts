export interface PaymentCustomer {
  userId: string;
  email: string;
  providerCustomerId: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  fee: number;
  timestamp: string;
}

export interface PayoutResult {
  success: boolean;
  payoutId: string;
  amount: number;
  currency: string;
  timestamp: string;
}

export interface PaymentProvider {
  providerName: string;
  createCustomer(userId: string, email: string): Promise<PaymentCustomer>;
  collectPayment(buyerId: string, amount: number, currency: string): Promise<PaymentResult>;
  createPayout(sellerId: string, amount: number, currency: string): Promise<PayoutResult>;
}
