"use client";

import useAxios from "@/hooks/useAxios";
import { BalanceContextType } from "@/types/api-types";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useChain } from "@/context/ChainContext"; // Import useChain hook

// Create the context
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl } from '@/lib/config';

const BalanceContext = createContext<BalanceContextType | null>(null);

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (context === null) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};

// Provider component
export const BalanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { chain } = useChain(); // Get the selected chain from ChainContext
  const { user, isAuthenticated } = useAuth();
  const api = useAxios();
  const walletAddress = user?.walletAddress;

  const { isLoading, data, error } = useQuery({
    queryKey: ["getUserBalance", getApiBaseUrl(), chain, walletAddress],
    queryFn: () =>
      api.get(`/usdc/balance/${walletAddress}`, { params: { chain } }).then((res) => {
        return res?.data;
      }),
    enabled: isAuthenticated && !!walletAddress, // Only run query if walletAddress is not null
  });

  return (
    <BalanceContext.Provider value={{ isLoading, data, error }}>
      {children}
    </BalanceContext.Provider>
  );
};
