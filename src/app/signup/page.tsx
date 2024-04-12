"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assuming these components exist in your project
import { useAuth as useAuthOriginal } from "@/context/AuthContext"; // Import the original useAuth hook
import { Player, Controls } from "@lottiefiles/react-lottie-player"; // import  react lottie player
import loading from "../../../public/json/loading.json";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import OTPInput from "react-otp-input";
import lottieConfirm from "../../../public/json/confirm.json";
import Link from "next/link";

// Define your form fields interface
interface LoginFormFields {
  phoneNumber: string;
  password: string;
}

// Define the expected type for the useAuth hook's return value
interface AuthContextType {
  user: any; // Replace `any` with your actual user type
  login: (userData: any) => void; // Adjust according to the actual parameters and types
  logout: () => void;
}

// A wrapper or assertion to cast the useAuth hook's return type
const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

// Define the types for the form data
type SignUpFormData = {
  userName: string;
  phoneNumber: string;
  password: string;
};

type OTPFormData = {
  otp: string;
};

const Signup = () => {
  const [openOTP, setOpenOTP] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [passwordVisibility, setPasswordVisibility] = useState("password");
  const [tillNumberParts, setTillNumberParts] = useState("");
  const [openSigningUp, setOpenSigningUp] = useState(false); // Opens the Account Creation Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog

  // Form hook for sign-up
  const {
    register,
    handleSubmit: handleSignUpSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();

  // Form hook for OTP verification
  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPFormData>();

  const [userDetails, setUserDetails] = useState<SignUpFormData | null>(null);

  // const initiateSignUp = async (data: SignUpFormData) => {
  //   // Assuming the API endpoint '/api/register/initiate' expects userName, phoneNumber, and password
  //   const response = await fetch(
  //     "https://afpaybackend.vercel.app/api/auth/register/initiate",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     }
  //   );

  //   if (response.ok) {
  //     setUserDetails(data); // Store user details for later use
  //     setOpenOTP(true); // Open the OTP dialog
  //   } else {
  //     // Handle errors, e.g., show a message to the user
  //     console.error("Failed to initiate sign-up.");
  //   }
  // };

  const initiateSignUp = async (data: SignUpFormData) => {
    // Check if phoneNumber starts with '01' or '07' and modify it
    let modifiedPhoneNumber = data.phoneNumber;
    if (
      modifiedPhoneNumber.startsWith("01") ||
      modifiedPhoneNumber.startsWith("07")
    ) {
      modifiedPhoneNumber = "+254" + modifiedPhoneNumber.substring(1);
    }

    // Use the modifiedPhoneNumber in your API request
    const requestData = {
      ...data,
      phoneNumber: modifiedPhoneNumber, // Replace the original phoneNumber with the modified one
    };

    const response = await fetch(
      "http://localhost:8000/api/auth/register/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (response.ok) {
      setUserDetails({ ...data, phoneNumber: modifiedPhoneNumber }); // Store user details with the modified phone number
      setOpenOTP(true); // Open the OTP dialog
    } else {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to initiate sign-up.");
    }
  };

  const verifyOTP = async (otpData: OTPFormData) => {
    setOpenSigningUp(true);
    if (!userDetails) return; // Ensure userDetails is not null

    // Call the register API with stored user details and provided OTP
    const registerResponse = await fetch(
      "http://localhost:8000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userDetails,
          otp: otpData.otp,
        }),
      }
    );

    if (registerResponse.ok) {
      // After successful registration, perform login
      const loginResponse = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: userDetails.phoneNumber,
            password: userDetails.password,
          }),
        }
      );

      if (loginResponse.ok) {
        const responseData = await loginResponse.json();
        login(responseData); // Use the login function from your context
        setOpenSigningUp(false);
        // Successfully logged in, navigate to home or dashboard
        router.replace("/home");
      } else {
        // Handle login failure
        setOpenSigningUp(false);
        setOpenAccErr(true);
        console.error("Failed to log in after registration.");
        // Here you might want to inform the user or handle the error
      }
    } else {
      // Handle errors, e.g., invalid OTP
      console.error("Failed to verify OTP.");
    }
  };

  return (
    <section className="app-background">
      <Dialog open={openOTP} onOpenChange={setOpenOTP}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">
              Confirm OTP-code sent to Phone Number
            </DialogTitle>
            <hr className="my-4" />
            <form
              onSubmit={handleOTPSubmit(verifyOTP)}
              className="flex flex-col justify-around h-[200px]"
            >
              <label
                htmlFor="otpcode"
                className="text-black font-semibold mb-2"
              >
                OTP-Code
              </label>
              <input
                {...registerOTP("otp")}
                type="number"
                placeholder="Enter OTP"
                className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6 w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
              />
              <OTPInput
                inputStyle={{
                  border: "1px solid #0795B0",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#0A0E0E",
                  color: "white",
                  width: "50px",
                  fontSize: "18px",
                }}
                inputType="number"
                value={tillNumberParts}
                onChange={setTillNumberParts}
                numInputs={5}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
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
      <Dialog open={openSigningUp} onOpenChange={setOpenSigningUp}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="mb-[5px]">Logging you in</DialogTitle>

            <Player
              keepLastFrame
              autoplay
              loop={true}
              src={lottieConfirm}
              style={{ height: "200px", width: "200px" }}
            ></Player>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={openAccErr} onOpenChange={setOpenAccErr}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Failed to Create your Account</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <article>
        <h2 className="text-4xl text-white font-bold">Sign Up to NexusPay</h2>
        <h4 className="text-white my-5">
          Enter your Details to Sign Up to NexusPay
        </h4>
        <form onSubmit={handleSignUpSubmit(initiateSignUp)}>
          {/* Input fields for userName, phoneNumber, and password */}
          <span className="flex flex-col">
            <label
              htmlFor="userName"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              User Name
            </label>
            <input
              {...register("userName")}
              type="text"
              name="name"
              placeholder="Enter your User Name"
              className="p-3 rounded-full text-sm"
            />
          </span>
          <span className="flex flex-col">
            <label
              htmlFor="phoneNumber"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              Phone Number eg (0720****20)
            </label>
            <input
              {...register("phoneNumber")}
              type="text"
              name="phoneNumber"
              placeholder="Enter your Phone Number"
              className="p-3 rounded-full text-sm w-full"
            />
          </span>
          <span className="flex flex-col">
            <label
              htmlFor="password"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              Password
            </label>
            <div className="flex justify-between bg-white rounded-full py-2 px-6 mb-5 w-full focus:outline-none ring-offset-[#0CAF60] focus-visible:bg-transparent">
              <input
                type={passwordVisibility}
                {...register("password", {
                  required: " This is required ",
                  minLength: {
                    value: 6,
                    message: "Minimum password length is six characters",
                  },
                })}
                id=""
                className="py-1 w-full focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  passwordVisibility == "password"
                    ? setPasswordVisibility("text")
                    : setPasswordVisibility("password");
                }}
              >
                {passwordVisibility == "password" ? (
                  <EyeSlash size={24} />
                ) : (
                  <Eye size={24} />
                )}
              </button>
            </div>
          </span>
          <div className="flex justify-start mb-5">
            <p className="text-[#909090] p-1 text-sm font-semibold">
              Have an account? <Link href="/login">Login</Link>
            </p>
          </div>
          <input
            type="submit"
            value="Sign Up"
            className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
          />
          <Player
            keepLastFrame
            autoplay
            src={loading}
            style={{ height: "100px", width: "100px" }}
          ></Player>
        </form>
      </article>
    </section>
  );
};

export default Signup;
