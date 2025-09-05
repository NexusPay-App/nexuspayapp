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
import { formatPhoneNumberToE164, validateE164PhoneNumber } from "@/lib/phone-utils";

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const ForgotPassword: React.FC = () => {
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [openLoading, setOpenLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState("password");
  const [openSendingOTP, setOpenSendingOTP] = useState(false); // Opens the Account Creation Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog
  const [errorMessage, setErrorMessage] = useState("Failed to Reset Password"); // Error message to display
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [openPasswordResetSuccess, setOpenPasswordResetSuccess] =
    useState(false);
  const [userDetails, setUserDetails] = useState<OTPFormData>({
    phoneNumber: "",
    newPassword: "",
    otp: "",
  });
  const [storedPhoneNumber, setStoredPhoneNumber] = useState<string>("");
  const api = useAxios();
  const router = useRouter();

  // Mutation to Request Password Reset (Phone)
  const initiateForgotPassword = useMutation({
    mutationFn: (initiateForgotPasswordPost: ForgotPasswordFormFields) => {
      return api.post(
        "auth/password-reset/phone/request",
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
      setStoredPhoneNumber(variables.phoneNumber); // Store the phone number for the next form
      setOpenResetPassword(true);
      setOpenSendingOTP(false);
    },
    onError: (error: any, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to request password reset:", error);
      
      // Check for specific error types
      if (error?.response?.status === 404) {
        setErrorMessage("Phone number not found. Please check your number or create an account.");
      } else if (error?.response?.status === 400) {
        setErrorMessage("Invalid phone number format. Please check your number.");
      } else {
        setErrorMessage("Failed to send reset code. Please try again.");
      }
      
      setOpenLoading(false);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {},
  });

  // Mutation to Reset Password (Phone)
  const initiateResetPassword = useMutation({
    mutationFn: (initiateResetPasswordPost: OTPFormData) => {
      setOpenSendingOTP(false);
      setOpenLoading(true);
      return api.post(
        "auth/password-reset/phone",
        {
          phoneNumber: storedPhoneNumber, // Use the stored phone number instead of form input
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
      setOpenResetPassword(false); // Close the reset password dialog
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    },
    onError: (error: any, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to reset password:", error);
      
      // Check for specific error types
      if (error?.response?.status === 400) {
        if (error?.response?.data?.error?.code === 'INVALID_OTP') {
          setErrorMessage("Invalid or expired OTP. Please try again.");
        } else if (error?.response?.data?.error?.code === 'MISSING_FIELDS') {
          setErrorMessage("All fields are required for password reset.");
        } else {
          setErrorMessage("Invalid data provided. Please check your inputs.");
        }
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
      }
      
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
        message={errorMessage}
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
              
              // Format phone number to E.164 format using utility function
              const formattedPhoneNumber = formatPhoneNumberToE164(values.phoneNumber);
              
              // Validate the formatted phone number
              if (!validateE164PhoneNumber(formattedPhoneNumber)) {
                console.error('Invalid phone number format:', formattedPhoneNumber);
                setOpenLoading(false);
                setOpenAccErr(true);
                setSubmitting(false);
                return;
              }

              // Use the formatted phone number in your API request
              const requestData = {
                ...values,
                phoneNumber: formattedPhoneNumber, // Now properly formatted as E.164
              };

              // Call the Initiate Forgot Password Mutation
              console.log('Forgot password request data:', requestData);
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
                <Link href="/login" className="hover:text-white">
                  Remember your password? Login
                </Link>
              </p>
              <p className="text-[#909090] p-1 text-sm font-semibold">
                <Link href="/signup" className="hover:text-white">
                  Don&apos;t have an account? Sign Up
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
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black mb-2">
                Reset Your Password
              </DialogTitle>
              <DialogDescription className="text-gray-600 mb-4">
                Enter the OTP code sent to your phone and create a new password
              </DialogDescription>
              <Formik
                initialValues={{
                  otp: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
                validationSchema={Yup.object({
                  otp: Yup.string()
                    .min(6, "Min of 6 Characters required")
                    .required("OTP is Required"),
                  newPassword: Yup.string()
                    .max(20, "Must be 20 characters or less")
                    .min(5, "Min of 5 Characters required")
                    .required("Password is Required"),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                    .required("Confirm Password is Required"),
                })}
                onSubmit={(values, { setSubmitting }) => {
                  setTimeout(async () => {
                    // Use the stored phone number and form values
                    const requestData = {
                      phoneNumber: storedPhoneNumber, // Use stored phone number
                      otp: values.otp,
                      newPassword: values.newPassword,
                    };

                    // Call the Reset Password Mutation
                    console.log('Reset password request data:', requestData);
                    initiateResetPassword.mutate(requestData);
                    setSubmitting(false);
                  }, 400);
                }}
              >
                <Form>
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="text-gray-800 font-medium">{storedPhoneNumber}</p>
                  </div>
                  
                  <TextInput
                    label="OTP Code"
                    name="otp"
                    type="text"
                    placeholder="Enter your OTP Code"
                  />

                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    placeholder="Enter New Password"
                  />

                  <PasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                  />

                  <button
                    type="submit"
                    className="bg-white text-black mt-5 p-3 rounded-full font-bold w-full cursor-pointer hover:bg-gray-100 transition-colors duration-200"
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
