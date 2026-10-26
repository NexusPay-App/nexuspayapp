import { handleCallback } from '@vercel/queue';
import { callBotMonitor, scheduleBotMonitor } from '@/lib/server/botMonitor';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const maxDuration = 120;
export const POST = handleCallback<{ tickId: string }>(async ({ tickId }) => {
  if (!/^[a-f0-9-]{36}$/.test(tickId)) throw new Error('Invalid monitor cycle');
  const result = await callBotMonitor<{ nextTickId: string | null }>('tick', { tickId });
  if (result.nextTickId) await scheduleBotMonitor(result.nextTickId);
}, { visibilityTimeoutSeconds: 180 });
