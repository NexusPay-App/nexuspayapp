"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  Plus,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { Transaction } from "@/types/transaction-types";

function networkName(chain: string) {
  return (
    (
      {
        "botchain-testnet": "BOT Chain Testnet",
        botchain: "BOT Chain",
        arbitrum: "Arbitrum",
        base: "Base",
        ethereum: "Ethereum",
        stellar: "Stellar",
      } as Record<string, string>
    )[chain] || chain
  );
}

function transactionLabel(transaction: Transaction) {
  if (transaction.direction === "incoming")
    return { label: "Received", Icon: ArrowDownLeft };
  if (transaction.direction === "outgoing")
    return { label: "Sent", Icon: ArrowUpRight };
  if (transaction.type === "fiat_to_crypto")
    return { label: "Crypto purchase", Icon: Plus };
  if (transaction.type === "crypto_to_fiat")
    return { label: "Withdrawal", Icon: ArrowUpRight };
  if (
    transaction.type === "crypto_to_paybill" ||
    transaction.type === "crypto_to_till"
  )
    return { label: "Payment", Icon: CreditCard };
  if (transaction.transactionSubType === "received")
    return { label: "Received", Icon: ArrowDownLeft };
  if (transaction.transactionSubType === "sent")
    return { label: "Sent", Icon: ArrowUpRight };
  return { label: "Transfer", Icon: ArrowLeftRight };
}

function statusDisplay(status: string) {
  const statuses: Record<string, { label: string; style: string }> = {
    completed: { label: "Success", style: "text-emerald-300 bg-emerald-400/10" },
    pending: { label: "Pending", style: "text-amber-300 bg-amber-400/10" },
    processing: {
      label: "Processing",
      style: "text-[#39BED3] bg-[#0795B0]/10",
    },
    failed: { label: "Failed", style: "text-red-300 bg-red-400/10" },
    error: { label: "Error", style: "text-red-300 bg-red-400/10" },
    reserved: { label: "Reserved", style: "text-amber-300 bg-amber-400/10" },
  };
  return (
    statuses[status] || { label: "Unknown", style: "text-white/60 bg-white/5" }
  );
}

