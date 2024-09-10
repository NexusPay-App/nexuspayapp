// Login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Adjusted import for useRouter
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth as useAuthOriginal } from "@/context/AuthContext"; // Import the original useAuth hook
import { Player } from "@lottiefiles/react-lottie-player"; //import the react animation lottie player
import loading from "@/public/json/loading.json";
import errorJson from "@/public/json/error.json";
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
import { AuthContextType, LoginFormFields, SignUpFormData } from "@/types/form-types";
import { useMutation } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import LoadingDialog from "@/components/dialog/LoadingDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import { Form, Formik } from "formik";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const ForgotPassword: React.FC = () => {
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [openLoading, setOpenLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState("password");
  const [openLoggin, setOpenLoggin] = useState(false); // Opens the Account Creation Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog
  const [openResetPassword, setOpenResetPassword ] = useState(false);
  const [userDetails, setUserDetails] = useState<SignUpFormData>({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const api = useAxios();
  const router = useRouter();

  // Mutation to Initiate Login User
  const initiateForgotPassword = useMutation({
    mutationFn: (initiateForgotPasswordPost: LoginFormFields) => {
      return api.post(
        "auth/forgotpassword",
        {
          phoneNumber: initiateForgotPasswordPost.phoneNumber,
          password: initiateForgotPasswordPost.password,
        },
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, variables, context) => {
      setOpenLoading(false);
      setOpenLoggin(true);
      login(data); // Use the login function from your context
      router.replace("/home");
    },
    onError: (error, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error(error);
      setOpenLoading(false);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {},
  });

    // Mutation to Initiate Register User
    const initiateRegisterUser = useMutation({
      mutationFn: (initiateRegisterUserPost: SignUpFormData) => {
        return api.post(
          "auth/register/initiate",
          {
            phoneNumber: initiateRegisterUserPost.phoneNumber,
            password: initiateRegisterUserPost.password,
          },
          {
            method: "POST",
          }
        );
      },
      onSuccess: (data, variables, context) => {
        setUserDetails(variables); // Store user details with the modified phone number
      },
      onError: (error, variables, context) => {
        // Handle errors, e.g., show a message to the user
        console.error("Failed to initiate sign-up.");
        setOpenAccErr(true);
      },
      onSettled: (data, error, variables, context) => {
      },
    });

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
        <h2 className="text-4xl text-white font-bold">Forgot Password</h2>
        <h4 className="text-white my-5">Enter your Phone Number to Reset Password</h4>
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
              <DialogDescription></DialogDescription>
              <hr className="my-4" />
              <Formik
          initialValues={{
            phoneNumber: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={Yup.object({
            phoneNumber: Yup.number()
              .min(13, "Min of 13 Characters required")
              .required("Phone Number is Required"),
            password: Yup.string()
              .max(20, "Must be 20 characters or less")
              .min(5, "Min of 5 Characters required")
              .required("Password is Required"),
            confirmPassword: Yup.string()
              .max(20, "Must be 20 characters or less")
              .min(5, "Min of 5 Characters required")
              .oneOf([Yup.ref("password"), undefined], "Passwords must match")
              .required("Confirm Password is Required"),
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
              initiateRegisterUser.mutate(requestData);
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

            <PasswordInput
              label="Password"
              name="password"
              placeholder="Enter your Password"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm your Password"
            />
            <div className="flex flex-col justify-start mb-5">
              <p className="text-[#909090] p-1 text-sm font-semibold">
                Have an account?{" "}
                <Link href="/login" className="hover:text-white text-gray-300">
                  Login
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
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </article>
    </section>
  );
};

export default ForgotPassword;
