import apiClient from './api';
import { ApiResponse } from './wallet';

// Types
export interface DepositData {
  amount: string;
  phoneNumber: string;
  token: string;
  chain: string;
}

export interface BuyCryptoData {
  amount: number; // Amount in KES/USD (not crypto amount)
  phone: string;
  chain: string;
  tokenType: string;
}

export interface WithdrawData {
  amount: string;
  phoneNumber: string;
  token: string;
  chain: string;
}

export interface PayBillData {
  businessNumber: string;
  accountNumber: string;
  amount: string;
  token: string;
  chain: string;
}

export interface PayTillData {
  tillNumber: string;
  amount: string;
  token: string;
  chain: string;
}

export interface PayWithCryptoData {
  recipient: string;
  amount: string;
  token: string;
  chain: string;
  paymentType: 'paybill' | 'till' | 'send';
  businessNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
}

export interface TransactionStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  txHash?: string;
  timestamp: string;
}

export interface SubmitReceiptData {
  transactionId: string;
  receiptNumber: string;
  amount: string;
  phoneNumber: string;
}

export interface PendingIntervention {
  id: string;
  type: 'deposit' | 'withdraw' | 'payment';
  amount: string;
  phoneNumber: string;
  status: 'failed' | 'pending_manual';
  error: string;
  timestamp: string;
}

// M-Pesa Integration API
export const mpesaAPI = {
  // Fiat to Crypto (On-Ramp)
  deposit: async (data: DepositData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/deposit', data);
    return response.data;
  },

  buyCrypto: async (data: BuyCryptoData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/buy-crypto', data);
    return response.data;
  },

  // Crypto to Fiat (Off-Ramp)
  withdraw: async (data: WithdrawData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/withdraw', data);
    return response.data;
  },

  // Crypto Bill Payments
  payBill: async (data: PayBillData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/pay/paybill', data);
    return response.data;
  },

  payTill: async (data: PayTillData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/pay/till', data);
    return response.data;
  },

  payWithCrypto: async (data: PayWithCryptoData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/pay-with-crypto', data);
    return response.data;
  },

  // Transaction Management
  getTransactionStatus: async (id: string): Promise<ApiResponse<TransactionStatus>> => {
    const response = await apiClient.get(`/mpesa/transaction/${id}`);
    return response.data;
  },

  submitReceipt: async (data: SubmitReceiptData): Promise<ApiResponse> => {
    const response = await apiClient.post('/mpesa/submit-receipt', data);
    return response.data;
  },

  getPendingInterventions: async (): Promise<ApiResponse<PendingIntervention[]>> => {
    const response = await apiClient.get('/mpesa/pending-interventions');
    return response.data;
  },
};