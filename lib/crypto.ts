import apiClient from './api';
import type { BotPayment } from './botchain';

// Types for crypto operations
export interface SendTokenData {
  maxNetworkFee?: string;
  recipientIdentifier: string; // Email, phone, or wallet address
  amount: string | number;
  senderAddress: string;
  chain: string;
  tokenSymbol?: string; // Optional, defaults to USDC (matches API spec)
  password?: string; // Required for security verification
  googleAuthCode?: string; // Alternative to password
}

export interface PayMerchantData {
  senderAddress: string;
  merchantId: string;
  amount: string | number;
  confirm: boolean;
  chainName: string;
  tokenSymbol: string;
  password?: string;
  googleAuthCode?: string; // Deprecated: authenticator codes are not configured
}

export interface SendTokenResponse {
  success: boolean;
  message: string;
  data: {
    actualNetworkFee?: string;
    transactionCode: string;
    transactionHash: string;
    explorerUrl: string;
    amount: string;
    tokenSymbol: string;
    chain: string;
    sender: {
      address: string;
      phone?: string;
      email?: string;
    };
    recipient: {
      identifier: string;
      address: string;
      phone?: string;
      email?: string;
    };
    timestamp: {
      iso: string;
      local: string;
      unix: number;
    };
    transaction: {
      hash: string;
      explorerUrl: string;
      chain: string;
      token: string;
      amount: string | number;
      amountDisplay: string;
      status: string;
      confirmations: string;
      gasUsed: string;
      blockNumber: string;
    };
    security: {
      level: string;
      authMethod: string;
      verified: boolean;
      transactionType: string;
    };
    notifications: string[];
    /** Present only for BOT Chain payments routed through this legacy response shape. */
    botStatus?: 'preparing' | 'submitted' | 'pending' | 'confirmed' | 'failed' | 'review';
  };
}

export interface SendTokenErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
    timestamp: string;
    requestId: string;
  };
}

// Specialized error shape for insufficient token balance responses
export interface SendTokenInsufficientBalanceError {
  response?: {
    status?: number;
    data?: {
      success?: boolean;
      message?: string;
      error?: {
        code?: string;
        message?: string;
        available?: number;
        token?: string;
        chain?: string;
        timestamp?: string;
      };
    };
  };
}

export const isInsufficientTokenBalanceError = (err: any): err is SendTokenInsufficientBalanceError => {
  const code = err?.response?.data?.error?.code;
  const status = err?.response?.status;
  return status === 400 && code === 'INSUFFICIENT_TOKEN_BALANCE';
};

export interface PayMerchantResponse {
  success: boolean;
  message: string;
  data: {
    businessName: string;
    transactionHash: string;
    authenticationMethod: string;
    /** Present only for BOT Chain payments routed through this legacy response shape. */
    botPayment?: BotPayment;
    botStatus?: 'preparing' | 'submitted' | 'pending' | 'confirmed' | 'failed' | 'review';
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
    const response = await apiClient.post('/token/sendToken', data);
    return response.data;
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
// Visible selection is limited to Arbitrum, Base, and Botchain.
// Other entries are commented out (not removed) for easy re-enable.
export const SUPPORTED_CHAINS = [
  { name: 'Arbitrum', id: 'arbitrum', chainId: 42161 },
  // { name: 'Polygon', id: 'polygon', chainId: 137 },
  { name: 'Base', id: 'base', chainId: 8453 },
  // { name: 'Optimism', id: 'optimism', chainId: 10 },
  // { name: 'Celo', id: 'celo', chainId: 42220 },
  // { name: 'Avalanche', id: 'avalanche', chainId: 43114 },
  // { name: 'BNB Chain', id: 'bnb', chainId: 56 },
  // { name: 'Scroll', id: 'scroll', chainId: 534352 },
  // { name: 'Gnosis', id: 'gnosis', chainId: 100 },
  // { name: 'Ethereum', id: 'ethereum', chainId: 1 },
  // { name: 'Fantom', id: 'fantom', chainId: 250 },
  // { name: 'Moonbeam', id: 'moonbeam', chainId: 1284 },
  // { name: 'Fuse', id: 'fuse', chainId: 122 },
  // { name: 'Aurora', id: 'aurora', chainId: 1313161554 },
  // { name: 'Lisk', id: 'lisk', chainId: 1135 },
  // { name: 'Somnia', id: 'somnia', chainId: 5031 },
  // { name: 'Stellar', id: 'stellar', chainId: 0 }, // Stellar doesn't use EVM chainId
  { name: 'BOT Chain', id: 'botchain', chainId: 677 },
];

/** Chain ids users can select anywhere in the app. Others stay commented in lists. */
export const VISIBLE_CHAIN_IDS = new Set(['arbitrum', 'base', 'botchain']);

/** Keep only Arbitrum / Base / Botchain entries from an API chain list. */
export function filterVisibleChains<T extends { id?: string; chain?: string }>(chains: T[]): T[] {
  return (chains || []).filter(chain => {
    const id = chain?.id || chain?.chain || '';
    return VISIBLE_CHAIN_IDS.has(id);
  });
}

export const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', decimals: 6 },
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  { symbol: 'DAI', name: 'Dai', decimals: 18 },
  { symbol: 'CELO', name: 'Celo', decimals: 18 },
  { symbol: 'XLM', name: 'Stellar Lumens', decimals: 7 },
];

// Utility functions
export const formatAmount = (amount: number, decimals: number = 6): string => {
  return amount.toFixed(decimals);
};

/** Normalize a phone-like recipient to E.164 when possible. */
export const normalizeRecipientPhone = (raw: string): string => {
  if (!/^[+\d\s().-]+$/.test(raw)) return raw.trim();
  const trimmed = raw.trim().replace(/[\s\-().]/g, '');
  if (!trimmed) return raw.trim();
  if (/^\+\d{8,15}$/.test(trimmed)) return trimmed;
  // Kenyan local formats → +254…
  if (/^0[17]\d{8}$/.test(trimmed)) return `+254${trimmed.slice(1)}`;
  if (/^[17]\d{8}$/.test(trimmed)) return `+254${trimmed}`;
  if (/^254[17]\d{8}$/.test(trimmed)) return `+${trimmed}`;
  return trimmed;
};

export const validateRecipientIdentifier = (identifier: string): boolean => {
  const value = identifier.trim();
  if (!value) return false;

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) return true;

  // EVM wallet address
  const evmWalletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (evmWalletRegex.test(value)) return true;

  // Stellar address (starts with G and is 56 characters)
  const stellarRegex = /^G[A-Z0-9]{55}$/;
  if (stellarRegex.test(value)) return true;

  // Phone: E.164, or common local forms (spaces/dashes, Kenyan 07/01…, bare national)
  const phone = normalizeRecipientPhone(value);
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  if (phoneRegex.test(phone)) return true;
  const nationalRegex = /^[1-9]\d{7,14}$/;
  if (nationalRegex.test(phone)) return true;

  return false;
};

export const getChainById = (chainId: string) => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

export const getTokenBySymbol = (symbol: string) => {
  return SUPPORTED_TOKENS.find(token => token.symbol === symbol);
};