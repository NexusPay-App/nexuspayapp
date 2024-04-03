// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import { useForm } from "react-hook-form";

// const Login = () => {
//   const [openOTP, setOpenOTP] = useState(false);
//   const router = useRouter();

//   // Form Hook for Login
//   const {
//     register: registerLogin,
//     handleSubmit: handleSubmitLogin,
//     setValue: setLoginValue,
//     formState: { errors: errorsLogin },
//     control: controlLogin,
//   } = useForm();

//   const submitLogin = () => {
//     setOpenOTP(true);
//   };

//   // Form Hook for OTP
//   const {
//     register: registerOTP,
//     handleSubmit: handleSubmitOTP,
//     setValue: setOTPValue,
//     formState: { errors: errorsOTP },
//     control: controlOTP,
//   } = useForm();

//   const submitOTP = () => {
//     router.replace("/home");
//   };

//   return (
//     <section className="app-background">
//       <Dialog open={openOTP} onOpenChange={setOpenOTP}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="text-black">
//               {" "}
//               Confirm OPT-code sent to Phone Number{" "}
//             </DialogTitle>
//             <DialogDescription></DialogDescription>
//             <hr className="my-4" />
//             <form
//               className="flex flex-col justify-around h-[200px]"
//               onSubmit={handleSubmitOTP(submitOTP)}
//             >
//               <label
//                 htmlFor="otpcode"
//                 className="text-black font-semibold mb-2"
//               >
//                 OTP-Code
//               </label>
//               <input
//                 {...registerOTP("otp")}
//                 id=""
//                 type="number"
//                 placeholder="Enter OTP"
//                 className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
//               />
//               <button
//                 type="submit"
//                 className="bg-black text-white font-semibold rounded-lg p-3"
//               >
//                 Confirm OTP Code
//               </button>
//             </form>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//       <article className="">
//         <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
//         <h4 className="text-white my-5">
//           Enter your Phone Number to Login to NexusPay
//         </h4>
//         <form onSubmit={handleSubmitLogin(submitLogin)}>
//           <span className="flex flex-col">
//             <label
//               htmlFor="phoneNumber"
//               className="text-[#909090] p-1 text-sm mt-4"
//             >
//               Phone Number eg (+254720****20)
//             </label>
//             <span className="flex">
//               <h4 className="p-3 rounded-full bg-white mr-1 text-sm font-semibold">
//                 +254
//               </h4>
//               <input
//                 {...registerLogin("phoneNumber")}
//                 type="number"
//                 placeholder="Enter your Phone Number"
//                 className="p-3 rounded-full text-sm w-full"
//               />
//             </span>
//           </span>
//           <span className="flex flex-col mt-5">
//             <label htmlFor="password" className="text-[#909090] p-1 text-sm">
//               Password
//             </label>
//             <input
//               {...registerLogin("phoneNumber")}
//               type="password"
//               placeholder="Enter your Password"
//               className="p-3 rounded-full text-sm"
//             />
//           </span>
//           <span className="flex justify-end mb-5">
//             <h5 className="text-[#909090] p-1 text-sm font-semibold">
//               Forgot Password?
//             </h5>
//           </span>
//           <input
//             type="submit"
//             value="Connect"
//             className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
//           />
//         </form>
//       </article>
//     </section>
//   );
// };

// export default Login;

// "use client";

// import { useRouter } from "next/navigation"; // Correcting import for useRouter
// import React from "react";
// import { SubmitHandler, useForm } from "react-hook-form";

// interface LoginFormFields {
//   phoneNumber: string;
//   password: string;
// }

// const Login = () => {
//   const router = useRouter();

//   const { register, handleSubmit, formState: { errors } } = useForm<LoginFormFields>();

//   const submitLogin: SubmitHandler<LoginFormFields> = async (data) => {
//     try {
//       const response = await fetch('http://localhost:8000/api/auth/login', { // Adjust the URL to your API endpoint
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to login');
//       }

//       const responseData = await response.json();
//       console.log('Login successful:', responseData); // Process your login here (e.g., redirect, store token)

//       router.replace("/home"); // Navigate to home on successful login
//     } catch (error) {
//       console.error("Login error:", error);
//       // Handle login errors, e.g., show a message to the user
//     }
//   };

//   return (
//     <section className="app-background">
//       <article>
//         <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
//         <h4 className="text-white my-5">
//           Enter your Phone Number to Login
//         </h4>
//         <form onSubmit={handleSubmit(submitLogin)}>

