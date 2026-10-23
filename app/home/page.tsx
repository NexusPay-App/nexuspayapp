"use client";
import { useChain } from '@/context/ChainContext';

import PWAInstallButton from "@/components/pwa/PWAInstallButton";

import { NexusLogo, UserIcon } from "@/constants/svg";
import {
  ArrowCircleDown,
  CreditCard,
  List,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, UserPlus, Plus, RefreshCw, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import loadingJson from "@/public/json/loading.json";

// Dynamically import Player to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { useOptimizedBalance } from "@/hooks/useOptimizedBalance";
import { BalanceSkeleton, BalanceErrorState, BalanceEmptyState } from "@/components/ui/balance-skeleton";
import { RecentTransactions } from "@/components/transactions/RecentTransactions";
import { cryptoConverter } from "@/lib/crypto-converter";
import { getApiBaseUrl } from "@/lib/config";

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    currentBusiness, 
    isPinVerified, 
    businessAccounts,
    loadBusinessAccounts
  } = useBusiness();
  const { balance, chainBalance, loading, error, fetchAllBalances, fetchChainBalance } = useOptimizedBalance();

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false); // Opens the Logout Loading Dialog
  const { setChain: setPaymentChain } = useChain();
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [botNetworks, setBotNetworks] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  // Enabled BOT networks join the same chain selector as every other network.
  useEffect(() => {
    let active = true;
    fetch(`${getApiBaseUrl()}/botchain/networks`)
      .then((response) => response.json())
      .then((json) => {
        if (!active || !Array.isArray(json?.data)) return;
        setBotNetworks(
          json.data
            .filter((network: any) => network.enabled)
            .map((network: any) => ({ id: network.id, name: network.name }))
        );
      })
      .catch(() => { /* Selection stays on legacy chains when capabilities are unavailable. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    // Check if the user is authenticated using the auth context
    if (!isAuthenticated) {
      // If not logged in, redirect to the login page
      router.replace("/login");
    }
  }, [router, isAuthenticated, user, businessAccounts, currentBusiness]);

  const handleSend = () => {
    router.replace("/crypto");
  };

  const handleReceive = () => {
    router.replace("/receive");
  };

  const handlePay = () => {
    router.replace("/pay");
  };

  const handleBuy = () => {
    router.replace("/buy-crypto");
  };

  // Logs out the User
  const handleLogout = () => {
    setOpenLogoutDialog(true);
    logout();
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  // Handle settings click
  const handleSettings = () => {
    router.push("/settings");
  };

  // Handle chain selection
  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
    if (chain !== 'all') setPaymentChain(chain);
    if (chain === 'all') {
      fetchAllBalances();
    } else {
      fetchChainBalance(chain);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (selectedChain === 'all') {
      fetchAllBalances(true); // Force refresh
    } else {
      fetchChainBalance(selectedChain, true); // Force refresh
    }
  };

  // Get current balance data based on selection
  const getCurrentBalance = () => {
    if (selectedChain === 'all') {
      return balance;
    } else {
      return chainBalance;
    }
  };

  // Get total USD value
  const getTotalUSDValue = () => {
    const currentBalance = getCurrentBalance();
    return currentBalance?.totalUSDValue || 0;
  };

  // Get chain-specific balances
  const getChainBalances = () => {
    const currentBalance = getCurrentBalance();
    if (selectedChain === 'all') {
      return currentBalance?.balances || {};
    } else {
      return currentBalance?.balances ? { [selectedChain]: currentBalance.balances } : {};
    }
  };

  // Dynamic USD→KES rate
  const [usdToKesRate, setUsdToKesRate] = useState<number>(130);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const rates = await cryptoConverter.getConversionRates();
        // rates.kes is USD→KES divisor per existing usage; 1 USD = (1 / rates.kes) KES
        const computed = 1 / rates.kes;
        if (isFinite(computed) && computed > 0) setUsdToKesRate(computed);
      } catch {
        // keep default fallback
      }
    };
    loadRate();
  }, []);

  const getKESEquivalent = () => {
    const usdAmount = getTotalUSDValue();
    return usdAmount * usdToKesRate;
  };


  return (
    <main className="min-h-screen bg-[#0A0E0E] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger aria-label="Open navigation" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/5">
              <List size={24} color="#ffffff" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <ul className="flex flex-col justify-around items-start text-base font-DM text-black w-auto">
                  <Link
                    href="/home"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Home
                  </Link>
                  <Link
                    href="/business"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Business
                  </Link>
                  <Link
                    href="/reclaim"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Reclaim
                  </Link>
                </ul>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Link href="/home" aria-label="NexusPay home">
            <Image src={NexusLogo} alt="NexusPay" className="h-8 w-auto" priority />
          </Link>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="My Account"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0795B0]"
                  onClick={() => {
                    // Load business accounts when user opens dropdown
                    if (user?.id && businessAccounts.length === 0) {
                      loadBusinessAccounts();
                    }
                  }}
                >
                  <Image src={UserIcon} alt="" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Settings */}
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {/* Business Account Switcher */}
                {currentBusiness ? (
                  <DropdownMenuItem
                    onClick={() => {
                      console.log('Switch to Business clicked');
                      router.push('/business/home');
                    }}
                    className="hover:bg-blue-50"
                  >
                    <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">Switch to {currentBusiness.businessName}</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      console.log('Browse Business Accounts clicked');
                      router.push('/business');
                    }}
                    className="hover:bg-blue-50"
                  >
                    <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">Business Accounts</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Dialog to LogOut the User */}
          <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="mb-[5px]">Logging you out</DialogTitle>
                <Player
                  keepLastFrame
                  autoplay
                  loop={true}
                  src={loadingJson}
                  style={{ height: "200px", width: "200px" }}
                ></Player>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Your wallet</h1>
            <p className="mt-1 hidden text-sm text-white/50 sm:block">Your money, assets and activity in one place.</p>
          </div>
          <Select value={selectedChain} onValueChange={handleChainChange}>
            <SelectTrigger aria-label="Select network" className="h-10 w-[170px] border border-[#0795B0]/40 bg-[#101919] text-sm sm:w-[200px]">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              {botNetworks.map(network => <SelectItem key={network.id} value={network.id}>{network.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <section aria-label="Wallet balance and actions" className="min-w-0 rounded-2xl border border-[#0795B0]/30 bg-gradient-to-br from-[#102729] to-[#0D1718] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/65">{currentBusiness ? `${currentBusiness.businessName} Balance` : 'Wallet Balance'}</h2>
              <button type="button" onClick={handleRefresh} disabled={loading} aria-label="Refresh balance" className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {currentBusiness && (
              <p className="mb-2 text-xs text-[#39BED3]">Business account · {currentBusiness.merchantId}{!isPinVerified && ' · PIN required'}</p>
            )}
            <div className="mt-2">
              {loading && !getCurrentBalance() ? <BalanceSkeleton /> : error && !getCurrentBalance() ? (
                <BalanceErrorState error={error} onRetry={handleRefresh} />
              ) : getCurrentBalance() ? (
                <>
                  <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                    {getKESEquivalent().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="ml-2 text-lg font-medium text-white/60">KES</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-sm font-medium text-white/80">${getTotalUSDValue().toFixed(2)} USD</p>
                    <p className="text-xs text-white/45">1 USD ≈ {usdToKesRate.toFixed(2)} KES</p>
                  </div>
                </>
              ) : <BalanceEmptyState />}
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2 border-t border-white/10 pt-4 sm:mt-6">
              {[
                { label: 'Send', icon: PaperPlaneTilt, action: handleSend },
                { label: 'Receive', icon: ArrowCircleDown, action: handleReceive },
                { label: 'Pay', icon: CreditCard, action: handlePay },
                { label: 'Buy', icon: Plus, action: handleBuy },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} type="button" onClick={action} className={`flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39BED3] sm:flex-row sm:gap-2 sm:text-sm ${label === 'Send' ? 'bg-[#0795B0] text-white hover:bg-[#06849C]' : 'bg-white/5 text-white/85 hover:bg-white/10'}`}>
                  <Icon size={19} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="assets-title" className="order-3 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0E1617] lg:order-2">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 id="assets-title" className="text-base font-semibold">Your assets</h2>
              <Wallet className="h-4 w-4 text-[#39BED3]" aria-hidden="true" />
            </div>
            <div className="max-h-[220px] overflow-y-auto px-5">
              {loading && !getCurrentBalance() ? <p className="py-6 text-sm text-white/50">Loading assets…</p> : error && !getCurrentBalance() ? (
                <p className="py-6 text-sm text-white/50">Assets are unavailable. Refresh your balance to try again.</p>
              ) : Object.values(getChainBalances()).every(tokens => Object.keys(tokens).length === 0) ? (
                <div className="py-6 text-sm text-white/50">No assets yet. Receive crypto to get started.</div>
              ) : Object.entries(getChainBalances()).flatMap(([chain, tokens]) => Object.entries(tokens).map(([token, amount]) => (
                <div key={`${chain}-${token}`} className="flex items-center justify-between gap-4 border-b border-white/5 py-3.5 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0795B0]/10 text-sm font-semibold text-[#39BED3]">{token.slice(0, 1)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{token}</p>
                      <p className="truncate text-xs text-white/45">{botNetworks.find(network => network.id === chain)?.name || chain.charAt(0).toUpperCase() + chain.slice(1)}</p>
                    </div>
                  </div>
                  <p className="text-right text-sm font-medium tabular-nums">{Number(amount).toLocaleString('en-US', { maximumFractionDigits: 8 })}</p>
                </div>
              )))}
            </div>
          </section>

          <section aria-label="Recent transactions" className="order-2 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0E1617] lg:order-3 lg:col-span-2">
            <RecentTransactions />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Home;
