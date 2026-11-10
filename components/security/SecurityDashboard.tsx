"use client";
import { PasswordInput } from "@/components/ui/password-input";

import { useCallback, useEffect, useState } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  KeyRound,
  LogOut,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import SecurityRecords from "./SecurityRecords";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Event = {
  _id: string;
  occurredAt: string;
  action: string;
  source: string;
  outcome: string;
  actorId?: string;
  requestId?: string;
  chainId?: number;
  transactionHash?: string;
  route?: string;
  detail?: string;
};
type Incident = {
  _id: string;
  title: string;
  severity: string;
  status: string;
  delivery: string;
  createdAt: string;
};
type Overview = {
  events: number;
  denied: number;
  critical: number;
  incidents: Incident[];
  checkpoints: {
    chainId: number;
    blockNumber: number;
    status: string;
    updatedAt: string;
    coverage: string;
  }[];
  signing: string;
  independentRetentionVerified: boolean;
};
const names: Record<number, string> = {
  677: "BOT Chain",
  8453: "Base",
  42161: "Arbitrum",
  1: "Ethereum",
};
const sources: Record<string, { label: string; description: string }> = {
  server: {
    label: "Backend",
    description:
      "Recorded by the NexusPay API while handling a request or account action.",
  },
  operator: {
    label: "Administrator",
    description: "An action performed by a signed-in security administrator.",
  },
  browser: {
    label: "Browser",
    description:
      "Page activity reported by the browser; not proof of identity.",
  },
  chain: {
    label: "Blockchain",
    description: "Activity observed by the on-chain monitor.",
  },
};
const explorers: Record<number, string> = {
  677: "https://scan.botchain.ai/tx/",
  8453: "https://basescan.org/tx/",
  42161: "https://arbiscan.io/tx/",
};
const message = (error: unknown) => {
  const failure = error as {
    name?: string;
    cause?: { name?: string };
    response?: { data?: { message?: string } };
  };
  if (failure.response?.data?.message) return failure.response.data.message;
  if (
    failure.name === "NotAllowedError" ||
    failure.cause?.name === "NotAllowedError"
  )
    return "The passkey request was cancelled or timed out. If using your phone, keep both devices nearby with Bluetooth on, then retry.";
  return "Passkey verification could not finish. Check your device prompt and try again.";
};
export default function SecurityDashboard() {
  const [admin, setAdmin] = useState<{ id: string; role: string } | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Event | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [adminId, setAdminId] = useState("");
  const [bootstrap, setBootstrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [zone, setZone] = useState("Africa/Nairobi");
  const time = (value: string) =>
    new Date(value).toLocaleString("en-GB", {
      timeZone: zone,
      dateStyle: "medium",
      timeStyle: "medium",
    });
  const load = useCallback(async () => {
    const [summary, activity] = await Promise.all([
      api.get("/security/overview"),
      api.get("/security/events", { params: filter ? { action: filter } : {} }),
    ]);
    setOverview(summary.data.data);
    setEvents(activity.data.data.events);
    setCursor(activity.data.data.nextCursor);
  }, [filter]);
  useEffect(() => {
    api
      .get("/security/me")
      .then((r) => setAdmin(r.data.data))
      .catch(() => setAdmin(null));
  }, []);
  useEffect(() => {
    if (!admin) return;
    void load().catch((e) => setError(message(e)));
    const timer = setInterval(
      () => void load().catch((e) => setError(message(e))),
      30_000,
    );
    return () => clearInterval(timer);
  }, [admin, load]);
  async function signIn(enroll = false) {
    setBusy(true);
    setError("");
    try {
      if (enroll) {
        const { data } = await api.post("/security/enroll/options", {
          adminId,
          bootstrapToken: bootstrap,
        });
        const response = await startRegistration({
          optionsJSON: data.data.options,
        });
        await api.post("/security/enroll/verify", {
          challengeId: data.data.challengeId,
          response,
          bootstrapToken: bootstrap,
        });
        setBootstrap("");
        try {
          const login = await api.post("/security/login/options", { adminId });
          const authResponse = await startAuthentication({
            optionsJSON: login.data.data.options,
          });
          const result = await api.post("/security/login/verify", {
            challengeId: login.data.data.challengeId,
            response: authResponse,
          });
          setAdmin(result.data.data);
        } catch {
          setError(
            "Passkey enrolled successfully. Sign in with “Continue with passkey”.",
          );
        }
        return;
      }
      const { data } = await api.post("/security/login/options", { adminId });
      const response = await startAuthentication({
        optionsJSON: data.data.options,
      });
      const result = await api.post("/security/login/verify", {
        challengeId: data.data.challengeId,
        response,
      });
      setAdmin(result.data.data);
    } catch (e) {
      const failure = e as {
        response?: { status?: number; data?: { message?: string } };
      };
      const enrollRejected =
        enroll &&
        failure.response?.status === 403 &&
        (failure.response.data?.message ===
          "Enrollment authorization invalid or expired." ||
          !failure.response.data?.message);
      if (enrollRejected) {
        setError(
          "Enrollment code already used or invalid. If you created a passkey, sign in with “Continue with passkey”.",
        );
      } else {
        setError(message(e));
      }
    } finally {
      setBusy(false);
    }
  }
  async function acknowledge(id: string) {
    setBusy(true);
    setError("");
    try {
      await api.post(
        `/security/incidents/${encodeURIComponent(id)}/acknowledge`,
        {},
      );
      await load();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#0A0E0E] text-white">
      <header className="border-b border-white/10 bg-[#0E1617] px-5 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/security"
            aria-label="NexusPay security console"
            className="flex items-center gap-4"
          >
            <Image
              src="/svg/nexus-logo.svg"
              alt="NexusPay"
              width={165}
              height={50}
              priority
              className="h-10 w-auto sm:h-12"
            />
            <span className="hidden border-l border-white/15 pl-4 text-sm font-medium text-white/60 sm:block">
              Security & activity
            </span>
          </Link>
          {admin && (
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden text-white/60 sm:block">
                {admin.id} · {admin.role}
              </span>
              <button
                aria-label="Sign out"
                onClick={async () => {
                  try {
                    await api.post("/security/logout", {});
                    setAdmin(null);
                    setEvents([]);
                    setOverview(null);
                    setSelected(null);
                  } catch (e) {
                    setError(message(e));
                  }
                }}
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-10">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}
        {!admin ? (
          <section className="mx-auto mt-12 max-w-md rounded-2xl border border-white/10 bg-[#0E1617] p-8 shadow-sm">
            <KeyRound className="mb-6 text-[#0795B0]" size={32} />
            <h1 className="text-2xl font-semibold">
              Security administrator sign-in
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Use a passkey on your phone or computer. Unlock it with your
              fingerprint, face or device PIN. A USB key is optional.
            </p>
            <label className="mt-6 block text-sm font-medium">
              Administrator ID
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-white outline-none transition focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20"
                autoComplete="username webauthn"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
            </label>
            <button
              disabled={busy || !adminId}
              onClick={() => void signIn()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0795B0] p-3.5 font-semibold text-white transition hover:bg-[#07869e] disabled:opacity-50"
            >
              <KeyRound size={18} />
              {busy ? "Verifying…" : "Continue with passkey"}
            </button>
            <p className="mt-4 text-xs leading-5 text-white/60">
              Using your phone? Keep it nearby with Bluetooth enabled on both
              devices. Choose “Use a phone or tablet” in the browser prompt,
              then scan the QR code.
            </p>
            <details className="mt-7 text-sm">
              <summary className="cursor-pointer text-white/60">
                First-time administrator enrollment
              </summary>
              <p className="mt-4 text-sm leading-6 text-white/60">
                Enter the enrollment code provided by your administrator, then
                create a passkey on your phone or computer. This code is only
                used for initial setup.
              </p>
              <label className="mt-4 block">
                One-time enrollment code
                <PasswordInput
                  autoComplete="off"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-white outline-none transition focus:border-[#39BED3] focus:ring-2 focus:ring-[#0795B0]/20"
                  value={bootstrap}
                  onChange={(e) => setBootstrap(e.target.value)}
                />
              </label>
              <button
                disabled={busy || !adminId || !bootstrap}
                onClick={() => void signIn(true)}
                className="mt-3 w-full rounded-lg border border-[#0795B0] p-3 text-[#39BED3] disabled:opacity-50"
              >
                Create administrator passkey
              </button>
            </details>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-white/60">
                  Private operations console
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Know what is happening.
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  Account activity, wallet exceptions and monitoring health.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  aria-label="Time zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0E1617] p-2 text-sm"
                >
                  <option>Africa/Nairobi</option>
                  <option>UTC</option>
                </select>
                <button
                  aria-label="Refresh activity"
                  onClick={() => void load().catch((e) => setError(message(e)))}
                  className="rounded-lg border border-white/10 bg-[#0E1617] p-2 disabled:opacity-40"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Events · last 24 hours", overview?.events ?? "—", Activity],
                [
                  "Denied requests · last 24 hours",
                  overview?.denied ?? "—",
                  ShieldCheck,
                ],
                [
                  "Open critical incidents",
                  overview?.critical ?? "—",
                  AlertTriangle,
                ],
              ].map(([label, value, Icon]) => {
                const Symbol = Icon as typeof Activity;
                return (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-white/10 bg-[#0E1617] p-5"
                  >
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>{String(label)}</span>
                      <Symbol size={18} className="text-[#0795B0]" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold">
                      {String(value)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
              <strong>Signing migration pending.</strong> Legacy signing is
              disabled in this local build. Custody integration, owner migration
              and independent log-retention controls still require verification.
            </div>
            <section className="rounded-2xl border border-white/10 bg-[#0E1617]">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-semibold">Needs attention</h2>
                <p className="mt-2 text-sm text-white/60">
                  Acknowledge marks an alert as seen and stops repeat
                  escalation. It does not resolve the issue.
                </p>
              </div>
              <div className="divide-y divide-white/10">
                {overview?.incidents.length ? (
                  overview.incidents.map((incident) => (
                    <div
                      key={incident._id}
                      className="flex flex-wrap items-center justify-between gap-4 p-5"
                    >
                      <div>
                        <p className="font-medium">
                          {incident.title.replaceAll(".", " ")}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          {incident.severity} · {incident.status} ·
                          Notification: {incident.delivery}
                        </p>
                      </div>
                      <button
                        disabled={
                          busy ||
                          admin.role === "viewer" ||
                          incident.status !== "open"
                        }
                        onClick={() => void acknowledge(incident._id)}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                      >
                        {incident.status === "acknowledged"
                          ? "Acknowledged"
                          : "Acknowledge"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="p-5 text-sm text-white/60">
                    No open incidents recorded. Check monitoring coverage below
                    before interpreting this as an all-clear.
                  </p>
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#0E1617]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
                <h2 className="font-semibold">Activity timeline</h2>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                  <Search size={16} className="text-white/50" />
                  <input
                    aria-label="Filter by exact event name"
                    placeholder="Exact event name"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-44 bg-transparent text-sm outline-none"
                  />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs text-white/60">
                    <tr>
                      {["Time", "Event", "Source", "Outcome", ""].map(
                        (name, i) => (
                          <th key={i} className="px-5 py-3 font-medium">
                            {name}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id} className="border-t border-white/10">
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-white/60">
                          {time(event.occurredAt)}
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {event.action}
                          <span className="mt-1 block text-xs font-normal text-white/50">
                            {event.chainId
                              ? names[event.chainId]
                              : event.route ||
                                event.actorId ||
                                "Unidentified visitor"}
                          </span>
                        </td>
                        <td
                          className="px-5 py-4 text-white/60"
                          title={sources[event.source]?.description}
                        >
                          {sources[event.source]?.label || event.source}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${event.outcome === "denied" || event.outcome === "failed" ? "bg-amber-400/10 text-amber-200" : "bg-[#0795B0]/15 text-[#52D4E7]"}`}
                          >
                            {event.outcome}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelected(event)}
                            className="text-[#39BED3]"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!events.length && (
                  <p className="p-6 text-sm text-white/60">
                    No matching activity recorded.
                  </p>
                )}
              </div>
              {cursor && (
                <button
                  className="m-5 text-sm text-[#39BED3]"
                  onClick={async () => {
                    try {
                      const r = await api.get("/security/events", {
                        params: { before: cursor, action: filter || undefined },
                      });
                      setEvents([...events, ...r.data.data.events]);
                      setCursor(r.data.data.nextCursor);
                    } catch (e) {
                      setError(message(e));
                    }
                  }}
                >
                  Load more
                </button>
              )}
            </section>
            <section className="grid gap-4 md:grid-cols-3">
              {[677, 8453, 42161].map((chainId) => {
                const check = overview?.checkpoints.find(
                  (c) => c.chainId === chainId,
                );
                return (
                  <div
                    key={chainId}
                    className="rounded-xl border border-white/10 bg-[#0E1617] p-5"
                  >
                    <h2 className="font-medium">{names[chainId]}</h2>
                    <p className="mt-2 text-sm text-amber-200">
                      {check?.status || "Monitor not started"}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/60">
                      {check
                        ? `Block ${check.blockNumber} · ${time(check.updatedAt)}`
                        : "No indexed checkpoint. Live monitoring is not yet verified."}
                    </p>
                    {check && (
                      <p className="mt-2 break-words text-xs text-white/60">
                        {check.coverage}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
            <SecurityRecords role={admin.role} />
            {selected && (
              <Dialog
                open
                onOpenChange={(open) => {
                  if (!open) setSelected(null);
                }}
              >
                <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-2xl border-white/10 bg-[#0E1617] p-6 text-white">
                  <DialogTitle className="pr-8">Event details</DialogTitle>
                  <DialogDescription className="text-white/60">
                    {sources[selected.source]?.description ||
                      "Recorded security activity."}
                  </DialogDescription>
                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    {Object.entries(selected).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs text-white/60">{key}</dt>
                        <dd className="mt-1 break-all">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                  {selected.chainId &&
                    selected.transactionHash &&
                    /^0x[a-fA-F0-9]{64}$/.test(selected.transactionHash) &&
                    explorers[selected.chainId] && (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`${explorers[selected.chainId]}${selected.transactionHash}`}
                        className="mt-5 inline-flex items-center gap-1 text-sm text-[#39BED3]"
                      >
                        View transaction
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
    </main>
  );
}
