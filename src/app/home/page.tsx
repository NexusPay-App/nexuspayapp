"use client";

import Transactions from "@/components/transactions/Transactions";
import {
  ArrowCircleDown,
  BellSimple,
  CreditCard,
  List,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import React from "react";

const Home = () => {
  return (
    <section className="home-background justify-start">
      <article className="bg-[#0B0811] flex flex-col p-5 xl:px-[200px] border-0 border-b border-[#642CDC]">
        <div className="flex justify-between">
          <List size={24} color="#ffffff" weight="fill" />
          <BellSimple size={24} color="#ffffff" weight="fill" />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-white my-1">Wallet Balance</h3>
          <h1 className="text-4xl text-white font-bold mb-3"> 40,000</h1>
        </div>
        <div className="flex justify-around relative top-20 ">
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <PaperPlaneTilt size={24} color="#ffffff" weight="fill" />
            </span>
            <h4 className="text-white my-1">Send</h4>
          </div>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <ArrowCircleDown size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1">Receive</h4>
          </div>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <CreditCard size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1">Pay</h4>
          </div>
        </div>
      </article>
      <article className="mt-20 flex flex-col items-center p-5  xl:px-[200px]">
        <div className="flex flex-col rounded-xl w-full overflow-hidden ">
          <span className="bg-wallet-bg bg-cover p-5 h-[100px]">
            <h3 className="text-white text-xl my-1 font-semibold">
              Buy Crypto Assets, Tokens in a Securely.
            </h3>
          </span>
          <span className="bg-[#0B0811] p-2">
            <button className="bg-white font-bold text-lg p-3 rounded-xl w-[150px]">
              Buy Crypto
            </button>
          </span>
        </div>
      </article>
      <Transactions />
    </section>
  );
};

export default Home;
