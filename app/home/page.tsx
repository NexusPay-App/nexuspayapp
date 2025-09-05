


// // Home.tsx
// "use client";

// // import {
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
// // import {
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
// 
// const Home = () => {
// //   const { data, isLoading, error } = useBalance();

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

import { UserIcon } from "@/constants/svg";
import {
  ArrowCircleDown,
  BellSimple,
  CreditCard,
  List,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, UserPlus, Copy, Eye, EyeOff, Smartphone, Mail } from "lucide-react";
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
import dynamic from "next/dynamic";
import loadingJson from "@/public/json/loading.json";

// Dynamically import Player to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);
import { useAuth } from "@/context/AuthContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { RecentTransactions } from "@/components/transactions/RecentTransactions";

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { balance, chainBalance, loading, error, fetchAllBalances, fetchChainBalance } = useWalletBalance();

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false); // Opens the Logout Loading Dialog
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated using the auth context
    if (!isAuthenticated) {
      // If not logged in, redirect to the login page
      router.replace("/login");
    }
    console.log("User:", user);
  }, [router, isAuthenticated, user]);

  const handleSend = () => {
    router.replace("/crypto");
  };

  const handleReceive = () => {
    router.replace("/receive");
  };

  const handlePay = () => {
    router.replace("/pay");
  };

  const handleBuy = () => {
    router.replace("/buy-crypto");
  };

  // Logs out the User
  const handleLogout = () => {
    setOpenLogoutDialog(true);
    logout();
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  // Handle settings click
  const handleSettings = () => {
    router.push("/settings");
  };

  // Handle chain selection
  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
    if (chain === 'all') {
      fetchAllBalances();
    } else {
      fetchChainBalance(chain);
    }
  };

  // Get current balance data based on selection
  const getCurrentBalance = () => {
    if (selectedChain === 'all') {
      return balance;
    } else {
      return chainBalance;
    }
  };

  // Get total USD value
  const getTotalUSDValue = () => {
    const currentBalance = getCurrentBalance();
    return currentBalance?.totalUSDValue || 0;
  };

  // Get chain-specific balances
  const getChainBalances = () => {
    const currentBalance = getCurrentBalance();
    if (selectedChain === 'all') {
      return currentBalance?.balances || {};
    } else {
      return currentBalance?.balances ? { [selectedChain]: currentBalance.balances } : {};
    }
  };

  // Convert USD to KES (using fixed rate for now)
  const getKESEquivalent = () => {
    const usdAmount = getTotalUSDValue();
    const kesRate = 130; // 1 USD = 130 KES (you can make this dynamic later)
    return usdAmount * kesRate;
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
                  <Link
                    href="/home"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Home
                  </Link>
                  <Link
                    href="/reclaim"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Reclaim
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
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Settings */}
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Logout */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
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
          {/* Chain Selector */}
          <div className="w-full max-w-md mb-4">
            <Select value={selectedChain} onValueChange={handleChainChange}>
              <SelectTrigger className="w-full my-[20px] p-3">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="celo">Celo</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="optimism">Optimism</SelectItem>
                <SelectItem value="avalanche">Avalanche</SelectItem>
                <SelectItem value="bnb">BNB Chain</SelectItem>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="gnosis">Gnosis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <h3 className="text-white my-2">Wallet Balance</h3>
          
          {loading ? (
            <div className="text-center">
              <h1 className="text-4xl text-white font-bold mb-3">Loading...</h1>
              <p className="text-sm text-gray-400">Fetching your balance</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <h1 className="text-4xl text-white font-bold mb-3">Error</h1>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <button
                onClick={() => selectedChain === 'all' ? fetchAllBalances() : fetchChainBalance(selectedChain)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : getCurrentBalance() ? (
            <>
              {/* KES Equivalent (Primary Display) */}
              <h1 className="text-4xl text-white font-bold mb-3 text-center">
                {getKESEquivalent().toFixed(2)} KES
              </h1>
              
              {/* USD Value */}
              <h1 className="text-xl text-white font-bold mb-3 text-center">
                ${getTotalUSDValue().toFixed(2)} USD
              </h1>
              
              {/* Exchange Rate */}
              <p className="text-sm mt-2 text-white">
                Current Rate: 1 USD = 130.00 KES
              </p>
              
              {/* Chain-specific balances */}
              <div className="text-center w-full max-w-md">
                {Object.entries(getChainBalances()).map(([chain, tokens]) => (
                  <div key={chain} className="mb-4">
                    <h2 className="text-lg text-gray-300 mb-2 capitalize">
                      {chain === 'all' ? 'All Chains' : chain}
                    </h2>
                    {Object.entries(tokens).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(tokens).map(([token, amount]) => (
                          <p key={token} className="text-sm text-gray-300">
                            {Number(amount).toFixed(6)} {token}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No tokens found</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl text-white font-bold mb-3">No Balance</h1>
              <p className="text-sm text-gray-400">Your wallet appears to be empty</p>
            </div>
          )}
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
          <button 
            className="bg-white font-bold text-lg p-3 rounded-xl w-[150px] hover:bg-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            onClick={handleBuy}
          >
            Buy Crypto
          </button>
        </div>
      </article>

      {/* Recent Transactions Section */}
      <article className="mt-8 flex flex-col items-center p-5 xl:px-[200px]">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
            <Link 
              href="/transactions"
              className="text-[#0795B0] hover:text-[#0AA5C0] text-sm font-medium transition-colors duration-200"
            >
              View All →
            </Link>
          </div>
          
          <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6">
            <RecentTransactions />
          </div>
        </div>
      </article>
    </section>
  );
};

export default Home;
