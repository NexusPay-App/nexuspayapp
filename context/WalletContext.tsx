"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { walletAPI, WalletDetails, BalanceData, SendTokenData, PayMerchantData, TransferEvent } from "../lib/wallet";
import { mpesaAPI, DepositData, WithdrawData, PayWithCryptoData } from "../lib/mpesa";
import { liquidityAPI, LiquidityPosition, ProvideLiquidityData } from "../lib/liquidity";
import { transactionAPI } from "../lib/transactions";
import { Transaction } from "../types/transaction-types";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

// Supported chains and tokens
export const SUPPORTED_CHAINS = [
  'celo', 'polygon', 'arbitrum', 'base', 'optimism', 'ethereum', 
  'bnb', 'avalanche', 'fantom', 'gnosis', 'scroll', 'moonbeam', 
  'fuse', 'aurora', 'lisk', 'somnia'
];

export const SUPPORTED_TOKENS = [
  'USDC', 'USDT', 'BTC', 'ETH', 'WETH', 'WBTC', 'DAI', 'CELO'
];

// Context Types
export interface WalletContextType {
  // Wallet State
  wallet: WalletDetails | null;
  balance: BalanceData | null;
  loading: boolean;
  refreshing: boolean;
  
  // Wallet Setup
  hasWallet: boolean;
  initializeWallet: () => Promise<void>;
  
  // Core Wallet Operations
  refreshWallet: () => Promise<void>;
  sendToken: (data: SendTokenData) => Promise<any>;
  payMerchant: (data: PayMerchantData) => Promise<any>;
  getTransferHistory: () => Promise<TransferEvent[]>;
  
  // M-Pesa Integration
  depositViaMpesa: (data: DepositData) => Promise<any>;
  withdrawToMpesa: (data: WithdrawData) => Promise<any>;
  payWithCrypto: (data: PayWithCryptoData) => Promise<any>;
  
  // Liquidity Operations
  provideLiquidity: (data: ProvideLiquidityData) => Promise<any>;
  getLiquidityPositions: () => Promise<LiquidityPosition[]>;
  
  // Transaction History
  getTransactionHistory: (filters?: any) => Promise<Transaction[]>;
  
  // Utility Functions
  formatBalance: (balance: string, decimals?: number) => string;
  formatUSD: (amount: string) => string;
  getTokenIcon: (token: string) => string;
  getChainIcon: (chain: string) => string;
}

// Create context
const WalletContext = createContext<WalletContextType | null>(null);

