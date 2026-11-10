"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Fingerprint,
  Loader2,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import api from "@/lib/api";

type Passkey = { id: string };
type Session = {
  id: string;
  device: string;
  createdAt: string;
  current: boolean;
};
const primary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#0795B0] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#07869e] disabled:opacity-50";

function usePasskeys() {
  const { user } = useAuth();
  return useQuery<Passkey[]>({
    queryKey: ["account-passkeys", user?.id],
    queryFn: async () => {
      const response = await api.get("/auth/passkeys");
      const passkeys = response.data?.data;
      if (!Array.isArray(passkeys))
        throw new Error("Invalid passkey status response");
      return passkeys;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
    retry: 1,
    refetchOnMount: "always",
  });
}
function deviceName(agent: string) {
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /OPR\//.test(agent)
      ? "Opera"
      : /Firefox\//.test(agent)
        ? "Firefox"
        : /Chrome\//.test(agent)
          ? "Chrome"
          : /Safari\//.test(agent)
            ? "Safari"
            : "Browser";
  const device = /iPhone/.test(agent)
    ? "iPhone"
    : /iPad/.test(agent)
      ? "iPad"
      : /Android/.test(agent)
        ? "Android"
        : /Windows/.test(agent)
          ? "Windows"
          : /Macintosh/.test(agent)
            ? "Mac"
            : /Linux/.test(agent)
              ? "Linux"
              : "Unknown device";
  return `${browser} · ${device}`;
}

export function AccountSecurityNotice() {
  const keys = usePasskeys();
  const [open, setOpen] = useState(false);
  return (
    <>
      {keys.isSuccess && keys.data.length === 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] px-3.5 py-3 text-left text-rose-200 transition hover:bg-rose-300/10 focus-visible:outline-2 focus-visible:outline-rose-200"
        >
          <ShieldCheck size={17} className="shrink-0" />
          <span className="flex-1 text-sm font-medium">
            Secure your account
          </span>
          <ArrowRight size={16} />
        </button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto rounded-2xl border-white/10 bg-[#0E1617] p-6 text-white sm:p-7">
          <DialogTitle className="sr-only">Secure your account</DialogTitle>
          <DialogDescription className="sr-only">
            Add device verification to protect sensitive actions.
          </DialogDescription>
          <AccountSecurityPanel onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AccountSecurityPanel({
  onDone,
}: {
  onDone?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const client = useQueryClient();
  const keys = usePasskeys();
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [reauth, setReauth] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const sessions = useQuery<Session[]>({
    queryKey: ["account-sessions", user?.id],
    queryFn: async () => (await api.get("/auth/sessions")).data.data,
    enabled: devicesOpen && !!user?.id,
  });
  const secured = !!keys.data?.length;
  async function enroll() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (secured) {
        const options = (await api.post("/auth/passkeys/verify/options", {}))
          .data.data;
        const response = await startAuthentication({
          optionsJSON: options.options,
        });
        await api.post("/auth/passkeys/verify", {
          challengeId: options.challengeId,
          response,
        });
      }
      const options = (
        await api.post(
          "/auth/passkeys/register/options",
          password ? { currentPassword: password } : {},
        )
      ).data.data;
      setPassword("");
      const response = await startRegistration({
        optionsJSON: options.options,
      });
      await api.post("/auth/passkeys/register/verify", {
        challengeId: options.challengeId,
        response,
      });
      await client.invalidateQueries({
        queryKey: ["account-passkeys", user?.id],
      });
      setComplete(true);
      setReauth(false);
    } catch (failure) {
      const e = failure as {
        name?: string;
        cause?: { name?: string };
        response?: {
          data?: {
            message?: string;
            error?: { code?: string; message?: string };
          };
        };
      };
      if (e.response?.data?.error?.code === "REAUTH_REQUIRED") {
        setReauth(true);
        if (password) setError("That password didn’t match. Try again.");
      } else if (
        e.name === "InvalidStateError" ||
        e.cause?.name === "InvalidStateError"
      ) {
        setError(
          "This device already has a passkey. Choose another device in the browser prompt.",
        );
      } else if (
        e.name === "NotAllowedError" ||
        e.cause?.name === "NotAllowedError"
      ) {
        setError("Setup cancelled. You can try again whenever you’re ready.");
      } else {
        setError(
          e.response?.data?.error?.message ||
            e.response?.data?.message ||
            "Couldn’t finish setup. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id?: string) {
    setBusy(true);
    setError("");
    try {
      await api.post(
        id ? `/auth/sessions/${id}/revoke` : "/auth/sessions/revoke-all",
        {},
      );
      if (!id || sessions.data?.find((s) => s.id === id)?.current)
        router.replace("/login");
      else await sessions.refetch();
    } catch {
      setError("Couldn’t sign out that device. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="text-white">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0795B0]/15 text-[#39BED3]">
        {secured || complete ? (
          <ShieldCheck size={25} />
        ) : (
          <Fingerprint size={25} />
        )}
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        {keys.isPending
          ? "Checking passkeys"
          : keys.isError
            ? "Passkey status unavailable"
            : complete
              ? "Passkey added"
              : secured
                ? "Passkey is set up"
                : "Set up a passkey"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/60">
        {keys.isPending
          ? "Loading your current passkey status."
          : keys.isError
            ? "We couldn’t confirm whether a passkey is active."
            : complete || secured
              ? "Use your device’s fingerprint, face or PIN to approve sensitive actions."
              : "Set up with this device’s fingerprint, face or PIN."}
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm leading-5 text-rose-200">
          {error}
        </p>
      )}
      {keys.isPending ? (
        <p role="status" className="mt-5 text-sm text-white/60">
          Checking your account…
        </p>
      ) : keys.isError ? (
        <div className="mt-5">
          <button
            type="button"
            className={`${primary} mt-4`}
            disabled={keys.isFetching}
            onClick={() => void keys.refetch()}
          >
            {keys.isFetching ? "Checking…" : "Try again"}
          </button>
        </div>
      ) : (
        <>
          {reauth && (
            <div className="mt-5">
              <p className="mb-3 text-sm text-white/70">
                Confirm it’s you to finish setup.
              </p>
              {user?.hasPassword ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void enroll();
                  }}
                >
                  <label
                    htmlFor="security-password"
                    className="mb-2 block text-sm"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="security-password"
                    autoComplete="current-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3"
                    visibilityButtonClassName="text-[#39BED3] opacity-100 hover:text-white"
                  />
                  <button
                    disabled={busy || !password}
                    className={`${primary} mt-4`}
                  >
                    {busy ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Fingerprint size={17} />
                    )}
                    Continue
                  </button>
                </form>
              ) : user?.authMethods?.includes("google") ? (
                <GoogleSignIn
                  mode="continue"
                  onCredential={async (credential) => {
                    await api.post("/auth/reauth", {
                      reauthGoogleToken: credential,
                    });
                    await enroll();
                  }}
                  onError={setError}
                />
              ) : (
                <p className="text-sm text-white/60">
                  Sign in again to confirm your identity.
                </p>
              )}
            </div>
          )}
          {!reauth && (
            <button
              disabled={busy}
              onClick={() => (complete && onDone ? onDone() : void enroll())}
              className={`${primary} mt-6`}
            >
              {busy ? (
                <Loader2 size={17} className="animate-spin" />
              ) : complete && onDone ? (
                <Check size={17} />
              ) : (
                <Fingerprint size={17} />
              )}
              {busy
                ? "Follow your device prompt…"
                : complete && onDone
                  ? "Back to wallet"
                  : secured
                    ? "Add another passkey"
                    : "Set up a passkey"}
            </button>
          )}
          {!secured && !reauth && (
            <p className="mt-3 text-center text-xs text-white/40">
              Creates a passkey. No new password to remember.
            </p>
          )}
        </>
      )}
      {onDone && !complete && (
        <button
          disabled={busy}
          onClick={onDone}
          className="mt-3 w-full py-2 text-sm text-white/55 hover:text-white"
        >
          Not now
        </button>
      )}
      {!onDone && (
        <section className="mt-7 border-t border-white/10 pt-5">
          <button
            onClick={() => setDevicesOpen((v) => !v)}
            aria-expanded={devicesOpen}
            aria-controls="signed-in-devices"
            className="flex w-full items-center gap-3 text-left text-sm text-white/80"
          >
            <Monitor size={17} />
            <span className="flex-1">Signed-in devices</span>
            <ChevronDown
              size={17}
              className={devicesOpen ? "rotate-180" : ""}
            />
          </button>
          {devicesOpen && (
            <div id="signed-in-devices" className="mt-3">
              {sessions.isPending && (
                <p className="py-3 text-sm text-white/60">Loading devices…</p>
              )}
              {sessions.isError && (
                <button
                  onClick={() => void sessions.refetch()}
                  className="py-3 text-sm text-rose-200"
                >
                  Couldn’t load devices. Retry
                </button>
              )}
              {sessions.data?.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-b border-white/5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm">
                      {deviceName(s.device)}
                      {s.current && (
                        <span className="ml-2 text-xs text-[#39BED3]">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Signed in{" "}
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => void revoke(s.id)}
                    className="shrink-0 text-xs text-white/60 hover:text-rose-200 disabled:opacity-50"
                  >
                    Sign out
                  </button>
                </div>
              ))}
              {!!sessions.data?.length && (
                <button
                  disabled={busy}
                  onClick={() => void revoke()}
                  className="mt-4 text-sm text-rose-200 disabled:opacity-50"
                >
                  Sign out all devices
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
