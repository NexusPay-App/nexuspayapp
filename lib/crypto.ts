import apiClient from './api';

// Types for crypto operations
export interface SendTokenData {
  recipientIdentifier: string; // Email, phone, or wallet address
  amount: number;
  senderAddress: string;
  chain: string;
  tokenType?: string; // Optional, defaults to USDC
  password?: string; // Required for security verification
  googleAuthCode?: string; // Alternative to password
}

export interface PayMerchantData {
  senderAddress: string;
  merchantId: string;
  amount: number;
  confirm: boolean;
  chainName: string;
  tokenSymbol: string;
  googleAuthCode?: string; // Required for security verification
}

export interface SendTokenResponse {
  success: boolean;
  message: string;
  data: {
    transactionCode: string;
    amount: string;
    recipient: string;
    transactionHash: string;
    authenticationMethod: string;
  };
}

export interface PayMerchantResponse {
  success: boolean;
  message: string;
  data: {
    businessName: string;
    transactionHash: string;
    authenticationMethod: string;
  };
}

export interface ReceiveInfoResponse {
  success: boolean;
  message: string;
  data: {
    walletAddress: string;
    phoneNumber: string;
    email: string;
    supportedChains: Array<{
      name: string;
      id: string;
      chainId: number;
    }>;
    note: string;
  };
}

export interface BalanceResponse {
  success: boolean;
  message: string;
  data: {
    walletAddress: string;
    totalUSDValue: number;
    balances: Record<string, Record<string, number>>;
    chainsWithBalance: number;
    lastUpdated: string;
  };
}

// Crypto API functions
export const cryptoAPI = {
  // Send crypto to any user
  sendToken: async (data: SendTokenData): Promise<SendTokenResponse> => {
    console.log('cryptoAPI.sendToken called with data:', data);
    console.log('Current auth token:', localStorage.getItem('nexuspay_token'));
    
    try {
      const response = await apiClient.post('/token/sendToken', data);
      console.log('cryptoAPI.sendToken response:', response);
      return response.data;
    } catch (error: any) {
      console.error('cryptoAPI.sendToken error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Log the specific validation error details
      if (error.response?.data?.error?.details) {
        console.error('Validation error details:', error.response.data.error.details);
      }
      
      throw error;
    }
  },

  // Pay merchant with crypto
  payMerchant: async (data: PayMerchantData): Promise<PayMerchantResponse> => {
    const response = await apiClient.post('/token/pay', data);
    return response.data;
  },

  // Get receive information
  getReceiveInfo: async (): Promise<ReceiveInfoResponse> => {
    const response = await apiClient.get('/token/receive');
    return response.data;
  },

  // Get user balance
  getBalance: async (): Promise<BalanceResponse> => {
    const response = await apiClient.get('/token/balance');
    return response.data;
  },
};

// Supported chains and tokens
export const SUPPORTED_CHAINS = [
  { name: 'Arbitrum', id: 'arbitrum', chainId: 42161 },
  { name: 'Polygon', id: 'polygon', chainId: 137 },
  { name: 'Base', id: 'base', chainId: 8453 },
  { name: 'Optimism', id: 'optimism', chainId: 10 },
  { name: 'Celo', id: 'celo', chainId: 42220 },
  { name: 'Avalanche', id: 'avalanche', chainId: 43114 },
  { name: 'BNB Chain', id: 'bnb', chainId: 56 },
  { name: 'Scroll', id: 'scroll', chainId: 534352 },
  { name: 'Gnosis', id: 'gnosis', chainId: 100 },
  { name: 'Ethereum', id: 'ethereum', chainId: 1 },
  { name: 'Fantom', id: 'fantom', chainId: 250 },
  { name: 'Moonbeam', id: 'moonbeam', chainId: 1284 },
  { name: 'Fuse', id: 'fuse', chainId: 122 },
  { name: 'Aurora', id: 'aurora', chainId: 1313161554 },
  { name: 'Lisk', id: 'lisk', chainId: 1890 },
  { name: 'Somnia', id: 'somnia', chainId: 1919 },
];

export const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', decimals: 6 },
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  { symbol: 'DAI', name: 'Dai', decimals: 18 },
  { symbol: 'CELO', name: 'Celo', decimals: 18 },
];

// Utility functions
export const formatAmount = (amount: number, decimals: number = 6): string => {
  return amount.toFixed(decimals);
};

export const validateRecipientIdentifier = (identifier: string): boolean => {
  // Check if it's an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(identifier)) return true;
  
  // Check if it's a phone number
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(identifier)) return true;
  
  // Check if it's a wallet address
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (walletRegex.test(identifier)) return true;
  
  return false;
};

export const getChainById = (chainId: string) => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

export const getTokenBySymbol = (symbol: string) => {
  return SUPPORTED_TOKENS.find(token => token.symbol === symbol);
};