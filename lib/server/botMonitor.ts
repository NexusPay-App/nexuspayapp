import { send } from '@vercel/queue';

export async function callBotMonitor<T>(path: 'start' | 'tick', body?: { tickId: string }): Promise<T> {
  const secret = process.env.BOT_MONITOR_SECRET;
  if (!secret) throw new Error('BOT monitor is not configured');
  const response = await fetch(`https://nexuspay-backend-test.vercel.app/api/internal/payments/monitor/${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}), signal: AbortSignal.timeout(90_000), cache: 'no-store',
  });
  if (!response.ok) throw new Error(`BOT monitor returned HTTP ${response.status}`);
  const result = await response.json();
  if (!result.success) throw new Error('BOT monitor cycle failed');
  return result.data;
}

export async function scheduleBotMonitor(tickId: string, delaySeconds = 20) {
  await send('botchain-monitor', { tickId }, { region: 'iad1', idempotencyKey: tickId, delaySeconds, retentionSeconds: 86400 });
}