//           <div className="flex flex-col">
//             <label htmlFor="phoneNumber" className="text-[#909090] p-1 text-sm mt-4">
//               Phone Number eg (+254720****20)
//             </label>
//             <input
//               {...register("phoneNumber", { required: true })}
//               type="text"
//               placeholder="Enter your Phone Number"
//               className="p-3 rounded-full text-sm w-full"
//             />
//           </div>
//           <div className="flex flex-col mt-5">
//             <label htmlFor="password" className="text-[#909090] p-1 text-sm">
//               Password
//             </label>
//             <input
//               {...register("password", { required: true })}
//               type="password"
//               placeholder="Enter your Password"
//               className="p-3 rounded-full text-sm"
//             />
//           </div>
//           <div className="flex justify-end mb-5">
//             <p className="text-[#909090] p-1 text-sm font-semibold">
//               Forgot Password?
//             </p>
//           </div>
//           <input
//             type="submit"
//             value="Connect"
//             className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
//           />
//         </form>
//       </article>
//     </section>
//   );
// };

// export default Login;

// "use client";

// import React from "react";
// import { useRouter } from "next/navigation"; // Corrected import for useRouter
// import { SubmitHandler, useForm } from "react-hook-form";
// import { useAuth } from "@/context/AuthContext"; // Make sure this path matches where your AuthContext is located

// interface LoginFormFields {
//   phoneNumber: string;
//   password: string;
// }

// const Login = () => {
//   const { login } = useAuth(); // Destructure the login function from useAuth
//   const router = useRouter();
//   const { register, handleSubmit, formState: { errors } } = useForm<LoginFormFields>();

//   const submitLogin: SubmitHandler<LoginFormFields> = async (data) => {
//     try {
//       const response = await fetch('http://localhost:8000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to login');
//       }

//       const responseData = await response.json(); // Assuming this contains the user data needed for your context

//       login(responseData); // Use the login function from your context to update the global auth state
//       router.replace("/home"); // Navigate to home on successful login
//     } catch (error) {
//       console.error("Login error:", error);
//       // Here, you would handle login errors, e.g., show a message to the user
//     }
//   };

//   return (
//     <section className="app-background">
//       <article>
//         <h2 className="text-4xl text-white font-bold">Sign in with Password</h2>
//         <h4 className="text-white my-5">
//           Enter your Phone Number to Login
//         </h4>
//         <form onSubmit={handleSubmit(submitLogin)}>
//           <div className="flex flex-col">
//             <label htmlFor="phoneNumber" className="text-[#909090] p-1 text-sm mt-4">
//               Phone Number eg (+254720****20)
//             </label>
//             <input
//               {...register("phoneNumber", { required: true })}
//               type="text"
//               placeholder="Enter your Phone Number"
//               className="p-3 rounded-full text-sm w-full"
//             />
//           </div>
//           <div className="flex flex-col mt-5">
//             <label htmlFor="password" className="text-[#909090] p-1 text-sm">
//               Password
//             </label>
//             <input
//               {...register("password", { required: true })}
//               type="password"
//               placeholder="Enter your Password"
//               className="p-3 rounded-full text-sm"
//             />
//           </div>
//           <div className="flex justify-end mb-5">
//             <p className="text-[#909090] p-1 text-sm font-semibold">
//               Forgot Password?
//             </p>
//           </div>
//           <input
//             type="submit"
//             value="Connect"
//             className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
//           />
//         </form>
//       </article>
//     </section>
//   );
// };

// export default Login;

// Login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Adjusted import for useRouter
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth as useAuthOriginal } from "@/context/AuthContext"; // Import the original useAuth hook
import { Player } from "@lottiefiles/react-lottie-player"; //import the react animation lottie player
import loading from "../../../public/json/loading.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const Login: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormFields>();
  const { login } = useAuth(); // Use the typed useAuth hook here
  const [openLoading, setOpenLoading] = useState(false);

  const submitLogin: SubmitHandler<LoginFormFields> = async (data) => {
    // setOpenLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const responseData = await response.json();
      login(responseData); // Use the login function from your context
      router.replace("/home"); // Navigate to home on successful login
    } catch (error) {
      console.error("Login error:", error);
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
              Phone Number eg (+254720****20)
            </label>
            <input
              {...register("phoneNumber", { required: true })}
              type="text"
              placeholder="Enter your Phone Number"
              className="p-3 rounded-full text-sm w-full"
            />
          </div>
          <div className="flex flex-col mt-5">
            <label htmlFor="password" className="text-[#909090] p-1 text-sm">
              Password
            </label>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Enter your Password"
              className="p-3 rounded-full text-sm"
            />
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
        </form>
      </article>
    </section>
  );
};

export default Login;
