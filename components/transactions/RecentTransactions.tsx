"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard, Plus, ChevronRight, RefreshCw, Receipt } from 'lucide-react';
import { transactionAPI } from '@/lib/transactions';
import { Transaction } from '@/types/transaction-types';
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl } from '@/lib/config';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

function networkName(chain: string) {
  return ({ 'botchain-testnet': 'BOT Chain Testnet', botchain: 'BOT Chain', arbitrum: 'Arbitrum', base: 'Base', stellar: 'Stellar' } as Record<string, string>)[chain] || chain;
}

function transactionLabel(transaction: Transaction) {
  if (transaction.type === 'fiat_to_crypto') return { label: 'Crypto purchase', Icon: Plus };
  if (transaction.type === 'crypto_to_fiat') return { label: 'Withdrawal', Icon: ArrowUpRight };
  if (transaction.type === 'crypto_to_paybill' || transaction.type === 'crypto_to_till') return { label: 'Payment', Icon: CreditCard };
  if (transaction.transactionSubType === 'received') return { label: 'Received', Icon: ArrowDownLeft };
  if (transaction.transactionSubType === 'sent') return { label: 'Sent', Icon: ArrowUpRight };
  return { label: 'Transfer', Icon: ArrowLeftRight };
}

function statusDisplay(status: string) {
  const statuses: Record<string, { label: string; style: string }> = {
    completed: { label: 'Success', style: 'text-emerald-300 bg-emerald-400/10' },
    pending: { label: 'Pending', style: 'text-amber-300 bg-amber-400/10' },
    processing: { label: 'Processing', style: 'text-[#39BED3] bg-[#0795B0]/10' },
    failed: { label: 'Failed', style: 'text-red-300 bg-red-400/10' },
    error: { label: 'Error', style: 'text-red-300 bg-red-400/10' },
    reserved: { label: 'Reserved', style: 'text-amber-300 bg-amber-400/10' },
  };
  return statuses[status] || { label: 'Unknown', style: 'text-white/60 bg-white/5' };
}

