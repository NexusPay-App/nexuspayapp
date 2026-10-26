import apiClient from './api';

// Types for Business PIN API
export interface BusinessPinSetData {
  merchantId?: string;
  phoneNumber?: string;
  otp: string;
  pin: string;
}

export interface BusinessPinRequestOtpData {
  merchantId: string;
  phoneNumber: string;
}

export interface BusinessPinUpdateData {
  businessId: string;
  oldPin: string;
  newPin: string;
}

export interface BusinessPinVerifyData {
  businessId: string;
  pin: string;
}

export interface BusinessPinVerifyTransactionData {
  businessId: string;
  pin: string;
  transactionType: string;
  amount?: number;
}

export interface BusinessPinForgotRequestData {
  merchantId?: string;
  phoneNumber?: string;
}

export interface BusinessPinForgotConfirmData {
  merchantId?: string;
  phoneNumber?: string;
  otp: string;
  newPin: string;
}

export interface BusinessPinVerifyResponse {
  verified: boolean;
  verifiedAt: string;
  expiresAt: string;
  businessId: string;
  businessName: string;
  merchantId: string;
}

export interface BusinessPinTransactionGuard {
  id: string;
  expiresIn: string;
}

export interface BusinessPinForgotRequestResponse {
  phoneNumber: string;
  otpExpiry: string;
}

export interface BusinessResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error: any;
  timestamp: string;
}

// Business PIN API functions
export const businessPinAPI = {
  
  // Request OTP for PIN setup
  requestOtp: async (data: BusinessPinRequestOtpData): Promise<BusinessResponse<BusinessPinForgotRequestResponse>> => {
    const response = await apiClient.post('/business/pin/request-otp', data);
    return response.data;
  },

  // Forgot PIN - Request OTP
  forgotPinRequest: async (data: BusinessPinForgotRequestData): Promise<BusinessResponse<BusinessPinForgotRequestResponse>> => {
    const response = await apiClient.post('/business/pin/forgot', data);
    return response.data;
  },

  // Forgot PIN - Confirm with OTP
  forgotPinConfirm: async (data: BusinessPinForgotConfirmData): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business/pin/confirm-forgot', data);
    return response.data;
  },

  // Authenticated endpoints (require Bearer token)
  
  setPin: async (data: BusinessPinSetData): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business/pin/set', data);
    return response.data;
  },

  // Update PIN (requires old PIN)
  updatePin: async (data: BusinessPinUpdateData): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business/pin/update', data);
    return response.data;
  },

  // Verify PIN for session
  verifyPin: async (data: BusinessPinVerifyData): Promise<BusinessResponse<BusinessPinVerifyResponse>> => {
    const response = await apiClient.post('/business/pin/verify', data);
    return response.data;
  },

  // Verify PIN for specific transaction
  verifyTransactionPin: async (data: BusinessPinVerifyTransactionData): Promise<BusinessResponse<{ transactionGuard: BusinessPinTransactionGuard }>> => {
    const response = await apiClient.post('/business/pin/verify-transaction', data);
    return response.data;
  },
};
