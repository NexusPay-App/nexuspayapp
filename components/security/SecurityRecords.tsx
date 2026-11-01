"use client";
import { useState } from "react";
import api from "@/lib/api";
type Row = {
  _id: string;
  userId: string;
  userAgent?: string;
  createdAt: string;
  state?: string;
  chainId?: number;
  amount?: string;
  recipient?: string;
  token?: string;
  transactionHash?: string;
};
export default function SecurityRecords({ role }: { role: string }) {
  const [tab, setTab] = useState<"sessions" | "payments">("sessions");
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  async function load(type: "sessions" | "payments") {
    setTab(type);
    setError("");
    try {
      const r = await api.get(`/security/${type}`);
      setRows(r.data.data);
      setLoaded(true);
    } catch {
      setError(
        "Records could not be loaded. Your administrator session may have expired.",
      );
    }
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0E1617] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Accounts and payments</h2>
        <div className="flex gap-2">
          {(["sessions", "payments"] as const).map((type) => (
            <button
              key={type}
              onClick={() => void load(type)}
              className={`rounded-lg px-3 py-2 text-sm ${tab === type && loaded ? "bg-[#0795B0]/15 text-[#52D4E7]" : "border border-white/10 text-white/60"}`}
            >
              {type === "sessions" ? "Active sessions" : "Payment intents"}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {!loaded ? (
        <p className="mt-4 text-sm text-white/60">
          Open a view to inspect the latest 50 records. Access is audited.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-white/10">
          {rows.map((row) => (
            <div
              key={row._id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="break-all text-sm font-medium">
                  Account {row.userId}
                </p>
                <p className="mt-1 break-all text-xs text-white/60">
                  {tab === "sessions"
                    ? row.userAgent || "Unknown device"
                    : `${row.state} · Chain ${row.chainId} · ${row.amount} base units · ${row.token}`}
                </p>
                {row.recipient && (
                  <p className="mt-1 break-all text-xs text-white/60">
                    Recipient: {row.recipient}
                  </p>
                )}
                <p className="mt-1 text-xs text-white/50">
                  {new Date(row.createdAt).toISOString()}
                </p>
              </div>
              {tab === "sessions" && role === "administrator" && (
                <button
                  className="text-sm text-red-300"
                  onClick={async () => {
                    try {
                      await api.post(
                        `/security/accounts/${row.userId}/revoke-sessions`,
                        {},
                      );
                      await load("sessions");
                    } catch {
                      setError(
                        "Sign in again with your passkey before revoking account sessions.",
                      );
                    }
                  }}
                >
                  Revoke account sessions
                </button>
              )}
            </div>
          ))}
          {!rows.length && (
            <p className="text-sm text-white/60">No matching records.</p>
          )}
        </div>
      )}
    </section>
  );
}
