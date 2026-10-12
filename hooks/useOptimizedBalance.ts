import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getApiBaseUrl } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';

export interface TokenBalance {
  [token: string]: number;
}

export interface ChainBalance {
  [chain: string]: TokenBalance;
}

export interface WalletBalanceData {
  walletAddress: string;
  totalUSDValue: number;
  balances: ChainBalance;
  chainsWithBalance: number;
  supportedChains: string[];
  lastUpdated: string;
}

export interface ChainSpecificBalance {
  walletAddress: string;
  chain: string;
  balances: TokenBalance;
  totalUSDValue: number;
  supportedTokens: string[];
  lastUpdated: string;
}

// Balances stay in memory and are scoped to the authenticated owner and backend.
export const useOptimizedBalance = () => {
  const { isAuthenticated, user } = useAuth();
  const client = useQueryClient();
  const [chain, setChain] = useState<string | null>(null);
  const owner = user?.walletAddress || user?.email || user?.phoneNumber || '';
  const environment = getApiBaseUrl();
  const enabled = isAuthenticated && !!owner;
  const allKey = ['wallet-balance', environment, owner] as const;
  const all = useQuery<WalletBalanceData>({
    queryKey: allKey,
    queryFn: async ({ signal }) => {
      const response = await api.get('/token/balance', { signal });
      if (!response.data.success) throw new Error(response.data.message || 'Unable to load balances');
      return response.data.data;
    },
    enabled, staleTime: 120000, gcTime: 300000, refetchInterval: 300000,
  });
  const specific = useQuery<ChainSpecificBalance>({
    queryKey: ['chain-balance', environment, owner, chain],
    queryFn: async ({ signal }) => {
      const response = await api.get(`/token/balance/${chain}`, { signal });
      if (!response.data.success) throw new Error(response.data.message || 'Unable to load this network');
      return response.data.data;
    },
    enabled: enabled && !!chain, staleTime: 120000, gcTime: 300000,
  });
  const fetchAllBalances = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;
    if (forceRefresh) await client.invalidateQueries({ queryKey: ['wallet-balance', environment, owner] });
  }, [client, enabled, environment, owner]);
  const fetchChainBalance = useCallback(async (nextChain: string, forceRefresh = false) => {
    setChain(nextChain);
    if (forceRefresh) await client.invalidateQueries({ queryKey: ['chain-balance', environment, owner, nextChain] });
  }, [client, environment, owner]);
  const clearCache = useCallback(() => {
    client.removeQueries({ queryKey: ['wallet-balance', environment, owner] });
    client.removeQueries({ queryKey: ['chain-balance', environment, owner] });
  }, [client, environment, owner]);
  return {
    balance: enabled ? all.data ?? null : null,
    chainBalance: enabled ? specific.data ?? null : null,
    loading: enabled && (all.isFetching || specific.isFetching),
    error: all.error?.message || specific.error?.message || null,
    fetchAllBalances, fetchChainBalance, refetch: fetchAllBalances, clearCache,
    isCacheValid: !!all.data && !all.isStale,
  };
};
