"use client";

import { QRCode } from "@/constants/svg";
import { Copy } from "@phosphor-icons/react";
import { ArrowLeft } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import Image from "next/image";
import Link from "next/link";
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
    <main className="min-h-dvh bg-gradient-to-br from-[#102729] to-[#0D1718] text-white">
      <AppHeader />
      <div className="w-full px-4 pt-6 pb-16 sm:px-5 sm:pt-8">
        <Link
          href="/home"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Wallet
        </Link>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Share QR</h1>
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
          <span className="border border-[#0795B0] rounded-lg p-4 bg-transparent text-white text-sm flex justify-between ">
            <button>0xbb0f...17c8</button>
            <Copy size={24} color="#ffffff" />
          </span>
        </span>
        <span className="flex flex-col">
          <label htmlFor="phoneNumber" className="text-[#909090] p-1">
            Copy Phone Address
          </label>
          <span className="border border-[#0795B0] rounded-lg p-4 bg-transparent text-white text-sm flex justify-between ">
            <button>0xbb0f...17c8</button>
            <Copy size={24} color="#ffffff" />
          </span>
        </span>
        <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
          Continue
        </button>
      </form>
      </div>
    </main>
  );
};

export default ShareQr;
