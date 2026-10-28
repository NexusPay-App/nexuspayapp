"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Loader2, LockKeyhole, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePaymentNetworks } from '@/hooks/usePaymentNetworks';
import { useCrypto } from '@/hooks/useCrypto';
import { useAuth } from '@/context/AuthContext';
import { botAPI, isBotNetwork } from '@/lib/botchain';
import api from '@/lib/api';
import { amountUnits as units } from '@/lib/amounts';
import { validateRecipientIdentifier, normalizeRecipientPhone } from '@/lib/crypto';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';


function message(error: unknown): string {
  const failure = error as { response?: { data?: { error?: { message?: string }; message?: string } }; message?: string };
  return failure.response?.data?.error?.message || failure.response?.data?.message || failure.message || 'Unable to complete this request. Please try again.';
}

const field = 'w-full rounded-xl border border-white/20 bg-transparent [color-scheme:dark] [&>option]:bg-[#0D1718] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20 disabled:opacity-50';
const primary = 'flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#06849C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39BED3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1617] disabled:cursor-not-allowed disabled:opacity-40';

export const SendTokenForm = () => {
  const { user } = useAuth();
  const { sendToken, sendFormData, updateSendForm, resetSendForm, sendTokenLoading, sendTokenData } = useCrypto();
  const { chain, tokenType, amount, recipientIdentifier } = sendFormData;
  const { networks, tokens } = usePaymentNetworks(chain);
  const network = networks.find(item => item.id === chain);
  const token = tokens.find(item => item.symbol === tokenType);
  const native = isBotNetwork(chain) && tokenType === 'BOT';
  const [error, setError] = useState('');
  const [review, setReview] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [maxLoading, setMaxLoading] = useState(false);
  const [gasReserve, setGasReserve] = useState('');
  const sending = useRef(false);
  const maxRequest = useRef<AbortController | null>(null);

  const wallet = useQuery({
    queryKey: ['send-balance', user?.walletAddress, chain],
    enabled: !!user && !!network,
    queryFn: async ({ signal }) => {
      if (isBotNetwork(chain)) {
        const data = await botAPI.balance(chain, signal);
        return { address: data.address, balances: Object.fromEntries(data.balances.map(row => [row.symbol, row.balance])) as Record<string, string> };
      }
      const response = await api.get(`/token/balance/${chain}`, { signal, params: { refresh: true } });
      if (!response.data.success || !response.data.data.exactBalances) throw new Error('Your balance could not be verified. Refresh to try again.');
      return { address: response.data.data.walletAddress as string, balances: response.data.data.exactBalances as Record<string, string> };
    },
    staleTime: 15_000, refetchInterval: review || showResult ? false : 30_000, retry: 1,
  });
  const balance = wallet.isError ? undefined : wallet.data?.balances[tokenType];
  const decimals = token?.decimals ?? 6;
  const amountUnits = units(amount, decimals);
  const balanceUnits = balance === undefined ? null : units(balance, decimals);
  const overBalance = amountUnits !== null && balanceUnits !== null && amountUnits > balanceUnits;
  const recipient = normalizeRecipientPhone(recipientIdentifier.trim());
  const validRecipient = validateRecipientIdentifier(recipient) && !/^G[A-Z2-7]{55}$/.test(recipient);
  const fee = useQuery({
    queryKey: ['send-fee', user?.walletAddress, chain, tokenType, amount, recipient],
    enabled: review && isBotNetwork(chain) && !sendTokenLoading,
    queryFn: ({ signal }) => {
      if (!isBotNetwork(chain)) throw new Error('Unsupported network');
      return botAPI.quote(chain, { recipientIdentifier: recipient, amount, tokenSymbol: tokenType }, signal);
    },
    retry: false, staleTime: 15_000, refetchInterval: 30_000,
  });
  const feeRequired = isBotNetwork(chain);
  const feeReady = !feeRequired || (!!fee.data && !fee.isError && !fee.isFetching && Date.parse(fee.data.expiresAt) > Date.now());
  const canReview = !!network && network.transfers !== false && !!token && !!wallet.data?.address && balanceUnits !== null && amountUnits !== null && amountUnits > BigInt(0) && !overBalance && validRecipient && !maxLoading && !wallet.isFetching;

  useEffect(() => {
    if (tokens.length && !tokens.some(item => item.symbol === tokenType)) updateSendForm('tokenType', tokens.find(item => item.symbol === 'USDT')?.symbol || tokens[0].symbol);
  }, [tokens, tokenType, updateSendForm]);
  useEffect(() => () => maxRequest.current?.abort(), []);

  const change = (name: keyof typeof sendFormData, value: string) => {
    maxRequest.current?.abort();
    setMaxLoading(false);
    setGasReserve('');
    setError('');
    if (name === 'chain' || name === 'tokenType') updateSendForm('amount', '');
    updateSendForm(name, value);
  };

  const useMax = async () => {
    if (native && !validRecipient) { setError('Enter the recipient first so we can estimate the BOT network fee.'); return; }
    const controller = new AbortController();
    maxRequest.current?.abort();
    maxRequest.current = controller;
    setMaxLoading(true);
    setError('');
    try {
      if (native && isBotNetwork(chain)) {
        const quote = await botAPI.max(chain, recipient, controller.signal);
        if (controller.signal.aborted) return;
        updateSendForm('amount', quote.amount);
        setGasReserve(quote.gasReserve);
      } else {
        const fresh = await wallet.refetch();
        if (controller.signal.aborted) return;
        const available = fresh.data?.balances[tokenType];
        if (fresh.isError || available === undefined) throw new Error('Your balance could not be verified. Refresh to try again.');
        updateSendForm('amount', available);
      }
    } catch (failure) { if (!controller.signal.aborted) setError(message(failure)); }
    finally { if (maxRequest.current === controller) setMaxLoading(false); }
  };

  const openReview = (event: FormEvent) => {
    event.preventDefault();
    if (!canReview) return;
    setError('');
    updateSendForm('recipientIdentifier', recipient);
    updateSendForm('amount', amount.replace(/^0+(?=\d)/, ''));
    setPasswordVisible(false);
    setReview(true);
  };

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current || !password.trim() || !wallet.data?.address) return;
    if (!feeReady) { setError('Refresh the network fee before confirming.'); void fee.refetch(); return; }
    sending.current = true;
    setError('');
    try {
      const response = await sendToken({ recipientIdentifier: recipient, amount, senderAddress: wallet.data.address, chain, tokenSymbol: tokenType, password, ...(feeRequired ? { maxNetworkFee: fee.data!.maxNetworkFee } : {}) });
      if (!response?.success) throw new Error(response?.message || 'Payment could not be submitted. Check your transaction history before retrying.');
      setReview(false);
      setShowResult(true);
      void wallet.refetch();
    } catch (failure) { setError(message(failure)); }
    finally { setPasswordVisible(false); setPassword(''); sending.current = false; }
  };

  if (showResult && sendTokenData) {
    const payment = sendTokenData.data;
    const status = payment.botStatus || payment.transaction?.status;
    const confirmed = status === 'confirmed' || status === 'success' || status === 'completed';
    const failed = status === 'failed';
    return <section className="w-full text-white" aria-live="polite">
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full ${failed ? 'bg-red-400/10 text-red-300' : 'bg-[#0795B0]/15 text-[#39BED3]'}`}>
        {confirmed ? <Check size={24} /> : failed ? <span className="text-2xl">×</span> : <Loader2 className="animate-spin" size={24} />}
      </div>
      <h2 className="text-2xl font-semibold">{confirmed ? 'Payment confirmed' : failed ? 'Payment failed' : 'Payment submitted'}</h2>
      <p className="mt-2 text-sm leading-6 text-white/55">{confirmed ? 'Your transfer is complete.' : failed ? sendTokenData.message : 'Waiting for network confirmation. You can safely leave this page and follow the payment in your history.'}</p>
      <p className="mt-7 break-all text-3xl font-semibold tracking-tight">{payment.amount} <span className="text-lg text-white/50">{payment.tokenSymbol}</span></p>
      <p className="mt-3 break-all text-sm text-white/65">To {payment.recipient.identifier || payment.recipient.address}</p>
      <p className="mt-1 text-sm text-white/40">{networks.find(item => item.id === payment.chain)?.name || payment.chain}</p>
      {payment.actualNetworkFee && <p className="mt-4 text-sm text-white/65">Network fee paid: {payment.actualNetworkFee} BOT</p>}
      {payment.explorerUrl && <a className="mt-5 inline-flex items-center gap-1 text-sm text-[#39BED3]" href={payment.explorerUrl} target="_blank" rel="noopener noreferrer">View on explorer <ArrowUpRight size={16} /></a>}
      <Link href="/home" className={`${primary} mt-8`}>Back to wallet</Link>
      {(confirmed || failed) && <button type="button" onClick={() => { resetSendForm(); setShowResult(false); void wallet.refetch(); setGasReserve(''); setError(''); }} className="mt-4 w-full text-sm text-white/60">Make another payment</button>}
    </section>;
  }

  return <section className="w-full text-white">
    <form onSubmit={openReview} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label htmlFor="chain" className="mb-2 block text-xs font-medium text-white/55">Network</label>
          <select id="chain" className={field} value={chain} onChange={event => change('chain', event.target.value)} disabled={!networks.length}>
            {!networks.length && <option>Loading networks…</option>}
            {networks.map(item => <option key={item.id} value={item.id}>{item.name}{item.transfers === false ? ' · Unavailable' : ''}</option>)}
          </select>
        </div>
        <div><label htmlFor="tokenType" className="mb-2 block text-xs font-medium text-white/55">Asset</label>
          <select id="tokenType" className={field} value={tokenType} onChange={event => change('tokenType', event.target.value)} disabled={!tokens.length}>
            {!tokens.length && <option>Loading…</option>}
            {tokens.map(item => <option key={item.symbol} value={item.symbol}>{item.symbol}</option>)}
          </select>
        </div>
      </div>
      <div><label htmlFor="recipientIdentifier" className="mb-2 block text-sm font-medium">Recipient</label>
        <input id="recipientIdentifier" className={field} value={recipientIdentifier} onChange={event => change('recipientIdentifier', event.target.value)} placeholder="Phone, email or wallet address" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={254} required aria-describedby="recipient-help" />
        <p id="recipient-help" className="mt-2 text-xs leading-5 text-white/40">Use a NexusPay phone or email, or an address on {network?.name || 'this network'}.</p>
      </div>
      <div className="rounded-2xl border border-white/20 bg-transparent p-4 focus-within:border-[#0795B0]/70">
        <label htmlFor="amount" className="block text-sm font-medium text-white/65">Amount</label>
        <div className="mt-2 flex items-center gap-3">
          <input id="amount" type="text" inputMode="decimal" autoComplete="off" className="min-w-0 flex-1 bg-transparent py-1 text-3xl font-medium tracking-tight text-white outline-none placeholder:text-white/20 sm:text-4xl" placeholder="0.00" value={amount} onChange={event => { if (/^\d*\.?\d*$/.test(event.target.value) && event.target.value.length <= 80) change('amount', event.target.value); }} required aria-describedby="available-balance amount-error" aria-invalid={overBalance || (!!amount && amountUnits === null)} />
          <span className="text-base font-medium text-white/60">{tokenType}</span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-3 border-t border-white/5 pt-3">
          <div className="min-w-0 text-xs leading-5 text-white/50" id="available-balance" aria-live="polite">
            {wallet.isPending ? 'Checking balance…' : balance === undefined ? 'Balance unavailable' : <>Available <span className="break-all text-white/80">{balance} {tokenType}</span></>}
            <button type="button" aria-label="Refresh available balance" title="Refresh balance" disabled={wallet.isFetching || maxLoading} onClick={() => void wallet.refetch()} className="ml-2 inline-flex align-middle text-white/40 hover:text-[#39BED3] disabled:opacity-40"><RefreshCw size={12} className={wallet.isFetching ? 'animate-spin' : ''} /></button>
          </div>
          <button type="button" onClick={useMax} disabled={balanceUnits === null || balanceUnits <= BigInt(0) || maxLoading || wallet.isFetching} className="flex shrink-0 items-center gap-1 rounded-md bg-[#0795B0]/15 px-2.5 py-1 text-xs font-semibold text-[#4BC9DE] hover:bg-[#0795B0]/25 disabled:opacity-40">{maxLoading && <Loader2 size={12} className="animate-spin" />}{maxLoading ? 'Estimating…' : 'Max'}</button>
        </div>
      </div>
      <div className="space-y-2 text-xs leading-5">
        <p id="amount-error" className="text-red-300" role={overBalance ? 'alert' : undefined}>{overBalance ? `Amount exceeds your available ${tokenType} balance.` : amount && amountUnits === null ? `Use up to ${decimals} decimal places.` : ''}</p>
        <p className="text-white/45">{gasReserve ? `${gasReserve} BOT kept for network fees. The final fee may change.` : `Network fee paid separately in ${isBotNetwork(chain) ? 'BOT' : 'ETH'}. ${native ? 'Max keeps a fee reserve in your wallet.' : 'Keep a little available for gas.'}`}</p>
        {network?.transfers === false && <p role="alert" className="text-amber-200">Sending on this network is currently unavailable.</p>}
        {error && !review && <p role="alert" className="rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      </div>
      <button type="submit" className={primary} disabled={!canReview}>Review payment <ArrowRight size={16} /></button>
    </form>
    <Dialog open={review} onOpenChange={open => { if (!sending.current) { setReview(open); setPasswordVisible(false); setPassword(''); setError(''); } }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-white/10 bg-gradient-to-br from-[#102729] to-[#0D1718] p-6 text-white sm:p-7">
        <DialogTitle className="text-xl">Review payment</DialogTitle>
        <DialogDescription className="text-sm text-white/50">Check the recipient and network before confirming.</DialogDescription>
        <div className="my-3"><p className="break-all text-3xl font-semibold tracking-tight">{amount} <span className="text-lg text-white/45">{tokenType}</span></p></div>
        <dl className="space-y-4 border-y border-white/10 py-5 text-sm">
          <div><dt className="text-xs text-white/45">To</dt><dd className="mt-1 break-all">{recipient}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/45">Network</dt><dd>{network?.name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/45">Network fee estimate</dt><dd className="text-right">{feeRequired ? fee.isFetching ? 'Estimating…' : fee.isError ? 'Unavailable' : fee.data ? `${fee.data.maxNetworkFee} BOT maximum` : 'Estimating…' : 'Calculated at send · ETH'}</dd></div>
          {feeRequired && fee.data && !fee.isError && <><div className="flex justify-between gap-4"><dt className="text-white/45">Maximum BOT from wallet</dt><dd className="break-all text-right">{fee.data.totalBotDebit} BOT</dd></div><p className="text-xs leading-5 text-white/45">The actual fee may be lower. You’ll see the final fee after confirmation.</p></>}
          {feeRequired && fee.isError && <p role="alert" className="text-sm text-red-200">{message(fee.error)}</p>}
          {feeRequired && <button type="button" onClick={() => void fee.refetch()} disabled={fee.isFetching || sendTokenLoading} className="text-xs text-[#39BED3] disabled:opacity-50">Refresh fee estimate</button>}
        </dl>
        <form onSubmit={confirm} className="mt-2 space-y-4">
          <div><label htmlFor="send-password" className="mb-2 flex items-center gap-2 text-sm text-white/70"><LockKeyhole size={14} />NexusPay password</label>
            <div className="relative"><input id="send-password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" className={`${field} pr-12`} value={password} onChange={event => setPassword(event.target.value)} disabled={sendTokenLoading} required /><button type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} aria-pressed={passwordVisible} onClick={() => setPasswordVisible(value => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55 hover:text-white">{passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <Link href="/settings" className="mt-2 inline-block text-xs text-[#39BED3]">Set up or manage your password</Link>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
          <button type="submit" className={primary} disabled={sendTokenLoading || !password.trim() || !feeReady}>{sendTokenLoading ? <><Loader2 size={16} className="animate-spin" />Submitting payment…</> : 'Confirm and send'}</button>
          <button type="button" disabled={sendTokenLoading} onClick={() => { setReview(false); setPasswordVisible(false); setPassword(''); setError(''); }} className="w-full py-1 text-sm text-white/50 disabled:opacity-40">Edit payment</button>
        </form>
      </DialogContent>
    </Dialog>
  </section>;
};
