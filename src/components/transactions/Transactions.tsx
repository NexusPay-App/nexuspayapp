import { ArrowCircleDown, CaretRight } from "@phosphor-icons/react";
import React from "react";

const Transactions = () => {
  return (
    <article className="flex flex-col p-3 md:p-5  xl:px-[200px]">
      <div className="flex justify-between mb-5">
        <h3 className="text-white font-semibold">Recent Transactions</h3>
        <CaretRight size={24} color="#ffffff" />
      </div>
      <div>
        <span className="flex justify-between my-2">
          <span className="flex">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <ArrowCircleDown size={24} color="#ffffff" />
            </span>
            <span className="ml-3">
              <h3 className="text-white font-semibold">Received USDT</h3>
              <h5 className="text-[#5A6B83] text-sm">9.30 am</h5>
            </span>
          </span>
          <span>
            <h3 className="text-white font-semibold">200 USDT</h3>
          </span>
        </span>
        <span className="flex justify-between my-2">
          <span className="flex">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <ArrowCircleDown size={24} color="#ffffff" />
            </span>
            <span className="ml-3">
              <h3 className="text-white font-semibold">Received USDT</h3>
              <h5 className="text-[#5A6B83] text-sm">9.30 am</h5>
            </span>
          </span>
          <span>
            <h3 className="text-white font-semibold">200 USDT</h3>
          </span>
        </span>
        <span className="flex justify-between my-2">
          <span className="flex">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <ArrowCircleDown size={24} color="#ffffff" />
            </span>
            <span className="ml-3">
              <h3 className="text-white font-semibold">Received USDT</h3>
              <h5 className="text-[#5A6B83] text-sm">9.30 am</h5>
            </span>
          </span>
          <span>
            <h3 className="text-white font-semibold">200 USDT</h3>
          </span>
        </span>
        <span className="flex justify-between my-2">
          <span className="flex">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <ArrowCircleDown size={24} color="#ffffff" />
            </span>
            <span className="ml-3">
              <h3 className="text-white font-semibold">Received USDT</h3>
              <h5 className="text-[#5A6B83] text-sm">9.30 am</h5>
            </span>
          </span>
          <span>
            <h3 className="text-white font-semibold">200 USDT</h3>
          </span>
        </span>
        <span className="flex justify-between my-2">
          <span className="flex">
            <span className="border border-[#642CDC] rounded-full p-4 bg-[#0B0811]">
              <ArrowCircleDown size={24} color="#ffffff" />
            </span>
            <span className="ml-3">
              <h3 className="text-white font-semibold">Received USDT</h3>
              <h5 className="text-[#5A6B83] text-sm">9.30 am</h5>
            </span>
          </span>
          <span>
            <h3 className="text-white font-semibold">200 USDT</h3>
          </span>
        </span>
      </div>
    </article>
  );
};

export default Transactions;
