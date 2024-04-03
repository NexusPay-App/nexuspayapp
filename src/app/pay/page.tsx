"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Swap } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OTPInput from "react-otp-input";

const Spinner = () => <div>Loading...</div>;
const TransactionSuccessModal = () => <div>Transaction Successful!</div>;

const Pay = () => {
  const router = useRouter();
  const [tillNumberParts, setTillNumberParts] = useState(Array(5).fill(""));
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("KSH"); // Default currency set to KSH
  const [conversionRate, setConversionRate] = useState(0); // Placeholder for conversion rate
  const [convertedAmount, setConvertedAmount] = useState(""); // Placeholder for converted amount
  const [loading, setLoading] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [inputBox, setInputBox] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

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
        const response = await fetch(
          "http://localhost:8000/api/usdc/conversionrate"
        );
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

  const handleInputChange = (index: number, value: string) => {
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
    const finalAmount =
      currency === "KSH"
        ? parseFloat(`${amount}`) / conversionRate
        : parseFloat(`${amount}`);

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
        <ArrowLeft
          size={24}
          color="#ffffff"
          onClick={() => router.replace("/home")}
        />
        <h3 className="text-white text-xl">Pay Utilities</h3>
        <span></span>
      </div>

      <div className="flex flex-col items-center mt-10">
        <h5 className="text-white mb-3">Enter Till Number</h5>
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
          value={inputBox}
          onChange={setInputBox}
          numInputs={4}
          renderSeparator={<span>-</span>}
          renderInput={(props) => <input {...props} />}
        />
      </div>

      <div className="flex flex-col items-center mt-10">
        <h5 className="text-white mb-2">Currency:</h5>
        {/* Currency Selection */}
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="border border-[#0795B0] rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-[#0795B0] rounded-lg bg-black text-white text-sm outline-none">
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="ksh">KSH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-center mt-4">
        <h5 className="text-white">Enter Amount:</h5>
        <input
          type="number"
          {...register("amount", { required: true, min: 0.01 })}
          className="border border-[#0795B0
            rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-full"
          placeholder="Amount"
        />
      </div>
      <div className="mt-4 text-center">
        {convertedAmount && (
          <div className="text-white">Equivalent amount: {convertedAmount}</div>
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
          <div className="text-white mb-2">
            Confirm payment to: {businessName}
          </div>
          <button
            className="bg-green-500 text-white font-bold text-lg p-3 rounded-xl w-full"
            onClick={() => handlePaymentInitiation()}
          >
            Confirm Payment
          </button>
        </div>
      )}
    </section>
  );
};
export default Pay;
