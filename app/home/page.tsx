


// // Home.tsx
// "use client";

// import Transactions from "@/components/transactions/Transactions";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ARB, UserIcon } from "@/constants/svg";
// import {
//   ArrowCircleDown,
//   BellSimple,
//   CreditCard,
//   List,
//   PaperPlaneTilt,
//   UserCircle,
// } from "@phosphor-icons/react";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { LifeBuoy, LogOut, Settings, User, UserPlus } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Player } from "@lottiefiles/react-lottie-player";
// import loadingJson from "@/public/json/loading.json";
// import { useBalance } from "@/context/BalanceContext";
// import { useChain } from "@/context/ChainContext"; // Import useChain hook

// const Home = () => {
//   const { chain, setChain } = useChain(); // Use the useChain hook
//   const { data, isLoading, error } = useBalance();

//   const [openLogoutDialog, setOpenLogoutDialog] = useState(false); // Opens the Logout Loading Dialog
//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//   } = useForm();

//   useEffect(() => {
//     // Check if the user is logged in
//     const user = localStorage.getItem("user"); // Assuming 'user' is saved in localStorage on login
//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace("/login"); // Adjust the path as needed
//     }
//     console.log(chain)
//   }, [router]);

//   const handleSend = () => {
//     router.replace("/send");
//   };

//   const handleReceive = () => {
//     router.replace("/receive");
//   };

//   const handlePay = () => {
//     router.replace("/pay");
//   };

//   // Logs out the User
//   const handleLogout = () => {
//     setOpenLogoutDialog(true);
//     localStorage.clear();
//     setTimeout(() => {
//       router.replace("/");
//     }, 1000);
//   };

//   return (
//     <section className="home-background">
//       <article className="bg-[#0A0E0E] flex flex-col p-5 xl:px-[200px] border-0 border-b border-[#0795B0]">
//         <div className="flex justify-between">
//           <Sheet>
//             <SheetTrigger>
//               <List size={24} color="#ffffff" />
//             </SheetTrigger>
//             <SheetContent side="left">
//               <SheetHeader>
//                 <ul className="flex flex-col justify-around items-start text-base font-DM text-black w-auto">
//                   <a
//                     href="/reclaim"
//                     className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
//                   >
//                     Home
//                   </a>
//                   <Link href="/reclaim" className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer ">
//                     Reclaim
//                   </Link>
                  
//                 </ul>
//               </SheetHeader>
//             </SheetContent>
//           </Sheet>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Image src={UserIcon} alt="tree" />
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56">
//               <DropdownMenuLabel>My Account</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>
//                 <LogOut className="mr-2 h-4 w-4" />
//                 <span onClick={handleLogout}>Log out</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Dialog to LogOut the User */}
//           <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle className="mb-[5px]">Logging you out</DialogTitle>
//                 <Player
//                   keepLastFrame
//                   autoplay
//                   loop={true}
//                   src={loadingJson}
//                   style={{ height: "200px", width: "200px" }}
//                 ></Player>
//               </DialogHeader>
//             </DialogContent>
//           </Dialog>
//         </div>
//         <div className="flex flex-col items-center my-[20px]">
//           <Controller
//             name="region"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 defaultValue="ARB"
//                 onValueChange={(value: string) => {
//                   field.onChange(value);
//                   setChain(value); // Update the chain state
//                 }}
//                 value={chain} // Use the chain state
//               >
//                 <SelectTrigger className="w-full my-[20px] p-3">
//                   <SelectValue
//                     defaultValue="Arbitrum One"
//                     placeholder="Select Chain"
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="arbitrum">Arbitrum</SelectItem>
//                   <SelectItem value="celo">Celo</SelectItem>
//                 </SelectContent>
//               </Select>
//             )}
//           />

//           <h3 className="text-white my-2">Wallet Balance</h3>
//           <h1 className="text-4xl text-white font-bold mb-3 text-center">
//             {isLoading
//               ? "0"
//               : parseFloat(data!.balanceInKES.toString()).toFixed(2)}{" "}
//             KES
//           </h1>
//           <h1 className="text-xl text-white font-bold mb-3 text-center">
//             {isLoading
//               ? 0
//               : parseFloat(data!.balanceInUSDC.toString()).toFixed(2)}{" "}
//             USDC
//           </h1>
//           <p className="text-sm mt-2 text-white">
//             {/* Current Rate: 1 USDC = {balance.rate} KES */}
//             Current Rate: 1 USDC ={" "}
//             {isLoading ? 0 : parseFloat(data!.rate.toString()).toFixed(2)} KES
//           </p>
//         </div>
//         <div className="flex justify-around relative top-20 ">
//           <div className="flex flex-col items-center" onClick={handleSend}>
//             <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
//               <PaperPlaneTilt size={24} weight="fill" />
//             </span>
//             <h4 className="text-white my-1">Send</h4>
//           </div>
//           <div className="flex flex-col items-center" onClick={handleReceive}>
//             <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
//               <ArrowCircleDown size={24} weight="fill" />
//             </span>
//             <h4 className="text-white my-1">Receive</h4>
//           </div>
//           <div className="flex flex-col items-center" onClick={handlePay}>
//             <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
//               <CreditCard size={24} weight="fill" />
//             </span>
//             <h4 className="text-white my-1">Pay</h4>
//           </div>
//         </div>
//       </article>
//       <article className="mt-20 flex flex-col items-center p-5  xl:px-[200px]">
//         <div className="flex flex-col justify-around rounded-xl w-full overflow-hidden bg-wallet-bg bg-cover p-5 h-[180px]">
//           <h3 className="text-white text-xl my-1 font-semibold">
//             Buy Crypto Assets, Tokens Securely.
//           </h3>
//           <button className="bg-white font-bold text-lg p-3 rounded-xl w-[150px]">
//             Buy Crypto
//           </button>
//         </div>
//       </article>
//       <Transactions />
//     </section>
//   );
// };

