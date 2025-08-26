"use client";

import { BuyCryptoForm } from '@/components/mpesa/BuyCryptoForm';
import { ArrowLeft } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

export default function BuyCryptoPage() {
  const router = useRouter();

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
          <h1 className="text-4xl text-white font-bold mb-3">Buy Crypto with M-Pesa</h1>
          <p className="text-gray-400 text-lg">Convert your M-Pesa to crypto tokens securely</p>
        </div>
      </article>
      
      <article className="mt-8 flex flex-col items-center p-5 xl:px-[200px]">
        <div className="w-full max-w-2xl">
          <BuyCryptoForm />
        </div>
      </article>
    </section>
  );
}
