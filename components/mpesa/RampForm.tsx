"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { rampAPI, type RampMode, type RampPayment } from "@/lib/ramp";
import { formatPhoneNumberToE164 } from "@/lib/phone-utils";
import { amountUnits } from "@/lib/amounts";
import api from "@/lib/api";

const field =
  "w-full rounded-xl border border-white/10 bg-[#141E20] px-4 py-3.5 text-sm text-white outline-none focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20 disabled:opacity-50";
const primary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#06849C] disabled:cursor-not-allowed disabled:opacity-40";
const message = (error: any) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  "Unable to complete this request. Please try again.";
const titles = {
  buy: "Add money with M-Pesa",
  withdraw: "Withdraw to M-Pesa",
  bills: "Pay a till or paybill",
};
const descriptions = {
  buy: "Pay in KES and receive stablecoins in your wallet.",
  withdraw: "Choose how much to withdraw and where to send it.",
  bills: "Pay a Kenyan business from your stablecoin balance.",
};

export function RampForm({ mode }: { mode: RampMode }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [chain, setChain] = useState("arbitrum");
  const [asset, setAsset] = useState("USDC");
  const [targetType, setTargetType] = useState("till");
  const [targetNumber, setTargetNumber] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [payment, setPayment] = useState<RampPayment | null>(null);
  const locked = useRef(false);
  const requestKey = useRef<string | null>(null);
  const storageKey = `nexuspay-ramp:${user?.id || user?.walletAddress}:${mode}`;
  const capabilities = useQuery({
    queryKey: ["ramp-capabilities"],
    queryFn: ({ signal }) => rampAPI.capabilities(signal),
    staleTime: 30000,
    retry: 1,
  });
  const enabled =
    capabilities.data?.modes[mode] === true && !capabilities.isError;
  const networks = capabilities.data?.networks || [];
  const selected = networks.find((network) => network.id === chain);
  useEffect(() => {
    if (user?.phoneNumber) setPhone(user.phoneNumber);
  }, [user?.phoneNumber]);
  useEffect(() => {
    if (networks.length && !networks.some((network) => network.id === chain))
      setChain(networks[0].id);
  }, [networks, chain]);
  useEffect(() => {
    if (selected?.tokens.length && !selected.tokens.includes(asset))
      setAsset(selected.tokens[0]);
  }, [selected, asset]);
  useEffect(() => {
    if (!user) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (saved?.key) {
        requestKey.current = saved.key;
        if (saved.payment?.transactionId) setPayment(saved.payment);
        else setUncertain(true);
      }
    } catch {
      /* Storage is optional; a started request stays locked in this tab. */
    }
  }, [storageKey, user]);
  const wallet = useQuery({
    queryKey: ["ramp-balance", user?.walletAddress, chain],
    enabled: !!user && enabled && mode !== "buy",
    queryFn: async ({ signal }) => {
      const response = await api.get(`/token/balance/${chain}`, {
        signal,
        params: { refresh: true },
      });
      if (!response.data.success || !response.data.data.exactBalances)
        throw new Error("Balance unavailable");
      return response.data.data.exactBalances as Record<string, string>;
    },
    staleTime: 15000,
    retry: 1,
  });
  const balance = wallet.isError ? undefined : wallet.data?.[asset];
  const amountValid =
    mode === "withdraw"
      ? (amountUnits(amount, 6) ?? BigInt(0)) > BigInt(0)
      : /^\d+$/.test(amount) &&
        Number(amount) >= 10 &&
        Number(amount) <= 150000;
  const phoneValid = /^\+254[17]\d{8}$/.test(formatPhoneNumberToE164(phone));
  const destinationValid =
    mode === "bills"
      ? /^\d{5,7}$/.test(targetNumber) &&
        (targetType === "till" || !!account.trim())
      : phoneValid;
  const quote = useQuery({
    queryKey: ["ramp-quote", mode, chain, asset, amount],
    enabled:
      review && enabled && amountValid && !submitting && !uncertain && !payment,
    queryFn: ({ signal }) =>
      rampAPI.quote({ mode, chain, tokenType: asset, amount }, signal),
    retry: false,
    refetchInterval: 30000,
  });
  const feeUnits = amountUnits(quote.data?.serviceFee || "0", 6) ?? BigInt(0);
  const debitUnits = amountUnits(quote.data?.cryptoAmount || "", 6);
  const balanceUnits = balance === undefined ? null : amountUnits(balance, 6);
  const enough =
    mode === "buy" ||
    (debitUnits !== null &&
      balanceUnits !== null &&
      debitUnits + feeUnits <= balanceUnits);
  const ready =
    enabled &&
    quote.data &&
    !quote.isError &&
    !quote.isFetching &&
    Date.parse(quote.data.expiresAt) > Date.now() &&
    enough;
  const status = useQuery({
    queryKey: ["ramp-status", payment?.transactionId],
    enabled: !!payment?.transactionId,
    queryFn: () => rampAPI.status(payment!.transactionId),
    refetchInterval: (query) =>
      ["completed", "failed", "error", "review"].includes(
        query.state.data?.status || "",
      )
        ? false
        : 4000,
    retry: 1,
  });
  const recovery = useQuery({
    queryKey: ["ramp-recovery", storageKey, requestKey.current],
    enabled: uncertain && !!requestKey.current,
    queryFn: () => rampAPI.recover(requestKey.current!),
    refetchInterval: 5000,
    retry: false,
  });
  useEffect(() => {
    if (!uncertain || !recovery.data?.payment?.transactionId) return;
    const recovered = recovery.data.payment;
    setPayment(recovered);
    setUncertain(false);
    setError("");
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ key: requestKey.current, payment: recovered }),
      );
    } catch {}
  }, [recovery.data, uncertain, storageKey]);
  const current = status.data || payment;
  const completed = current?.status === "completed";
  const failed = ["failed", "error", "review"].includes(current?.status || "");

  function edit() {
    setReview(false);
    setPassword("");
    setVisible(false);
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      locked.current ||
      !ready ||
      !quote.data ||
      (mode !== "buy" && !password)
    )
      return;
    locked.current = true;
    setSubmitting(true);
    setError("");
    const key = requestKey.current || crypto.randomUUID();
    requestKey.current = key;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ key }));
    } catch {}
    try {
      const input = {
        chain,
        tokenType: asset,
        ...(mode === "buy"
          ? {
              amount: quote.data.fiatAmount,
              phone: formatPhoneNumberToE164(phone),
            }
          : mode === "withdraw"
            ? { amount, phone: formatPhoneNumberToE164(phone), password }
            : {
                amount: quote.data.fiatAmount,
                cryptoAmount: Number(quote.data.cryptoAmount),
                targetType,
                targetNumber,
                accountNumber:
                  targetType === "paybill" ? account.trim() : undefined,
                password,
              }),
      };
      const result = await rampAPI.submit(mode, input, key);
      setPayment(result);
      setReview(false);
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ key, payment: result }),
        );
      } catch {}
    } catch (failure: any) {
      const http = failure?.response?.status;
      const preflight =
        [400, 401, 403, 422, 429].includes(http) &&
        !failure?.response?.data?.error?.paymentStarted;
      if (preflight) {
        requestKey.current = null;
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
      } else setUncertain(true);
      setError(message(failure));
    } finally {
      setPassword("");
      setVisible(false);
      setSubmitting(false);
      locked.current = false;
    }
  }
  if (payment || uncertain)
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0E1617] p-6 text-white sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#0795B0]/15 text-[#39BED3]">
          {completed ? <Check /> : <Clock3 />}
        </div>
        <h2 className="text-xl font-semibold">
          {completed
            ? mode === "buy"
              ? "Money added"
              : "Payment completed"
            : failed
              ? "Payment needs attention"
              : uncertain
                ? "Checking your payment"
                : mode === "buy"
                  ? "Check your M-Pesa phone"
                  : "Payment in progress"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          {completed
            ? "Your payment has been confirmed."
            : failed
              ? "We could not complete this payment. Check its status before trying again."
              : uncertain
                ? "The connection ended before we received a final response. Do not make another payment. Check your transaction history or contact support with the reference below."
                : mode === "buy"
                  ? "Enter your M-Pesa PIN on your phone. We’ll update this screen when your stablecoins arrive."
                  : "Your request is being processed. Keep this reference until the recipient has received the payment."}
        </p>
        <div className="my-6 rounded-xl bg-white/[0.04] p-4">
          <p className="text-xs text-white/40">Payment reference</p>
          <p className="mt-1 break-all font-mono text-xs text-white/75">
            {payment?.transactionId || requestKey.current}
          </p>
        </div>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-200">
            {error}
          </p>
        )}
        {status.isError && (
          <p role="status" className="mb-4 text-sm text-white/55">
            Status is temporarily unavailable. Your payment has not been
            retried.
          </p>
        )}
        <Link className={primary} href="/transactions">
          View transactions
        </Link>
        {payment && !completed && (
          <button
            type="button"
            className="mt-4 w-full text-sm text-[#39BED3]"
            disabled={status.isFetching}
            onClick={() => void status.refetch()}
          >
            Refresh status
          </button>
        )}
        {completed && (
          <button
            type="button"
            className="mt-4 w-full text-sm text-white/55"
            onClick={() => {
              try {
                sessionStorage.removeItem(storageKey);
              } catch {}
              requestKey.current = null;
              setPayment(null);
              setAmount("");
              edit();
            }}
          >
            Start a new payment
          </button>
        )}
      </section>
    );
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0E1617] p-6 text-white sm:p-8">
      <div className="mb-6">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#0795B0]/15 text-[#39BED3]">
          {mode === "buy" ? (
            <ArrowDownLeft size={21} />
          ) : mode === "withdraw" ? (
            <ArrowUpRight size={21} />
          ) : (
            <Smartphone size={21} />
          )}
        </div>
        <h2 className="text-xl font-semibold">
          {review ? "Review payment" : titles[mode]}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/50">
          {review
            ? "Check the amount and destination before confirming."
            : descriptions[mode]}
        </p>
      </div>
      {!enabled && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/65"
        >
          {capabilities.isPending
            ? "Checking M-Pesa availability…"
            : capabilities.isError
              ? "We couldn’t check M-Pesa availability. Please try again."
              : capabilities.data?.message ||
                "This M-Pesa option is not available yet."}
          <button
            type="button"
            onClick={() => void capabilities.refetch()}
            className="mt-2 block text-[#39BED3]"
          >
            Check availability
          </button>
        </div>
      )}
      {capabilities.data?.sandbox && enabled && (
        <p className="mb-4 text-xs text-amber-200">
          Sandbox · test payments only
        </p>
      )}
      {review ? (
        <form onSubmit={submit} className="space-y-5">
          <dl className="space-y-4 rounded-xl bg-white/[0.03] p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">
                {mode === "buy" ? "You pay" : "You send"}
              </dt>
              <dd className="text-right">
                {mode === "buy"
                  ? `${amount} KES`
                  : quote.data
                    ? `${quote.data.cryptoAmount} ${asset}`
                    : "Calculating…"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">
                {mode === "buy" ? "Estimated receive" : "Recipient receives"}
              </dt>
              <dd className="text-right">
                {quote.data
                  ? mode === "buy"
                    ? `${quote.data.cryptoAmount} ${asset}`
                    : `${quote.data.fiatAmount.toLocaleString()} KES`
                  : "Calculating…"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">NexusPay fee</dt>
              <dd>
                {quote.data
                  ? `${quote.data.serviceFee} ${asset}`
                  : "Calculating…"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">
                {mode === "bills"
                  ? targetType === "till"
                    ? "Till number"
                    : "Paybill"
                  : "M-Pesa phone"}
              </dt>
              <dd>
                {mode === "bills"
                  ? targetNumber
                  : formatPhoneNumberToE164(phone)}
              </dd>
            </div>
            {mode === "bills" && targetType === "paybill" && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Account</dt>
                <dd className="break-all text-right">{account}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Wallet network</dt>
              <dd>{selected?.name}</dd>
            </div>
          </dl>
          <p className="text-xs leading-5 text-white/40">
            {mode === "buy"
              ? "Approve the M-Pesa prompt on your phone. Never enter your M-Pesa PIN here."
              : "Wallet transfers also require network gas. Keep ETH available on the selected network."}
          </p>
          {mode !== "buy" && (
            <div>
              <label
                htmlFor="ramp-password"
                className="mb-2 block text-sm text-white/65"
              >
                NexusPay password
              </label>
              <div className="relative">
                <input
                  id="ramp-password"
                  type={visible ? "text" : "password"}
                  className={`${field} pr-12`}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={submitting}
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
          )}
          {quote.isError && (
            <p role="alert" className="text-sm text-red-200">
              {message(quote.error)}{" "}
              <button
                type="button"
                onClick={() => void quote.refetch()}
                className="text-[#39BED3]"
              >
                Refresh quote
              </button>
            </p>
          )}
          {quote.data && !enough && (
            <p role="alert" className="text-sm text-red-200">
              Your balance does not cover this amount and the NexusPay fee.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-200">
              {error}
            </p>
          )}
          <button
            className={primary}
            disabled={!ready || submitting || (mode !== "buy" && !password)}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting
              ? "Submitting…"
              : mode === "buy"
                ? "Send M-Pesa prompt"
                : "Confirm payment"}
          </button>
          <button
            type="button"
            disabled={submitting}
            className="w-full text-sm text-white/50"
            onClick={edit}
          >
            Edit payment
          </button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (enabled && amountValid && destinationValid) {
              setError("");
              setReview(true);
            }
          }}
          className="space-y-5"
        >
          {mode === "bills" && (
            <>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">
                {["till", "paybill"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={targetType === type}
                    onClick={() => setTargetType(type)}
                    className={`rounded-lg px-4 py-2.5 text-sm ${targetType === type ? "bg-[#0795B0] text-white" : "text-white/55"}`}
                  >
                    {type === "till" ? "Buy goods · Till" : "Paybill"}
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="ramp-target"
                  className="mb-2 block text-sm text-white/65"
                >
                  {targetType === "till" ? "Till number" : "Paybill number"}
                </label>
                <input
                  id="ramp-target"
                  className={field}
                  inputMode="numeric"
                  value={targetNumber}
                  onChange={(event) =>
                    setTargetNumber(
                      event.target.value.replace(/\D/g, "").slice(0, 7),
                    )
                  }
                  required
                />
              </div>
              {targetType === "paybill" && (
                <div>
                  <label
                    htmlFor="ramp-account"
                    className="mb-2 block text-sm text-white/65"
                  >
                    Account number
                  </label>
                  <input
                    id="ramp-account"
                    className={field}
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    maxLength={50}
                    required
                  />
                </div>
              )}
            </>
          )}
          <div>
            <label
              htmlFor="ramp-amount"
              className="mb-2 block text-sm text-white/65"
            >
              {mode === "withdraw" ? `Amount (${asset})` : "Amount (KES)"}
            </label>
            <input
              id="ramp-amount"
              className={`${field} text-2xl`}
              inputMode={mode === "withdraw" ? "decimal" : "numeric"}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              required
            />
            <p className="mt-2 text-xs text-white/45">
              {mode === "buy"
                ? "Minimum 10 KES · Maximum 150,000 KES"
                : balance === undefined
                  ? "Balance will appear when this payment option is available."
                  : `Available: ${balance} ${asset}`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ramp-network"
                className="mb-2 block text-sm text-white/65"
              >
                Network
              </label>
              <select
                id="ramp-network"
                className={field}
                value={chain}
                disabled={!networks.length}
                onChange={(event) => {
                  setChain(event.target.value);
                  setAmount("");
                }}
              >
                {networks.length ? (
                  networks.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.name}
                    </option>
                  ))
                ) : (
                  <option value="arbitrum">Unavailable</option>
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="ramp-asset"
                className="mb-2 block text-sm text-white/65"
              >
                Asset
              </label>
              <select
                id="ramp-asset"
                className={field}
                value={asset}
                disabled={!selected}
                onChange={(event) => setAsset(event.target.value)}
              >
                {(selected?.tokens || ["USDC"]).map((token) => (
                  <option key={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>
          {mode !== "bills" && (
            <div>
              <label
                htmlFor="ramp-phone"
                className="mb-2 block text-sm text-white/65"
              >
                {mode === "buy"
                  ? "Pay from M-Pesa number"
                  : "Receive at M-Pesa number"}
              </label>
              <input
                id="ramp-phone"
                className={field}
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0712 345 678"
                required
              />
            </div>
          )}
          <button
            className={primary}
            disabled={
              !enabled ||
              !amountValid ||
              !destinationValid ||
              !selected ||
              (mode !== "buy" && balance === undefined)
            }
          >
            Review payment
          </button>
        </form>
      )}
    </section>
  );
}
