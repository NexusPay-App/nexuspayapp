"use client";
import { TxReceive, TxSent } from "@/constants/svg";
import { useGetTransactions } from "@/hooks/apiHooks";
import { TransactionsType } from "@/types/api-types";
import {
  ArrowCircleDown,
  ArrowCircleUp,
  CaretRight,
} from "@phosphor-icons/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const Transactions = () => {
  const [transactions, setTransactions] = useState<TransactionsType[]>([]);
  const [wallet, setWallet] = useState("");
  // useEffect(() => {
  //   const user = localStorage.getItem("user"); // Retrieves a string
  //   const userObject = JSON.parse(user as string); // Parses the string back into an object
  //   console.log(userObject.walletAddress); // Now you can safely access phoneNumber
  //   setWallet(userObject.walletAddress);
  //   // fetch("http://localhost:8000/api/token/token-transfer-events?address=0xe1F4615Afec6801493FB889eDe3A70812c842d05")
  //   fetch(
  //     `https://afpaybackend.vercel.app/api/token/token-transfer-events?address=${userObject.walletAddress}`
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       setTransactions(data);
  //     })
  //     .catch((error) => console.error("Error fetching transactions:", error));
  // }, []);
  const { data, isLoading, error } = useGetTransactions();

  const formatValue = (value: any, decimals: any) =>
    (value / Math.pow(10, decimals)).toFixed(2);

  return (
    <article className="flex flex-col p-3 md:p-5 xl:px-[200px]">
      <div className="flex justify-between mb-5">
        <h3 className="text-white font-semibold">Recent Transactions</h3>
        <CaretRight size={24} color="#ffffff" />
      </div>
      <div>
        {isLoading
          ? <h3 className="text-white font-semibold">
            Loading Transactions
        </h3>
          : data.map((transaction, index) => (
              <span className="flex justify-between my-2" key={index}>
                <span className="flex items-center">
                  <span className="border border-[#0795B0] rounded-full p-2 bg-[#0A0E0E]">
                    {transaction.to.toLowerCase() === wallet.toLowerCase() ? (
                      <Image src={TxReceive} alt="tx-receive" />
                    ) : (
                      <Image src={TxSent} alt="tx-receive" />
                    )}
                  </span>
                  <span className="ml-2">
                    <h3 className="text-white font-semibold">
                      {transaction.to.toLowerCase() === wallet.toLowerCase()
                        ? "Received"
                        : "Sent"}{" "}
                      {transaction.tokenSymbol}
                    </h3>
                    <h5 className="text-[#5A6B83] text-sm">
                      {new Date(
                        (transaction.timeStamp as unknown as number) * 1000
                      ).toLocaleTimeString()}
                    </h5>
                  </span>
                </span>
                <span>
                  <h3 className="text-white font-semibold">
                    {formatValue(transaction.value, transaction.tokenDecimal)}{" "}
                    {transaction.tokenSymbol}
                  </h3>
                </span>
              </span>
            ))}
      </div>
    </article>
  );
};

export default Transactions;
