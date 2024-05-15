"use client";

import useAxios from "@/hooks/useAxios";
import { BalanceApiResponseType, BalanceContextType } from "@/types/api-types";
import { useQuery } from "@tanstack/react-query";
// contexts/BalanceContext.js
import { createContext, useContext, useEffect, useState } from "react";

// Create the context
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
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem("user"));
  }, []);

  const api = useAxios();
  let getUserfromLocalStorage: BalanceApiResponseType;
  getUserfromLocalStorage = JSON.parse(user);

  const { isLoading, data, error } = useQuery({
    queryKey: ["getUserBalance"],
    queryFn: () =>
      api
        .get(`usdc/usdc-balance/${getUserfromLocalStorage.data.walletAddress}`)
        .then((res) => {
          return res?.data;
        }),
  });

  return (
    <BalanceContext.Provider value={{ isLoading, data, error }}>
      {children}
    </BalanceContext.Provider>
  );
};
