import api from "./api";
export type RampMode = "buy" | "withdraw" | "bills";
export interface RampCapabilities {
  modes: Record<RampMode, boolean>;
  networks: { id: string; name: string; tokens: string[] }[];
  sandbox: boolean;
  message?: string;
}
export interface RampQuote {
  fiatAmount: number;
  cryptoAmount: string;
  serviceFee: string;
  rate: number;
  expiresAt: string;
}
export interface RampPayment {
  transactionId: string;
  status: string;
  amount?: number;
  cryptoAmount?: number;
  cryptoTransactionHash?: string;
}
export const rampAPI = {
  capabilities: async (signal?: AbortSignal): Promise<RampCapabilities> =>
    (await api.get("/mpesa/capabilities", { signal })).data.data,
  quote: async (
    input: { mode: RampMode; chain: string; tokenType: string; amount: string },
    signal?: AbortSignal,
  ): Promise<RampQuote> =>
    (await api.post("/mpesa/quote", input, { signal })).data.data,
  submit: async (
    mode: RampMode,
    input: Record<string, unknown>,
    key: string,
  ): Promise<RampPayment> => {
    const path =
      mode === "buy"
        ? "buy-crypto"
        : mode === "withdraw"
          ? "crypto-to-mpesa"
          : "pay-with-crypto";
    const response = await api.post(`/mpesa/${path}`, input, {
      headers: { "Idempotency-Key": key },
      timeout: 90000,
    });
    if (!response.data.success || !response.data.data?.transactionId)
      throw new Error(
        response.data.message ||
          "Payment outcome needs checking. Do not start another payment.",
      );
    return response.data.data;
  },
  recover: async (key: string): Promise<{ payment: RampPayment | null }> =>
    (await api.get(`/mpesa/requests/${encodeURIComponent(key)}`)).data.data,
  status: async (id: string): Promise<RampPayment> =>
    (await api.get(`/mpesa/transaction/${encodeURIComponent(id)}`)).data.data,
};
