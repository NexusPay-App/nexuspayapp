"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Login = () => {
  const [openOTP, setOpenOTP] = useState(false);
  const router = useRouter();

  // Form Hook for Login
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setLoginValue,
    formState: { errors: errorsLogin },
    control: controlLogin,
  } = useForm();

  const submitLogin = () => {
    setOpenOTP(true);
  };

  // Form Hook for OTP
  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    setValue: setOTPValue,
    formState: { errors: errorsOTP },
    control: controlOTP,
  } = useForm();

  const submitOTP = () => {
    router.replace("/home");
  };

  return (
    <section className="app-background">
      <Dialog open={openOTP} onOpenChange={setOpenOTP}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">
              {" "}
              Confirm OPT-code sent to Phone Number{" "}
            </DialogTitle>
            <DialogDescription></DialogDescription>
            <hr className="my-4" />
            <form
              className="flex flex-col justify-around h-[200px]"
              onSubmit={handleSubmitOTP(submitOTP)}
            >
              <label
                htmlFor="otpcode"
                className="text-black font-semibold mb-2"
              >
                OTP-Code
              </label>
              <input
                {...registerOTP("otp")}
                id=""
                type="number"
                placeholder="Enter OTP"
                className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
              />
              <button
                type="submit"
                className="bg-black text-white font-semibold rounded-lg p-3"
              >
                Confirm OTP Code
              </button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <article className="">
        <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
        <h4 className="text-white my-5">
          Enter your Phone Number to Login to NexusPay
        </h4>
        <form onSubmit={handleSubmitLogin(submitLogin)}>
          <span className="flex flex-col">
            <label
              htmlFor="phoneNumber"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              Phone Number eg (+254720****20)
            </label>
            <span className="flex">
              <h4 className="p-3 rounded-full bg-white mr-1 text-sm font-semibold">
                +254
              </h4>
              <input
                {...registerLogin("phoneNumber")}
                type="number"
                placeholder="Enter your Phone Number"
                className="p-3 rounded-full text-sm w-full"
              />
            </span>
          </span>
          <span className="flex flex-col mt-5">
            <label htmlFor="password" className="text-[#909090] p-1 text-sm">
              Password
            </label>
            <input
              {...registerLogin("phoneNumber")}
              type="password"
              placeholder="Enter your Password"
              className="p-3 rounded-full text-sm"
            />
          </span>
          <span className="flex justify-end mb-5">
            <h5 className="text-[#909090] p-1 text-sm font-semibold">
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

export default Login;
