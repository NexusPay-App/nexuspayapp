// "use client";

// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import { useForm } from "react-hook-form";


// const Signup = () => {

//   const router = useRouter();

//   // Form Hook for SignUp
//   const {
//     register: registerSignUp,
//     handleSubmit: handleSubmitSignUp,
//     setValue: setSignUpValue,
//     formState: { errors: errorsSignUp },
//     control: controlSignUp,
//   } = useForm();

//   const submitSignUp = () => {
//     router.replace("/login");
//   };

//   return (
//     <section className="app-background">
//       <article className="">
//         <h2 className="text-4xl text-white font-bold">Sign Up to NexusPay</h2>
//         <h4 className="text-white my-5">
//           Enter your Details to SignUp to NexusPay
//         </h4>
//         <form onSubmit={handleSubmitSignUp(submitSignUp)}>
//           <span className="flex flex-col">
//             <label
//               htmlFor="userName"
//               className="text-[#909090] p-1 text-sm mt-4"
//             >
//               User Name
//             </label>
//             <input
//               {...registerSignUp("userName")}
//               type="number"
//               placeholder="Enter your User Name"
//               className="p-3 rounded-full text-sm"
//             />
//           </span>
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
//                 {...registerSignUp("phoneNumber")}
//                 type="number"
//                 placeholder="Enter your Phone Number"
//                 className="p-3 rounded-full text-sm w-full"
//               />
//             </span>
//           </span>
//           <span className="flex flex-col ">
//             <label
//               htmlFor="password"
//               className="text-[#909090] p-1 text-sm mt-4"
//             >
//               Password
//             </label>
//             <input
//               {...registerSignUp("password")}
//               type="password"
//               placeholder="Enter your Password"
//               className="p-3 rounded-full text-sm"
//             />
//           </span>
//           <span className="flex justify-end mb-5">
//             <h5 className="text-[#909090] p-1 text-sm mt-4 font-semibold">
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

// export default Signup;


// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const Signup = () => {
//   const [openOTP, setOpenOTP] = useState(false);
//   const router = useRouter();

//   // Form Hook for SignUp
//   const {
//     register: registerSignUp,
//     handleSubmit: handleSubmitSignUp,
//     formState: { errors: errorsSignUp },
//   } = useForm();

//   // Form Hook for OTP
//   const {
//     register: registerOTP,
//     handleSubmit: handleSubmitOTP,
//     formState: { errors: errorsOTP },
//   } = useForm();

//   const submitSignUp = () => {
//     // Here you might want to send the user's phone number to the server to get an OTP
//     setOpenOTP(true); // Open the OTP dialog
//   };

//   const submitOTP = () => {
//     // Here you would verify the OTP with the server
//     router.replace("/home"); // Navigate to home on successful OTP verification
//   };


// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";


// const Signup = () => {
//   const [openOTP, setOpenOTP] = useState(false);
//   const [phoneNumber, setPhoneNumber] = useState(""); // To store phone number for OTP verification
//   const router = useRouter();

//   // Form Hook for SignUp
//   const {
//     register: registerSignUp,
//     handleSubmit: handleSubmitSignUp,
//     formState: { errors: errorsSignUp },
//   } = useForm();


//   const initiateSignUp = async (data: { phoneNumber: React.SetStateAction<string>; }) => {
//     // Call the register/initiate API
//     const response = await fetch("/api/register/initiate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ phoneNumber: data.phoneNumber }),
//     });

//     if (response.ok) {
//       setPhoneNumber(data.phoneNumber); // Store phone number for later use
//       setOpenOTP(true); // Open the OTP dialog
//     } else {
//       // Handle errors, e.g., show a message to the user
//       console.error("Failed to initiate sign-up.");
//     }
//   };

//   const verifyOTP = async (otpData: { password: any; otp: any; }) => {
//     // Call the register API
//     const response = await fetch("/api/register", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         phoneNumber,
//         password: otpData.password, // Assume password was stored or ask again
//         otp: otpData.otp,
//       }),
//     });

//     if (response.ok) {
//       // Successfully registered, navigate to home or dashboard
//       router.replace("/home");
//     } else {
//       // Handle errors, e.g., invalid OTP
//       console.error("Failed to verify OTP.");
//     }
//   };
//   function handleSubmitOTP(verifyOTP: (otpData: { password: any; otp: any; }) => Promise<void>): React.FormEventHandler<HTMLFormElement> | undefined {
//     throw new Error("Function not implemented.");
//   }

