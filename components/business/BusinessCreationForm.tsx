"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  Copy,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { isAxiosError } from "axios";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { businessV2API, BusinessAccount } from "@/lib/business-v2";
import { NexusLogo } from "@/constants/svg";

const QRCode = dynamic(
  () => import("qrcode.react").then((module) => module.QRCodeSVG),
  { ssr: false },
);
const categories = [
  "Professional services",
  "Retail & e-commerce",
  "Software & technology",
  "Food & hospitality",
  "Creative & media",
  "Education",
  "Health & wellness",
  "Travel & transport",
  "Manufacturing",
  "Nonprofit",
  "Other",
];
const inputClass =
  "min-h-12 w-full rounded-xl border border-white/15 bg-[#111E22] px-3.5 py-3 text-base text-white placeholder:text-[#80969C] outline-none transition-colors hover:border-white/30 focus:border-[#3EC1C8] focus:ring-2 focus:ring-[#3EC1C8]/20 disabled:opacity-60";
const primaryClass =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#087E96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#52D4E7] disabled:cursor-wait disabled:opacity-60";
const textButtonClass =
  "rounded text-sm font-medium text-[#52D4E7] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#52D4E7]";
const emptyDetails = {
  businessName: "",
  ownerName: "",
  country: "",
  city: "",
  businessType: "",
  phoneNumber: "",
};
type Details = typeof emptyDetails;
type Step = "details" | "secure" | "ready";

