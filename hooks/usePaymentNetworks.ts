'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { botAPI, isBotNetwork, type BotCapability, type BotToken } from '@/lib/botchain';
interface PaymentNetwork { id: string; name: string; chainId: number; tokens: { symbol: string; name: string; decimals: number }[]; transfers?: boolean; merchantPayments?: boolean; }
const BOT_TOKEN_NAMES: Record<BotToken, { name: string; decimals: number }> = {
  USDT: { name: 'Tether USD', decimals: 6 },
  BOT: { name: 'BOT Chain', decimals: 18 },
};
const DEFAULT_BOT_TOKENS: BotToken[] = ['USDT', 'BOT'];
function toPaymentNetwork(capability: BotCapability): PaymentNetwork {
  const source = capability.tokens?.length
    ? capability.tokens.map(token => ({ symbol: token.symbol, decimals: token.decimals }))
    : DEFAULT_BOT_TOKENS.map(symbol => ({ symbol, decimals: BOT_TOKEN_NAMES[symbol].decimals }));
  const tokens = source.filter(token => DEFAULT_BOT_TOKENS.includes(token.symbol)).map(token => ({
    symbol: token.symbol,
    name: BOT_TOKEN_NAMES[token.symbol]?.name || token.symbol,
    decimals: token.decimals,
  }));
  return { id: capability.id, name: capability.name, chainId: capability.chainId, tokens, transfers: capability.transfers, merchantPayments: capability.merchantPayments };
}
/**
 * Legacy chain list plus capability-driven BOT networks. Only enabled BOT
 * networks are selectable, so a disabled network never appears as an option.
 * The two fetches are held in separate state so arrival order cannot drop one.
 * Visible chains are limited to Arbitrum, Base, and Botchain; the rest stay
 * commented in SUPPORTED_CHAINS / filter lists rather than deleted.
 */
const VISIBLE_LEGACY_CHAIN_IDS = new Set(['arbitrum', 'base']);

export function usePaymentNetworks(chain: string) {
  const [legacy, setLegacy] = useState<PaymentNetwork[]>([]);
  const [bot, setBot] = useState<PaymentNetwork[]>([]);
  useEffect(() => {
    const abort = new AbortController();
    api.get('/token/networks', { signal: abort.signal }).then(r => setLegacy(r.data.data)).catch(() => {});
    botAPI.networks().then(list => setBot(list.filter(n => n.enabled).map(toPaymentNetwork))).catch(() => { /* BOT unavailable: legacy networks remain usable. */ });
    return () => { abort.abort(); };
  }, []);
  const networks = [
    // Visible payment chains only. Uncomment others from the API list if product re-enables them.
    ...legacy.filter(n => VISIBLE_LEGACY_CHAIN_IDS.has(n.id)),
    // 'celo', 'polygon', 'optimism', 'ethereum', 'bnb', 'avalanche', …
    ...bot,
  ];
  const selected = networks.find(n => n.id === chain);
  return { networks, tokens: selected?.tokens || [], isBot: isBotNetwork(chain) && !!selected };
}
