"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowsLeftRight } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OTPInput from "react-otp-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Player } from "@lottiefiles/react-lottie-player";
import lottieSuccess from "@/public/json/success.json";
import loadingJson from "@/public/json/loading.json";
import lottieConfirm from "@/public/json/confirm.json";

const Spinner = () => <div>Loading...</div>;
const TransactionSuccessModal = () => <div>Transaction Successful!</div>;

const Pay = () => {
  const router = useRouter();
  const [tillNumberParts, setTillNumberParts] = useState("");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("KSH"); // Default currency set to KSH
  const [conversionRate, setConversionRate] = useState(0); // Placeholder for conversion rate
  const [equivalentAmount, setEquivalentAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [openConfirmTx, setOpenConfirmTx] = useState(false); // Opens the Transaction Dialog
  const [openConfirmingTx, setOpenConfirmingTx] = useState(false); // Opens the Transaction Loading Dialog
  const [openSuccess, setOpenSuccess] = useState(false); // Opens the Success Dialog
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
          "https://afpaybackend.vercel.app/api/usdc/conversionrate"
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
    if (!amount) setEquivalentAmount("");
    else {
      // If the user is inputting KSH, convert to USDC by dividing by the rate
      // If the user is inputting USDC, convert to KSH by multiplying by the rate
      const convertedAmount =
        currency === "ksh"
          ? parseFloat(`${amount}`) / conversionRate
          : parseFloat(`${amount}`) * conversionRate;
      setEquivalentAmount(
        `${convertedAmount.toFixed(2)} ${currency === "usdc" ? "KSH" : "USDC"}`
      );
    }
  }, [amount, currency, conversionRate]);

  const initiatePayment = async () => {
    const fullTillNumber = tillNumberParts;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;

    if (!fullTillNumber || !amount || !user || !token) {
      alert("Please fill all the fields and ensure you are logged in.");
      return;
    }
console.log(currency)
    // Convert amount for API if necessary
    const finalAmount =
      currency === "ksh"
        ? parseFloat(`${amount}`) / conversionRate
        : parseFloat(`${amount}`);

        console.log(finalAmount)

    setLoading(true);

    try {
      const response = await fetch("https://afpaybackend.vercel.app/api/token/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          businessUniqueCode: fullTillNumber,
          amount: finalAmount,
          senderAddress: user.walletAddress,
          confirm: false, // Not confirming yet
          currency: currency, // Optionally include currency type if your backend needs it
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBusinessName(data.businessName); // Display business name in confirmation dialog
        setOpenConfirmTx(true); // Show confirmation dialog
      } else {
        alert(`Payment initiation failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to initiate payment. Please try again.");
    }

    setLoading(false);
  };


  const confirmPayment = async () => {
    setOpenConfirmTx(false); // Close the confirmation dialog

    const fullTillNumber = tillNumberParts;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;

    if (!fullTillNumber || !amount || !user || !token) {
      alert("Please ensure all details are correct and you are logged in.");
      return;
    }

    const finalAmount =
      currency === "ksh"
        ? parseFloat(`${amount}`) / conversionRate
        : parseFloat(`${amount}`);
console.log(finalAmount)
    setLoading(true);

    try {
      const response = await fetch("https://afpaybackend.vercel.app/api/token/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          businessUniqueCode: fullTillNumber,
          amount: finalAmount,
          senderAddress: user.walletAddress,
          confirm: true, // Confirming the transaction
          currency: currency,
        }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        // Wait to display the success modal until after a successful backend response
        setOpenConfirmingTx(false);
        setOpenSuccess(true); // Now show the success dialog/message
      } else {
        alert(`Payment confirmation failed: ${data.message}`);
      }
    } catch (error) {
      setOpenConfirmingTx(false);
      console.error("Error:", error);
      alert("Failed to confirm payment. Please try again.");
      setLoading(false);
    }
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
          inputType="number"
          value={tillNumberParts}
          onChange={setTillNumberParts}
          numInputs={5}
          renderSeparator={<span>-</span>}
          renderInput={(props) => <input {...props} />}
        />
      </div>

      <div className="flex flex-col items-center mt-10">
        <h5 className="text-white mb-2">Currency:</h5>
        {/* Currency Selection */}
        <Select
          defaultValue="default"
          value={currency}
          onValueChange={setCurrency}
        >
          <SelectTrigger className="border border-[#0795B0] rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-[#0795B0] rounded-lg bg-black text-white text-sm outline-none">
            <SelectItem value="default">-- Select Currency --</SelectItem>
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="ksh">KSH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-center mt-4">
        <h5 className="text-white">Enter Amount:</h5>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.valueAsNumber)}
          className="border border-[#0795B0
            rounded-lg p-4 bg-[#0A0E0E] text-white text-lg w-full"
          placeholder="Amount"
        />
      </div>
      <span className="flex items-center justify-between w-full text-white ">
        <h1 className="text-lg font-bold text-center">
          {equivalentAmount && (
            <p>
              {amount} {currency === "usdc" ? "USDC" : "KSH"}
            </p>
          )}
        </h1>
        <ArrowsLeftRight size={24} weight="bold" className="text-white mx-1" />
        <h1 className="text-lg font-bold text-center">
          {equivalentAmount && <p>{equivalentAmount}</p>}
        </h1>
      </span>

      {!isConfirming ? (
        <button
          className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5"
          onClick={() => initiatePayment()}
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
            onClick={() => confirmPayment()}
          >
            Confirm Payment
          </button>
        </div>
      )}
      <Dialog open={openConfirmTx} onOpenChange={setOpenConfirmTx}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="mb-[5px]">Confirm Payment</DialogTitle>
            <DialogDescription>
              Confirm payment of {amount} {currency === "usdc" ? "USDC" : "KSH"}{" "}
              to: {businessName}
            </DialogDescription>
            <button
              className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5 text-black"
              onClick={() => {
                setOpenConfirmTx(false);
                setOpenConfirmingTx(true);
                confirmPayment();
                // setOpenSuccess(true);
              }}
            >
              Confirm
            </button>
            <button
              className="bg-red-500 font-bold text-lg p-3 rounded-xl w-full mt-5 text-white"
              onClick={() => setOpenConfirmTx(false)}
            >
              Cancel Payment
            </button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={openConfirmingTx} onOpenChange={setOpenConfirmingTx}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="mb-[5px]">Confirm Payment</DialogTitle>
            <DialogDescription>
              Confirming payment of {amount} {currency === "usdc" ? "USDC" : "KSH"}{" "}
              to: {businessName}
            </DialogDescription>
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
      <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="mb-[20px]">
              Payment Transferred Succesfully
            </DialogTitle>
            <Player
              keepLastFrame
              autoplay
              src={lottieSuccess}
              style={{ height: "300px", width: "300px" }}
            ></Player>
            <button
              className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5 text-black"
              onClick={() => setOpenSuccess(false)}
            >
              Done
            </button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
};
export default Pay;