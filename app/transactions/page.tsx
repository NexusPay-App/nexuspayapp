"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import AppHeader from "@/components/layout/AppHeader";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <main className="min-h-dvh bg-gradient-to-br from-[#102729] to-[#0D1718] text-white">
        <AppHeader />
        <div className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 sm:py-8 md:w-[92%] lg:w-[86%] lg:px-8 2xl:w-[82%]">
          <Link
            href="/home"
            aria-label="Back to wallet"
            className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Wallet
          </Link>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Transactions
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Your activity across wallet, crypto and M-Pesa.
            </p>
          </div>
          <TransactionHistory />
        </div>
      </main>
    </AuthGuard>
  );
}
