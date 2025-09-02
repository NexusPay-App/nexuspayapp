import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { transactionAPI } from '../lib/transactions';
import { 
  TransactionHistoryResponse, 
  TransactionHistoryFilters,
  Transaction 
} from '../types/transaction-types';

export const useTransactionHistory = () => {
  // API hook
  const transactionHistoryApi = useApi<TransactionHistoryResponse>();
  
  // State for filters and pagination
  const [filters, setFilters] = useState<TransactionHistoryFilters>({
    page: 1,
    limit: 10,
  });
  
  // State for all transactions (for infinite scroll or caching)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get transaction history
  const getTransactionHistory = useCallback(async (customFilters?: TransactionHistoryFilters) => {
    const currentFilters = { ...filters, ...customFilters };
    
    console.log('🚀 useTransactionHistory: Getting transaction history with filters:', currentFilters);
    
    return transactionHistoryApi.execute(
      () => transactionAPI.getHistory(currentFilters),
      {
        showSuccessToast: false,
        showErrorToast: true,
      }
    );
  }, [filters, transactionHistoryApi]);

  // Load more transactions (for pagination)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = (filters.page || 1) + 1;
      const response = await transactionAPI.getHistory({
        ...filters,
        page: nextPage,
      });
      
      if (response.success) {
        setAllTransactions(prev => [...prev, ...response.data.transactions]);
        setFilters(prev => ({ ...prev, page: nextPage }));
        setHasMore(response.data.summary.hasNext);
      }
    } catch (error) {
      console.error('Failed to load more transactions:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, hasMore, isLoadingMore]);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    setAllTransactions([]);
    setHasMore(false);
    
    try {
      const response = await getTransactionHistory({ page: 1 });
      if (response.success) {
        setAllTransactions(response.data.transactions);
        setHasMore(response.data.summary.hasNext);
      }
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  }, [getTransactionHistory]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TransactionHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setAllTransactions([]);
    setHasMore(false);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10 });
    setAllTransactions([]);
    setHasMore(false);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔄 useTransactionHistory: Loading initial data...');
      try {
        const response = await getTransactionHistory();
        console.log('📊 useTransactionHistory: Initial data response:', response);
        
        if (response.success) {
          console.log('✅ useTransactionHistory: Setting transactions:', response.data.transactions);
          setAllTransactions(response.data.transactions);
          setHasMore(response.data.summary.hasNext);
        } else {
          console.log('❌ useTransactionHistory: Response not successful:', response);
        }
      } catch (error) {
        console.error('❌ useTransactionHistory: Failed to load initial transaction data:', error);
      }
    };

    loadInitialData();
  }, [getTransactionHistory]);

  return {
    // Data
    transactions: allTransactions,
    summary: transactionHistoryApi.data?.data?.summary,
    filtersInfo: transactionHistoryApi.data?.data?.filters,
    
    // Loading states
    loading: transactionHistoryApi.loading,
    loadingMore: isLoadingMore,
    
    // Error
    error: transactionHistoryApi.error,
    
    // Actions
    getTransactionHistory,
    loadMore,
    refreshTransactions,
    updateFilters,
    clearFilters,
    
    // Filter state
    currentFilters: filters,
    hasMore,
  };
};
