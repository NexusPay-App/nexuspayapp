import apiClient from './api';
import { 
  TransactionHistoryResponse,
  AdminTransactionResponse,
  OnchainTransactionResponse,
  FiatCryptoTransactionResponse,
  StatusCorrectionResponse,
  TransactionHistoryFilters 
} from '../types/transaction-types';

// Transaction History API
export const transactionAPI = {
  // Get transaction history with optional filters
  getHistory: async (filters: TransactionHistoryFilters = {}): Promise<TransactionHistoryResponse> => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.chain) params.append('chain', filters.chain);
      if (filters.tokenType) params.append('tokenType', filters.tokenType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const queryString = params.toString();
      const url = `/transactions/history${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching transaction history:', url);
      console.log('🔍 Full URL:', `${process.env.NODE_ENV === 'production' ? 'https://api.nexuspaydefi.xyz' : 'http://localhost:8000'}/api${url}`);
      console.log('🔍 Filters:', filters);
      console.log('🔍 Auth token:', localStorage.getItem('nexuspay_token') ? 'Present' : 'Missing');
      
      const response = await apiClient.get(url);
      console.log('✅ Transaction history response:', response);
      console.log('✅ Response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Transaction history API error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      throw error;
    }
  },

  // Get transaction by ID
  getTransaction: async (transactionId: string): Promise<TransactionHistoryResponse> => {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get transaction API error:', error);
      throw error;
    }
  },

  // Admin endpoints
  // Get all platform transactions (Admin only)
  getAllTransactions: async (filters: TransactionHistoryFilters = {}): Promise<AdminTransactionResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.chain) params.append('chain', filters.chain);
      if (filters.tokenType) params.append('tokenType', filters.tokenType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters.hasTransactionHash !== undefined) params.append('hasTransactionHash', filters.hasTransactionHash.toString());
      if (filters.hasMpesaId !== undefined) params.append('hasMpesaId', filters.hasMpesaId.toString());

      const queryString = params.toString();
      const url = `/transactions/all${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching all transactions (Admin):', url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Get all transactions API error:', error);
      throw error;
    }
  },

  // Get onchain transactions (Admin only)
  getOnchainTransactions: async (filters: TransactionHistoryFilters = {}): Promise<OnchainTransactionResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.chain) params.append('chain', filters.chain);
      if (filters.tokenType) params.append('tokenType', filters.tokenType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters.status) params.append('status', filters.status);

      const queryString = params.toString();
      const url = `/transactions/onchain${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching onchain transactions (Admin):', url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Get onchain transactions API error:', error);
      throw error;
    }
  },

  // Get fiat-crypto transactions (Admin only)
  getFiatCryptoTransactions: async (filters: TransactionHistoryFilters = {}): Promise<FiatCryptoTransactionResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.chain) params.append('chain', filters.chain);
      if (filters.tokenType) params.append('tokenType', filters.tokenType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.conversionType) params.append('conversionType', filters.conversionType);

      const queryString = params.toString();
      const url = `/transactions/fiat-crypto${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching fiat-crypto transactions (Admin):', url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Get fiat-crypto transactions API error:', error);
      throw error;
    }
  },

  // Export transactions to CSV (Admin only)
  exportTransactions: async (filters: TransactionHistoryFilters = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      
      // Add all filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      params.append('format', format);
      
      const queryString = params.toString();
      const url = `/transactions/export${queryString ? `?${queryString}` : ''}`;
      
      console.log('📊 Exporting transactions:', url);
      const response = await apiClient.get(url, { responseType: 'blob' });
      return response.data;
    } catch (error: any) {
      console.error('Export transactions API error:', error);
      throw error;
    }
  },

  // Get transaction analytics (Admin only)
  getTransactionAnalytics: async (filters: TransactionHistoryFilters = {}): Promise<any> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.chain) params.append('chain', filters.chain);
      if (filters.tokenType) params.append('tokenType', filters.tokenType);
      if (filters.type) params.append('type', filters.type);

      const queryString = params.toString();
      const url = `/transactions/analytics${queryString ? `?${queryString}` : ''}`;
      
      console.log('📈 Fetching transaction analytics:', url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Get transaction analytics API error:', error);
      throw error;
    }
  },

  // Trigger manual transaction status correction (Admin only)
  triggerStatusCorrection: async (): Promise<StatusCorrectionResponse> => {
    try {
      console.log('🔧 Triggering transaction status correction...');
      const response = await apiClient.post('/admin/transactions/fix-statuses');
      console.log('✅ Status correction response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Status correction API error:', error);
      throw error;
    }
  },
};

// Utility functions for transaction data
export const transactionUtils = {
  // Format transaction amount for display
  formatAmount: (transaction: any): string => {
    const { token } = transaction;
    return `${token.amount} ${token.symbol}`;
  },

  // Get status color
  getStatusColor: (status: string): string => {
    const statusColors: Record<string, string> = {
      completed: 'text-green-400',
      processing: 'text-blue-400',
      pending: 'text-yellow-400',
      failed: 'text-red-400',
      error: 'text-red-500',
      reserved: 'text-orange-400',
    };
    return statusColors[status] || 'text-gray-400';
  },

  // Get status background color
  getStatusBgColor: (status: string): string => {
    const statusBgColors: Record<string, string> = {
      completed: 'bg-green-500/20',
      processing: 'bg-blue-500/20',
      pending: 'bg-yellow-500/20',
      failed: 'bg-red-500/20',
      error: 'bg-red-600/20',
      reserved: 'bg-orange-500/20',
    };
    return statusBgColors[status] || 'bg-gray-500/20';
  },

  // Get transaction type icon
  getTypeIcon: (type: string): string => {
    const typeIcons: Record<string, string> = {
      token_transfer: '↗️',
      fiat_to_crypto: '💰',
      crypto_to_fiat: '💸',
      crypto_to_paybill: '📱',
      crypto_to_till: '🏪',
    };
    return typeIcons[type] || '💳';
  },

  // Get chain color
  getChainColor: (chain: string): string => {
    const chainColors: Record<string, string> = {
      arbitrum: 'text-blue-400',
      celo: 'text-green-400',
      polygon: 'text-purple-400',
      base: 'text-blue-300',
      optimism: 'text-red-400',
      ethereum: 'text-gray-400',
    };
    return chainColors[chain] || 'text-gray-400';
  },

  // Get portfolio impact color
  getPortfolioImpactColor: (impact: string): string => {
    const impactColors: Record<string, string> = {
      positive: 'text-green-400',
      negative: 'text-red-400',
      neutral: 'text-gray-400',
    };
    return impactColors[impact] || 'text-gray-400';
  },

  // Format time ago
  formatTimeAgo: (ageMinutes: number): string => {
    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes < 60) return `${Math.floor(ageMinutes)}m ago`;
    if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h ago`;
    return `${Math.floor(ageMinutes / 1440)}d ago`;
  },

  // Get explorer name
  getExplorerName: (chain: string): string => {
    const explorerNames: Record<string, string> = {
      arbitrum: 'Arbiscan',
      celo: 'Celo Explorer',
      polygon: 'PolygonScan',
      base: 'BaseScan',
      optimism: 'Optimism Explorer',
      ethereum: 'Etherscan',
    };
    return explorerNames[chain] || 'Explorer';
  },
};