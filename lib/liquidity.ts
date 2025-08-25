import apiClient from './api';
import { ApiResponse } from './wallet';

// Types
export interface ProvideLiquidityData {
  token: string;
  amount: string;
  chain: string;
  lockPeriod?: number; // in days
}

export interface LiquidityPosition {
  id: string;
  token: string;
  amount: string;
  chain: string;
  apy: string;
  lockPeriod: number;
  unlockDate: string;
  rewards: string;
  status: 'active' | 'unlocking' | 'withdrawn';
  createdAt: string;
}

export interface LiquidityStats {
  token: string;
  chain: string;
  totalLiquidity: string;
  currentApy: string;
  totalRewards: string;
  participantCount: number;
  averageLockPeriod: number;
}

export interface InitiateWithdrawalData {
  positionId: string;
  amount?: string; // partial withdrawal
}

export interface ConfirmWithdrawalData {
  withdrawalId: string;
  signature: string;
}

// Liquidity Operations API
export const liquidityAPI = {
  // Provide liquidity
  provideLiquidity: async (data: ProvideLiquidityData): Promise<ApiResponse> => {
    const response = await apiClient.post('/liquidity/provide', data);
    return response.data;
  },

  // Get user's liquidity positions
  getPositions: async (): Promise<ApiResponse<LiquidityPosition[]>> => {
    const response = await apiClient.get('/liquidity/positions');
    return response.data;
  },

  // Get liquidity stats for a token
  getStats: async (token: string): Promise<ApiResponse<LiquidityStats>> => {
    const response = await apiClient.get(`/liquidity/stats/${token}`);
    return response.data;
  },

  // Initiate liquidity withdrawal
  initiateWithdrawal: async (data: InitiateWithdrawalData): Promise<ApiResponse> => {
    const response = await apiClient.post('/liquidity/withdraw/initiate', data);
    return response.data;
  },

  // Confirm liquidity withdrawal
  confirmWithdrawal: async (data: ConfirmWithdrawalData): Promise<ApiResponse> => {
    const response = await apiClient.post('/liquidity/withdraw/confirm', data);
    return response.data;
  },

  // Delete liquidity position
  deletePosition: async (positionId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/liquidity/position/${positionId}`);
    return response.data;
  },
};