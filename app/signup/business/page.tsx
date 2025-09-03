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
import SuccessDialog from "@/components/dialog/SuccessDialog";
import GoogleSignIn from "@/components/auth/GoogleSignIn";

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const SignupBusiness = () => {
  const { login, user, isAuthenticated } = useAuth(); // Get user data for auto-fill
  const [openOTP, setOpenOTP] = useState(false);
  const router = useRouter();
  const [tillNumberParts, setTillNumberParts] = useState("");
  const [openMerchantSuccess, setOpenMerchantSuccess] = useState(false);
  const [openSigningUp, setOpenSigningUp] = useState(false); // Opens the Account Creation Loading Dialog
  const [openConfirmingOTP, setOpenConfirmingOTP] = useState(false); // Opens the confirm otp Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog
  const [errorMessage, setErrorMessage] = useState(""); // Store specific error message
  const [existingBusinesses, setExistingBusinesses] = useState<any[]>([]); // Track existing business accounts
  const api = useAxios();
  const [userDetails, setUserDetails] = useState<SignUpBusinessFormData>({
    userId: "",
    ownerName: "",
    businessName: "",
    location: "",
    phoneNumber: "",
    businessType: "",
  });

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: any) => {
    const errorData = error.response?.data;
    const status = error.response?.status;
    
    if (errorData?.message) {
      return errorData.message;
    }
    
    switch (status) {
      case 400:
        return "Invalid data provided. Please check your information and try again.";
      case 401:
        return "Authentication required. Please login first.";
      case 403:
        return "Access denied. You don't have permission to perform this action.";
      case 404:
        return "Service not found. Please contact support.";
      case 409:
        return "Phone number already registered. Please use a different phone number or login with existing account.";
      case 422:
        return "Validation failed. Please check your input and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  // Helper function to check existing businesses for a phone number
  const checkExistingBusinesses = async (phoneNumber: string) => {
    try {
      const formattedPhone = phoneNumber.toString().startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;
        
      const response = await api.get(`business/phone/${formattedPhone.replace('+', '')}`);
      
      if (response.data?.success && response.data?.data?.businesses) {
        setExistingBusinesses(response.data.data.businesses);
        console.log(`Found ${response.data.data.businesses.length} existing business accounts`);
      }
    } catch (error) {
      console.log("No existing businesses found or error checking:", error);
      setExistingBusinesses([]);
    }
  };

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
      
      // Ensure phone number has + prefix for registration
      const formattedPhoneNumber = initiateRegisterUserPost.phoneNumber.toString().startsWith('+') 
        ? initiateRegisterUserPost.phoneNumber 
        : `+${initiateRegisterUserPost.phoneNumber}`;
        
      console.log("Sending business registration data:", {
        ...initiateRegisterUserPost,
        phoneNumber: formattedPhoneNumber,
      });
      
      return api.post(
        "business/request-upgrade",
        {
          userId: initiateRegisterUserPost.userId || 'temp_user_id', // Will be replaced with actual user ID
          phoneNumber: formattedPhoneNumber,
          businessName: initiateRegisterUserPost.businessName,
          ownerName: initiateRegisterUserPost.ownerName,
          location: initiateRegisterUserPost.location,
          businessType: initiateRegisterUserPost.businessType || 'General Business',
        },
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
    },
    onSuccess: (data, variables, context) => {
      console.log("Business registration success:", data);
      setOpenSigningUp(false);
      setUserDetails(variables); // Store user details with the modified phone number
      
      // Show existing businesses count if available
      if (data.data?.existingBusinesses) {
        console.log(`User has ${data.data.existingBusinesses.length} existing business accounts`);
        setExistingBusinesses(data.data.existingBusinesses);
      }
      
      // Always show OTP dialog since OTP is logged in server
      setOpenOTP(true);
    },
    onError: (error: any, variables, context) => {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to initiate business sign-up:", error);
      console.error("Error response:", error.response?.data);
      setOpenSigningUp(false);
      
      // Get user-friendly error message
      const specificMessage = getErrorMessage(error);
      setErrorMessage(specificMessage);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {
      setOpenSigningUp(false);
    },
  });

  // Mutation Side Effect to Login User
  const loginUser = useMutation({
    mutationFn: (loginUserPost: SignUpBusinessFormData) => {
      // Ensure phone number has + prefix for login
      const formattedPhoneNumber = loginUserPost.phoneNumber.toString().startsWith('+') 
        ? loginUserPost.phoneNumber 
        : `+${loginUserPost.phoneNumber}`;
        
      console.log("Attempting login with:", {
        phoneNumber: formattedPhoneNumber,
      });
      
      // For business accounts, we don't need password login
      // This is just a fallback, but business creation should handle authentication
      return Promise.resolve({ success: true, data: { token: "business_token" } });
    },
    onSuccess: (data, variables, context) => {
      console.log("Login success:", data);
      login(data); // Use the login function from your context
      setOpenSigningUp(false); //
      setOpenMerchantSuccess(true);
      setTimeout(() => {
        router.replace("/home"); // Successfully logged in, navigate to home or dashboard
      }, 2000);
    },
    onError: (error: any, variables, context) => {
      console.error("Login failed:", error);
      console.error("Login error response:", error.response?.data);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {
      console.log("Login settled:", { data, error });
    },
  });

  const verifyUser = useMutation({
    mutationFn: (verifyUserPost) => {
      // Ensure phone number has + prefix for verification
      const formattedPhoneNumber = userDetails.phoneNumber.toString().startsWith('+') 
        ? userDetails.phoneNumber 
        : `+${userDetails.phoneNumber}`;
        
      console.log("Completing business creation with data:", {
        phoneNumber: formattedPhoneNumber,
        otp: tillNumberParts,
      });
      
      return api.post(
        "business/complete-upgrade",
        {
          userId: userDetails.userId || 'temp_user_id',
          phoneNumber: formattedPhoneNumber,
          otp: tillNumberParts,
          businessName: userDetails.businessName,
          ownerName: userDetails.ownerName,
          location: userDetails.location,
          businessType: userDetails.businessType || 'General Business',
        },
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
    },
    onSuccess: (data, variables, context) => {
      console.log("Business creation success:", data);
      setOpenConfirmingOTP(false);
      
      // Show business creation details
      if (data.data?.merchantId) {
        console.log("✅ Business Account Created Successfully!");
        console.log("Merchant ID:", data.data.merchantId);
        console.log("Business Wallet:", data.data.walletAddress);
        console.log("Credit Limit:", data.data.creditLimit);
      }
      
      // If verification returns a token, user is fully registered and logged in
      if (data.data?.token) {
        login(data);
        setOpenMerchantSuccess(true);
        setTimeout(() => {
          router.replace("/business"); // Redirect to business dashboard
        }, 2000);
      } else {
        // Otherwise, proceed with login
        loginUser.mutate(userDetails);
      }
    },
    onError: (error: any, variables, context) => {
      // Handle errors, e.g., invalid OTP
      console.error("Failed to complete business creation:", error);
      console.error("Error response:", error.response?.data);
      
      // Get user-friendly error message
      const specificMessage = getErrorMessage(error);
      setErrorMessage(specificMessage);
      setOpenAccErr(true);
    },
    onSettled: (data, error, variables, context) => {
      console.log("OTP verification settled:", { data, error });
    },
  });

  const verifyOTP = async (otpData: OTPFormData) => {
    if (!userDetails) {
      console.error("No user details available");
      return;
    }
    
    if (!tillNumberParts || tillNumberParts.length !== 6) {
      console.error("Invalid OTP length:", tillNumberParts);
      return;
    }
    
    // Clear any previous error messages
    setErrorMessage("");
    
    // Ensure phone number has + prefix
    const formattedPhoneNumber = userDetails.phoneNumber.toString().startsWith('+') 
      ? userDetails.phoneNumber 
      : `+${userDetails.phoneNumber}`;
    
    console.log("Starting business creation with:", {
      phoneNumber: formattedPhoneNumber,
      otp: tillNumberParts,
    });

    // Call the verify API with stored user details and provided OTP
    verifyUser.mutate();
  };

  return (
    <section className="home-background p-3">
      <Dialog open={openOTP} onOpenChange={setOpenOTP}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">
              Enter Business Verification Code from SMS
            </DialogTitle>
            <hr className="my-4" />
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Business OTP:</strong> Check your SMS for the 6-digit business verification code
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                ⚠️ <strong>Note:</strong> This OTP is specifically for business account creation
              </p>
            </div>
            <form
              onSubmit={handleOTPSubmit(verifyOTP)}
              className="flex flex-col justify-around h-[200px]"
            >
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={tillNumberParts[index] || ""}
                    onChange={(e) => {
                      const newOtp = tillNumberParts.split("");
                      newOtp[index] = e.target.value;
                      setTillNumberParts(newOtp.join(""));
                      
                      // Auto-focus next input
                      if (e.target.value && index < 5 && typeof document !== 'undefined') {
                        const nextInput = document.querySelector(`input[data-business-index="${index + 1}"]`) as HTMLInputElement;
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to focus previous input
                      if (e.key === "Backspace" && !tillNumberParts[index] && index > 0 && typeof document !== 'undefined') {
                        const prevInput = document.querySelector(`input[data-business-index="${index - 1}"]`) as HTMLInputElement;
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    data-business-index={index}
                    className="w-10 h-10 text-center text-lg font-semibold border border-black rounded-lg focus:border-[#0795B0] focus:outline-none bg-white text-black"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="bg-black text-white font-semibold rounded-lg p-3 w-auto"
              >
                Create Business Account
              </button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <LoadingDialog
        message="Requesting Business Account Creation"
        openLoading={openSigningUp}
        setOpenLoading={setOpenSigningUp}
      />
      <LoadingDialog
        message="Sending Business OTP Code...."
        openLoading={openConfirmingOTP}
        setOpenLoading={setOpenConfirmingOTP}
      />
      <SuccessDialog
        message="Business Account Created Successfully! You can now manage multiple business accounts under one personal wallet."
        openSuccess={openMerchantSuccess}
        setOpenSuccess={setOpenMerchantSuccess}
      />
      <ErrorDialog
        message={errorMessage || "Failed to Create Business Account"}
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
        <p className="text-sm text-gray-300 mb-4">
          💡 <strong>Optimized System:</strong> One personal wallet per phone number, multiple business accounts allowed.
        </p>
        
        {/* User ID Information */}
        {isAuthenticated && user?.id ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-green-300">
                Logged In User Detected
              </h3>
            </div>
            <p className="text-sm text-green-200 mb-2">
              Your User ID will be automatically filled: <span className="font-mono text-green-300">{user.id}</span>
            </p>
            <p className="text-xs text-green-300">
              ✅ You can create business accounts linked to your personal wallet
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-yellow-300">
                User ID Required
              </h3>
            </div>
            <p className="text-sm text-yellow-200 mb-2">
              You need your User ID from your personal account to create a business account.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/login")}
                className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
              >
                Login First
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Get User ID
              </button>
            </div>
          </div>
        )}
        
        {/* Existing Businesses Info */}
        {existingBusinesses.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-blue-900">
                Existing Business Accounts ({existingBusinesses.length})
              </h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              You already have {existingBusinesses.length} business account{existingBusinesses.length > 1 ? 's' : ''} linked to this phone number.
            </p>
            <div className="space-y-2">
              {existingBusinesses.slice(0, 3).map((business, index) => (
                <div key={index} className="flex items-center justify-between text-xs text-blue-600">
                  <span className="font-medium">{business.businessName}</span>
                  <span className="text-blue-500">ID: {business.merchantId}</span>
                </div>
              ))}
              {existingBusinesses.length > 3 && (
                <div className="text-xs text-blue-500">
                  +{existingBusinesses.length - 3} more business account{existingBusinesses.length - 3 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* SignUp using Formik */}
        <Formik
          initialValues={{
            userId: user?.id || "",
            ownerName: "",
            businessName: "",
            location: "",
            phoneNumber: user?.phoneNumber || "",
            businessType: "",
          }}
          validationSchema={Yup.object({
            userId: Yup.string()
              .min(3, "Min of 3 Characters required")
              .required("User ID is Required"),
            ownerName: Yup.string()
              .min(6, "Min of 6 Characters required")
              .required("Business Owner Name is Required"),
            businessName: Yup.string()
              .min(5, "Min of 5 Characters required")
              .required("Business Name is Required"),
            location: Yup.string()
              .min(4, "Min of 4 Characters required")
              .required("Location is Required"),
            phoneNumber: Yup.number()
              .min(13, "Min of 13 Characters required")
              .required("Phone Number is Required"),
            businessType: Yup.string()
              .min(3, "Min of 3 Characters required")
              .required("Business Type is Required"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(async () => {
              // Clear any previous error messages
              setErrorMessage("");
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
              label="User ID"
              name="userId"
              type="text"
              placeholder="Enter your User ID from personal account"
            />
            <div className="text-xs text-gray-300 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="mb-2">
                💡 <strong>Don't have your User ID?</strong>
              </p>
              <div className="space-y-1">
                <p>1. <button onClick={() => router.push("/login")} className="text-blue-300 hover:text-blue-200 underline">Login to your account</button></p>
                <p>2. <button onClick={() => router.push("/settings")} className="text-blue-300 hover:text-blue-200 underline">Go to your settings</button></p>
                <p>3. Copy your User ID and return here</p>
              </div>
            </div>
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
            <TextInput
              label="Business Type"
              name="businessType"
              type="text"
              placeholder="e.g., Technology Services, Retail, etc."
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
              Create Business
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
            mode="signup"
            onSuccess={() => {
              setOpenSigningUp(true);
              setTimeout(() => {
                router.replace("/home");
              }, 1000);
            }}
            onError={(error) => {
              console.error("Google signup error:", error);
              setOpenAccErr(true);
            }}
          />
        </div>
      </article>
    </section>
  );
};

export default SignupBusiness;
