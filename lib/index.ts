// Core wallet operations
export * from './wallet';
export * from './mpesa';
export * from './platform-wallet';
export * from './liquidity';
export * from './transactions';

// Re-export auth for convenience
export * from './auth';

// Constants
// Visible: Arbitrum, Base, Botchain. Others commented, not removed.
export const SUPPORTED_CHAINS = [
  'arbitrum', 'base', 'botchain-testnet', 'botchain',
  // 'celo', 'polygon', 'optimism', 'ethereum',
  // 'bnb', 'avalanche', 'fantom', 'gnosis', 'scroll', 'moonbeam',
  // 'fuse', 'aurora', 'lisk', 'somnia'
] as const;

export const SUPPORTED_TOKENS = [
  'USDC', 'USDT', 'BTC', 'ETH', 'WETH', 'WBTC', 'DAI', 'CELO'
] as const;

export type SupportedChain = typeof SUPPORTED_CHAINS[number];
export type SupportedToken = typeof SUPPORTED_TOKENS[number];