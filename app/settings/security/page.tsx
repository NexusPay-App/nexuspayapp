"use client";

import Link from "next/link";
import AccountSecurityPanel from "@/components/security/AccountSecurityPanel";

export default function AccountSecurity() {
  return (
    <main className="min-h-screen bg-[#0A0E0E] px-5 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-lg">
        <Link
          href="/home"
          className="text-sm text-white/60 hover:text-[#39BED3]"
        >
          ← Back to wallet
        </Link>
        <h1 className="mt-7 text-sm font-medium text-white/50">
          Account security
        </h1>
        <section className="mt-3 rounded-2xl border border-white/10 bg-[#0E1617] p-6 sm:p-8">
          <AccountSecurityPanel />
        </section>
      </div>
    </main>
  );
}
