"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Player } from "@lottiefiles/react-lottie-player";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import lottieSuccess from "@/json/success.json";
import lottieConfirm from "@/json/loading.json";

const ForgotPassword = () => {
  const [openOTP, setOpenOTP] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const {
    register: registerPhoneNumber,
    handleSubmit: handleSubmitPhoneNumber,
    setValue: setPhoneNumberValue,
    formState: { errors: errorsPhoneNumber },
    control: controlPhoneNumber,
  } = useForm();

  const onSubmitPhoneNumber = async (data: any) => {
    // onsumbit phoneNumber logic
    // const res = await SendAfricaOTP({ phoneNumber: data.phoneNumber });
    // console.log(res);
    // if (res?.status === 200) {
    //   setOpenOTP(true);
    //   setPhoneNumber(data.phoneNumber);
    // }
    // event;
  };

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    setValue: setOTPValue,
    formState: { errors: errorsOTP },
    control: controlOTP,
  } = useForm();

  const onSubmitOTP = async (data: any) => {
    // onsumbit OTP logic
    // const res = await VerifyAfricaOTP({ otp: data.otp });
    // if (res?.status === 200) {
    //   setOpenOTP(false);
    //   setOpenResetPassword(true);
    // }
    // event;
  };

  const {
    register: registerResetPassword,
    handleSubmit: handleSubmitResetPassword,
    setValue: setResetPasswordValue,
    formState: { errors: errorsResetPassword },
    control: controlResetPassword,
  } = useForm();

  const onSubmitResetPassword = async (data: any) => {
    // onsumbit ResetPassword logic
    // const res = await SendPasswordReset({
    //   phoneNumber: phoneNumber,
    //   newPassword: data.newPassword,
    // });

    // if (res?.status == 202) {
    //   setOpenResetPassword(false);
    //   setOpenSuccess(true);
    // }
    // event;
  };

  return (
      <main className="home-background h-screen flex flex-col justify-around items-center p-10">
        <h1 className="text-4xl font-bold mb-[30px] text-white">
          Reset your Account Password
        </h1>
        <form
          onSubmit={handleSubmitPhoneNumber(onSubmitPhoneNumber)}
          className="flex flex-col justify-around h-[300px]"
        >
          <h4 className="text-sm text-gray-300">
            Enter Phone Number associated with your account and click
            &quot;Forgot Password&quot; to receive an OTP code to confirm
            account ownership
          </h4>
          <div className="h-auto">
            <label
              htmlFor="emailphone"
              className="text-[#A5A5A5] font-semibold mb-4"
            >
              Phone Number
            </label>
            <input
              {...registerPhoneNumber("phoneNumber", {
                required: " This is required ",
              })}
              type={"number" || "email"}
              id=""
              className="flex justify-around border border-[#A5A5A533] bg-[#141A1980] rounded-md py-3 px-6 w-full focus:outline-none ring-offset-[#A5A5A533] text-white"
            />
          </div>

          <button
            type="submit"
            className="bg-white font-semibold rounded-lg p-3 w-full"
          >
            Forgot Password
          </button>
        </form>

        <Dialog open={openOTP} onOpenChange={setOpenOTP}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-black">
                {" "}
                Confirm OPT-code sent to Phone Number{" "}
              </DialogTitle>
              <DialogDescription></DialogDescription>
              <hr className="my-4" />
              <DialogDescription>
                <form
                  className="flex flex-col justify-around h-[200px]"
                  onSubmit={handleSubmitOTP(onSubmitOTP)}
                >
                  <label
                    htmlFor="otpcode"
                    className="text-black font-semibold mb-2"
                  >
                    OTP-Code
                  </label>
                  <input
                    {...registerOTP("otp", {
                      required: " This is required ",
                    })}
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
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog open={openResetPassword} onOpenChange={setOpenResetPassword}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-black">
                Enter New Password
              </DialogTitle>
              <DialogDescription></DialogDescription>
              <hr className="my-4" />
              <DialogDescription>
                <form
                  className="flex flex-col justify-around h-[200px]"
                  onSubmit={handleSubmitResetPassword(onSubmitResetPassword)}
                >
                  <label
                    htmlFor="otpcode"
                    className="text-black font-semibold mb-2"
                  >
                    Enter New Password
                  </label>
                  <input
                    {...registerResetPassword("newPassword", {
                      required: " This is required ",
                    })}
                    id=""
                    type="text"
                    placeholder="New Password"
                    className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
                  />

                  <label
                    htmlFor="otpcode"
                    className="text-black font-semibold mb-2"
                  >
                    Confirm New Password
                  </label>
                  <input
                    {...registerResetPassword("confirmPassword", {
                      required: " This is required ",
                    })}
                    id=""
                    type="text"
                    placeholder="Confirm Password"
                    className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white font-semibold rounded-lg p-3"
                  >
                    Reset Password
                  </button>
                </form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="mb-[20px]">
                Dispute Raised Successfully
              </DialogTitle>
              <Player
                keepLastFrame
                autoplay
                src={lottieSuccess}
                style={{ height: "300px", width: "300px" }}
              ></Player>
              <button
                className="flex items-center m-2 py-2 px-2 bg-white text-[#218B53] border-2 border-[#218B53] rounded-lg font-semibold hover:bg-[#218B53] hover:text-white"
                onClick={() => setOpenSuccess(false)}
              >
                Done
              </button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </main>
  );
};

export default ForgotPassword;
