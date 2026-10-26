"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { getPostAuthPath } from "@/lib/auth";
import {
  formatPhoneNumberToE164,
  validateE164PhoneNumber,
} from "@/lib/phone-utils";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20 disabled:opacity-50";
const primary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-4 py-3.5 font-semibold text-white transition hover:bg-[#07869e] disabled:cursor-not-allowed disabled:opacity-50";
const errorMessage = (error: any) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  "Sign-in could not complete. Please try again.";

export default function Login() {
  const { login, verifyLogin } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [businessSetup, setBusinessSetup] = useState(false);
  const submitting = useRef(false);
  const codeInput = useRef<HTMLInputElement>(null);
  const normalizedPhone = formatPhoneNumberToE164(phone);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(
    () => setBusinessSetup(getPostAuthPath() === "/signup/business"),
    [],
  );
  useEffect(() => {
    if (step !== "code") return;
    codeInput.current?.focus();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);

  async function requestCode() {
    if (submitting.current) return;
    setError("");
    if (!validateE164PhoneNumber(normalizedPhone)) {
      setError(
        "Enter your phone number, including the country code for numbers outside Kenya.",
      );
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const response = await login({ phoneNumber: normalizedPhone, password });
      if (!response.success || response.data?.smsFailure)
        throw new Error(
          "We couldn’t send your code. Wait a minute and try again.",
        );
      if (response.data?.token) {
        setPassword("");
        router.replace(getPostAuthPath());
        return;
      }
      setPhone(normalizedPhone);
      setCode("");
      setVisible(false);
      setStep("code");
      setResendAt(Date.now() + 60000);
      setNow(Date.now());
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step === "credentials") return requestCode();
    if (submitting.current || !/^\d{6}$/.test(code)) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await verifyLogin({ phoneNumber: normalizedPhone, otp: code });
      setPassword("");
      router.replace(getPostAuthPath());
    } catch (failure) {
      setError(errorMessage(failure));
      codeInput.current?.focus();
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="min-h-[80dvh] bg-[#0A0E0E] px-5 py-8 sm:py-14">
      <div className="mx-auto max-w-md">
        <Link
          href="/onboarding"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="rounded-3xl border border-white/10 bg-[#0E1617] p-6 sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-[#39BED3]">NexusPay</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {step === "code" ? "Check your messages" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {step === "code"
                ? `Enter the 6-digit code sent to ${normalizedPhone}.`
                : "Sign in with your phone number and password."}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
            {step === "credentials" ? (
              <>
                <div>
                  <label
                    htmlFor="login-phone"
                    className="mb-2 block text-sm text-white/75"
                  >
                    Phone number
                  </label>
                  <input
                    id="login-phone"
                    type="tel"
                    autoComplete="username"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0712 345 678 or +254…"
                    className={field}
                    disabled={busy}
                    required
                  />
                  <p className="mt-2 text-xs text-white/40">
                    Use the number linked to your NexusPay account.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="text-sm text-white/75"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgotpassword"
                      className="text-xs text-[#39BED3] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={visible ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${field} pr-12`}
                      disabled={busy}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      aria-label={visible ? "Hide password" : "Show password"}
                      aria-pressed={visible}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55"
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label
                  htmlFor="login-code"
                  className="mb-2 block text-sm text-white/75"
                >
                  Verification code
                </label>
                <input
                  ref={codeInput}
                  id="login-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={`${field} text-center text-2xl tracking-[0.4em]`}
                  disabled={busy}
                  required
                />
                <p className="mt-2 text-xs text-white/40">
                  You can paste the whole code. It expires in 5 minutes.
                </p>
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-400/10 p-3 text-sm leading-5 text-red-200"
              >
                {error}
              </p>
            )}
            <button
              className={primary}
              disabled={
                busy ||
                (step === "code"
                  ? code.length !== 6
                  : !phone.trim() || !password)
              }
            >
              {busy && <Loader2 size={17} className="animate-spin" />}
              {busy
                ? step === "code"
                  ? "Verifying…"
                  : "Signing in…"
                : step === "code"
                  ? "Verify and sign in"
                  : "Sign in"}
            </button>
          </form>
          {step === "code" ? (
            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep("credentials");
                  setCode("");
                  setError("");
                }}
                className="text-white/55 hover:text-white"
              >
                Change number
              </button>
              <button
                type="button"
                disabled={busy || remaining > 0}
                onClick={requestCode}
                className="text-[#39BED3] disabled:text-white/35"
              >
                {remaining ? `Resend in ${remaining}s` : "Resend code"}
              </button>
            </div>
          ) : (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-white/35">
                <span className="h-px flex-1 bg-white/10" />
                or
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <GoogleSignIn mode="login" />
              <p className="mt-6 text-center text-sm text-white/55">
                New to NexusPay?{" "}
                <Link
                  className="text-[#39BED3] hover:underline"
                  href={
                    businessSetup ? "/signup?next=/signup/business" : "/signup"
                  }
                >
                  Create an account
                </Link>
              </p>
            </>
          )}
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/35">
          <ShieldCheck size={14} />
          {step === "code"
            ? "Never share your verification code."
            : "Your account stays protected with SMS verification."}
        </p>
      </div>
    </section>
  );
}
