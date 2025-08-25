import apiClient from './api';

// Types
export interface BusinessUpgradeData {
  businessName: string;
  ownerName: string;
  location: string;
  businessType: string;
  phoneNumber: string;
}

export interface CompleteUpgradeData {
  businessId: string;
  otp: string;
}

export interface TransferFundsData {
  businessId: string;
  amount: string;
  walletAddress: string;
}

export interface BusinessResponse {
  success: boolean;
  message: string;
  data: any;
}

// Business API functions
export const businessAPI = {
  // Request business upgrade
  requestUpgrade: async (data: BusinessUpgradeData): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business/request-upgrade', data);
    return response.data;
  },

  // Complete business upgrade
  completeUpgrade: async (data: CompleteUpgradeData): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business/complete-upgrade', data);
    return response.data;
  },

  // Transfer funds to personal wallet
  transferFunds: async (data: TransferFundsData): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business/transfer-funds', data);
    return response.data;
  },
};