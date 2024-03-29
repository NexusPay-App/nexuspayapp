"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Scan } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const SendAmount = () => {
  const router = useRouter();
  const [openPassWord, setOpenPassWord] = useState(false);

  // Form Hook for
  const {
    register: register,
    handleSubmit: handleSubmit,
    setValue: setValue,
    formState: { errors: errors },
    control: control,
  } = useForm();

  const submit = () => {
    setOpenPassWord(true);
  };

  // Form Hook for PassWord
  const {
    register: registerPassWord,
    handleSubmit: handleSubmitPassWord,
    setValue: setPassWordValue,
    formState: { errors: errorsPassWord },
    control: controlPassWord,
  } = useForm();

  const submitPassWord = () => {};

  const handleSend = () => {
    router.replace("/send");
  };
  return (
    <section className="home-background h-screen flex flex-col p-5 xl:px-[200px] ">
      <div className="flex justify-between">
        <Link href="/send">
          <ArrowLeft size={24} color="#ffffff" />
        </Link>
        <span className="flex flex-col items-center">
          <h3 className="text-white text-xl">Send Crypto</h3>
          <h5 className="text-sm text-[#A4A4A4]">200.00 USDC Available </h5>
        </span>
        <Scan size={24} color="#ffffff" />
      </div>
      <div className="flex flex-col items-center mt-10">
        <h3 className="text-4xl text-white font-bold">ksh 500</h3>
        <h5 className="text-xl text-white">3.12 USDC</h5>
      </div>

      <Dialog open={openPassWord} onOpenChange={setOpenPassWord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black"> Confirm Password</DialogTitle>
            <DialogDescription></DialogDescription>
            <hr className="my-4" />
            <form
              className="flex flex-col justify-around h-[200px]"
              onSubmit={handleSubmitPassWord(submitPassWord)}
            >
              <input
                {...registerPassWord("passWord")}
                id=""
                type="number"
                placeholder="Enter PassWord"
                className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
              />
              <button
                type="submit"
                className="bg-black text-white font-semibold rounded-lg p-3"
              >
                Confirm PassWord
              </button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <form onSubmit={handleSubmit(submit)} className="mt-10">
        <Select>
          <SelectTrigger className=" border border-[#0795B0] rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none">
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent className="border border-[#0795B0] rounded-lg bg-black text-white text-sm outline-none">
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="ksh">KSH</SelectItem>
            <SelectItem value="eth">ETH</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="text"
          name=""
          id=""
          placeholder="Additional Notes"
          className=" border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
        />
        <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
          Continue
        </button>
      </form>
    </section>
  );
};

export default SendAmount;
