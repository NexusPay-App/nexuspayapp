"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { PasswordInput } from "@/components/ui/password-input";
import { getPostAuthPath } from "@/lib/auth";
import {
  formatPhoneNumberToE164,
  validateE164PhoneNumber,
} from "@/lib/phone-utils";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20 disabled:opacity-50";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [businessSetup, setBusinessSetup] = useState(false);
  const submitting = useRef(false);
  useEffect(
    () => setBusinessSetup(getPostAuthPath() === "/signup/business"),
    [],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    const phoneNumber = formatPhoneNumberToE164(phone);
    if (!validateE164PhoneNumber(phoneNumber)) {
      setError(
        "Enter your phone number, including the country code for numbers outside Kenya.",
      );
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const response = await login({ phoneNumber, password });
      if (!response.success || !response.data?.sessionActive)
        throw new Error("Sign-in could not complete. Please try again.");
      setPassword("");
      router.replace(getPostAuthPath());
    } catch (failure) {
      const e = failure as {
        message?: string;
        response?: {
          data?: { message?: string; error?: { message?: string } };
        };
      };
      setError(
        e.response?.data?.error?.message ||
          e.response?.data?.message ||
          e.message ||
          "Sign-in could not complete. Please try again.",
      );
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
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Sign in to your wallet.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678 or +254…"
                className={field}
                disabled={busy}
                required
              />
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
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
                disabled={busy}
                required
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-400/10 p-3 text-sm leading-5 text-red-200"
              >
                {error}
              </p>
            )}
            <button
              disabled={busy || !phone.trim() || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-4 py-3.5 font-semibold text-white transition hover:bg-[#07869e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <Loader2 size={17} className="animate-spin" />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <GoogleSignIn mode="login" />
          <p className="mt-6 text-center text-sm text-white/55">
            New to NexusPay?{" "}
            <Link
              href={businessSetup ? "/signup?next=/signup/business" : "/signup"}
              className="font-medium text-[#39BED3] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