export function BusinessCreationForm() {
  const { user, loading, isAuthenticated } = useAuth();
  const { openCreatedBusiness } = useBusiness();
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [step, setStep] = useState<Step>("details");
  const [requestId, setRequestId] = useState("");
  const [loadedDraftKey, setLoadedDraftKey] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [now, setNow] = useState(0);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [copied, setCopied] = useState("");
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const draftKey = `nexuspay-business-setup:${user?.id || user?.email || user?.phoneNumber || ""}`;
  const draftLoaded = loadedDraftKey === draftKey;
  const retryIn = Math.max(0, Math.ceil((sentAt + 60_000 - now) / 1000));

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const defaults = {
      ...emptyDetails,
      ownerName: user.name || "",
      phoneNumber: user.phoneNumber || "",
    };
    setOtp("");
    setPin("");
    setConfirmPin("");
    setError("");
    setBusiness(null);
    setDetails(defaults);
    setStep("details");
    setRequestId(crypto.randomUUID());
    setSentAt(0);
    setNow(Date.now());
    try {
      const stored = JSON.parse(sessionStorage.getItem(draftKey) || "null");
      if (stored && Date.now() - stored.savedAt < 24 * 60 * 60_000) {
        const restored = Object.fromEntries(
          Object.entries(defaults).map(([key, value]) => [
            key,
            typeof stored.details?.[key] === "string"
              ? stored.details[key]
              : value,
          ]),
        ) as Details;
        setDetails(restored);
        if (typeof stored.requestId === "string")
          setRequestId(stored.requestId);
        if (stored.step === "secure") setStep("secure");
        if (typeof stored.sentAt === "number") setSentAt(stored.sentAt);
      }
    } catch {
      /* Setup remains usable when browser storage is unavailable. */
    }
    setLoadedDraftKey(draftKey);
  }, [draftKey, isAuthenticated]);

  useEffect(() => {
    if (!draftLoaded || !isAuthenticated || step === "ready") return;
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          details,
          requestId,
          step,
          sentAt,
          savedAt: Date.now(),
        }),
      );
    } catch {
      /* Keep the in-memory draft. */
    }
  }, [
    details,
    requestId,
    step,
    sentAt,
    draftLoaded,
    draftKey,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (step !== "secure") return;
    const currentTime = Date.now();
    setNow(currentTime);
    if (currentTime >= sentAt + 60_000) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= sentAt + 60_000) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, sentAt]);

  useEffect(() => {
    if (draftLoaded) heading.current?.focus();
  }, [step, draftLoaded]);

  function reportError(cause: unknown) {
    const status = isAxiosError(cause) ? cause.response?.status : undefined;
    setSessionExpired(status === 401);
    setError(
      isAxiosError(cause)
        ? cause.response?.data?.message ||
            cause.response?.data?.error?.message ||
            "Connection interrupted. Check your connection and try again."
        : cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
    );
  }

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (inFlight.current || (step === "secure" && retryIn > 0)) return;
    const phoneNumber = details.phoneNumber.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
      setError("Include your country code, for example +254712345678.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await businessV2API.requestUpgrade({
        requestId,
        businessName: details.businessName.trim(),
        ownerName: details.ownerName.trim(),
        businessType: details.businessType.trim(),
        location: `${details.city.trim()}, ${details.country.trim()}`,
        phoneNumber,
      });
      if (!result.success)
        throw new Error(
          result.message || "Your verification code could not be sent.",
        );
      setDetails((current) => ({ ...current, phoneNumber }));
      setOtp("");
      setSentAt(Date.now());
      setNow(Date.now());
      setStep("secure");
    } catch (cause) {
      reportError(cause);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (pin !== confirmPin) {
      setError("Your PINs do not match. Please enter them again.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await businessV2API.completeUpgrade({
        requestId,
        phoneNumber: details.phoneNumber,
        otp,
        pin,
      });
      if (
        !result.success ||
        !result.data?.business?.businessId ||
        !result.data.session?.verified
      )
        throw new Error(
          result.message || "Business setup did not finish. Please try again.",
        );
      openCreatedBusiness(result.data.business, result.data.session);
      setBusiness(result.data.business);
      setOtp("");
      setPin("");
      setConfirmPin("");
      setStep("ready");
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* No credentials are stored in the draft. */
      }
    } catch (cause) {
      reportError(cause);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setError("Copy is unavailable. Select and copy the text below.");
    }
  }

  function update(field: keyof Details, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  }

  const signedIn = isAuthenticated && Boolean(user);
  const currentStep = !signedIn ? 0 : step === "details" ? 1 : 2;
  const title = !signedIn
    ? "Your business starts here."
    : step === "details"
      ? "Make it your business."
      : step === "secure"
        ? "Secure your business wallet."
        : "Ready for your first payment.";

  return (
    <main className="min-h-[calc(100svh-90px)] bg-[#080F12] px-4 py-5 text-white sm:px-6 sm:py-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href={signedIn ? "/home" : "/onboarding"}
          aria-label="NexusPay home"
          className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#52D4E7]"
        >
          <Image
            src={NexusLogo}
            alt="NexusPay"
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>
        <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-[#B7C9CE]">
          <Building2 size={14} aria-hidden="true" /> For business
        </span>
      </header>

      <div className="mx-auto max-w-[520px] py-7 sm:py-10">
        <nav aria-label="Setup progress" className="mb-7">
          <ol className="flex items-center justify-between gap-2">
            {["Account", "Business", "Security"].map((label, index) => (
              <li
                key={label}
                aria-current={index === currentStep ? "step" : undefined}
                className={`flex items-center gap-2 text-xs sm:text-sm ${index <= currentStep ? "text-[#DAE9EC]" : "text-[#8A9EA4]"}`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs ${index < currentStep || step === "ready" ? "bg-[#3EC1C8] text-[#061316]" : index === currentStep ? "border border-[#3EC1C8] bg-[#0795B0]/15 text-[#52D4E7]" : "border border-white/15"}`}
                >
                  {index < currentStep || step === "ready" ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </nav>

        <section
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D181C] shadow-[0_16px_60px_rgba(0,0,0,0.18)]"
          aria-labelledby="business-setup-title"
          aria-busy={busy}
        >
          <div className="h-1 bg-gradient-to-r from-[#0795B0] to-[#3EC1C8]" />
          <div className="p-5 sm:p-7">
            <h1
              ref={heading}
              tabIndex={-1}
              id="business-setup-title"
              className="text-[26px] leading-tight font-semibold tracking-tight outline-none sm:text-[28px]"
            >
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#A9BCC2]">
              {!signedIn
                ? "Sign in or create an account, then set up a separate wallet for your business."
                : step === "details"
                  ? "A few details to put a name to your payments."
                  : step === "secure"
                    ? `We sent a six-digit code to ${details.phoneNumber}. Confirm it and choose your business PIN.`
                    : `${business?.businessName} is set up. Share your details to receive a payment.`}
            </p>

            {loading && !signedIn ? (
              <div
                role="status"
                className="flex items-center gap-2 py-10 text-sm text-[#A9BCC2]"
              >
                <LoaderCircle size={18} className="animate-spin" /> Checking
                your account…
              </div>
            ) : !signedIn ? (
              <div className="mt-7 space-y-5">
                <GoogleSignIn
                  mode="continue"
                  redirectTo="/signup/business"
                  onError={setError}
                />
                <div className="flex items-center gap-3 text-xs text-[#8A9EA4]">
                  <span className="h-px flex-1 bg-white/10" />
                  or
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <Link
                  href="/login?next=/signup/business"
                  className={`${primaryClass} !border !border-white/15 !bg-[#15262C] hover:!bg-[#1C343C]`}
                >
                  <Smartphone size={17} /> Continue with phone and password
                </Link>
                <p className="text-center text-sm text-[#A9BCC2]">
                  New to NexusPay?{" "}
                  <Link
                    href="/signup?next=/signup/business"
                    className={textButtonClass}
                  >
                    Create an account
                  </Link>
                </p>
                <div className="flex items-start gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-[#A9BCC2]">
                  <ShieldCheck size={18} className="shrink-0 text-[#3EC1C8]" />
                  <p>
                    One sign-in for your personal and business accounts.
                    Separate wallets to keep your money organised.
                  </p>
                </div>
              </div>
            ) : !draftLoaded ? (
              <p role="status" className="py-8 text-sm text-[#A9BCC2]">
                Loading your details…
              </p>
            ) : step === "details" ? (
              <form onSubmit={sendCode} className="mt-6 space-y-4">
                <fieldset disabled={busy} className="space-y-4">
                  <div>
                    <label
                      htmlFor="businessName"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Business name
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      autoComplete="organization"
                      required
                      minLength={2}
                      maxLength={120}
                      value={details.businessName}
                      onChange={(event) =>
                        update("businessName", event.target.value)
                      }
                      placeholder="e.g. Acacia Studio"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-[#91A8AF]">
                      The name customers will see when they pay you.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">
                    <div>
                      <label
                        htmlFor="country"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        required
                        minLength={2}
                        maxLength={60}
                        value={details.country}
                        onChange={(event) =>
                          update("country", event.target.value)
                        }
                        placeholder="Country"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        City / town
                      </label>
                      <input
                        id="city"
                        name="city"
                        autoComplete="address-level2"
                        required
                        minLength={2}
                        maxLength={55}
                        value={details.city}
                        onChange={(event) => update("city", event.target.value)}
                        placeholder="City or town"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="businessType"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Business category
                    </label>
                    <input
                      id="businessType"
                      name="businessType"
                      list="business-categories"
                      required
                      minLength={2}
                      maxLength={120}
                      value={details.businessType}
                      onChange={(event) =>
                        update("businessType", event.target.value)
                      }
                      placeholder="Search or enter a category"
                      className={inputClass}
                    />
                    <datalist id="business-categories">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-medium text-[#91A8AF]">
                      <ShieldCheck size={15} /> Account owner
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="ownerName"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Your full name
                        </label>
                        <input
                          id="ownerName"
                          name="ownerName"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={120}
                          value={details.ownerName}
                          onChange={(event) =>
                            update("ownerName", event.target.value)
                          }
                          placeholder="Full name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phoneNumber"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Verification phone number
                        </label>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          autoComplete="tel"
                          required
                          maxLength={24}
                          value={details.phoneNumber}
                          onChange={(event) =>
                            update("phoneNumber", event.target.value)
                          }
                          placeholder="+254 712 345 678"
                          aria-describedby="phone-help"
                          className={inputClass}
                        />
                        <p
                          id="phone-help"
                          className="mt-1.5 text-xs text-[#91A8AF]"
                        >
                          Include your country code. We’ll send a verification
                          code here.
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <button disabled={busy || !requestId} className={primaryClass}>
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />{" "}
                      Sending code…
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            ) : step === "secure" ? (
              <form onSubmit={createBusiness} className="mt-6 space-y-5">
                <fieldset disabled={busy} className="space-y-5">
                  <div>
                    <label
                      htmlFor="businessOtp"
                      className="mb-2 block text-sm font-medium"
                    >
                      Verification code
                    </label>
                    <input
                      id="businessOtp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      className={`${inputClass} text-center !text-2xl tracking-[0.35em]`}
                    />
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={busy || retryIn > 0}
                        onClick={() => void sendCode()}
                        className={`${textButtonClass} disabled:text-[#91A8AF] disabled:no-underline`}
                      >
                        {retryIn > 0 ? `Resend in ${retryIn}s` : "Resend code"}
                      </button>
                      <button
                        type="button"
                        className={textButtonClass}
                        onClick={() => {
                          setStep("details");
                          setOtp("");
                          setPin("");
                          setConfirmPin("");
                          setError("");
                        }}
                      >
                        Edit details
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="mb-4 flex items-start gap-3">
                      <LockKeyhole
                        size={18}
                        className="mt-0.5 shrink-0 text-[#3EC1C8]"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          Choose your business PIN
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#91A8AF]">
                          Use six digits to unlock this business account. Avoid
                          obvious numbers such as your birthday.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="businessPin"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          New PIN
                        </label>
                        <input
                          id="businessPin"
                          type={showPin ? "text" : "password"}
                          inputMode="numeric"
                          autoComplete="new-password"
                          pattern="[0-9]{6}"
                          required
                          maxLength={6}
                          value={pin}
                          onChange={(event) =>
                            setPin(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="confirmPin"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Confirm PIN
                        </label>
                        <input
                          id="confirmPin"
                          type={showPin ? "text" : "password"}
                          inputMode="numeric"
                          autoComplete="new-password"
                          pattern="[0-9]{6}"
                          required
                          maxLength={6}
                          value={confirmPin}
                          onChange={(event) =>
                            setConfirmPin(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <label className="mt-3 flex min-h-8 w-fit items-center gap-2 text-xs text-[#A9BCC2]">
                      <input
                        type="checkbox"
                        checked={showPin}
                        onChange={(event) => setShowPin(event.target.checked)}
                        className="size-4 accent-[#0795B0]"
                      />{" "}
                      Show PIN
                    </label>
                  </div>
                </fieldset>
                <button disabled={busy} className={primaryClass}>
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />{" "}
                      Creating your business…
                    </>
                  ) : (
                    <>
                      Create business wallet <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              business && (
                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-3 rounded-xl border border-[#3EC1C8]/25 bg-[#0795B0]/10 p-4">
                    <CheckCheck className="shrink-0 text-[#52D4E7]" size={22} />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold">
                        {business.businessName}
                      </p>
                      <p className="mt-1 text-xs text-[#A9BCC2]">
                        Business wallet created · PIN set
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block rounded-2xl bg-white p-4">
                      <QRCode
                        value={JSON.stringify({
                          type: "business_payment",
                          businessName: business.businessName,
                          merchantId: business.merchantId,
                          walletAddress: business.walletAddress,
                          businessType: business.businessType,
                        })}
                        size={184}
                        level="M"
                        role="img"
                        aria-label={`${business.businessName} NexusPay payment QR`}
                      />
                    </div>
                    <p className="mt-3 text-xs text-[#A9BCC2]">
                      Scan with NexusPay to pay this business.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-4">
                    <p className="text-xs text-[#91A8AF]">Merchant ID</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="select-all font-mono text-lg">
                        {business.merchantId}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void copy(business.merchantId, "merchant")
                        }
                        className={textButtonClass}
                        aria-label="Copy merchant ID"
                      >
                        {copied === "merchant" ? (
                          <Check size={18} />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                    <p className="mt-4 text-xs text-[#91A8AF]">
                      Wallet address
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void copy(business.walletAddress, "wallet")
                      }
                      className="mt-2 w-full break-all text-left font-mono text-xs leading-5 text-[#C7DCE2]"
                      aria-label="Copy wallet address"
                    >
                      {business.walletAddress}
                    </button>
                    <span
                      role="status"
                      className="mt-1 block min-h-4 text-xs text-[#52D4E7]"
                    >
                      {copied
                        ? `${copied === "merchant" ? "Merchant ID" : "Wallet address"} copied`
                        : ""}
                    </span>
                  </div>
                  <Link href="/business/home" className={primaryClass}>
                    Open business account <ArrowRight size={17} />
                  </Link>
                </div>
              )
            )}
            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm leading-6 text-rose-200"
              >
                {error}
                {sessionExpired && (
                  <Link
                    href="/login?next=/signup/business"
                    className="mt-2 block font-semibold underline"
                  >
                    Sign in to continue
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-[#91A8AF]">
          <Link
            href={signedIn ? "/home" : "/onboarding"}
            className="flex min-h-10 items-center gap-1.5 hover:text-white"
          >
            <ArrowLeft size={14} />{" "}
            {signedIn ? "Back to personal wallet" : "Back to NexusPay"}
          </Link>
          {signedIn && (
            <Link
              href="/business"
              className="flex min-h-10 items-center gap-1.5 hover:text-white"
            >
              Your businesses <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