// export default Home;




// Home.tsx
"use client";

import Transactions from "@/components/transactions/Transactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARB, UserIcon } from "@/constants/svg";
import {
  ArrowCircleDown,
  BellSimple,
  CreditCard,
  List,
  PaperPlaneTilt,
  UserCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LifeBuoy, LogOut, Settings, User, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Player } from "@lottiefiles/react-lottie-player";
import loadingJson from "@/public/json/loading.json";
import { useBalance } from "@/context/BalanceContext";
import { useChain } from "@/context/ChainContext"; // Import useChain hook

const Home = () => {
  const { chain, setChain } = useChain(); // Use the useChain hook
  const { data, isLoading, error } = useBalance();

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false); // Opens the Logout Loading Dialog
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Check if the user is logged in
    const user = localStorage.getItem("user"); // Assuming 'user' is saved in localStorage on login
    if (!user) {
      // If not logged in, redirect to the login page
      router.replace("/login"); // Adjust the path as needed
    }
    console.log(chain);
  }, [router, chain]);

  const handleSend = () => {
    router.replace("/send");
  };

  const handleReceive = () => {
    router.replace("/receive");
  };

  const handlePay = () => {
    router.replace("/pay");
  };

  // Logs out the User
  const handleLogout = () => {
    setOpenLogoutDialog(true);
    localStorage.clear();
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  return (
    <section className="home-background">
      <article className="bg-[#0A0E0E] flex flex-col p-5 xl:px-[200px] border-0 border-b border-[#0795B0]">
        <div className="flex justify-between">
          <Sheet>
            <SheetTrigger>
              <List size={24} color="#ffffff" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <ul className="flex flex-col justify-around items-start text-base font-DM text-black w-auto">
                  <a
                    href="/reclaim"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Home
                  </a>
                  <Link
                    href="/reclaim"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Reclaim
                  </Link>
                  <Link
                    href="/forgotpassword"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Forgot Password
                  </Link>
                </ul>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Image src={UserIcon} alt="tree" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span onClick={handleLogout}>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog to LogOut the User */}
          <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="mb-[5px]">Logging you out</DialogTitle>
                <Player
                  keepLastFrame
                  autoplay
                  loop={true}
                  src={loadingJson}
                  style={{ height: "200px", width: "200px" }}
                ></Player>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col items-center my-[20px]">
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Select
                defaultValue="ARB"
                onValueChange={(value: string) => {
                  field.onChange(value);
                  setChain(value); // Update the chain state
                }}
                value={chain} // Use the chain state
              >
                <SelectTrigger className="w-full my-[20px] p-3">
                  <SelectValue
                    defaultValue="Arbitrum One"
                    placeholder="Select Chain"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="celo">Celo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <h3 className="text-white my-2">Wallet Balance</h3>
          <h1 className="text-4xl text-white font-bold mb-3 text-center">
            {isLoading
              ? "0"
              : data
              ? parseFloat(data.balanceInKES.toString()).toFixed(2)
              : "0"}{" "}
            KES
          </h1>
          <h1 className="text-xl text-white font-bold mb-3 text-center">
            {isLoading
              ? "0"
              : data
              ? parseFloat(data.balanceInUSDC.toString()).toFixed(2)
              : "0"}{" "}
            USDC
          </h1>
          <p className="text-sm mt-2 text-white">
            Current Rate: 1 USDC ={" "}
            {isLoading
              ? "0"
              : data
              ? parseFloat(data.rate.toString()).toFixed(2)
              : "0"}{" "}
            KES
          </p>
        </div>
        <div className="flex justify-around relative top-20 ">
          <div className="flex flex-col items-center" onClick={handleSend}>
            <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
              <PaperPlaneTilt size={24} weight="fill" />
            </span>
            <h4 className="text-white my-1">Send</h4>
          </div>
          <div className="flex flex-col items-center" onClick={handleReceive}>
            <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
              <ArrowCircleDown size={24} weight="fill" />
            </span>
            <h4 className="text-white my-1">Receive</h4>
          </div>
          <div className="flex flex-col items-center" onClick={handlePay}>
            <span className="border border-[#0795B0] rounded-full p-4 bg-[#0A0E0E] hover:bg-white text-white hover:text-[#0795B0] hover:cursor-pointer hover:border-white">
              <CreditCard size={24} weight="fill" />
            </span>
            <h4 className="text-white my-1">Pay</h4>
          </div>
        </div>
      </article>
      <article className="mt-20 flex flex-col items-center p-5  xl:px-[200px]">
        <div className="flex flex-col justify-around rounded-xl w-full overflow-hidden bg-wallet-bg bg-cover p-5 h-[180px]">
          <h3 className="text-white text-xl my-1 font-semibold">
            Buy Crypto Assets, Tokens Securely.
          </h3>
          <button className="bg-white font-bold text-lg p-3 rounded-xl w-[150px]">
            Buy Crypto
          </button>
        </div>
      </article>
      <Transactions />
    </section>
  );
};

export default Home;