// Provider component
export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if user has wallet setup
  const hasWallet = wallet?.walletAddress ? true : false;

  // Initialize wallet data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, attempting to refresh wallet');
      console.log('User token:', user.token);
      console.log('Token in localStorage:', localStorage.getItem('nexuspay_token'));
      refreshWallet();
    } else {
      setWallet(null);
      console.log('User not authenticated or no user data');
    }
  }, [isAuthenticated, user]);

  // Refresh wallet data
  const refreshWallet = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setRefreshing(true);
      console.log('Refreshing wallet for user:', user);
      
      // Get both wallet info and balance data
      const [walletResponse, balanceResponse] = await Promise.allSettled([
        walletAPI.getReceiveInfo(),
        walletAPI.getBalance()
      ]);
      
      // Handle wallet info
      if (walletResponse.status === 'fulfilled' && walletResponse.value.success) {
        const walletData: WalletDetails = {
          walletAddress: walletResponse.value.data.walletAddress,
          phoneNumber: walletResponse.value.data.phoneNumber,
          email: walletResponse.value.data.email,
          supportedChains: walletResponse.value.data.supportedChains,
          note: walletResponse.value.data.note,
          // Legacy compatibility fields
          address: walletResponse.value.data.walletAddress,
          chains: walletResponse.value.data.supportedChains.map(chain => chain.id),
          totalUsdValue: "0",
          balances: []
        };
        setWallet(walletData);
        console.log('Wallet data loaded:', walletData);
      } else if (walletResponse.status === 'rejected') {
        console.error('Failed to load wallet info:', walletResponse.reason);
        
        // Check if it's a 403 error - user might need wallet setup
        if (walletResponse.reason?.response?.status === 403) {
          console.log('User needs wallet setup - 403 error on /token/receive');
          // Don't show error toast, this is expected for new Google users
        } else {
          console.error('Unexpected error loading wallet:', walletResponse.reason);
        }
      }
      
      // Handle balance data
      if (balanceResponse.status === 'fulfilled' && balanceResponse.value.success) {
        setBalance(balanceResponse.value.data);
        console.log('Balance data loaded:', balanceResponse.value.data);
      } else if (balanceResponse.status === 'rejected') {
        console.error('Failed to load balance data:', balanceResponse.reason);
        
        // Check if it's a 403 error - user might need wallet setup
        if (balanceResponse.reason?.response?.status === 403) {
          console.log('User needs wallet setup - 403 error on /token/balance');
          // Don't show error toast, this is expected for new Google users
        } else {
          console.error('Unexpected error loading balance:', balanceResponse.reason);
        }
      }
      
    } catch (error: any) {
      console.error('Failed to refresh wallet:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log('Authentication issue - user may not have wallet yet');
        // Don't show error toast for auth issues, just log it
      } else {
        toast.error(error.message || 'Failed to load wallet data');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize wallet for new users (especially Google users)
  const initializeWallet = async () => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to initialize wallet');
    }
    
    try {
      setLoading(true);
      console.log('Initializing wallet for user:', user);
      
      // Try to call the receive endpoint to initialize/create wallet
      const response = await walletAPI.getReceiveInfo();
      
      if (response.success) {
        const walletData: WalletDetails = {
          walletAddress: response.data.walletAddress,
          phoneNumber: response.data.phoneNumber,
          email: response.data.email,
          supportedChains: response.data.supportedChains,
          note: response.data.note,
          // Legacy compatibility fields
          address: response.data.walletAddress,
          chains: response.data.supportedChains.map(chain => chain.id),
          totalUsdValue: "0",
          balances: []
        };
        setWallet(walletData);
        toast.success('Wallet initialized successfully!');
        
        // Try to load balance after wallet initialization
        try {
          const balanceResponse = await walletAPI.getBalance();
          if (balanceResponse.success) {
            setBalance(balanceResponse.data);
          }
        } catch (balanceError) {
          console.log('Balance not available yet, but wallet is initialized');
        }
        
      } else {
        throw new Error(response.message || 'Failed to initialize wallet');
      }
    } catch (error: any) {
      console.error('Failed to initialize wallet:', error);
      
      if (error.response?.status === 403) {
        toast.error('Unable to initialize wallet. Please contact support.');
      } else {
        toast.error(error.message || 'Failed to initialize wallet');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send token to another wallet
  const sendToken = async (data: SendTokenData) => {
    try {
      setLoading(true);
      const response = await walletAPI.sendToken(data);
      
      if (response.success) {
        toast.success('Transaction sent successfully');
        await refreshWallet(); // Refresh wallet after successful transaction
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Transaction failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Pay merchant with crypto
  const payMerchant = async (data: PayMerchantData) => {
    try {
      setLoading(true);
      const response = await walletAPI.payMerchant(data);
      
      if (response.success) {
        toast.success('Payment sent successfully');
        await refreshWallet();
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Payment failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get transfer history
  const getTransferHistory = async (): Promise<TransferEvent[]> => {
    try {
      const response = await walletAPI.getTransferEvents();
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Failed to get transfer history:', error);
      toast.error('Failed to load transfer history');
      return [];
    }
  };

  // Deposit via M-Pesa
  const depositViaMpesa = async (data: DepositData) => {
    try {
      setLoading(true);
      const response = await mpesaAPI.deposit(data);
      
      if (response.success) {
        toast.success('Deposit initiated successfully');
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Deposit failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw to M-Pesa
  const withdrawToMpesa = async (data: WithdrawData) => {
    try {
      setLoading(true);
      const response = await mpesaAPI.withdraw(data);
      
      if (response.success) {
        toast.success('Withdrawal initiated successfully');
        await refreshWallet();
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Withdrawal failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Pay with crypto (bills, etc.)
  const payWithCrypto = async (data: PayWithCryptoData) => {
    try {
      setLoading(true);
      const response = await mpesaAPI.payWithCrypto(data);
      
      if (response.success) {
        toast.success('Payment sent successfully');
        await refreshWallet();
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Payment failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide liquidity
  const provideLiquidity = async (data: ProvideLiquidityData) => {
    try {
      setLoading(true);
      const response = await liquidityAPI.provideLiquidity(data);
      
      if (response.success) {
        toast.success('Liquidity provided successfully');
        await refreshWallet();
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to provide liquidity';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get liquidity positions
  const getLiquidityPositions = async (): Promise<LiquidityPosition[]> => {
    try {
      const response = await liquidityAPI.getPositions();
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Failed to get liquidity positions:', error);
      toast.error('Failed to load liquidity positions');
      return [];
    }
  };

  // Get transaction history
  const getTransactionHistory = async (filters?: any): Promise<Transaction[]> => {
    try {
      const response = await transactionAPI.getHistory(filters);
      
      if (response.success) {
        return response.data.transactions;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Failed to get transaction history:', error);
      toast.error('Failed to load transaction history');
      return [];
    }
  };



  // Utility Functions
  const formatBalance = (balance: string, decimals: number = 4): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(decimals);
  };

  const formatUSD = (amount: string): string => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getTokenIcon = (token: string): string => {
    // Return token icon URL or placeholder
    return `/icons/tokens/${token.toLowerCase()}.svg`;
  };

  const getChainIcon = (chain: string): string => {
    // Return chain icon URL or placeholder
    return `/icons/chains/${chain.toLowerCase()}.svg`;
  };

  const value: WalletContextType = {
    wallet,
    balance,
    loading,
    refreshing,
    hasWallet,
    refreshWallet,
    initializeWallet,
    sendToken,
    payMerchant,
    getTransferHistory,
    depositViaMpesa,
    withdrawToMpesa,
    payWithCrypto,
    provideLiquidity,
    getLiquidityPositions,
    getTransactionHistory,
    formatBalance,
    formatUSD,
    getTokenIcon,
    getChainIcon,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};