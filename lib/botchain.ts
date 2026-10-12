import api from './api';
import type { PayMerchantResponse, SendTokenResponse } from './crypto';
export type BotNetwork = 'botchain' | 'botchain-testnet';
export type BotToken = 'BOT' | 'WBOT' | 'USDT';
export interface BotCapability { id: BotNetwork; name: string; chainId: number; enabled: boolean; transfers: boolean; merchantPayments: boolean; deposits?: boolean; explorer: string; testnet: boolean; tokens?: { symbol: BotToken; decimals: number; address: string | null }[]; }
export interface BotBalance { network: BotNetwork; address: string; gasMode: string; balances: { symbol: BotToken; decimals: number; balance: string; balanceUnits: string }[]; }
export interface BotPayment { id: string; network: BotNetwork; sender: string; recipient: string; amount: string; tokenSymbol: BotToken; status: 'preparing' | 'submitted' | 'pending' | 'confirmed' | 'failed' | 'review'; userOpHash?: string; transactionHash?: string; explorerUrl?: string; failureReason?: string; createdAt: string; merchantId?: string; direction?: 'outgoing' | 'incoming'; }
export const BOT_NETWORK_IDS: BotNetwork[] = ['botchain', 'botchain-testnet'];
export function isBotNetwork(value: string): value is BotNetwork {
  return (BOT_NETWORK_IDS as string[]).includes(value);
}
/**
 * Stable per-payment idempotency key, scoped by form intent. Retrying the same
 * details reuses the key so the backend can deduplicate; changing any detail
 * starts a new payment key. Mirrors the /botchain page behaviour.
 */
// In-memory fallback for environments without sessionStorage (SSR, jest).
// Scoped by fingerprint, and the backend additionally scopes idempotency by user.
const memoryKeys = new Map<string, string>();
export function botRequestKey(scope: 'send' | 'merchant', fingerprint: unknown): string {
  const serialized = JSON.stringify(fingerprint);
  const storageKey = `nexuspay_bot_request_${scope}`;
  const memoryKey = `${storageKey}:${serialized}`;
  const existing = memoryKeys.get(memoryKey);
  if (existing) return existing;
  const key = (() => {
    try {
      const previous = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (previous?.fingerprint === serialized && typeof previous.key === 'string' && previous.key) return previous.key as string;
      const fresh = crypto.randomUUID();
      sessionStorage.setItem(storageKey, JSON.stringify({ fingerprint: serialized, key: fresh }));
      return fresh;
    } catch { return crypto.randomUUID(); }
  })();
  memoryKeys.set(memoryKey, key);
  return key;
}
export function clearBotRequest(scope: 'send' | 'merchant'): void {
  const prefix = `nexuspay_bot_request_${scope}:`;
  for (const memoryKey of [...memoryKeys.keys()]) if (memoryKey.startsWith(prefix)) memoryKeys.delete(memoryKey);
  try { sessionStorage.removeItem(`nexuspay_bot_request_${scope}`); } catch { /* Storage unavailable. */ }
}
export const botAPI = {
  networks: async () => (await api.get<{ data: BotCapability[] }>('/botchain/networks')).data.data,
  balance: async (network: BotNetwork, signal?: AbortSignal) => (await api.get<{ data: BotBalance }>(`/botchain/${network}/balances`, { signal })).data.data,
  history: async (network: BotNetwork, signal?: AbortSignal) => (await api.get<{ data: BotPayment[] }>(`/botchain/${network}/transfers`, { signal })).data.data,
  status: async (network: BotNetwork, id: string) => (await api.get<{ data: BotPayment }>(`/botchain/${network}/transfers/${id}`)).data.data,
  send: async (network: BotNetwork, input: { amount: string; tokenSymbol: BotToken; password: string; recipientIdentifier?: string; merchantId?: string; senderAddress?: string }, key: string) => (await api.post<{ data: BotPayment }>(`/botchain/${network}/transfers`, input, { headers: { 'Idempotency-Key': key } })).data.data,
};
export function botPaymentLabel(payment: BotPayment): string {
  if (payment.status === 'confirmed') return 'Payment confirmed';
  if (payment.status === 'failed') return 'Payment failed';
  if (payment.status === 'review') return 'Checking submission outcome';
  return 'Payment pending confirmation';
}
/** Map a BOT payment onto the legacy send-response shape the existing success cards render. */
export function botPaymentToSendResponse(payment: BotPayment, recipientIdentifier: string): SendTokenResponse {
  const createdAt = new Date(payment.createdAt);
  return {
    success: true,
    message: botPaymentLabel(payment),
    data: {
      transactionCode: payment.id,
      transactionHash: payment.transactionHash || '',
      explorerUrl: payment.explorerUrl || '',
      amount: payment.amount,
      tokenSymbol: payment.tokenSymbol,
      chain: payment.network,
      sender: { address: payment.sender },
      recipient: { identifier: recipientIdentifier, address: payment.recipient },
      timestamp: { iso: payment.createdAt, local: createdAt.toLocaleString(), unix: Math.floor(createdAt.getTime() / 1000) },
      transaction: {
        hash: payment.transactionHash || '',
        explorerUrl: payment.explorerUrl || '',
        chain: payment.network,
        token: payment.tokenSymbol,
        amount: payment.amount,
        amountDisplay: `${payment.amount} ${payment.tokenSymbol}`,
        status: payment.status,
        confirmations: payment.status === 'confirmed' ? 'confirmed' : 'pending',
        gasUsed: '',
        blockNumber: '',
      },
      security: { level: 'password', authMethod: 'account password', verified: true, transactionType: 'botchain_transfer' },
      notifications: [],
      botStatus: payment.status,
    },
  };
}
/** Map a BOT merchant payment onto the legacy merchant-response shape. */
export function botPaymentToMerchantResponse(payment: BotPayment, merchantId: string): PayMerchantResponse {
  return {
    success: true,
    message: botPaymentLabel(payment),
    data: {
      businessName: payment.merchantId || merchantId,
      transactionHash: payment.transactionHash || payment.userOpHash || '',
      authenticationMethod: 'account password',
      botStatus: payment.status,
    },
  };
}
