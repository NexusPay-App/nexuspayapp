"use client";

import Transactions from "@/components/transactions/Transactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARB } from "@/constants/svg";
import {
  ArrowCircleDown,
  BellSimple,
  CreditCard,
  List,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useBalance } from "@/context/BalanceContext";
const Home = () => {
  const [chain, setChain] = useState("USDC");
  const { balance, loading } = useBalance(); // Use the useBalance hook to get balance and loading state

  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Check if the user is logged in
    const user = localStorage.getItem("user"); // Assuming 'user' is saved in localStorage on login
    if (!user) {
      // If not logged in, redirect to the login page
      router.replace("/login"); // Adjust the path as needed
    }
  }, [router]);
  const handleSend = () => {
    router.replace("/send");
  };

  const handleReceive = () => {
    router.replace("/receive");
  };

  const handlePay = () => {
    router.replace("/pay");
  };

  return (
    <section className="home-background">
      <article className="bg-[#0A0E0E] flex flex-col p-5 xl:px-[200px] border-0 border-b border-[#0795B0]">
        {/* <div className="flex justify-between">
          <List size={24} color="#ffffff" weight="fill" />
          <BellSimple size={24} color="#ffffff" weight="fill" />
        </div> */}
        <div className="flex flex-col items-center my-[20px]">
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Select
                defaultValue="ARB"
                onValueChange={(value: string) => {
                  field.onChange;
                  setChain(value);
                }}
                value={field.value}
              >
                <SelectTrigger className="w-full my-[20px] p-3">
                  <SelectValue
                    defaultValue="Arbitrum One"
                    placeholder="Select Chain"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARB">Arbitrum</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <h3 className="text-white my-2">Wallet Balance</h3>
          <h1 className="text-4xl text-white font-bold mb-3 text-center">
            {parseFloat(balance.balanceInKES).toFixed(2)} KES
          </h1>
          <h1 className="text-xl text-white font-bold mb-3 text-center">
            {parseFloat(balance.balanceInUSDC).toFixed(2)} USDC
          </h1>
          <p className="text-sm mt-2 text-white">
            {/* Current Rate: 1 USDC = {balance.rate} KES */}
            Current Rate: 1 USDC = {parseFloat(balance.rate).toFixed(2)} KES
          </p>
        </div>
        <div className="flex justify-around relative top-20 ">
          <div className="flex flex-col items-center" onClick={handleSend}>
            <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
              <PaperPlaneTilt size={24} weight="fill" />
            </span>
            <h4 className="text-white my-1">Send</h4>
          </div>
          <div className="flex flex-col items-center" onClick={handleReceive}>
            <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
              <ArrowCircleDown size={24} weight="fill" />
            </span>
            <h4 className="text-white my-1">Receive</h4>
          </div>
          <div className="flex flex-col items-center" onClick={handlePay}>
            <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
              <CreditCard size={24} weight="fill" />
            </span>
            <h4 className="text-white my-1">Pay</h4>
          </div>
        </div>
      </article>
      {/* <article className="mt-20 flex flex-col items-center p-5  xl:px-[200px]">
        <div className="flex flex-col justify-around rounded-xl w-full overflow-hidden bg-wallet-bg bg-cover p-5 h-[180px]">
          <h3 className="text-white text-xl my-1 font-semibold">
            Buy Crypto Assets, Tokens Securely.
          </h3>
          <button className="bg-white font-bold text-lg p-3 rounded-xl w-[150px]">
            Buy Crypto
          </button>
        </div>
      </article> */}

<article className="mt-20 flex flex-col items-center p-5 xl:px-[200px]">
    <div className="flex flex-col justify-around rounded-xl w-full overflow-hidden bg-wallet-bg bg-cover p-5 h-[180px] relative">
        <div className="bg-black bg-opacity-50 absolute inset-0 flex flex-col justify-center items-center">
            <h3 className="text-white text-xl my-1 font-semibold">
                Buy Crypto Assets, Tokens Securely.
            </h3>
            <p className="text-white text-sm mb-4">Coming Soon!!!!!</p>
            <button className="bg-white opacity-70 cursor-not-allowed font-bold text-lg p-3 rounded-xl w-[150px]">
                Buy Crypto
            </button>
        </div>
    </div>
</article>

      <Transactions />
    </section>
  );
};

export default Home;
