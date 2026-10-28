"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ExternalLink, RefreshCw } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

/**
 * Public transaction dashboard, intended for tx-dashboard.nexuspayapp.xyz.
 *
 * Password-free and read-only: it calls the unauthenticated /api/public/transactions
 * feed, which is BOT Chain–only (mainnet + testnet). Other-chain ledgers are not
 * queried here — they remain on authenticated history routes. The feed returns
 * public-safe fields only (never addresses, phones, emails or account identities)
 * and is rate limited on the backend.
 */

const REFRESH_MS = 15_000;

interface PublicTransaction {
  id: string;
  network: string;
  token: string;
  amount: string;
  direction: "incoming" | "outgoing" | null;
  status: "completed" | "pending" | "failed" | string;
  type: string;
  txHash: string | null;
  explorerUrl: string | null;
  createdAt: string;
}

const NETWORK_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All BOT networks" },
  { value: "botchain", label: "BOT Chain" },
  { value: "botchain-testnet", label: "BOT Chain Testnet" },
];

function networkName(chain: string) {
  return (
    {
      "botchain-testnet": "BOT Chain Testnet",
      botchain: "BOT Chain",
    } as Record<string, string>
  )[chain] || chain;
}

function directionDisplay(direction: PublicTransaction["direction"]) {
  if (direction === "incoming") return { label: "Received", Icon: ArrowDownLeft, style: "bg-emerald-400/10 text-emerald-300" };
  if (direction === "outgoing") return { label: "Sent", Icon: ArrowUpRight, style: "bg-[#0795B0]/10 text-[#52D4E7]" };
  return { label: "Transfer", Icon: ArrowLeftRight, style: "bg-white/5 text-white/55" };
}

function statusDisplay(status: string) {
  const statuses: Record<string, { label: string; style: string }> = {
    completed: { label: "Success", style: "text-emerald-300 bg-emerald-400/10" },
    pending: { label: "Pending", style: "text-amber-300 bg-amber-400/10" },
    processing: { label: "Processing", style: "text-[#39BED3] bg-[#0795B0]/10" },
    failed: { label: "Failed", style: "text-red-300 bg-red-400/10" },
    error: { label: "Error", style: "text-red-300 bg-red-400/10" },
    reserved: { label: "Reserved", style: "text-amber-300 bg-amber-400/10" },
  };
  return statuses[status] || { label: "Unknown", style: "text-white/60 bg-white/5" };
}

function timeDisplay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TxDashboard() {
  const [network, setNetwork] = useState("all");
  const [transactions, setTransactions] = useState<PublicTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const query = network === "all" ? "" : `?network=${encodeURIComponent(network)}`;
      const response = await fetch(`${getApiBaseUrl()}/public/transactions${query}`, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const payload = await response.json();
      if (!payload?.success || !Array.isArray(payload?.data?.transactions)) throw new Error("unexpected payload");
      setTransactions(payload.data.transactions);
      setTotal(payload.data.summary?.total ?? payload.data.transactions.length);
      setError(null);
      setUpdatedAt(new Date().toISOString());
    } catch {
      setError("The transaction feed is unavailable right now. It keeps retrying automatically.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [network]);

  useEffect(() => {
    setLoading(true);
    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <main className="min-h-screen bg-[#070B0B] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">NexusPay transactions</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/55">
              Public, read-only feed of NexusPay payments on BOT Chain mainnet and testnet. No account or
              password required.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-white/45" role="status">
              {updatedAt
                ? `Updated ${new Date(updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Loading…"}
            </span>
            <button
              type="button"
              onClick={() => void load()}
              aria-label="Refresh transactions"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/55 hover:bg-white/5 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        <nav aria-label="Filter by network" className="flex flex-wrap gap-2 py-4">
          {NETWORK_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={network === filter.value}
              onClick={() => setNetwork(filter.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                network === filter.value
                  ? "bg-[#0795B0] text-white"
                  : "bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </nav>

        <section
          aria-label="Public transaction feed"
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E1617]"
        >
          <div
            aria-hidden="true"
            className="hidden border-b border-white/5 px-6 py-2.5 text-xs text-white/40 md:grid md:grid-cols-[150px_minmax(0,1fr)_150px_110px_80px] md:gap-4"
          >
            <span>Time</span>
            <span>Amount</span>
            <span>Network</span>
            <span>Status</span>
            <span>Tx</span>
          </div>

          {loading ? (
            <div role="status" aria-label="Loading transactions" className="divide-y divide-white/5 px-5">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex animate-pulse items-center gap-3 py-4">
                  <div className="h-5 w-24 rounded bg-white/10" />
                  <div className="ml-auto h-5 w-28 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : error && transactions.length === 0 ? (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 px-5 py-8">
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-lg border border-[#0795B0]/40 px-4 py-2 text-sm text-[#39BED3]"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <p role="status" className="px-5 py-10 text-center text-sm text-white/50">
              No transactions match this filter yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {transactions.map((transaction) => {
                const direction = directionDisplay(transaction.direction);
                const status = statusDisplay(transaction.status);
                const signed =
                  transaction.direction === "incoming"
                    ? `+${transaction.amount}`
                    : transaction.direction === "outgoing"
                      ? `-${transaction.amount}`
                      : transaction.amount;
                return (
                  <li
                    key={transaction.id}
                    className="grid grid-cols-[minmax(0,1fr)] items-center gap-2 px-4 py-3 md:grid-cols-[150px_minmax(0,1fr)_150px_110px_80px] md:gap-4 md:px-6"
                  >
                    <span className="hidden text-sm text-white/60 md:block">{timeDisplay(transaction.createdAt)}</span>

                    <span className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 md:flex-nowrap md:gap-4">
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${direction.style}`}>
                        <direction.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {direction.label}
                      </span>
                      <span className="text-sm font-medium tabular-nums">
                        {signed} {transaction.token}
                      </span>
                      <span className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-white/45 md:hidden">
                        <span className="truncate">
                          {networkName(transaction.network)} · {timeDisplay(transaction.createdAt)}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 ${status.style}`}>{status.label}</span>
                          {transaction.explorerUrl ? (
                            <a
                              href={transaction.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View transaction on explorer"
                              className="inline-flex items-center gap-1 text-[#52D4E7] hover:underline"
                            >
                              View <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="text-white/30" title="Not yet confirmed on-chain">
                              —
                            </span>
                          )}
                        </span>
                      </span>
                    </span>

                    <span className="hidden truncate text-sm text-white/60 md:block">
                      {networkName(transaction.network)}
                    </span>

                    <span className={`hidden w-fit rounded-full px-2 py-1 text-xs md:block ${status.style}`}>
                      {status.label}
                    </span>

                    <span className="hidden md:block">
                      {transaction.explorerUrl ? (
                        <a
                          href={transaction.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View transaction on explorer"
                          className="inline-flex items-center gap-1 text-xs text-[#52D4E7] hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-xs text-white/30" title="Not yet confirmed on-chain">
                          —
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-white/40">
          Showing the {transactions.length} newest of {total.toLocaleString()} recorded transactions, refreshed
          automatically every 15 seconds. This feed publishes transaction metadata only — no wallet addresses,
          phone numbers, emails or account identities.
        </p>
        {error && transactions.length > 0 && (
          <p role="alert" className="mt-2 text-xs text-amber-300">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
