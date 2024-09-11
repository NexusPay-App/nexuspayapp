"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assuming these components exist in your project
import { useAuth as useAuthOriginal } from "@/context/AuthContext"; // Import the original useAuth hook
import OTPInput from "react-otp-input";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import {
  AuthContextType,
  OTPFormData,
  SignUpBusinessFormData,
  SignUpFormData,
} from "@/types/form-types";
import useAxios from "@/hooks/useAxios";
import { useMutation } from "@tanstack/react-query";
import LoadingDialog from "@/components/dialog/LoadingDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import Link from "next/link";
import toast from "react-hot-toast";

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const SignupBusiness = () => {
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [openOTP, setOpenOTP] = useState(false);
  const router = useRouter();
  const [tillNumberParts, setTillNumberParts] = useState("");
  const [openSigningUp, setOpenSigningUp] = useState(false); // Opens the Account Creation Loading Dialog
  const [openConfirmingOTP, setOpenConfirmingOTP] = useState(false); // Opens the confirm otp Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog
  const api = useAxios();
  const [userDetails, setUserDetails] = useState<SignUpBusinessFormData>({
    ownerName: "",
    businessName: "",
    location: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Form hook for OTP verification
  const {
    register: registerOTP,
    setValue: setOTPValue,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPFormData>();

  // Mutation to Initiate Register User
  const initiateRegisterUser = useMutation({
    mutationFn: (initiateRegisterUserPost: SignUpBusinessFormData) => {
      setOpenSigningUp(true);
      return api.post(
        "business",
        {
          ownerName: initiateRegisterUserPost.ownerName,
          businessName: initiateRegisterUserPost.businessName,
          location: initiateRegisterUserPost.location,
          phoneNumber: initiateRegisterUserPost.phoneNumber,
          password: initiateRegisterUserPost.password,
        },
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, variables, context) => {
      setOpenSigningUp(false);
      setUserDetails(variables); // Store user details with the modified phone number
      loginUser.mutate(userDetails)
    //   setOpenOTP(true); // Open the OTP dialog
    },
    onError: (error, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to initiate sign-up.");
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {
    //   setOpenConfirmingOTP(false);
    },
  });

  // Mutation Side Effect to Login User
  const loginUser = useMutation({
    mutationFn: (loginUserPost: SignUpBusinessFormData) => {
      return api.post(
        "auth/login",
        {
          phoneNumber: loginUserPost.phoneNumber,
          password: loginUserPost.password,
        },
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, variables, context) => {
      login(data); // Use the login function from your context
      setOpenSigningUp(false); //
      router.replace("/home"); // Successfully logged in, navigate to home or dashboard
    },
    onError: (error, variables, context) => {
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {},
  });

//   const verifyUser = useMutation({
//     mutationFn: (verifyUserPost) => {
//       return api.post(
//         "auth/register",
//         {
//           ...userDetails,
//           otp: tillNumberParts,
//         },
//         {
//           method: "POST",
//         }
//       );
//     },
//     onSuccess: (data, variables, context) => {
//       loginUser.mutate(userDetails);
//     },
//     onError: (error, variables, context) => {
//       // Handle errors, e.g., invalid OTP
//       console.error("Failed to verify OTP.");
//       setOpenAccErr(true);
//     },
//     onSettled: (data, error, variables, context) => {
//       console.log(data);
//     },
//   });

//   const verifyOTP = async (otpData: OTPFormData) => {
//     if (!userDetails) return; // Ensure userDetails is not null
//     // console.log(otpData.otp);

//     // Call the verify API with stored user details and provided OTP
//     const promise = verifyUser.mutate();
//     console.log("promise", promise);
//   };

  return (
    <section className="home-background p-3">
      {/* <Dialog open={openOTP} onOpenChange={setOpenOTP}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">
              Confirm OTP-code sent to Phone Number
            </DialogTitle>
            <hr className="my-4" />
            <form
              onSubmit={handleOTPSubmit(verifyOTP)}
              className="flex flex-col justify-around h-[200px]"
            >
              <div className="flex justify-center">
                <OTPInput
                  inputStyle={{
                    border: "1px solid black",
                    borderRadius: "8px",
                    padding: "8px",
                    backgroundColor: "white",
                    color: "black",
                    width: "40px",
                    fontSize: "18px",
                  }}
                  containerStyle={{ width: "auto" }}
                  inputType="number"
                  value={tillNumberParts}
                  onChange={setTillNumberParts}
                  numInputs={6}
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} />}
                />
              </div>
              <button
                type="submit"
                className="bg-black text-white font-semibold rounded-lg p-3 w-auto"
              >
                Confirm OTP Code
              </button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog> */}
      <LoadingDialog
        message="Creating Account"
        openLoading={openSigningUp}
        setOpenLoading={setOpenSigningUp}
      />
      <LoadingDialog
        message="Sending OTP Code...."
        openLoading={openConfirmingOTP}
        setOpenLoading={setOpenConfirmingOTP}
      />
      <ErrorDialog
        message="Failed to Create Account"
        openError={openAccErr}
        setOpenError={setOpenAccErr}
      />
      <article>
        <h2 className="text-2xl text-white font-bold">
          Sign Up to NexusPay For Business
        </h2>
        <h4 className="text-white my-5">
          Enter your Details to Sign Up to NexusPay
        </h4>
        {/* SignUp using Formik */}
        <Formik
          initialValues={{
            ownerName: "",
            businessName: "",
            location: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={Yup.object({
            ownerName: Yup.string()
              .min(6, "Min of 6 Characters required")
              .required("Business Name is Required"),
            businessName: Yup.string()
              .min(5, "Min of 5 Characters required")
              .required("Business Owner Name is Required"),
            location: Yup.string()
              .min(4, "Min of 4 Characters required")
              .required("Location is Required"),
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
              setOpenSigningUp(true);
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
                // console.log(requestData);
              initiateRegisterUser.mutate(requestData);
              setOpenSigningUp(false);
              setSubmitting(false);
            }, 400);
          }}
        >
          <Form>
            <TextInput
              label="Business Name"
              name="businessName"
              type="text"
              placeholder="Enter your Business Name"
            />
            <TextInput
              label="Business Owner Name"
              name="ownerName"
              type="text"
              placeholder="Enter your Business Owner Name"
            />
            <TextInput
              label="Location"
              name="location"
              type="text"
              placeholder="Enter your Location"
            />
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
                <Link href="/signup" className="hover:text-white">
                  Create a Personal Account?
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
      </article>
    </section>
  );
};

export default SignupBusiness;