//   return (
//     <section className="app-background">
//       <Dialog open={openOTP} onOpenChange={setOpenOTP}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="text-black">
//               Confirm OTP-code sent to Phone Number
//             </DialogTitle>
//             <hr className="my-4" />
//             <form
//               className="flex flex-col justify-around h-[200px]"
//               onSubmit={handleSubmitOTP(verifyOTP)}
//             >
//               <label htmlFor="otpcode" className="text-black font-semibold mb-2">
//                 OTP-Code
//               </label>
//               <input
//                 {...registerOTP("otp")}
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
//         <h2 className="text-4xl text-white font-bold">Sign Up to NexusPay</h2>
//         <h4 className="text-white my-5">
//           Enter your Details to Sign Up to NexusPay
//         </h4>

//         <form onSubmit={handleSubmitSignUp(initiateSignUp)}>
//           <span className="flex flex-col">
//             <label
//               htmlFor="userName"
//               className="text-[#909090] p-1 text-sm mt-4"
//             >
//               User Name
//             </label>
//             <input
//               {...registerSignUp("userName")}
//               type="number"
//               placeholder="Enter your User Name"
//               className="p-3 rounded-full text-sm"
//             />
//           </span>
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
//                 {...registerSignUp("phoneNumber")}
//                 type="number"
//                 placeholder="Enter your Phone Number"
//                 className="p-3 rounded-full text-sm w-full"
//               />
//             </span>
//           </span>
//           <span className="flex flex-col ">
//             <label
//               htmlFor="password"
//               className="text-[#909090] p-1 text-sm mt-4"
//             >
//               Password
//             </label>
//             <input
//               {...registerSignUp("password")}
//               type="password"
//               placeholder="Enter your Password"
//               className="p-3 rounded-full text-sm"
//             />
//           </span>
//           <span className="flex justify-end mb-5">
//             <h5 className="text-[#909090] p-1 text-sm mt-4 font-semibold">
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

// export default Signup;
// function registerOTP(arg0: string): React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement> {
//   throw new Error("Function not implemented.");
// }

"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assuming these components exist in your project

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

  const initiateSignUp = async (data: SignUpFormData) => {
    // Assuming the API endpoint '/api/register/initiate' expects userName, phoneNumber, and password
    const response = await fetch("http://localhost:8000/api/auth/register/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setUserDetails(data); // Store user details for later use
      setOpenOTP(true); // Open the OTP dialog
    } else {
      // Handle errors, e.g., show a message to the user
      console.error("Failed to initiate sign-up.");
    }
  };

  const verifyOTP = async (otpData: OTPFormData) => {
    if (!userDetails) return; // Ensure userDetails is not null

    // Call the register API with stored user details and provided OTP
    const response = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userDetails,
        otp: otpData.otp,
      }),
    });

    if (response.ok) {
      // Successfully registered, navigate to home or dashboard
      router.replace("/home");
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
            <DialogTitle className="text-black">Confirm OTP-code sent to Phone Number</DialogTitle>
            <hr className="my-4" />
            <form onSubmit={handleOTPSubmit(verifyOTP)} className="flex flex-col justify-around h-[200px]">
              <label htmlFor="otpcode" className="text-black font-semibold mb-2">OTP-Code</label>
              <input {...registerOTP("otp")} type="number" placeholder="Enter OTP" className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6 w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black" />
              <button type="submit" className="bg-black text-white font-semibold rounded-lg p-3">Confirm OTP Code</button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <article>
        <h2 className="text-4xl text-white font-bold">Sign Up to NexusPay</h2>
        <h4 className="text-white my-5">Enter your Details to Sign Up to NexusPay</h4>
        <form onSubmit={handleSignUpSubmit(initiateSignUp)}>
          {/* Input fields for userName, phoneNumber, and password */}
          <span className="flex flex-col">
            <label htmlFor="userName" className="text-[#909090] p-1 text-sm mt-4">User Name</label>
            <input {...register("userName")} type="text" placeholder="Enter your User Name" className="p-3 rounded-full text-sm" />
          </span>
          <span className="flex flex-col">
            <label htmlFor="phoneNumber" className="text-[#909090] p-1 text-sm mt-4">Phone Number eg (+254720****20)</label>
            <input {...register("phoneNumber")} type="text" placeholder="Enter your Phone Number" className="p-3 rounded-full text-sm w-full" />
          </span>
          <span className="flex flex-col">
            <label htmlFor="password" className="text-[#909090] p-1 text-sm mt-4">Password</label>
            <input {...register("password")} type="password" placeholder="Enter your Password" className="p-3 rounded-full text-sm" />
          </span>
          <input type="submit" value="Sign Up" className="bg-white p-3 rounded-full font-bold w-full cursor-pointer" />
        </form>
      </article>
    </section>
  );
};

export default Signup;
