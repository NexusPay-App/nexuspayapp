"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SendTokenForm } from '@/components/crypto/SendTokenForm';
import { SendCryptoToMpesaForm } from '@/components/crypto/SendCryptoToMpesaForm';

export default function CryptoPage() {
  const [destination, setDestination] = useState<'wallet' | 'mpesa'>('wallet');
  return <main className="min-h-screen bg-[#0A0E0E] pb-16 pt-6 text-white sm:pt-10">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Link href="/home" className="mb-7 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"><ArrowLeft size={16} />Wallet</Link>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Send money</h1><p className="mt-2 text-sm text-white/45">Send to a phone number, email or wallet.</p></div>
      </div>
      <div className="mb-6 flex gap-5 border-b border-white/10 text-sm" role="tablist" aria-label="Send destination">
        {(['wallet', 'mpesa'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={destination === item} onClick={() => setDestination(item)} className={`border-b-2 pb-3 transition ${destination === item ? 'border-[#39BED3] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>{item === 'wallet' ? 'Crypto wallet' : 'M-Pesa'}</button>)}
      </div>
      {destination === 'wallet' ? <SendTokenForm /> : <SendCryptoToMpesaForm />}
    </div>
  </main>;
}
