// Login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Adjusted import for useRouter
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth as useAuthOriginal } from "@/context/AuthContext"; // Import the original useAuth hook
import dynamic from "next/dynamic";
import loading from "@/public/json/loading.json";
import errorJson from "@/public/json/error.json";

// Dynamically import Player to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import {
  AuthContextType,
  ForgotPasswordFormFields,
  LoginFormFields,
  OTPFormData,
  SignUpFormData,
} from "@/types/form-types";
import { useMutation } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import LoadingDialog from "@/components/dialog/LoadingDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import { Form, Formik } from "formik";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import SuccessDialog from "@/components/dialog/SuccessDialog";

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const ForgotPassword: React.FC = () => {
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [openLoading, setOpenLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState("password");
  const [openSendingOTP, setOpenSendingOTP] = useState(false); // Opens the Account Creation Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [openPasswordResetSuccess, setOpenPasswordResetSuccess] =
    useState(false);
  const [userDetails, setUserDetails] = useState<OTPFormData>({
    phoneNumber: "",
    newPassword: "",
    otp: "",
  });
  const api = useAxios();
  const router = useRouter();

  // Mutation to Initiate Login User
  const initiateForgotPassword = useMutation({
    mutationFn: (initiateForgotPasswordPost: ForgotPasswordFormFields) => {
      return api.post(
        "auth/password-reset/request",
        {
          phoneNumber: initiateForgotPasswordPost.phoneNumber,
        },
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, variables, context) => {
      setOpenLoading(false);
      setOpenSendingOTP(true);
      setOpenResetPassword(true);
      setOpenSendingOTP(false);
    },
    onError: (error, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error(error);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {},
  });

  // Mutation to Initiate Register User
  const initiateResetPassword = useMutation({
    mutationFn: (initiateResetPasswordPost: OTPFormData) => {
      setOpenSendingOTP(false);
      setOpenLoading(true);
      return api.post(
        "auth/password-reset",
        {
          phoneNumber: initiateResetPasswordPost.phoneNumber,
          newPassword: initiateResetPasswordPost.newPassword,
          otp: initiateResetPasswordPost.otp,
        },
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, variables, context) => {
      setOpenLoading(false);
      setOpenPasswordResetSuccess(true);
      router.replace("/home");
      setUserDetails(variables); // Store user details with the modified phone number
    },
    onError: (error, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to initiate sign-up.");
      setOpenLoading(false);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {},
  });

  return (
    <section className="app-background">
      <LoadingDialog
        message="Resetting Password..."
        openLoading={openLoading}
        setOpenLoading={setOpenLoading}
      />
      <LoadingDialog
        message="Sending OTP..."
        openLoading={openSendingOTP}
        setOpenLoading={setOpenSendingOTP}
      />
      <SuccessDialog
        message="Password Reset Succesful..."
        openSuccess={openPasswordResetSuccess}
        setOpenSuccess={setOpenPasswordResetSuccess}
      />
      <ErrorDialog
        message="Failed to Login"
        openError={openAccErr}
        setOpenError={setOpenAccErr}
      />
      <article>
        <h2 className="text-4xl text-white font-bold">Forgot Password</h2>
        <h4 className="text-white my-5">
          Enter your Phone Number to Reset Password
        </h4>
        {/* SignUp using Formik */}
        <Formik
          initialValues={{
            phoneNumber: "",
          }}
          validationSchema={Yup.object({
            phoneNumber: Yup.number()
              .min(13, "Min of 13 Characters required")
              .required("Phone Number is Required"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(async () => {
              setOpenLoading(true);
              // Check if phoneNumber starts with '01' or '07' and modify it
              let modifiedPhoneNumber = values.phoneNumber;
              if (
                modifiedPhoneNumber.toString().startsWith("01") ||
                modifiedPhoneNumber.toString().startsWith("07")
              ) {
                modifiedPhoneNumber = "+254" + values.phoneNumber.substring(1);
              }

              // Use the modifiedPhoneNumber in your API request
              const requestData = {
                ...values,
                phoneNumber: modifiedPhoneNumber, // Replace the original phoneNumber with the modified one
              };

              // Call the Initiate Register User Mutation
              initiateForgotPassword.mutate(requestData);

              setOpenSendingOTP(false);
              setSubmitting(false);
            }, 400);
          }}
        >
          <Form>
            <TextInput
              label="Phone Number eg (0720****20)"
              name="phoneNumber"
              type="text"
              placeholder="Enter your Phone Number"
            />
            <div className="flex flex-col justify-start mb-5">
              <p className="text-[#909090] p-1 text-sm font-semibold">
                <Link href="/signup" className="hover:text-white">
                  Create a Personal Account
                </Link>
              </p>
              <p className="text-[#909090] p-1 text-sm font-semibold">
                <Link href="/signup/business" className="hover:text-white">
                  Create a Business Account?
                </Link>
              </p>
            </div>
            <button
              type="submit"
              className="bg-white mt-5 p-3 rounded-full font-bold w-full cursor-pointer"
            >
              Submit
            </button>
          </Form>
        </Formik>
        <Dialog open={openResetPassword} onOpenChange={setOpenResetPassword}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-black">
                Enter New Password
              </DialogTitle>
              <Formik
                initialValues={{
                  phoneNumber: "",
                  otp: "",
                  newPassword: "",
                }}
                validationSchema={Yup.object({
                  phoneNumber: Yup.number()
                    .min(13, "Min of 13 Characters required")
                    .required("Phone Number is Required"),
                  otp: Yup.string()
                    .min(6, "Min of 6 Characters required")
                    .required("OTP is Required"),
                  newPassword: Yup.string()
                    .max(20, "Must be 20 characters or less")
                    .min(5, "Min of 5 Characters required")
                    .required("Password is Required"),
                })}
                onSubmit={(values, { setSubmitting }) => {
                  setTimeout(async () => {
                    // Check if phoneNumber starts with '01' or '07' and modify it
                    let modifiedPhoneNumber = values.phoneNumber;
                    if (
                      modifiedPhoneNumber.toString().startsWith("1") ||
                      modifiedPhoneNumber.toString().startsWith("7")
                    ) {
                      modifiedPhoneNumber =
                        "+254" + values.phoneNumber.toString().substring(0);
                    }

                    // Use the modifiedPhoneNumber in your API request
                    const requestData = {
                      ...values,
                      phoneNumber: modifiedPhoneNumber, // Replace the original phoneNumber with the modified one
                    };

                    // Call the Initiate Register User Mutation
                    console.log(requestData);
                    initiateResetPassword.mutate(requestData);
                    setSubmitting(false);
                  }, 400);
                }}
              >
                <Form>
                  <TextInput
                    label="Phone Number"
                    name="phoneNumber"
                    type="number"
                    placeholder="Enter your Phone Number eg (0720****20)"
                  />
                  <TextInput
                    label="OTP Code"
                    name="otp"
                    type="text"
                    placeholder="Enter your OTP Code "
                  />

                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    placeholder="Enter New Password"
                  />

                  <button
                    type="submit"
                    className="bg-black text-white mt-5 p-3 rounded-full font-bold w-full cursor-pointer"
                  >
                    Reset Password
                  </button>
                </Form>
              </Formik>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </article>
    </section>
  );
};

export default ForgotPassword;
