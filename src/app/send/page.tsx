"use client";

import Contact from "@/components/contact/Contact";
import { recentContactSource } from "@/helpers/recentContactSource";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Send = () => {
    const router = useRouter();
  
    const handleContinue = () => {
        event?.preventDefault();
      router.replace("/send/amount")
    }
  return (
    <section className="home-background flex flex-col p-5 xl:px-[200px] ">
      <div className="flex justify-between">
        <Link href="/home"><ArrowLeft size={24} color="#ffffff" /></Link>
        <h3 className="text-white text-xl">Send Crypto</h3>
        <span></span>
      </div>
      <form onSubmit={handleContinue} className="my-5">
        <span className="flex flex-col">
          <label htmlFor="phoneNumber" className="text-[#909090] p-1">
            Phone Number
          </label>
          <input
            type="number"
            placeholder="Enter Recipient’s Phone Number"
            className="border border-[#642CDC] rounded-lg p-4 bg-[#0B0811] text-white text-sm "
          />
        </span>
        <article className="flex flex-col mt-5">
          <div className="flex justify-between mb-5">
            <h3 className="text-white font-semibold">Recent Contacts</h3>
            <CaretRight size={24} color="#ffffff" />
          </div>
          {recentContactSource.map((element, index) => {
            return (
              <Contact
                key={index}
                img={element.img}
                address={element.address}
                name={element.name}
              />
            );
          })}
        </article>
        <article className="flex flex-col mt-5">
          <div className="flex justify-between mb-5">
            <h3 className="text-white font-semibold">Contacts</h3>
            <CaretRight size={24} color="#ffffff" />
          </div>
          {recentContactSource.map((element, index) => {
            return (
              <Contact
                key={index}
                img={element.img}
                address={element.address}
                name={element.name}
              />
            );
          })}
        </article>
        <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
          Continue
        </button>
      </form>
    </section>
  );
};

export default Send;
