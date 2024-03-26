// "use client";

// import { ArrowLeft, Swap } from "@phosphor-icons/react";
// import { useRouter } from "next/navigation";
// import React, {useEffect} from "react";

// const Pay = () => {
//   const router = useRouter();

//   useEffect(() => {
//     // Check if the user is logged in
//     const user = localStorage.getItem('user'); // Assuming 'user' is saved in localStorage on login
//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace('/login'); // Adjust the path as needed
//     }
//   }, [router]);
//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px] ">
//       <div className="flex justify-between">
//         <ArrowLeft size={24} color="#ffffff" />
//         <h3 className="text-white text-xl">Pay Utilities</h3>
//         <span></span>
//       </div>
//       <div className="flex flex-col items-center mt-10">
//         <h5 className="text-white">Enter Till Number</h5>
//         <span className="flex justify-around w-full mt-2">
//           <input
//             type="number"
//             className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//             maxLength={1}
//           />
//           <input
//             type="number"
//             className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//             maxLength={1}
//           />
//           <input
//             type="number"
//             className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//             maxLength={1}
//           />
//           <input
//             type="number"
//             className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//             maxLength={1}
//           />
//           <input
//             type="number"
//             className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//             maxLength={1}
//           />
//         </span>
//       </div>
//       <div className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg mt-10">
//         <h5>200.00 USDC Available </h5>
//         <span className="flex mt-3 items-center justify-between">
//           <h3 className="text-4xl text-white font-bold">ksh 500</h3>
//           <Swap size={24} color="#ffffff" />
//           <h5 className="text-xl text-white">3.12 USDC</h5>
//         </span>
//       </div>
//       <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
//         Proceed
//       </button>
//     </section>
//   );
// };

// export default Pay;

// // function useEffect(arg0: () => void, arg1: any[]) {
// //   throw new Error("Function not implemented.");
// // }

// "use client";

// import { ArrowLeft, Swap } from "@phosphor-icons/react";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react"; // Import useState

// const Pay = () => {
//   const router = useRouter();
//   const [amount, setAmount] = useState(''); // State to store the amount

//   useEffect(() => {
//     // Check if the user is logged in
//     const user = localStorage.getItem('user'); // Assuming 'user' is saved in localStorage on login
//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace('/login'); // Adjust the path as needed
//     }
//   }, [router]);
  

//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px] ">
//       <div className="flex justify-between">
//         <ArrowLeft size={24} color="#ffffff" />
//         <h3 className="text-white text-xl">Pay Utilities</h3>
//         <span></span>
//       </div>
//       <div className="flex flex-col items-center mt-10">
//   <h5 className="text-white">Enter Till Number</h5>
//   <span className="flex justify-around w-full mt-2">
//     <input
//       type="text"
//       inputMode="numeric"
//       pattern="[0-9]*"
//       className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//       maxLength={1}
//     />
//     <input
//       type="text"
//       inputMode="numeric"
//       pattern="[0-9]*"
//       className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//       maxLength={1}
//     />
//     <input
//       type="text"
//       inputMode="numeric"
//       pattern="[0-9]*"
//       className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//       maxLength={1}
//     />
//     <input
//       type="text"
//       inputMode="numeric"
//       pattern="[0-9]*"
//       className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//       maxLength={1}
//     />
//     <input
//       type="text"
//       inputMode="numeric"
//       pattern="[0-9]*"
//       className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//       maxLength={1}
//     />
//   </span>
// </div>

//       <div className="flex flex-col items-center mt-10">
//         <h5 className="text-white mb-2">Enter Amount</h5>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-full"
//           placeholder="Amount in Ksh"
//         />
//       </div>
//       <div className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg mt-10">
//         <h5>200.00 USDC Available </h5>
//         <span className="flex mt-3 items-center justify-between">
//           <h3 className="text-4xl text-white font-bold">ksh {amount || '500'}</h3>
//           <Swap size={24} color="#ffffff" />
//           <h5 className="text-xl text-white">3.12 USDC</h5>
//         </span>
//       </div>
//       <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
//         Proceed
//       </button>
//     </section>
//   );
// };


// "use client"
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Adjusted from "next/navigation" to "next/router" for accuracy
// import { ArrowLeft, Swap } from "@phosphor-icons/react";

