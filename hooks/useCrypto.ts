import { useState, useCallback } from 'react';
import { cryptoAPI, SendTokenData, PayMerchantData } from '../lib/crypto';
import { useApi } from './useApi';

export const useCrypto = () => {
  const sendTokenApi = useApi();
  const payMerchantApi = useApi();
  const transactionHistoryApi = useApi();
  const tokenEventsApi = useApi();

  // Send tokens
  const sendToken = useCallback(async (data: SendTokenData) => {
    return sendTokenApi.execute(
      () => cryptoAPI.sendToken(data),
      {
        showSuccessToast: true,
        successMessage: 'Tokens sent successfully!',
      }
    );
  }, [sendTokenApi]);

  // Pay merchant
  const payMerchant = useCallback(async (data: PayMerchantData) => {
    return payMerchantApi.execute(
      () => cryptoAPI.payMerchant(data),
      {
        showSuccessToast: true,
        successMessage: 'Payment successful!',
      }
    );
  }, [payMerchantApi]);

  // Get transaction history
  const getTransactionHistory = useCallback(async (params?: any) => {
    return transactionHistoryApi.execute(
      () => cryptoAPI.getTransactionHistory(params),
      {
        showErrorToast: true,
      }
    );
  }, [transactionHistoryApi]);

  // Get token transfer events
  const getTokenTransferEvents = useCallback(async (params: any) => {
    return tokenEventsApi.execute(
      () => cryptoAPI.getTokenTransferEvents(params),
      {
        showErrorToast: true,
      }
    );
  }, [tokenEventsApi]);

  return {
    // Send token
    sendToken,
    sendTokenLoading: sendTokenApi.loading,
    sendTokenError: sendTokenApi.error,

    // Pay merchant
    payMerchant,
    payMerchantLoading: payMerchantApi.loading,
    payMerchantError: payMerchantApi.error,

    // Transaction history
    getTransactionHistory,
    transactionHistory: transactionHistoryApi.data,
    transactionHistoryLoading: transactionHistoryApi.loading,
    transactionHistoryError: transactionHistoryApi.error,

    // Token events
    getTokenTransferEvents,
    tokenEvents: tokenEventsApi.data,
    tokenEventsLoading: tokenEventsApi.loading,
    tokenEventsError: tokenEventsApi.error,
  };
};