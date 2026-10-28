"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { RampForm } from "@/components/mpesa/RampForm";

export default function BuyCryptoPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#102729] to-[#0D1718] text-white">
      <AppHeader />
      <div className="w-full px-4 pt-6 pb-16 sm:px-5 sm:pt-8">
        <Link
          href="/home"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Wallet
        </Link>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Buy crypto</h1>
        </div>
        <RampForm mode="buy" />
      </div>
    </main>
  );
}
