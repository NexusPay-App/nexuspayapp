"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { SendTokenForm } from '@/components/crypto/SendTokenForm';
import { SendCryptoToMpesaForm } from '@/components/crypto/SendCryptoToMpesaForm';

export default function CryptoPage() {
  const [destination, setDestination] = useState<'wallet' | 'mpesa'>('wallet');
  return <main className="min-h-dvh bg-gradient-to-br from-[#102729] to-[#0D1718] text-white">
    <AppHeader />
    <div className="w-full px-4 pt-6 pb-16 sm:px-5 sm:pt-8">
      <Link href="/home" className="mb-7 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} />Wallet</Link>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Send money</h1><p className="mt-2 text-sm text-white/50">Send to a phone number, email or wallet.</p></div>
      </div>
      <div className="mb-6 flex gap-5 border-b border-white/10 text-sm" role="tablist" aria-label="Send destination">
        {(['wallet', 'mpesa'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={destination === item} onClick={() => setDestination(item)} className={`border-b-2 pb-3 transition ${destination === item ? 'border-[#39BED3] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>{item === 'wallet' ? 'Crypto wallet' : 'M-Pesa'}</button>)}
      </div>
      {destination === 'wallet' ? <SendTokenForm /> : <SendCryptoToMpesaForm />}
    </div>
  </main>;
}
