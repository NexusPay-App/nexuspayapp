import { createHash, timingSafeEqual } from 'node:crypto';
import { callBotMonitor, scheduleBotMonitor } from '@/lib/server/botMonitor';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export async function POST(request: Request) {
  const secret = process.env.BOT_MONITOR_SECRET;
  if (!secret) return Response.json({ success: false }, { status: 503 });
  const digest = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(digest(request.headers.get('authorization') || ''), digest(`Bearer ${secret}`))) return Response.json({ success: false }, { status: 401 });
  const result = await callBotMonitor<{ tickId: string | null }>('start');
  if (result.tickId) await scheduleBotMonitor(result.tickId, 0);
  return Response.json({ success: true, enabled: !!result.tickId });
}
