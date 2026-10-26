import { useChain } from '../context/ChainContext';
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';import {
  cryptoAPI,
  SendTokenData,
  PayMerchantData,
  SendTokenResponse,
  PayMerchantResponse,
  ReceiveInfoResponse,
  BalanceResponse,
  validateRecipientIdentifier,
  normalizeRecipientPhone,
  isInsufficientTokenBalanceError
} from '../lib/crypto';
import { botAPI, botPaymentToSendResponse, botPaymentToMerchantResponse, botRequestKey, clearBotRequest, isBotNetwork, type BotToken } from '../lib/botchain';

const BOT_TOKENS: BotToken[] = ['BOT', 'USDT'];

export const useCrypto = () => {
  const queryClient = useQueryClient();
  const { chain: selectedChain, setChain } = useChain();
  const refreshConfirmedBalances = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] }),
      queryClient.invalidateQueries({ queryKey: ['chain-balance'] }),
      queryClient.invalidateQueries({ queryKey: ['getUserBalance'] }),
    ]);
  }, [queryClient]);
  // API hooks
  const sendTokenApi = useApi<SendTokenResponse>();
  const payMerchantApi = useApi<PayMerchantResponse>();
  const receiveInfoApi = useApi<ReceiveInfoResponse>();
  const balanceApi = useApi<BalanceResponse>();

  const { data: latestSend, setData: setSendData } = sendTokenApi;
  const { data: latestMerchant, setData: setMerchantData } = payMerchantApi;
  useEffect(() => {
    if (!latestSend?.data.botStatus || ['confirmed', 'failed'].includes(latestSend.data.botStatus) || !isBotNetwork(latestSend.data.chain)) return;
    let stopped = false;
    const timer = setTimeout(async () => {
      try {
        const payment = await botAPI.status(latestSend.data.chain as 'botchain' | 'botchain-testnet', latestSend.data.transactionCode);
        if (stopped) return;
        setSendData(botPaymentToSendResponse(payment, latestSend.data.recipient.identifier));
        if (['confirmed', 'failed'].includes(payment.status)) {
          clearBotRequest('send');
          await refreshConfirmedBalances();
          window.dispatchEvent(new Event('nexuspay:transactions-updated'));
        }
      } catch {
        // Keep the pending state and schedule another read; never retry a debit.
        if (!stopped) setSendData({ ...latestSend });
      }
    }, 4000);
    return () => { stopped = true; clearTimeout(timer); };
  }, [latestSend, setSendData, refreshConfirmedBalances]);
  useEffect(() => {
    const tracked = latestMerchant?.data.botPayment;
    if (!tracked || ['confirmed', 'failed'].includes(tracked.status)) return;
    let stopped = false;
    const timer = setTimeout(async () => {
      try {
        const payment = await botAPI.status(tracked.network, tracked.id);
        if (stopped) return;
        setMerchantData(botPaymentToMerchantResponse(payment, latestMerchant.data.businessName));
        if (['confirmed', 'failed'].includes(payment.status)) {
          clearBotRequest('merchant');
          await refreshConfirmedBalances();
          window.dispatchEvent(new Event('nexuspay:transactions-updated'));
        }
      } catch { if (!stopped) setMerchantData({ ...latestMerchant }); }
    }, 4000);
    return () => { stopped = true; clearTimeout(timer); };
  }, [latestMerchant, setMerchantData, refreshConfirmedBalances]);

  // State for form data
  const [sendFormData, setSendFormData] = useState({
    recipientIdentifier: '',
    amount: '',
    chain: selectedChain,
    tokenType: isBotNetwork(selectedChain) ? 'USDT' : 'USDC',
  });

  const [payFormData, setPayFormData] = useState({
    merchantId: '',
    amount: '',
    chainName: selectedChain,
    tokenSymbol: isBotNetwork(selectedChain) ? 'USDT' : 'USDC',
    confirm: false,
  });

  // Send crypto to any user
  const sendToken = useCallback(async (data: SendTokenData) => {
    // Normalize phone-like recipients (local 07… / spaces → E.164) before validation.
    const recipientIdentifier = normalizeRecipientPhone(data.recipientIdentifier || '');
    if (!validateRecipientIdentifier(recipientIdentifier)) {
      throw new Error('Invalid recipient identifier. Please use a valid email, phone number, or wallet address.');
    }

    // BOT Chain payments go through the BOT API with a durable idempotency key.
    // The legacy sender address is an EVM address and must never be sent as the
    // BOT smart-account sender, so it is deliberately omitted here.
    if (isBotNetwork(data.chain)) {
      const network = data.chain;
      const tokenSymbol = (data.tokenSymbol || 'USDT') as BotToken;
      if (!BOT_TOKENS.includes(tokenSymbol)) {
        throw new Error('Select a BOT Chain asset (USDT or BOT) for this payment.');
      }
      const amount = String(data.amount);
      const key = botRequestKey('send', [data.senderAddress.toLowerCase(), network, recipientIdentifier.trim(), amount, tokenSymbol]);
      try {
        const response = await sendTokenApi.execute(
          async () => {
            const payment = await botAPI.send(network, { amount, tokenSymbol, password: data.password || '', recipientIdentifier: recipientIdentifier.trim(), maxNetworkFee: data.maxNetworkFee }, key);
            if (payment.status === 'failed') {
              clearBotRequest('send');
              throw new Error(payment.failureReason || 'Payment failed');
            }
            if (payment.status === 'confirmed') clearBotRequest('send');
            return botPaymentToSendResponse(payment, recipientIdentifier.trim());
          },
          { showSuccessToast: false, showErrorToast: false }
        );
        if (response?.success) {
          await refreshConfirmedBalances();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('nexuspay:transactions-updated'));
          }
        }
        return response;
      } catch (err: any) {
        const serverMessage = err?.response?.data?.error?.message || err?.response?.data?.message;
        if (serverMessage) throw Object.assign(new Error(serverMessage), { code: err?.response?.data?.error?.code, original: err });
        throw err;
      }
    }

    try {
      const response = await sendTokenApi.execute(
        () => cryptoAPI.sendToken({ ...data, recipientIdentifier }),
        {
          showSuccessToast: false,
          showErrorToast: false,
        }
      );
      if (response?.success) {
        await refreshConfirmedBalances();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('nexuspay:transactions-updated'));
        }
      }
      return response;
    } catch (err: any) {
      if (isInsufficientTokenBalanceError(err)) {
        // Attach a friendly message and structured details for UI consumers
        const available = err?.response?.data?.error?.available;
        const token = err?.response?.data?.error?.token;
        const chain = err?.response?.data?.error?.chain;
        const friendlyMessage = err?.response?.data?.message || `Insufficient ${token} balance on ${chain}.`;

        const enriched = Object.assign(new Error(friendlyMessage), {
          code: 'INSUFFICIENT_TOKEN_BALANCE',
          available,
          token,
          chain,
          original: err,
        });
        throw enriched;
      }
      throw err;
    }
  }, [sendTokenApi, refreshConfirmedBalances]);

  // Pay merchant with crypto
  const payMerchant = useCallback(async (data: PayMerchantData) => {
    if (!data.confirm) {
      throw new Error('Please confirm the payment before proceeding.');
    }

    // BOT Chain merchant payments are USDT-only and use the BOT API.
    if (isBotNetwork(data.chainName)) {
      const network = data.chainName;
      const amount = String(data.amount);
      const key = botRequestKey('merchant', [data.senderAddress.toLowerCase(), network, data.merchantId.trim(), amount]);
      try {
        const response = await payMerchantApi.execute(
          async () => {
            const payment = await botAPI.send(network, { amount, tokenSymbol: 'USDT', password: data.password || '', merchantId: data.merchantId.trim() }, key);
            if (payment.status === 'failed') {
              clearBotRequest('merchant');
              throw new Error(payment.failureReason || 'Payment failed');
            }
            if (payment.status === 'confirmed') clearBotRequest('merchant');
            return botPaymentToMerchantResponse(payment, data.merchantId.trim());
          },
          // No success toast: a submitted BOT payment is not a confirmed payment.
          // The form's status card reports the canonical state.
          { showSuccessToast: false, showErrorToast: false }
        );
        if (response?.success) {
          await refreshConfirmedBalances();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('nexuspay:transactions-updated'));
          }
        }
        return response;
      } catch (err: any) {
        const serverMessage = err?.response?.data?.error?.message || err?.response?.data?.message;
        if (serverMessage) throw Object.assign(new Error(serverMessage), { code: err?.response?.data?.error?.code, original: err });
        throw err;
      }
    }

    const response = await payMerchantApi.execute(
      () => cryptoAPI.payMerchant(data),
      {
        showSuccessToast: true,
        successMessage: 'Payment to merchant completed successfully!',
      }
    );
    if (response?.success) await refreshConfirmedBalances();
    return response;
  }, [payMerchantApi, refreshConfirmedBalances]);

  // Get receive information
  const getReceiveInfo = useCallback(async () => {
    return receiveInfoApi.execute(
      () => cryptoAPI.getReceiveInfo(),
      {
        showSuccessToast: false,
      }
    );
  }, [receiveInfoApi]);

  // Get user balance
  const getBalance = useCallback(async () => {
    return balanceApi.execute(
      () => cryptoAPI.getBalance(),
      {
        showSuccessToast: false,
      }
    );
  }, [balanceApi]);

  // Update send form data
  const updateSendForm = useCallback((field: string, value: string) => {
    if (field === 'chain') setChain(value);
    setSendFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, [setChain]);

  // Update pay form data
  const updatePayForm = useCallback((field: string, value: string | boolean) => {
    if (field === 'chainName') setChain(String(value));
    setPayFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, [setChain]);

  // Reset forms
  const resetSendForm = useCallback(() => {
    setSendFormData({
      recipientIdentifier: '',
      amount: '',
      chain: selectedChain,
      tokenType: isBotNetwork(selectedChain) ? 'USDT' : 'USDC', // Keep as tokenType for UI consistency
    });
  }, [selectedChain]);

  const resetPayForm = useCallback(() => {
    setPayFormData({
      merchantId: '',
      amount: '',
      chainName: selectedChain,
      tokenSymbol: isBotNetwork(selectedChain) ? 'USDT' : 'USDC',
      confirm: false,
    });
  }, [selectedChain]);

  // Get current user's wallet address from API (same as receive page)
  const getCurrentUserAddress = useCallback(async (network?: string) => {
    try {
      if (network && isBotNetwork(network)) return (await botAPI.account(network)).address;
      console.log('🔍 Fetching wallet address from API...');
      const response = await cryptoAPI.getReceiveInfo();
      
      if (response.success && response.data.walletAddress) {
        console.log("✅ Found wallet address from API:");
        return response.data.walletAddress;
      } else {
        console.log("❌ No wallet address in API response");
        return '';
      }
    } catch (error) {
      console.error('❌ Failed to fetch wallet address from API:', error);
      return '';
    }
  }, []);

  return {
    // API functions
    sendToken,
    payMerchant,
    getReceiveInfo,
    getBalance,
    
    // Form data
    sendFormData,
    payFormData,
    
    // Form actions
    updateSendForm,
    updatePayForm,
    resetSendForm,
    resetPayForm,
    
    // Loading states
    sendTokenLoading: sendTokenApi.loading,
    payMerchantLoading: payMerchantApi.loading,
    receiveInfoLoading: receiveInfoApi.loading,
    balanceLoading: balanceApi.loading,
    
    // Data
    sendTokenData: sendTokenApi.data,
    payMerchantData: payMerchantApi.data,
    receiveInfoData: receiveInfoApi.data,
    balanceData: balanceApi.data,
    
    // Errors
    sendTokenError: sendTokenApi.error,
    payMerchantError: payMerchantApi.error,
    receiveInfoError: receiveInfoApi.error,
    balanceError: balanceApi.error,
    
    // Utility
    getCurrentUserAddress,
  };
};
