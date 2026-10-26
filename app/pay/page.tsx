"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Smartphone,
  ArrowUpRight,
  ScanLine,
} from "lucide-react";
import { PayMerchantForm } from "@/components/crypto/PayMerchantForm";
import { RampForm } from "@/components/mpesa/RampForm";
import { QRCodeScanner } from "@/components/crypto/QRCodeScanner";

export default function PayPage() {
  const [tab, setTab] = useState<"merchant" | "bills" | "withdraw">("merchant");
  const [scan, setScan] = useState(false);
  const options = [
    { id: "merchant" as const, label: "Business", icon: Building2 },
    { id: "bills" as const, label: "Till / Paybill", icon: Smartphone },
    { id: "withdraw" as const, label: "Withdraw", icon: ArrowUpRight },
  ];
  return (
    <main className="min-h-[80dvh] bg-[#0A0E0E] px-5 py-6 sm:py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
          >
            <ArrowLeft size={16} />
            Wallet
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-[#39BED3] hover:bg-white/5"
            onClick={() => setScan(true)}
          >
            <ScanLine size={16} />
            Scan QR
          </button>
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
          Pay & withdraw
        </h1>
        <p className="mb-6 text-sm text-white/50">
          Pay a business or move money to M-Pesa.
        </p>
        <div
          className="mb-5 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-[#0E1617] p-1"
          role="group"
          aria-label="Payment type"
        >
          {options.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-xs font-medium transition sm:flex-row sm:justify-center ${tab === id ? "bg-[#0795B0] text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        {tab === "merchant" ? (
          <PayMerchantForm />
        ) : (
          <RampForm key={tab} mode={tab} />
        )}
      </div>
      {scan && (
        <QRCodeScanner
          onClose={() => setScan(false)}
          onScanSuccess={() => setScan(false)}
        />
      )}
    </main>
  );
}
