"use client";

import { QRCode } from "@/constants/svg";
import { ArrowLeft, Copy } from "@phosphor-icons/react";
import Image from "next/image";
import router from "next/router";
import React, { useEffect } from "react";

const ShareQr = () => {
  useEffect(() => {
    // Check if the user is logged in
    const user = localStorage.getItem('user'); // Assuming 'user' is saved in localStorage on login
    if (!user) {
      // If not logged in, redirect to the login page
      router.replace('/login'); // Adjust the path as needed
    }
  }, [router]);
  return (
    <section className="home-background flex flex-col p-5 xl:px-[200px] ">
      <div className="flex justify-between">
        <ArrowLeft size={24} color="#ffffff" />
        <h3 className="text-white text-lg">Share QR</h3>
        <span></span>
      </div>
      <div className="flex flex-col items-center mt-10">
        <h5 className="text-xl text-white">scan to Receive</h5>
      </div>
      <div className="flex justify-center">
        <Image src={QRCode} alt="" />
      </div>
      <form className="mt-10">
        <span className="flex flex-col">
          <label htmlFor="phoneNumber" className="text-[#909090] p-1">
            Copy Wallet Address
          </label>
          <span className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-sm flex justify-between ">
            <button>0xbb0f...17c8</button>
            <Copy size={24} color="#ffffff" />
          </span>
        </span>
        <span className="flex flex-col">
          <label htmlFor="phoneNumber" className="text-[#909090] p-1">
            Copy Phone Address
          </label>
          <span className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-sm flex justify-between ">
            <button>0xbb0f...17c8</button>
            <Copy size={24} color="#ffffff" />
          </span>
        </span>
        <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
          Continue
        </button>
      </form>
    </section>
  );
};

export default ShareQr;
