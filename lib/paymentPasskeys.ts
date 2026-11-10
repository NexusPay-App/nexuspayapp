import { startAuthentication } from "@simplewebauthn/browser";
import api from "@/lib/api";

export type PaymentPasskeyTerms = {
  kind: "send" | "merchant";
  senderAddress: string;
  amount: string;
  tokenSymbol: string;
  chain?: string;
  chainName?: string;
  recipientIdentifier?: string;
  merchantId?: string;
  maxNetworkFee?: string;
};

export async function approvePaymentWithPasskey(terms: PaymentPasskeyTerms) {
  const { data } = await api.post("/auth/payment-approvals/options", terms);
  const challengeId = data?.data?.challengeId;
  const options = data?.data?.options;
  if (!challengeId || !options)
    throw new Error("Passkey approval could not start.");
  let response;
  try {
    response = await startAuthentication({ optionsJSON: options });
  } catch (error) {
    const failure = error as { name?: string };
    if (failure.name === "NotAllowedError")
      throw new Error("Passkey confirmation was cancelled or timed out.");
    throw error;
  }
  return { challengeId, response };
}
