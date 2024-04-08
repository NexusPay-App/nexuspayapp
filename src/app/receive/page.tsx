// "use client";

// import Contact from "@/components/contact/Contact";
// import { QRCode } from "@/constants/svg";
// import { recentContactSource } from "@/helpers/recentContactSource";
// import { ArrowLeft, CaretRight, Copy } from "@phosphor-icons/react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import React, { useEffect } from "react";

// const Receive = () => {
//   const router = useRouter();
//   useEffect(() => {
//     // Check if the user is logged in
//     const user = localStorage.getItem("user"); // Assuming 'user' is saved in localStorage on login
//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace("/login"); // Adjust the path as needed
//     }
//   }, [router]);
//   const handleContinue = () => {
//     event?.preventDefault();
//     router.replace("/receive/amount");
//   };
//   return (
//     <section className="home-background flex flex-col p-5 xl:px-[200px] ">
//       <div className="flex justify-between">
//         <ArrowLeft
//           size={24}
//           color="#ffffff"
//           onClick={() => router.replace("/home")}
//         />
//         <h3 className="text-white text-lg">Share QR</h3>
//         <span></span>
//       </div>
//       <div className="flex flex-col items-center mt-10">
//         <h5 className="text-xl text-white">scan to Receive</h5>
//       </div>
//       <div className="flex justify-center">
//         <Image src={QRCode} alt="" />
//       </div>
//       <form className="mt-10">
//         <span className="flex flex-col">
//           <label htmlFor="phoneNumber" className="text-[#909090] p-1">
//             Copy Wallet Address
//           </label>
//           <span className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-sm flex justify-between ">
//             <button>0xbb0f...17c8</button>
//             <Copy size={24} color="#ffffff" />
//           </span>
//         </span>
//         <span className="flex flex-col">
//           <label htmlFor="phoneNumber" className="text-[#909090] p-1">
//             Copy Phone Address
//           </label>
//           <span className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-sm flex justify-between ">
//             <button>0xbb0f...17c8</button>
//             <Copy size={24} color="#ffffff" />
//           </span>
//         </span>
//         <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
//           Continue
//         </button>
//       </form>
//     </section>
//   );
// };

// export default Receive;



"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy } from "@phosphor-icons/react";
import  QRCode  from "qrcode.react"; // Import QRCode from 'qrcode.react'

const Receive: React.FC = () => {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setWalletAddress(user.walletAddress);
      setPhoneNumber(user.phoneNumber);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const copyToClipboard = async (text: string, message = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setToastMessage("Failed to copy");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleContinue = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.replace("/receive/amount");
  };

  const formatWalletAddress = (address: string) => {
    // Assuming the format "0xbb0f...17c8" for wallet addresses
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
  };

  return (
    <section className="home-background flex flex-col p-5 xl:px-[200px]">
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'black',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
        }}>
          {toastMessage}
        </div>
      )}
      <div className="flex justify-between">
        <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
        <h3 className="text-white text-lg">Share QR</h3>
        <span></span>
      </div>
      <div className="flex flex-col items-center mt-10">
        <h5 className="text-xl text-white">Scan to Receive</h5>
      </div>
      <div className="flex justify-center">
        {/* Use the QRCode component to dynamically generate a QR code based on the walletAddress */}
        {walletAddress && (
          <QRCode value={walletAddress} size={200} level={"H"} includeMargin={true} />
        )}
      </div>
      <form className="mt-10" >
        <div className="flex flex-col mb-4">
          <label className="text-[#909090] p-1">
            Wallet Address
          </label>
          <div className="flex justify-between items-center border border-[#0795B0] rounded-lg p-2 bg-[#0A0E0E] text-white">
            <span>{formatWalletAddress(walletAddress)}</span>
            <Copy size={24} color="#ffffff" onClick={() => copyToClipboard(walletAddress, "Wallet address copied!")} />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-[#909090] p-1">
            Phone Number
          </label>
          <div className="flex justify-between items-center border border-[#0795B0] rounded-lg p-2 bg-[#0A0E0E] text-white">
            <span>{phoneNumber}</span>
            <Copy size={24} color="#ffffff" onClick={() => copyToClipboard(phoneNumber, "Phone number copied!")} />
          </div>
        </div>
        {/* <button type="submit" className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
          Continue
        </button> */}
      </form>
    </section>
  );
};

export default Receive;
