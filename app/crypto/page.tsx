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
    <div className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 sm:py-8 md:w-[92%] lg:w-[86%] lg:px-8 2xl:w-[82%]">
      <Link href="/home" className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} />Wallet</Link>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Send money</h1><p className="mt-2 text-sm text-white/50">Send to a phone number, email or wallet.</p></div>
      </div>
      <div className="mb-5 flex gap-5 border-b border-white/10 text-sm" role="tablist" aria-label="Send destination">
        {(['wallet', 'mpesa'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={destination === item} onClick={() => setDestination(item)} className={`border-b-2 pb-3 transition ${destination === item ? 'border-[#39BED3] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>{item === 'wallet' ? 'Crypto wallet' : 'M-Pesa'}</button>)}
      </div>
      {destination === 'wallet' ? <SendTokenForm /> : <SendCryptoToMpesaForm />}
    </div>
  </main>;
}
