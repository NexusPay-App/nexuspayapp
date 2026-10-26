"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useCrypto } from "@/hooks/useCrypto";
import { usePaymentNetworks } from "@/hooks/usePaymentNetworks";
import { botAPI, isBotNetwork } from "@/lib/botchain";
import { amountUnits } from "@/lib/amounts";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const field =
  "w-full rounded-xl border border-white/10 bg-[#141E20] px-4 py-3.5 text-sm text-white outline-none focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20 disabled:opacity-50";
const primary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#06849C] disabled:cursor-not-allowed disabled:opacity-40";
const message = (error: any) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  "Payment could not complete. Please try again.";

export function PayMerchantForm({
  initialMerchantId = "",
}: {
  initialMerchantId?: string;
}) {
  const { user } = useAuth();
  const {
    payMerchant,
    payMerchantLoading,
    payMerchantData,
    payFormData,
    updatePayForm,
    resetPayForm,
  } = useCrypto();
  const {
    chainName: chain,
    tokenSymbol: symbol,
    merchantId,
    amount,
  } = payFormData;
  const { networks, tokens } = usePaymentNetworks(chain);
  const supportedTokens = isBotNetwork(chain)
    ? tokens.filter((token) => token.symbol === "USDT")
    : tokens;
  const [merchant, setMerchant] = useState<{
    merchantId: string;
    businessName: string;
  } | null>(null);
  const [review, setReview] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    if (initialMerchantId) updatePayForm("merchantId", initialMerchantId);
  }, [initialMerchantId, updatePayForm]);
  useEffect(() => {
    if (
      supportedTokens.length &&
      !supportedTokens.some((token) => token.symbol === symbol)
    )
      updatePayForm("tokenSymbol", supportedTokens[0].symbol);
  }, [supportedTokens, symbol, updatePayForm]);
  const wallet = useQuery({
    queryKey: ["payment-balance", user?.walletAddress, chain],
    enabled: !!user,
    queryFn: async ({ signal }) => {
      if (isBotNetwork(chain)) {
        const data = await botAPI.balance(chain, signal);
        return {
          address: data.address,
          balances: Object.fromEntries(
            data.balances.map((token) => [token.symbol, token.balance]),
          ) as Record<string, string>,
        };
      }
      const { data } = await api.get(`/token/balance/${chain}`, {
        signal,
        params: { refresh: true },
      });
      if (!data.success || !data.data.exactBalances)
        throw new Error("Balance unavailable");
      return {
        address: data.data.walletAddress as string,
        balances: data.data.exactBalances as Record<string, string>,
      };
    },
    staleTime: 15000,
    retry: 1,
  });
  const balance = wallet.isError ? undefined : wallet.data?.balances[symbol];
  const decimals =
    supportedTokens.find((token) => token.symbol === symbol)?.decimals ?? 6;
  const units = amountUnits(amount, decimals);
  const available =
    balance === undefined ? null : amountUnits(balance, decimals);
  const overBalance = units !== null && available !== null && units > available;
  const fee = useQuery({
    queryKey: [
      "merchant-fee",
      user?.walletAddress,
      chain,
      merchant?.merchantId,
      amount,
      symbol,
    ],
    enabled: review && !!merchant && isBotNetwork(chain) && !payMerchantLoading,
    queryFn: ({ signal }) => {
      if (!isBotNetwork(chain)) throw new Error("Unsupported network");
      return botAPI.quote(
        chain,
        { merchantId: merchant!.merchantId, amount, tokenSymbol: symbol },
        signal,
      );
    },
    retry: false,
    refetchInterval: 30000,
  });
  const feeReady =
    !isBotNetwork(chain) ||
    (!!fee.data &&
      !fee.isFetching &&
      !fee.isError &&
      Date.parse(fee.data.expiresAt) > Date.now());
  const canReview =
    !!merchantId.trim() &&
    units !== null &&
    units > BigInt(0) &&
    available !== null &&
    !overBalance &&
    !wallet.isFetching &&
    !!supportedTokens.find((token) => token.symbol === symbol) &&
    !!networks.find((network) => network.id === chain && network.transfers !== false);

  async function openReview(event: FormEvent) {
    event.preventDefault();
    if (!canReview || busy.current) return;
    busy.current = true;
    setChecking(true);
    setError("");
    try {
      const response = await api.get(
        `/business/find/${encodeURIComponent(merchantId.trim())}`,
      );
      if (!response.data.success || !response.data.data?.businessName)
        throw new Error("Merchant not found. Check the merchant ID.");
      setMerchant({
        merchantId: response.data.data.merchantId,
        businessName: response.data.data.businessName,
      });
      setReview(true);
    } catch (failure) {
      setError(message(failure));
    } finally {
      busy.current = false;
      setChecking(false);
    }
  }
  async function confirm(event: FormEvent) {
    event.preventDefault();
    if (
      busy.current ||
      !merchant ||
      !password ||
      !wallet.data?.address ||
      !feeReady
    )
      return;
    busy.current = true;
    setError("");
    try {
      const response = await payMerchant({
        senderAddress: wallet.data.address,
        merchantId: merchant.merchantId,
        chainName: chain,
        tokenSymbol: symbol,
        amount,
        confirm: true,
        password,
        ...(isBotNetwork(chain)
          ? { maxNetworkFee: fee.data!.maxNetworkFee }
          : {}),
      });
      if (!response?.success)
        throw new Error(response?.message || "Payment could not complete.");
      setReview(false);
      setResult(true);
    } catch (failure) {
      setError(message(failure));
    } finally {
      busy.current = false;
      setPassword("");
      setVisible(false);
    }
  }
  if (result && payMerchantData) {
    const payment = payMerchantData.data.botPayment;
    const confirmed = payment
      ? payment.status === "confirmed"
      : payMerchantData.success;
    const failed = payment?.status === "failed";
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0E1617] p-6 text-white sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#0795B0]/15 text-[#39BED3]">
          {confirmed ? <Check /> : <Clock3 />}
        </div>
        <h2 className="text-xl font-semibold">
          {confirmed
            ? "Payment confirmed"
            : failed
              ? "Payment failed"
              : "Payment submitted"}
        </h2>
        <p className="mt-2 text-sm text-white/55">
          {confirmed
            ? `Paid ${merchant?.businessName}.`
            : failed
              ? payment?.failureReason
              : "Waiting for the network. Your payment will continue even if you leave this page."}
        </p>
        <p className="my-6 text-3xl font-semibold">
          {amount} <span className="text-lg text-white/50">{symbol}</span>
        </p>
        {payment?.actualNetworkFee && (
          <p className="mb-4 text-sm text-white/55">
            Network fee paid: {payment.actualNetworkFee} BOT
          </p>
        )}
        {payment?.explorerUrl && (
          <a
            className="mb-5 inline-flex items-center gap-1 text-sm text-[#39BED3]"
            href={payment.explorerUrl}
            target="_blank"
            rel="noreferrer"
          >
            View on explorer <ArrowUpRight size={15} />
          </a>
        )}
        <Link className={primary} href="/transactions">
          View transactions
        </Link>
        {(confirmed || failed) && (
          <button
            className="mt-4 w-full text-sm text-white/55"
            onClick={() => {
              setResult(false);
              resetPayForm();
              setMerchant(null);
            }}
          >
            Make another payment
          </button>
        )}
      </div>
    );
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0E1617] p-6 text-white sm:p-8">
      <h2 className="text-xl font-semibold">Pay a business</h2>
      <p className="mb-6 mt-2 text-sm text-white/50">
        Enter a merchant ID. You’ll see the business name before paying.
      </p>
      <form onSubmit={openReview} className="space-y-5">
        <div>
          <label
            className="mb-2 block text-sm text-white/65"
            htmlFor="merchant-id"
          >
            Merchant ID
          </label>
          <input
            id="merchant-id"
            className={field}
            value={merchantId}
            onChange={(event) =>
              updatePayForm("merchantId", event.target.value)
            }
            autoComplete="off"
            placeholder="Enter merchant ID"
            maxLength={100}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="mb-2 block text-sm text-white/65"
              htmlFor="merchant-network"
            >
              Network
            </label>
            <select
              id="merchant-network"
              className={field}
              value={chain}
              onChange={(event) => {
                updatePayForm("chainName", event.target.value);
                updatePayForm("amount", "");
              }}
            >
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="mb-2 block text-sm text-white/65"
              htmlFor="merchant-asset"
            >
              Asset
            </label>
            <select
              id="merchant-asset"
              className={field}
              value={symbol}
              onChange={(event) => {
                updatePayForm("tokenSymbol", event.target.value);
                updatePayForm("amount", "");
              }}
            >
              {supportedTokens.map((token) => (
                <option key={token.symbol}>{token.symbol}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            className="mb-2 block text-sm text-white/65"
            htmlFor="merchant-amount"
          >
            Amount
          </label>
          <input
            id="merchant-amount"
            className={`${field} text-2xl`}
            inputMode="decimal"
            value={amount}
            onChange={(event) => updatePayForm("amount", event.target.value)}
            placeholder="0.00"
            required
          />
          <p className="mt-2 text-xs text-white/45">
            {balance === undefined
              ? "Balance unavailable"
              : `Available: ${balance} ${symbol}`}
          </p>
          {overBalance && (
            <p role="alert" className="mt-2 text-sm text-red-200">
              Amount exceeds your available balance.
            </p>
          )}
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-400/10 p-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}
        {networks.find((network) => network.id === chain)?.transfers === false && (
          <p role="status" className="text-sm text-amber-200/80">Payments on this network are temporarily unavailable. Choose another network.</p>
        )}
        <button className={primary} disabled={!canReview || checking}>
          {checking && <Loader2 size={16} className="animate-spin" />}
          {checking ? "Finding business…" : "Review payment"}
        </button>
      </form>
      <Dialog
        open={review}
        onOpenChange={(open) => {
          if (!busy.current) {
            setReview(open);
            setPassword("");
            setVisible(false);
            setError("");
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-white/10 bg-[#0E1617] p-6 text-white">
          <DialogTitle>Review payment</DialogTitle>
          <DialogDescription className="text-white/50">
            Check the business and amount before confirming.
          </DialogDescription>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-4">
            <Building2 className="text-[#39BED3]" />
            <div>
              <p className="font-medium">{merchant?.businessName}</p>
              <p className="text-xs text-white/45">{merchant?.merchantId}</p>
            </div>
          </div>
          <p className="my-2 text-3xl font-semibold">
            {amount} <span className="text-lg text-white/50">{symbol}</span>
          </p>
          <dl className="space-y-3 border-y border-white/10 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/45">Network</dt>
              <dd>{networks.find((network) => network.id === chain)?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Network fee estimate</dt>
              <dd className="break-all text-right">
                {isBotNetwork(chain)
                  ? fee.isError
                    ? "Unavailable"
                    : fee.data
                      ? `${fee.data.maxNetworkFee} BOT maximum`
                      : "Estimating…"
                  : "Calculated at send · ETH"}
              </dd>
            </div>
          </dl>
          {fee.isError && (
            <p role="alert" className="text-sm text-red-200">
              {message(fee.error)}{" "}
              <button
                type="button"
                className="text-[#39BED3]"
                onClick={() => void fee.refetch()}
              >
                Retry estimate
              </button>
            </p>
          )}
          <form className="space-y-4" onSubmit={confirm}>
            <div>
              <label
                className="mb-2 block text-sm text-white/65"
                htmlFor="merchant-password"
              >
                NexusPay password
              </label>
              <div className="relative">
                <input
                  id="merchant-password"
                  className={`${field} pr-12`}
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={payMerchantLoading}
                  required
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55"
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-200">
                {error}
              </p>
            )}
            <button
              className={primary}
              disabled={!password || payMerchantLoading || !feeReady}
            >
              {payMerchantLoading ? "Submitting payment…" : "Confirm and pay"}
            </button>
            <button
              className="w-full text-sm text-white/50"
              type="button"
              disabled={payMerchantLoading}
              onClick={() => {
                setReview(false);
                setPassword("");
                setVisible(false);
                setError("");
              }}
            >
              Edit payment
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
