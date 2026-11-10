"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Copy,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import AuthGuard from "@/components/auth/AuthGuard";
import AppHeader from "@/components/layout/AppHeader";
import AccountSecurityPanel from "@/components/security/AccountSecurityPanel";
import toast from "react-hot-toast";

function shortAddress(address?: string) {
  return address
    ? `${address.slice(0, 8)}…${address.slice(-6)}`
    : "Wallet not available";
}

function MethodStatus({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="text-sm text-white/75">{label}</span>
      <span
        className={`text-xs ${active ? "text-[#39BED3]" : "text-white/40"}`}
      >
        {active ? "On" : "Not set"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { wallet } = useWallet();
  const router = useRouter();
  const address =
    wallet?.walletAddress || wallet?.address || user?.walletAddress || "";

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Couldn’t copy the wallet address");
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-dvh bg-gradient-to-br from-[#102729] to-[#0D1718] text-white">
        <AppHeader />
        <div className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 sm:py-8 md:w-[92%] lg:w-[86%] lg:px-8 2xl:w-[82%]">
          <Link
            href="/home"
            className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
          >
            <ArrowLeft size={16} /> Wallet
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-white/50">Account and security.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
            <div className="space-y-7">
              <section
                aria-labelledby="account-title"
                className="border-b border-white/10 pb-6"
              >
                <h2
                  id="account-title"
                  className="mb-4 flex items-center gap-2 text-base font-semibold"
                >
                  <UserRound size={18} className="text-[#39BED3]" /> Account
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs text-white/45">Email</dt>
                    <dd className="mt-1 break-all text-sm">
                      {user?.email || "Not added"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/45">Phone</dt>
                    <dd className="mt-1 text-sm">
                      {user?.phoneNumber || "Not added"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/45">Wallet address</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm">
                      <span className="font-mono">{shortAddress(address)}</span>
                      {address && (
                        <button
                          type="button"
                          onClick={copyAddress}
                          aria-label="Copy wallet address"
                          className="rounded p-1 text-white/50 transition hover:bg-white/5 hover:text-white"
                        >
                          <Copy size={15} />
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-label="Business account"
                className="flex items-center justify-between gap-4 border-b border-white/10 pb-6"
              >
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness size={18} className="text-[#39BED3]" />
                  <div>
                    <h2 className="text-sm font-medium">Business account</h2>
                    <p className="mt-1 text-xs text-white/45">
                      Set up payments for your business.
                    </p>
                  </div>
                </div>
                <Link
                  href="/signup/business"
                  className="shrink-0 text-sm font-medium text-[#39BED3] hover:text-white"
                >
                  Set up
                </Link>
              </section>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.replace("/onboarding");
                }}
                className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-rose-200"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>

            <section
              aria-labelledby="security-title"
              className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
            >
              <h2
                id="security-title"
                className="mb-4 flex items-center gap-2 text-base font-semibold"
              >
                <ShieldCheck size={18} className="text-[#39BED3]" /> Security
              </h2>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/80">
                  Sign-in methods
                </h3>
                <div className="mt-1">
                  <MethodStatus
                    label="Phone and password"
                    active={!!user?.phoneNumber && !!user?.hasPassword}
                  />
                  <MethodStatus
                    label="Google"
                    active={!!user?.authMethods?.includes("google")}
                  />
                </div>
              </div>
              <h3 className="mb-3 text-sm font-medium text-white/80">
                Passkey
              </h3>
              <AccountSecurityPanel />
            </section>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