function dateLabel(transaction: Transaction) {
  const date = new Date(transaction.timing.createdAt);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function shortHash(hash?: string) {
  if (!hash) return "—";
  return hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "completed", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
] as const;

export const TransactionHistory: React.FC = () => {
  const {
    transactions,
    summary,
    loading,
    loadingMore,
    error,
    loadMore,
    refreshTransactions,
    updateFilters,
    clearFilters,
    currentFilters,
    hasMore,
  } = useTransactionHistory();

  const [selected, setSelected] = useState<Transaction | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="divide-y divide-white/5 px-4 sm:px-5">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="flex animate-pulse items-center gap-3 py-4"
            >
              <div className="h-9 w-9 rounded-full bg-white/5" />
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-20 rounded bg-white/5" />
              </div>
              <div className="ml-auto h-3 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/5 px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">
              Couldn&apos;t load transactions
            </p>
            <p className="mt-1 text-sm text-white/50">{error}</p>
          </div>
          <button
            type="button"
            onClick={refreshTransactions}
            className="rounded-lg border border-[#0795B0]/40 px-4 py-2 text-sm text-[#39BED3] hover:bg-white/5"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const activeStatus = currentFilters.status || "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-white">All activity</h2>
          {summary && (
            <p className="mt-0.5 text-xs text-white/45">
              {summary.total} total · showing {transactions.length}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refreshTransactions}
          disabled={loading}
          aria-label="Refresh transactions"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Status filter */}
      <div
        className="flex gap-2 overflow-x-auto border-b border-white/5 px-4 py-3 sm:px-5"
        role="tablist"
        aria-label="Filter by status"
      >
        {STATUS_FILTERS.map((option) => {
          const active = activeStatus === option.value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (option.value) updateFilters({ status: option.value });
                else clearFilters();
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-[#39BED3] bg-[#0795B0]/15 text-white"
                  : "border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="flex items-center gap-4 px-5 py-8">
          <Receipt className="h-8 w-8 text-[#39BED3]" />
          <div>
            <p className="text-sm font-medium text-white">No transactions yet</p>
            <p className="mt-1 text-sm text-white/50">
              Payments will appear here once you get started.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_minmax(0,1fr)_20px] gap-4 border-b border-white/5 px-5 py-2.5 text-xs text-white/40 md:grid"
          >
            <span>Transaction</span>
            <span>Network</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          <ul className="divide-y divide-white/5">
            {transactions.map((transaction) => {
              const { label, Icon } = transactionLabel(transaction);
              const status = statusDisplay(transaction.status);
              return (
                <li key={transaction.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(transaction)}
                    aria-label={`View details: ${label}, ${transaction.token.amount} ${transaction.token.symbol}`}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0795B0] sm:px-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_minmax(0,1fr)_20px] md:gap-4"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0795B0]/10 text-[#39BED3]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">
                          {label}
                        </span>
                        <span className="mt-1 block text-xs text-white/45">
                          {dateLabel(transaction)}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-white/45 md:hidden">
                          {networkName(transaction.blockchain.chain)}
                        </span>
                      </span>
                    </span>
                    <span className="hidden text-sm text-white/60 md:block">
                      {networkName(transaction.blockchain.chain)}
                    </span>
                    <span
                      className={`hidden w-fit rounded-full px-2 py-1 text-xs md:block ${status.style}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-medium tabular-nums text-white">
                        {transaction.token.amount} {transaction.token.symbol}
                      </span>
                      <span className="mt-1 hidden text-xs tabular-nums text-white/40 md:block">
                        {transaction.values.usd.formatted}
                      </span>
                      <span
                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] md:hidden ${status.style}`}
                      >
                        {status.label}
                      </span>
                    </span>
                    <ChevronRight className="hidden h-4 w-4 text-white/30 md:block" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {hasMore && (
        <div className="border-t border-white/5 px-4 py-4 text-center sm:px-5">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-[#0795B0]/40 px-5 py-2.5 text-sm font-medium text-[#39BED3] transition hover:bg-white/5 disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {/* Details — only the essentials */}
      {selected && (
        <Dialog open onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent
            aria-describedby={undefined}
            className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0E0E] p-6 text-white"
          >
            <DialogTitle className="mb-1 text-lg font-semibold">
              Transaction details
            </DialogTitle>
            <p className="mb-5 text-sm text-white/50">
              {transactionLabel(selected).label} ·{" "}
              {networkName(selected.blockchain.chain)}
            </p>

            <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-white/45">Amount</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {selected.token.amount} {selected.token.symbol}
              </p>
              <p className="mt-1 text-sm text-white/50">
                {selected.values.usd.formatted}
                {selected.values.kes?.formatted
                  ? ` · ${selected.values.kes.formatted}`
                  : ""}
              </p>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/45">Status</dt>
                <dd>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${statusDisplay(selected.status).style}`}
                  >
                    {statusDisplay(selected.status).label}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/45">Date</dt>
                <dd className="text-right text-white/85">
                  {new Date(selected.timing.createdAt).toLocaleString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/45">Network</dt>
                <dd className="text-white/85">
                  {networkName(selected.blockchain.chain)}
                </dd>
              </div>
              {selected.dashboard?.summary && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-white/45">Note</dt>
                  <dd className="text-right text-white/85">
                    {selected.dashboard.summary}
                  </dd>
                </div>
              )}
              {selected.mpesa?.receiptNumber && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">M-Pesa receipt</dt>
                  <dd className="font-mono text-white/85">
                    {selected.mpesa.receiptNumber}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/45">Hash</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-xs text-white/70">
                    {shortHash(selected.blockchain.txHash)}
                  </span>
                  <button
                    type="button"
                    aria-label="Copy transaction hash"
                    onClick={() => copy(selected.blockchain.txHash)}
                    className="rounded p-1 text-[#39BED3] hover:bg-white/5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex gap-3 border-t border-white/10 pt-4">
              {selected.blockchain.explorerUrl && (
                <a
                  href={selected.blockchain.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0795B0] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0684A0]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Explorer
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionHistory;
