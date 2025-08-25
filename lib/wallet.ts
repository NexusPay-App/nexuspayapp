import apiClient from './api';

// Types
export interface SupportedChain {
  name: string;
  id: string;
  chainId: number;
}

export interface ReceiveData {
  walletAddress: string;
  phoneNumber: string;
  email: string;
  supportedChains: SupportedChain[];
  note: string;
}

export interface ChainBalances {
  [token: string]: number;
}

export interface BalanceData {
  walletAddress: string;
  totalUSDValue: number;
  balances: {
    [chain: string]: ChainBalances;
  };
  chainsWithBalance: number;
  lastUpdated: string;
}

// Legacy types for backward compatibility
export interface WalletBalance {
  token: string;
  balance: string;
  usdValue: string;
  chain: string;
}

export interface WalletDetails {
  walletAddress: string;
  phoneNumber: string;
  email: string;
  supportedChains: SupportedChain[];
  note: string;
  // Legacy fields for compatibility
  address?: string;
  totalUsdValue?: string;
  chains?: string[];
  balances?: WalletBalance[];
}

export interface SendTokenData {
  to: string;
  amount: string;
  token: string;
  chain: string;
}

export interface PayMerchantData {
  merchantId: string;
  amount: string;
  token: string;
  chain: string;
  description?: string;
}

export interface TransferEvent {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  txHash: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'send' | 'receive' | 'payment';
}

export interface UnifyWalletData {
  sourceChain: string;
  targetChain: string;
  tokens: string[];
}

export interface MigrateWalletData {
  fromChain: string;
  toChain: string;
  tokens: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Core Wallet Operations
export const walletAPI = {
  // Get receive information (wallet address, supported chains, etc.)
  getReceiveInfo: async (): Promise<ApiResponse<ReceiveData>> => {
    const response = await apiClient.get('/token/receive');
    return response.data;
  },

  // Get wallet balance information
  getBalance: async (): Promise<ApiResponse<BalanceData>> => {
    const response = await apiClient.get('/token/balance');
    return response.data;
  },

  // Legacy method for backward compatibility
  getWallet: async (): Promise<ApiResponse<WalletDetails>> => {
    const response = await apiClient.get('/token/receive');
    return response.data;
  },

  // Send crypto to another wallet
  sendToken: async (data: SendTokenData): Promise<ApiResponse> => {
    const response = await apiClient.post('/token/sendToken', data);
    return response.data;
  },

  // Pay merchant with crypto
  payMerchant: async (data: PayMerchantData): Promise<ApiResponse> => {
    const response = await apiClient.post('/token/pay', data);
    return response.data;
  },

  // Get transfer history
  getTransferEvents: async (): Promise<ApiResponse<TransferEvent[]>> => {
    const response = await apiClient.get('/token/tokenTransferEvents');
    return response.data;
  },

  // Unify wallet accounts across chains
  unifyWallet: async (data: UnifyWalletData): Promise<ApiResponse> => {
    const response = await apiClient.post('/token/unify', data);
    return response.data;
  },

  // Migrate wallet to different chain
  migrateWallet: async (data: MigrateWalletData): Promise<ApiResponse> => {
    const response = await apiClient.post('/token/migrate', data);
    return response.data;
  },
};