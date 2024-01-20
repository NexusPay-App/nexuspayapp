"use client"

import { useRouter } from "next/navigation";
import React from "react";

const Signup = () => {
    const router = useRouter();
  
    const handleNavigate = () => {
        event?.preventDefault();
      router.replace("/home")
    }

  return (
    <section className="app-background">
      <article className="">
        <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
        <h4 className="text-white my-5">
          Enter your Phone Number to Login to NexusPay
        </h4>
        <form onSubmit={()=>handleNavigate()}>
          <span className="flex flex-col">
            <label htmlFor="phoneNumber" className="text-[#909090] p-1">
              Phone Number
            </label>
            <input
              type="number"
              placeholder="Enter your Phone Number"
              className="p-3 rounded-full text-sm"
            />
          </span>
          <span className="flex flex-col mt-5">
            <label htmlFor="password" className="text-[#909090] p-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your Password"
              className="p-3 rounded-full text-sm"
            />
          </span>
          <span className="flex justify-end mb-5">
            <h5 className="text-[#909090] p-1 font-semibold text-sm">
              Forgot Password?
            </h5>
          </span>
          <input
            type="submit"
            value="Connect"
            className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
          />
        </form>
      </article>
    </section>
  );
};

export default Signup;
