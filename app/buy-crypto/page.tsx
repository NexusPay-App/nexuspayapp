"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RampForm } from "@/components/mpesa/RampForm";

export default function BuyCryptoPage() {
  return (
    <main className="min-h-[80dvh] bg-[#0A0E0E] py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
        >
          <ArrowLeft size={16} />
          Wallet
        </Link>
        <RampForm mode="buy" />
      </div>
    </main>
  );
}