// const Spinner = () => <div>Loading...</div>;
// const TransactionSuccessModal = () => <div>Transaction Successful!</div>;

// const Pay = () => {
//   const router = useRouter();
//   const [tillNumberParts, setTillNumberParts] = useState(Array(5).fill(""));
//   const [amount, setAmount] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [transactionSuccess, setTransactionSuccess] = useState(false);
//   const [isConfirming, setIsConfirming] = useState(false);
//   const [businessName, setBusinessName] = useState("");

//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     if (!user) {
//       router.replace("/login");
//     }
//   }, [router]);

//   const handleInputChange = (index, value) => {
//     let newTillNumberParts = [...tillNumberParts];
//     newTillNumberParts[index] = value;
//     setTillNumberParts(newTillNumberParts);
//   };

//   const handlePaymentInitiation = async (confirm = false) => {
//     // Adjust this function to optionally accept a 'confirm' argument
//     const fullTillNumber = tillNumberParts.join("");

//     if (!fullTillNumber || !amount) {
//       alert("Please fill all the fields");
//       return;
//     }

//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const token = user.token;

//     if (!user || !token) {
//       console.error("User is not authenticated.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:8000/api/token/pay", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           tokenAddress: "0xEE49EA567f79e280E4F1602eb8e6479d1Fb9c8C8",
//           businessUniqueCode: fullTillNumber,
//           amount,
//           senderAddress: user.walletAddress,
//           confirm: confirm
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && !confirm) {
//         setBusinessName(data.businessName); // Assuming response includes the business name
//         setIsConfirming(true);
//       } else if (response.ok && confirm) {
//         setTransactionSuccess(true);
//         setTimeout(() => {
//           setTransactionSuccess(false);
//           setIsConfirming(false);
//         }, 3000);
//       } else {
//         console.error("Payment initiation failed:", data.message);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }

//     setLoading(false);
//   };

//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
//       {loading && <Spinner />}
//       {transactionSuccess && <TransactionSuccessModal />}

//       <div className="flex justify-between">
//         <ArrowLeft size={24} color="#ffffff" />
//         <h3 className="text-white text-xl">Pay Utilities</h3>
//         <span></span>
//       </div>

//       {/* Till Number and Amount Input Fields */}
//       {/* Omitted for brevity - keep your existing input fields here */}
//            <div className="flex flex-col items-center mt-10">
//       <h5 className="text-white">Enter Till Number</h5>
//        <span className="flex justify-around w-full mt-2">
//          {tillNumberParts.map((part, index) => (
//             <input
//               key={index}
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
//               maxLength={1}
//               value={part}
//               onChange={(e) => handleInputChange(index, e.target.value)}
//             />
//           ))}
//         </span>
//       </div>
    
//       <div className="flex flex-col items-center mt-10">
//         <h5 className="text-white mb-2">Enter Amount</h5>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-full"
//           placeholder="Amount in Ksh"
//         />
//       </div>

//       {!isConfirming ? (
//         <button
//           className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5"
//           onClick={() => handlePaymentInitiation()}
//         >
//           Proceed
//         </button>
//       ) : (
//         // Inline confirmation section
//         <div className="mt-5 text-center">
//           <div className="text-white" >Confirm payment to: {businessName}</div>
//           <button
//             className="bg-green-500 text-white font-bold text-lg p-3 rounded-xl w-full mt-2"
//             onClick={() => handlePaymentInitiation(true)}
//           >
//             Confirm Payment
//           </button>
//         </div>
//       )}
//     </section>
//   );
// };

// export default Pay;

"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Swap } from "@phosphor-icons/react";

const Spinner = () => <div>Loading...</div>;
const TransactionSuccessModal = () => <div>Transaction Successful!</div>;

const Pay = () => {
  const router = useRouter();
  const [tillNumberParts, setTillNumberParts] = useState(Array(5).fill(""));
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KSH"); // Default currency set to KSH
  const [conversionRate, setConversionRate] = useState(0); // Placeholder for conversion rate
  const [convertedAmount, setConvertedAmount] = useState(""); // Placeholder for converted amount
  const [loading, setLoading] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    // Redirect to login if user is not found in localStorage
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
    }

    // Simulated fetch request to get conversion rate (replace URL with your actual API)
    const fetchConversionRate = async () => {
      setLoading(true);
      try {
        // This URL is a placeholder. Replace it with your actual conversion rate endpoint.
        const response = await fetch("http://localhost:8000/api/usdc/conversionrate");
        const data = await response.json();
        setConversionRate(data.rate); // Assuming the API returns a conversion rate
      } catch (error) {
        console.error("Failed to fetch conversion rate:", error);
      }
      setLoading(false);
    };

    fetchConversionRate();
  }, []);

  useEffect(() => {
    // Dynamically convert the amount based on selected currency and fetched conversion rate
    if (currency === "USDC" && conversionRate) {
      setConvertedAmount((amount * conversionRate).toFixed(2) + " KSH"); // Convert USDC to KSH
    } else if (currency === "KSH" && conversionRate) {
      setConvertedAmount((amount / conversionRate).toFixed(2) + " USDC"); // Convert KSH to USDC
    }
  }, [amount, currency, conversionRate]);

  const handleInputChange = (index, value) => {
    let newTillNumberParts = [...tillNumberParts];
    newTillNumberParts[index] = value;
    setTillNumberParts(newTillNumberParts);
  };

  const handlePaymentInitiation = async () => {
    const fullTillNumber = tillNumberParts.join("");
  
    if (!fullTillNumber || !amount) {
      alert("Please fill all the fields");
      return;
    }
  
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;
  
    if (!user || !token) {
      console.error("User is not authenticated.");
      return;
    }
  
    // Convert amount for API if necessary
    // Here we assume the API requires the amount in USDC
    const finalAmount = currency === "KSH" ? parseFloat(amount) / conversionRate : parseFloat(amount);
  
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:8000/api/token/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenAddress: "0xEE49EA567f79e280E4F1602eb8e6479d1Fb9c8C8",
          businessUniqueCode: fullTillNumber,
          amount: finalAmount,
          senderAddress: user.walletAddress,
          confirm: isConfirming,
          // Optionally include currency type if your backend needs it
          currency: currency,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && !isConfirming) {
        setBusinessName(data.businessName); // Assuming response includes the business name
        setIsConfirming(true);
      } else if (response.ok && isConfirming) {
        setTransactionSuccess(true);
        setTimeout(() => {
          setTransactionSuccess(false);
          setIsConfirming(false); // Reset the confirmation state
        }, 3000);
      } else {
        console.error("Payment initiation failed:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  
    setLoading(false);
  };
  return (
    <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
      {loading && <Spinner />}
      {transactionSuccess && <TransactionSuccessModal />}
  
      <div className="flex justify-between">
        <ArrowLeft size={24} color="#ffffff" />
        <h3 className="text-white text-xl">Pay Utilities</h3>
        <span></span>
      </div>
  
      <div className="flex flex-col items-center mt-10">
        <h5 className="text-white">Enter Till Number</h5>
        <span className="flex justify-around w-full mt-2">
          {tillNumberParts.map((part, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-[50px]"
              maxLength={1}
              value={part}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ))}
        </span>
      </div>
  
      <div className="flex flex-col items-center mt-10">
        <h5 className="text-white mb-2">Currency:</h5>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border border-[#0795B0] rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-full"
        >
          <option value="KSH">KSH</option>
          <option value="USDC">USDC</option>
        </select>
      </div>
  
      <div className="flex flex-col items-center mt-4">
        <h5 className="text-white">Enter Amount:</h5>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-[#0795B0
            rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-full"
            placeholder="Amount"
            />
            </div>
            <div className="mt-4 text-center">
  {convertedAmount && (
    <div className="text-white">
      Equivalent amount: {convertedAmount}
    </div>
  )}
</div>

{!isConfirming ? (
  <button
    className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5"
    onClick={() => handlePaymentInitiation()}
  >
    Proceed
  </button>
) : (
  <div className="mt-5 text-center">
    <div className="text-white mb-2">Confirm payment to: {businessName}</div>
    <button
      className="bg-green-500 text-white font-bold text-lg p-3 rounded-xl w-full"
      onClick={() => handlePaymentInitiation(true)}
    >
      Confirm Payment
    </button>
  </div>
)}
  </section>
);

};
export default Pay;