function dateLabel(transaction: Transaction) {
  const date = new Date(transaction.timing.createdAt);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const RecentTransactions = () => {
  const { user, isAuthenticated } = useAuth();
  const identity = `${getApiBaseUrl()}:${user?.walletAddress || user?.email || user?.phoneNumber || ''}`;
  const [history, setHistory] = useState<{ owner: string; data: Transaction[] }>({ owner: '', data: [] });
  const transactions = isAuthenticated && history.owner === identity ? history.data : [];
  const generation = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    const requestGeneration = ++generation.current;
    if (!isAuthenticated) { setHistory({ owner: '', data: [] }); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const response = await transactionAPI.getHistory({ page: 1, limit: 10 });
      if (requestGeneration !== generation.current) return;
      if (!response.success || !response.data?.transactions) throw new Error('History unavailable');
      const data = response.data.transactions.slice(0, 5).map(transaction => ({ ...transaction, status: transaction.status || 'pending' }));
      setHistory({ owner: identity, data });
    } catch {
      if (requestGeneration === generation.current) setError('Unable to load your recent transactions. Please try again.');
    } finally {
      if (requestGeneration === generation.current) setLoading(false);
    }
  };

  useEffect(() => {
    setHistory({ owner: identity, data: [] });
    setSelectedTransaction(null);
    loadTransactions();
    const onTransactionsUpdated = () => { loadTransactions(); };
    window.addEventListener('nexuspay:transactions-updated', onTransactionsUpdated);
    return () => {
      generation.current++;
      window.removeEventListener('nexuspay:transactions-updated', onTransactionsUpdated);
    };
  }, [identity, isAuthenticated]);

  // Transaction Details Modal
  const TransactionDetailsModal: React.FC<{ 
    transaction: Transaction; 
    onClose: () => void; 
  }> = ({ transaction, onClose }) => {
    const { 
      type, status, token, values, blockchain, timing, dashboard, user, mpesa, conversion, statusValidation
    } = transaction;

    const getStatusColor = (status: string, transaction: Transaction) => {
      // Use the API's validated status
      const statusColors: Record<string, string> = {
        completed: 'text-green-400',
        processing: 'text-blue-400',
        pending: 'text-yellow-400',
        failed: 'text-red-400',
        error: 'text-red-500',
        reserved: 'text-orange-400',
      };
      return statusColors[status] || 'text-gray-400';
    };

    const getStatusText = (status: string, transaction: Transaction) => {
      // Use the API's validated status
      const statusTexts: Record<string, string> = {
        completed: 'Success',
        processing: 'Processing',
        pending: 'Pending',
        failed: 'Failed',
        error: 'Error',
        reserved: 'Reserved',
      };
      return statusTexts[status] || 'Unknown';
    };

    const formatDateTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    return (
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent aria-describedby={undefined} className="bg-[#0A0E0E] text-white border-[#0795B0]/40 rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="mb-2 text-xl font-semibold">Transaction details</DialogTitle>

          {/* Status Banner */}
          <div className={`p-4 rounded-lg mb-6 ${
            getStatusText(status, transaction) === 'Success' ? 'bg-green-500/20 border border-green-500' :
            getStatusText(status, transaction) === 'Pending' ? 'bg-yellow-500/20 border border-yellow-500' :
            getStatusText(status, transaction) === 'Processing' ? 'bg-blue-500/20 border border-blue-500' :
            'bg-red-500/20 border border-red-500'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${getStatusColor(status, transaction)}`}>
                {getStatusText(status, transaction) === 'Success' ? '✅' : 
                 getStatusText(status, transaction) === 'Pending' ? '⏳' : 
                 getStatusText(status, transaction) === 'Processing' ? '🔄' : '❌'}
              </div>
              <div>
                <h4 className={`text-lg font-semibold ${getStatusColor(status, transaction)}`}>
                  {getStatusText(status, transaction)}
                </h4>
                <p className="text-gray-300 text-sm">
                  {dashboard?.summary || `Transaction status: ${getStatusText(status, transaction)}`}
                </p>
                {statusValidation?.wasCorrected && (
                  <p className="text-blue-300 text-xs mt-1">
                    🔄 Status was automatically corrected based on blockchain data
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Transaction Type</h4>
                <p className="text-white font-medium capitalize">{type.replace('_', ' ')}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Token</h4>
                <p className="text-white font-medium">
                  {token.amount} {token.symbol} ({token.name})
                </p>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">Amount Values</h4>
                <div className="space-y-1">
                  <p className="text-white text-sm">{values.usd.formatted}</p>
                  <p className="text-gray-300 text-sm">{values.kes.formatted}</p>
                  <p className="text-gray-300 text-sm">{values.fiat.formatted}</p>
                </div>
              </div>

              {conversion && (
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Conversion Details</h4>
                  <div className="space-y-1">
                    <p className="text-white text-sm">{conversion.direction}</p>
                    <p className="text-gray-300 text-sm">{conversion.rateDisplay}</p>
                    <p className="text-gray-300 text-sm">Rate: {conversion.effectiveRate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Blockchain</h4>
                <p className="text-white font-medium capitalize">{blockchain.network}</p>
                <p className="text-gray-300 text-sm">{blockchain.explorerName}</p>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">Transaction Hash</h4>
                <p className="text-white font-mono text-xs break-all">{blockchain.txHash}</p>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">Timing</h4>
                <div className="space-y-1">
                  <p className="text-white text-sm">Created: {formatDateTime(timing.createdAt)}</p>
                  {timing.completedAt && (
                    <p className="text-white text-sm">Completed: {formatDateTime(timing.completedAt)}</p>
                  )}
                  <p className="text-gray-300 text-sm">Processing: {timing.processingTimeSeconds}s</p>
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">References</h4>
                <p className="text-white text-sm">ID: {transaction.id}</p>
                {mpesa?.transactionId && (
                  <p className="text-gray-300 text-sm">M-Pesa: {mpesa.transactionId}</p>
                )}
                {mpesa?.receiptNumber && (
                  <p className="text-gray-300 text-sm">Receipt: {mpesa.receiptNumber}</p>
                )}
              </div>

              {user && (
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">User Info</h4>
                  <p className="text-white text-sm">Phone: {user.phone}</p>
                  <p className="text-gray-300 text-sm">Email: {user.email}</p>
                  <p className="text-gray-300 text-sm">Wallet: {user.wallet}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-[#0795B0]">
            <a
              href={blockchain.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#0795B0] text-white py-3 px-4 rounded-lg hover:bg-[#0684A0] transition-colors duration-200 text-center"
            >
              View on Explorer
            </a>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-white">Recent transactions</h2>
        <div className="flex items-center gap-3">
          <button type="button" onClick={loadTransactions} disabled={loading} aria-label="Refresh transactions" className="flex h-8 w-8 items-center justify-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-40">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/transactions" className="inline-flex items-center gap-1 text-xs font-medium text-[#39BED3] hover:text-white sm:text-sm">View all <ChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 px-5 py-6">
          <p className="text-sm text-red-300">{error}</p>
          <button type="button" onClick={loadTransactions} className="rounded-lg border border-[#0795B0]/40 px-4 py-2 text-sm text-[#39BED3]">Try again</button>
        </div>
      ) : loading && transactions.length === 0 ? (
        <div role="status" aria-label="Loading transactions" className="divide-y divide-white/5 px-5">
          {[1, 2, 3].map(row => <div key={row} className="flex animate-pulse items-center gap-3 py-4"><div className="h-9 w-9 rounded-full bg-white/5" /><div className="h-3 w-32 rounded bg-white/10" /><div className="ml-auto h-3 w-20 rounded bg-white/10" /></div>)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex items-center gap-4 px-5 py-8">
          <Receipt className="h-8 w-8 text-[#39BED3]" />
          <div><p className="text-sm font-medium text-white">No transactions yet</p><p className="mt-1 text-sm text-white/50">Your payments will appear here once you get started.</p></div>
        </div>
      ) : (
        <>
          <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_minmax(0,1fr)_20px] gap-4 border-b border-white/5 px-5 py-2.5 text-xs text-white/40 md:grid">
            <span>Transaction</span><span>Network</span><span>Status</span><span className="text-right">Amount</span><span />
          </div>
          <ul className="divide-y divide-white/5">
            {transactions.map(transaction => {
              const { label, Icon } = transactionLabel(transaction);
              const status = statusDisplay(transaction.status);
              return (
                <li key={transaction.id}>
                  <button type="button" onClick={() => setSelectedTransaction(transaction)} aria-label={`View details: ${label}, ${transaction.token.amount} ${transaction.token.symbol}, ${status.label}`} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0795B0] sm:px-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_minmax(0,1fr)_20px] md:gap-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0795B0]/10 text-[#39BED3]"><Icon className="h-4 w-4" /></span>
                      <span className="min-w-0"><span className="block text-sm font-medium text-white">{label}</span><span className="mt-1 block text-xs text-white/45">{dateLabel(transaction)}</span><span className="mt-1 block truncate text-[11px] text-white/45 md:hidden">{networkName(transaction.blockchain.chain)}</span></span>
                    </span>
                    <span className="hidden text-sm text-white/60 md:block">{networkName(transaction.blockchain.chain)}</span>
                    <span className={`hidden w-fit rounded-full px-2 py-1 text-xs md:block ${status.style}`}>{status.label}</span>
                    <span className="text-right"><span className="block text-sm font-medium tabular-nums text-white">{transaction.token.amount} {transaction.token.symbol}</span><span className="mt-1 hidden text-xs tabular-nums text-white/40 md:block">{transaction.values.usd.formatted}</span><span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] md:hidden ${status.style}`}>{status.label}</span></span>
                    <ChevronRight className="hidden h-4 w-4 text-white/30 md:block" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {selectedTransaction && <TransactionDetailsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
    </>
  );
};
