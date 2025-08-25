import apiClient from './api';

// Types
export interface SendTokenData {
  recipientIdentifier: string;
  amount: string;
  senderAddress: string;
  chain: string;
}

export interface PayMerchantData {
  senderAddress: string;
  businessUniqueCode: string;
  amount: string;
  confirm: boolean;
  chainName: string;
}

export interface TokenTransferEventsParams {
  address: string;
  chain: string;
  page?: number;
  limit?: number;
}

export interface CryptoResponse {
  success: boolean;
  message: string;
  data: any;
}

// Crypto API functions
export const cryptoAPI = {
  // Send tokens to another user
  sendToken: async (data: SendTokenData): Promise<CryptoResponse> => {
    const response = await apiClient.post('/token/sendToken', data);
    return response.data;
  },

  // Pay merchant
  payMerchant: async (data: PayMerchantData): Promise<CryptoResponse> => {
    const response = await apiClient.post('/token/pay', data);
    return response.data;
  },

  // Get token transfer events
  getTokenTransferEvents: async (params: TokenTransferEventsParams): Promise<CryptoResponse> => {
    const response = await apiClient.get('/token/tokenTransferEvents', { params });
    return response.data;
  },

  // Get transaction history (enhanced)
  getTransactionHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    chain?: string;
    tokenType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CryptoResponse> => {
    const response = await apiClient.get('/transactions/history', { params });
    return response.data;
  },
};