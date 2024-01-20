"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Scan } from "@phosphor-icons/react";
import React from "react";

const ReceiveAmount = () => {
  return (
    <section className="home-background h-screen flex flex-col p-5 xl:px-[200px] ">
      <div className="flex justify-between">
        <ArrowLeft size={24} color="#ffffff" />
        <span className="flex flex-col items-center">
          <h3 className="text-white text-xl">Receive Crypto</h3>
          <h5 className="text-sm text-[#A4A4A4]">200.00 USDC Available </h5>
        </span>
        <Scan size={24} color="#ffffff" />
      </div>
      <div className="flex flex-col items-center mt-10">
        <h3 className="text-4xl text-white font-bold">ksh 500</h3>
        <h5 className="text-xl text-white">3.12 USDC</h5>
      </div>
      <form className="mt-10">
        <Select>
          <SelectTrigger className=" border border-[#642CDC] rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none">
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent className="border border-[#642CDC] rounded-lg bg-transparent text-white text-sm outline-none">
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="ksh">KSH</SelectItem>
            <SelectItem value="eth">ETH</SelectItem>
          </SelectContent>
        </Select>
        <input type="text" name="" id="" placeholder="Additional Notes" className=" border border-[#642CDC] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5" />
        <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
          Continue
        </button>
      </form>
    </section>
  );
};

export default ReceiveAmount;
