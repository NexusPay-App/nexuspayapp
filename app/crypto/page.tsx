"use client";

import React, { useState } from 'react';
import { SendTokenForm } from '@/components/crypto/SendTokenForm';
import { SendCryptoToMpesaForm } from '@/components/crypto/SendCryptoToMpesaForm';
import { ArrowLeft } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

export default function CryptoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'crypto' | 'mpesa'>('crypto');

  const handleBackToHome = () => {
    router.push('/home');
  };

  return (
    <section className="home-background">
      <article className="bg-[#0A0E0E] flex flex-col p-5 xl:px-[200px] border-0 border-b border-[#0795B0]">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToHome}
            className="flex items-center text-white hover:text-[#0795B0] transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft size={24} className="mr-2" />
            <span className="text-lg font-medium">Back to Home</span>
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white font-bold mb-3">Send Crypto</h1>
          <p className="text-gray-400 text-lg">Send crypto to anyone using email, phone, or wallet address</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1A1E1E] rounded-lg p-1 border border-[#0795B0]">
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'crypto'
                  ? 'bg-[#0795B0] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Send to Crypto Wallet
            </button>
            <button
              onClick={() => setActiveTab('mpesa')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'mpesa'
                  ? 'bg-[#0795B0] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Send to M-Pesa
            </button>
          </div>
        </div>
      </article>
      
      <article className="mt-8 flex flex-col items-center p-5 xl:px-[200px]">
        <div className="w-full max-w-4xl">
          {activeTab === 'crypto' ? (
            <SendTokenForm />
          ) : (
            <SendCryptoToMpesaForm />
          )}
        </div>
      </article>
    </section>
  );
}
