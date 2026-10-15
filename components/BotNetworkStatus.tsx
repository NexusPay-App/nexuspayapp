'use client';
import { useEffect, useState } from 'react';
import { botAPI, type BotCapability } from '@/lib/botchain';

export default function BotNetworkStatus() {
  const [networks, setNetworks] = useState<BotCapability[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    botAPI.networks().then(data => { if (active) setNetworks(data); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <section className="rounded-2xl border border-cyan-800 bg-cyan-950/30 p-6" aria-label="BOT network availability">
    <h2 className="text-xl font-semibold">Network availability</h2>
    {!networks && <p className="mt-3 text-slate-300">{failed ? 'Network status is currently unavailable. Check again before making a payment.' : 'Checking network status…'}</p>}
    {networks?.map(network => <p key={network.id} className="mt-3 text-slate-300"><strong className="text-white">{network.name}:</strong> {network.enabled && network.transfers ? 'Payments enabled' : 'Payments not enabled'}{network.testnet ? ' · Test assets only' : ''}</p>)}
  </section>;
}
