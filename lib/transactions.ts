import apiClient from './api';
import { ApiResponse } from './wallet';

// Types
export interface TransactionHistoryFilter {
  type?: 'send' | 'receive' | 'payment' | 'deposit' | 'withdraw' | 'liquidity';
  token?: string;
  chain?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'payment' | 'deposit' | 'withdraw' | 'liquidity';
  amount: string;
  token: string;
  chain: string;
  from?: string;
  to?: string;
  txHash?: string;
  mpesaReceiptNumber?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  fee?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransactionStats {
  totalTransactions: number;
  totalVolume: string;
  totalFees: string;
  successRate: string;
  averageAmount: string;
  topTokens: Array<{
    token: string;
    volume: string;
    count: number;
  }>;
  topChains: Array<{
    chain: string;
    volume: string;
    count: number;
  }>;
}

export interface DashboardInsights {
  totalBalance: string;
  totalTransactions: number;
  recentTransactions: Transaction[];
  topTokens: Array<{
    token: string;
    balance: string;
    usdValue: string;
    change24h: string;
  }>;
  monthlyVolume: string;
  pendingTransactions: number;
}

export interface RampTransaction {
  id: string;
  type: 'on-ramp' | 'off-ramp';
  amount: string;
  token: string;
  chain: string;
  fiatAmount: string;
  fiatCurrency: string;
  status: 'pending' | 'completed' | 'failed';
  provider: string;
  timestamp: string;
}

export interface CreateRampTransactionData {
  type: 'on-ramp' | 'off-ramp';
  amount: string;
  token: string;
  chain: string;
  fiatCurrency: string;
  provider: string;
}

export interface CalculateSavingsData {
  amount: string;
  fromToken: string;
  toToken: string;
  fromChain: string;
  toChain: string;
}

export interface SavingsCalculation {
  traditionalCost: string;
  nexuspayCost: string;
  savings: string;
  savingsPercentage: string;
  estimatedTime: string;
}

// Transaction History & Analytics API
export const transactionsAPI = {
  // Get transaction history with filters
  getHistory: async (filters?: TransactionHistoryFilter): Promise<ApiResponse<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiClient.get(`/transactions/history?${params.toString()}`);
    return response.data;
  },

  // Get transaction by ID
  getTransaction: async (id: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // Get dashboard insights
  getDashboardInsights: async (): Promise<ApiResponse<DashboardInsights>> => {
    const response = await apiClient.get('/transactions/dashboard/insights');
    return response.data;
  },

  // Get transaction statistics
  getStats: async (): Promise<ApiResponse<TransactionStats>> => {
    const response = await apiClient.get('/ramp/stats');
    return response.data;
  },
};

// Ramp Services API
export const rampAPI = {
  // Create ramp transaction
  createTransaction: async (data: CreateRampTransactionData): Promise<ApiResponse<RampTransaction>> => {
    const response = await apiClient.post('/ramp/transaction', data);
    return response.data;
  },

  // Get user's ramp transactions
  getTransactions: async (): Promise<ApiResponse<RampTransaction[]>> => {
    const response = await apiClient.get('/ramp/transactions');
    return response.data;
  },

  // Calculate potential savings
  calculateSavings: async (data: CalculateSavingsData): Promise<ApiResponse<SavingsCalculation>> => {
    const response = await apiClient.post('/ramp/calculate-savings', data);
    return response.data;
  },
};