"use client";

import {
  ArrowLeft,
  Drop,
  Fire,
  GasPump,
  HouseSimple,
  Lightning,
  PaperPlaneTilt,
  Swap,
  WifiHigh,
} from "@phosphor-icons/react";
import React from "react";

const PayCheckout = () => {
  return (
    <section className="home-background h-screen flex flex-col p-5 xl:px-[200px] ">
      <div className="flex justify-between">
        <ArrowLeft size={24} color="#ffffff" />
        <h3 className="text-white text-xl">Pay Utilities</h3>
        <span></span>
      </div>
      <div className="border border-[#642CDC] rounded-lg p-2 sm:p-4 bg-[#0B0811] grid grid-cols-4 justify-around">
        <span>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <Lightning size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1 text-center">Electricity</h4>
          </div>
        </span>
        <span>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <Drop size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1 text-center">Water Bills</h4>
          </div>
        </span>
        <span>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <WifiHigh size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1 text-center">Internet Bills</h4>
          </div>
        </span>
        <span>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <HouseSimple size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1 text-center">Rent</h4>
          </div>
        </span>
        <span>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <Fire size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1 text-center">Gas</h4>
          </div>
        </span>
        <span>
          <div className="flex flex-col items-center">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <GasPump size={24} color="#ffffff" />
            </span>
            <h4 className="text-white my-1 text-center">Fuel</h4>
          </div>
        </span>
      </div>
      <div className="flex flex-col items-center mt-10">
        <h5 className="text-white">Enter Till Number</h5>
        <span className="flex justify-around w-full mt-2">
          <input
            type="number"
            className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-lg w-[50px]"
            maxLength={1}
          />
          <input
            type="number"
            className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-lg w-[50px]"
            maxLength={1}
          />
          <input
            type="number"
            className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-lg w-[50px]"
            maxLength={1}
          />
          <input
            type="number"
            className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-lg w-[50px]"
            maxLength={1}
          />
          <input
            type="number"
            className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-lg w-[50px]"
            maxLength={1}
          />
        </span>
      </div>
      <div className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-lg mt-10">
        <h5>200.00 USDC Available </h5>
        <span className="flex mt-3 items-center justify-between">
          <h3 className="text-4xl text-white font-bold">ksh 500</h3>
          <Swap size={24} color="#ffffff" />
          <h5 className="text-xl text-white">3.12 USDC</h5>
        </span>
      </div>
      <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
        Proceed
      </button>
    </section>
  );
};

export default PayCheckout;
