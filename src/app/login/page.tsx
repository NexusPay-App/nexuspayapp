// Login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Adjusted import for useRouter
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth as useAuthOriginal } from "@/context/AuthContext"; // Import the original useAuth hook
import { Player } from "@lottiefiles/react-lottie-player"; //import the react animation lottie player
import loading from "../../../public/json/loading.json";
import lottieConfirm from "../../../public/json/confirm.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Eye, EyeSlash } from "@phosphor-icons/react";

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

const Login: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormFields>();
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [openLoading, setOpenLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState("password");
  const [openLoggin, setOpenLoggin] = useState(false); // Opens the Account Creation Loading Dialog
  const [openAccErr, setOpenAccErr] = useState(false); // Opens the Failed Acc Creation Loading Dialog

  // const submitLogin: SubmitHandler<LoginFormFields> = async (data) => {
  //   // setOpenLoading(true);
  //   try {
  //     const response = await fetch("https://afpaybackend.vercel.app/api/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to login");
  //     }

  //     const responseData = await response.json();
  //     login(responseData); // Use the login function from your context
  //     router.replace("/home"); // Navigate to home on successful login
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     // Handle login errors, e.g., show a message to the user
  //   }
  // };

  const submitLogin: SubmitHandler<LoginFormFields> = async (data) => {
    // Preprocess the phoneNumber to include the +254 country code prefix
    let modifiedPhoneNumber = data.phoneNumber;
    if (
      modifiedPhoneNumber.startsWith("01") ||
      modifiedPhoneNumber.startsWith("07")
    ) {
      modifiedPhoneNumber = "+254" + modifiedPhoneNumber.substring(1);
    }

    const modifiedData = {
      ...data,
      phoneNumber: modifiedPhoneNumber, // Use the modified phoneNumber
    };

    try {
      setOpenLoggin(true);
      const response = await fetch("https://afpaybackend.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Pass the modifiedData with the adjusted phoneNumber
        body: JSON.stringify(modifiedData),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const responseData = await response.json();
      login(responseData); // Use the login function from your context
      router.replace("/home"); // Navigate to home on successful login
    } catch (error) {
      console.error("Login error:", error);
      setOpenLoggin(false);
      setOpenAccErr(true);
      // Handle login errors, e.g., show a message to the user
    }
  };

  return (
    <section className="app-background">
      <article>
        <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
        <h4 className="text-white my-5">Enter your Phone Number to Login</h4>
        <form onSubmit={handleSubmit(submitLogin)}>
          <div className="flex flex-col">
            <label
              htmlFor="phoneNumber"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              Phone Number eg (0720****20)
            </label>
            <input
              {...register("phoneNumber", { required: "Phone number is required " })}
              type="text"
              placeholder="Enter your Phone Number"
              className="p-3 rounded-full text-sm w-full"
            />
            {errors.phoneNumber && <span className="text-red-500 text-sm m-1">{errors.phoneNumber.message}</span>}
          </div>
          <div className="flex flex-col mt-5">
            <label htmlFor="password" className="text-[#909090] p-1 text-sm">
              Password
            </label>
            <div className="flex justify-between bg-white rounded-full py-2 px-6  w-full focus:outline-none ring-offset-[#0CAF60] focus-visible:bg-transparent">
              <input
                type={passwordVisibility}
                {...register("password", {
                  required: "Minimum password length is six characters",
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
            {errors.password && <span className="text-red-500 text-sm m-1">{errors.password.message}</span>}
          </div>
          <div className="flex justify-start mb-5">
            <p className="text-[#909090] p-1 text-sm font-semibold">
              Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
            </p>
          </div>
          <input
            type="submit"
            value="Connect"
            className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
          />
          <Dialog open={openLoading} onOpenChange={setOpenLoading}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-black">Signing You In</DialogTitle>
                <Player
                  keepLastFrame
                  autoplay
                  loop
                  src={loading}
                  className="w-[300px] h-[300px]"
                ></Player>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog open={openLoggin} onOpenChange={setOpenLoggin}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="mb-[5px]">Logging you in</DialogTitle>
                <Player
                  keepLastFrame
                  autoplay
                  loop={true}
                  src={loading}
                  style={{ height: "200px", width: "200px" }}
                ></Player>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog open={openAccErr} onOpenChange={setOpenAccErr}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="mb-[5px]">
                  Failed to Login you in
                </DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </form>
      </article>
    </section>
  );
};

export default Login;

