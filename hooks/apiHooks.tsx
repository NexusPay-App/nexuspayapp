import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { Transaction } from "@/types/api-types";

interface ApiHookResponse<T> {
  data: T;
  isLoading: boolean;
  error: unknown;
}

export function useGetConversionRate(): ApiHookResponse<number> {
  const api = useAxios();
  const { isLoading, data, error } = useQuery({
    queryKey: ["getConversionRate"],
    queryFn: () =>
      api.get("usdc/conversionrate").then((res) => {
        // console.log(res);
        return res.data.rate;
      }),
  });
  return { isLoading, data, error };
}

export function useGetBalanceHook(): ApiHookResponse<number> {
  const api = useAxios();
  const user = JSON.parse(localStorage.getItem("user") ?? "");
  const { isLoading, data, error } = useQuery({
    queryKey: ["getUserBalance"],
    queryFn: () =>
      api.get(`usdc/usdc-balance/${user.walletAddress}`).then((res) => {
        return res.data;
      }),
  });
  return { isLoading, data, error };
}

export function useGetTransactions(): ApiHookResponse<Transaction[]> {
  const api = useAxios();
  const user = JSON.parse(localStorage.getItem("user"));
  const { isLoading, data, error } = useQuery({
    queryKey: ["getUserTransactions"],
    queryFn: () =>
      api.get(`token/token-transfer-events?address=${user.data.walletAddress}`).then((res) => {
        return res.data;
      }),
  });
  return { isLoading, data, error };
}
