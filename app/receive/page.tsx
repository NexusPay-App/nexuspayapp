"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy } from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { useChain } from "@/context/ChainContext";
import AuthGuard from "@/components/auth/AuthGuard";
import { botAPI } from "@/lib/botchain";
import toast from "react-hot-toast";

const networks = [
  {
    id: "botchain",
    name: "BOT Chain",
    assets: "USDT or native BOT",
    explorer: "https://scan.botchain.ai",
  },
  {
    id: "base",
    name: "Base",
    assets: "assets on Base",
    explorer: "https://basescan.org",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    assets: "assets on Arbitrum",
    explorer: "https://arbiscan.io",
  },
];

export default function Receive() {
  const { user, isAuthenticated } = useAuth();
  const { wallet } = useWallet();
  const { chain, setChain } = useChain();
  const selected =
    networks.find((network) => network.id === chain) || networks[0];
  const owner = user?.id || user?.email || user?.phoneNumber || "";
  const [account, setAccount] = useState<{
    owner: string;
    address: string;
  } | null>(null);
  const [failure, setFailure] = useState("");
  const [attempt, setAttempt] = useState(0);
  const isBot = selected.id === "botchain";

  useEffect(() => {
    if (!isAuthenticated || !isBot) return;
    const abort = new AbortController();
    setAccount(null);
    setFailure("");
    async function load() {
      try {
        const available = await botAPI.networks();
        if (
          !available.some(
            (network) => network.id === "botchain" && network.enabled,
          )
        ) {
          throw new Error("BOT Chain receiving is currently unavailable.");
        }
        const result = await botAPI.account("botchain", abort.signal);
        if (
          result.network !== "botchain" ||
          !/^0x[\da-f]{40}$/i.test(result.address)
        ) {
          throw new Error("The BOT Chain address could not be verified.");
        }
        if (!abort.signal.aborted)
          setAccount({ owner, address: result.address });
      } catch {
        if (!abort.signal.aborted)
          setFailure(
            "We couldn't load your BOT Chain address. Retry before sending funds.",
          );
      }
    }
    void load();
    return () => abort.abort();
  }, [isAuthenticated, isBot, owner, attempt]);

  const address = isBot
    ? account?.owner === owner
      ? account.address
      : ""
    : wallet?.walletAddress || wallet?.address || user?.walletAddress || "";

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy. Select and copy the address below.");
    }
  }

  return (
    <AuthGuard>
      <section className="home-background min-h-screen px-5 py-6 text-white">
        <div className="mx-auto max-w-lg">
          <header className="mb-8 flex items-center gap-4">
            <Link
              href="/home"
              aria-label="Back to wallet"
              className="rounded-lg p-2 hover:bg-white/5"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-semibold">Receive crypto</h1>
          </header>
          <label
            htmlFor="receive-network"
            className="mb-2 block text-sm text-gray-300"
          >
            Receiving network
          </label>
          <select
            id="receive-network"
            value={selected.id}
            onChange={(event) => setChain(event.target.value)}
            className="mb-6 w-full rounded-xl border border-[#0795B0] bg-[#0A0E0E] p-3 text-white"
          >
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border border-[#0795B0]/40 bg-[#0A0E0E] p-5 text-center">
            <h2 className="mb-2 text-lg font-medium">
              Your {selected.name} address
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              Send only {selected.assets} using the {selected.name} network.
            </p>
            {address ? (
              <>
                <div className="mx-auto w-fit rounded-xl bg-white p-4">
                  <QRCodeSVG
                    value={address}
                    size={200}
                    level="H"
                    title={`${selected.name} receiving address: ${address}`}
                  />
                </div>
                <p
                  className="mt-5 break-all rounded-lg bg-white/5 p-3 text-left font-mono text-sm"
                  data-testid="receive-address"
                >
                  {address}
                </p>
                <button
                  type="button"
                  onClick={() => copy(address)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-4 py-3 font-medium hover:bg-[#0684A0]"
                >
                  <Copy size={20} /> Copy {selected.name} address
                </button>
                <a
                  href={`${selected.explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm text-[#52D4E7] hover:underline"
                >
                  View on explorer
                </a>
              </>
            ) : failure && isBot ? (
              <div role="alert" className="py-6">
                <p className="text-sm text-amber-200">{failure}</p>
                <button
                  type="button"
                  onClick={() => setAttempt((value) => value + 1)}
                  className="mt-4 rounded-lg border border-[#0795B0] px-5 py-2 text-[#52D4E7]"
                >
                  Retry
                </button>
              </div>
            ) : (
              <p role="status" className="py-12 text-sm text-gray-400">
                Loading your {selected.name} address…
              </p>
            )}
            {isBot && (
              <p className="mt-5 text-sm leading-6 text-gray-400">
                Use this same BOT Chain address for USDT and BOT. Keep some BOT
                here to pay network fees. Your Base and Arbitrum address is
                different.
              </p>
            )}
          </div>
          {(user?.phoneNumber || user?.email) && (
            <div className="mt-6 space-y-3 text-sm">
              <p className="text-gray-400">
                Other NexusPay users can also send to you using:
              </p>
              {[user?.phoneNumber, user?.email].filter(Boolean).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => copy(value!)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-left"
                >
                  <span className="break-all">{value}</span>
                  <Copy size={18} className="shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </AuthGuard>
  );
}
