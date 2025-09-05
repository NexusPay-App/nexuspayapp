// Login.tsx - Updated for production deployment
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
import { AuthContextType, LoginFormFields } from "@/types/form-types";
import { useMutation } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import LoadingDialog from "@/components/dialog/LoadingDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import { Form, Formik } from "formik";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { formatPhoneNumberToE164, validateE164PhoneNumber } from "@/lib/phone-utils";

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const Login: React.FC = () => {
  const { login, verifyLogin } = useAuth(); // Use the typed useAuth hook here
  const [openLoading, setOpenLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState("password");
  const [openLoggin, setOpenLoggin] = useState(false); // Opens the Account Creation Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog
  const [openOTP, setOpenOTP] = useState(false); // Opens the OTP input dialog
  const [otpCode, setOtpCode] = useState("");
  const [userCredentials, setUserCredentials] = useState<LoginFormFields | null>(null);
  const api = useAxios();
  const router = useRouter();

  // Mutation to Initiate Login User
  const initiateLoginUser = useMutation({
    mutationFn: async (initiateLoginUserPost: LoginFormFields) => {
      // Store credentials for OTP verification
      setUserCredentials(initiateLoginUserPost);
      
      // First, initiate login
      const loginResponse = await login({
        phoneNumber: initiateLoginUserPost.phoneNumber,
        password: initiateLoginUserPost.password,
      });
      
      return loginResponse;
    },
    onSuccess: (data, variables, context) => {
      setOpenLoading(false);
      if (data.data.token) {
        // User is fully authenticated (no OTP required)
        setOpenLoggin(true);
        setTimeout(() => {
          router.replace("/home");
        }, 1000);
      } else if (data.success) {
        // Login successful, OTP sent - show OTP input
        setOpenOTP(true);
      }
    },
    onError: (error, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error(error);
      setOpenLoading(false);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {},
  });

  // Mutation to Verify OTP
  const verifyOTPMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!userCredentials) throw new Error("No user credentials found");
      
      const verifyResponse = await verifyLogin({
        phoneNumber: userCredentials.phoneNumber,
        otp: otp,
      });
      
      return verifyResponse;
    },
    onSuccess: (data, variables, context) => {
      console.log("OTP verification response:", data);
      
      // The AuthContext handleAuthSuccess will handle token extraction and storage
      // If we get here, authentication was successful
      setOpenOTP(false);
      setOpenLoggin(true);
      setTimeout(() => {
        router.replace("/home");
      }, 1000);
    },
    onError: (error, variables, context) => {
      console.error("OTP verification failed:", error);
      setOpenAccErr(true);
    },
  });

  // Handle OTP submission
  const handleOTPSubmit = () => {
    if (otpCode.length === 6) {
      verifyOTPMutation.mutate(otpCode);
    }
  };

  return (
    <section className="app-background">
      <LoadingDialog
        message="Confirming Credentials..."
        openLoading={openLoading}
        setOpenLoading={setOpenLoading}
      />
      <LoadingDialog
        message="Logging you in..."
        openLoading={openLoggin}
        setOpenLoading={setOpenLoggin}
      />
      <ErrorDialog
        message="Failed to Login"
        openError={openAccErr}
        setOpenError={setOpenAccErr}
      />
      <article>
        <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
        <h4 className="text-white my-5">Enter your Phone Number to Login</h4>
        {/* SignUp using Formik */}
        <Formik
          initialValues={{
            phoneNumber: "",
            password: "",
          }}
          validationSchema={Yup.object({
            phoneNumber: Yup.number()
              .min(13, "Min of 13 Characters required")
              .required("Phone Number is Required"),
            password: Yup.string()
              .max(20, "Must be 20 characters or less")
              .min(5, "Min of 5 Characters required")
              .required("Password is Required"),
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

              // Call the Initiate Login User Mutation
              console.log('Formatted login request data:', requestData);
              initiateLoginUser.mutate(requestData);
              setOpenLoggin(false);
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

            <PasswordInput
              label="Password"
              name="password"
              placeholder="Enter your Password"
            />
            <div className="flex flex-col justify-start mb-5">
              <p className="text-[#909090] p-1 text-sm font-semibold">
                <Link href="/forgotpassword" className="hover:text-white">
                  Forgot Password?
                </Link>
              </p>
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

        {/* Google Sign-In */}
        <div className="mt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-white text-sm">or</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
          <GoogleSignIn 
            mode="login"
            onSuccess={() => {
              setOpenLoggin(true);
              setTimeout(() => {
                router.replace("/home");
              }, 1000);
            }}
            onError={(error) => {
              console.error("Google login error:", error);
              setOpenAccErr(true);
            }}
          />
        </div>
      </article>

      {/* OTP Verification Dialog */}
      <Dialog open={openOTP} onOpenChange={setOpenOTP}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="mb-[20px]">Enter Verification Code</DialogTitle>
            <DialogDescription>
              We&apos;ve sent a 6-digit verification code to your phone number.
              Please enter it below to complete your login.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={otpCode[index] || ""}
                  onChange={(e) => {
                    const newOtp = otpCode.split("");
                    newOtp[index] = e.target.value;
                    setOtpCode(newOtp.join(""));
                    
                    // Auto-focus next input
                    if (e.target.value && index < 5 && typeof document !== 'undefined') {
                      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle backspace to focus previous input
                    if (e.key === "Backspace" && !otpCode[index] && index > 0 && typeof document !== 'undefined') {
                      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                      if (prevInput) prevInput.focus();
                    }
                  }}
                  data-index={index}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-[#0795B0] focus:outline-none bg-white text-black"
                />
              ))}
            </div>
            
            <div className="flex space-x-3 w-full">
              <button
                onClick={() => {
                  setOpenOTP(false);
                  setOtpCode("");
                }}
                className="flex-1 bg-gray-500 text-white p-3 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleOTPSubmit}
                disabled={otpCode.length !== 6 || verifyOTPMutation.isPending}
                className="flex-1 bg-[#0795B0] text-white p-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyOTPMutation.isPending ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Login;
