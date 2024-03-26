// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ArrowLeft, Scan } from "@phosphor-icons/react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";



// const SendAmount = () => {
//   const router = useRouter();
//   const [openPassWord, setOpenPassWord] = useState(false);

//   // Form Hook for
//   const {
//     register: register,
//     handleSubmit: handleSubmit,
//     setValue: setValue,
//     formState: { errors: errors },
//     control: control,
//   } = useForm();

  
//   useEffect(() => {
//     // Check if the user is logged in
//     const user = localStorage.getItem('user'); // Assuming 'user' is saved in localStorage on login
//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace('/login'); // Adjust the path as needed
//     }
//   }, [router]);

//   // const submit = () => {
//   //   setOpenPassWord(true);
//   // };

//   const onSubmit = async (data: { tokenAddress: any; phoneNumber: any; amount: any; }) => {
//   // Construct the URL for your backend API
//   const apiUrl = 'http://yourbackend.domain/api/send'; // Replace with your actual backend API URL
  
//   try {
//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         tokenAddress: data.tokenAddress, // You need to collect this from the form or your application state
//         recipientIdentifier: data.phoneNumber, // Assuming phoneNumber is collected from the form
//         amount: data.amount, // Collected from the form
//         senderAddress: 'YOUR_SENDER_ADDRESS', // Add logic to retrieve or define the sender's address
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Success:', result);
//     // Handle success (e.g., show a success message, navigate to a confirmation page, etc.)
//   } catch (error) {
//     console.error('Error:', error);
//     // Handle error (e.g., show an error message)
//   }
// };

//   // Form Hook for PassWord
//   const {
//     register: registerPassWord,
//     handleSubmit: handleSubmitPassWord,
//     setValue: setPassWordValue,
//     formState: { errors: errorsPassWord },
//     control: controlPassWord,
//   } = useForm();

//   const submitPassWord = () => {};

//   const handleSend = () => {
//     router.replace("/send");
//   };
//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px] ">
//       <div className="flex justify-between">
//         <Link href="/send">
//           <ArrowLeft size={24} color="#ffffff" />
//         </Link>
//         <span className="flex flex-col items-center">
//           <h3 className="text-white text-xl">Send Crypto</h3>
//           <h5 className="text-sm text-[#A4A4A4]">200.00 USDC Available </h5>
//         </span>
//         <Scan size={24} color="#ffffff" />
//       </div>
//       <div className="flex flex-col items-center mt-10">
//         <h3 className="text-4xl text-white font-bold">ksh 500</h3>
//         <h5 className="text-xl text-white">3.12 USDC</h5>
//       </div>

//       <Dialog open={openPassWord} onOpenChange={setOpenPassWord}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="text-black"> Confirm Password</DialogTitle>
//             <DialogDescription></DialogDescription>
//             <hr className="my-4" />
//             <form
//               className="flex flex-col justify-around h-[200px]"
//               onSubmit={handleSubmitPassWord(submitPassWord)}
//             >
//               <input
//                 {...registerPassWord("passWord")}
//                 id=""
//                 type="number"
//                 placeholder="Enter PassWord"
//                 className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
//               />
//               <button
//                 type="submit"
//                 className="bg-black text-white font-semibold rounded-lg p-3"
//               >
//                 Confirm PassWord
//               </button>
//             </form>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//       <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
//         <Select>
//           <SelectTrigger className=" border border-[#0795B0] rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none">
//             <SelectValue placeholder="Select Currency" />
//           </SelectTrigger>
//           <SelectContent className="border border-[#0795B0] rounded-lg bg-black text-white text-sm outline-none">
//             <SelectItem value="usdc">USDC</SelectItem>
//             <SelectItem value="ksh">KSH</SelectItem>
//           </SelectContent>
//         </Select>
//                 {/* New Phone Number Field */}
//                 <input
//           {...register("phoneNumber", { required: true })}
//           type="tel"
//           placeholder="Recipient's Phone Number"
//           className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//         />
//         {errors.phoneNumber && <p className="text-red-500">Phone number is required.</p>}

//         {/* New Amount Field */}
//         <input
//           {...register("amount", { required: true, min: 0.01 })}
//           type="number"
//           step="0.01"
//           placeholder="Amount to Send"
//           className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//         />
//                 {errors.amount && <p className="text-red-500">Amount is required and must be greater than 0.</p>}

//         <input
//           type="text"
//           name=""
//           id=""
//           placeholder="Additional Notes"
//           className=" border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//         />
//         <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
//           Continue
//         </button>
//       </form>
//     </section>
//   );
// };

// export default SendAmount;

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ArrowLeft, Scan } from "@phosphor-icons/react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { useForm, SubmitHandler } from "react-hook-form";


// interface FormData {
//   phoneNumber: string;
//   additionalNotes?: string; // Assuming additionalNotes is optional
// }

// const SendAmount = () => {
//   const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
//   const router = useRouter();
//   const [openPassWord, setOpenPassWord] = useState(false);
//   const [conversionRate, setConversionRate] = useState(Number);
//   const [selectedCurrency, setSelectedCurrency] = useState('usdc'); // Default currency
//   const [convertedAmount, setConvertedAmount] = useState('');
//   const [amount, setAmount] = useState(); // Store the amount input by the user

//   // Form Hook for
//   const {
//     register: register,
//     handleSubmit: handleSubmit,
//     setValue: setValue,
//     formState: { errors: errors },
//     control: control,
//   } = useForm();

//     // Fetch conversion rate on component mount
//     useEffect(() => {
//       const fetchConversionRate = async () => {
//         try {
//           const response = await fetch('/api/usdc/conversionrate');
//           if (!response.ok) throw new Error('Network response was not ok');
//           const data = await response.json();
//           setConversionRate(data.rate);
//         } catch (error) {
//           console.error('Error fetching conversion rate:', error);
//         }
//       };
//       fetchConversionRate();
//     }, []);

//   useEffect(() => {
//     // Check if the user is logged in
//     const user = localStorage.getItem('user'); // Assuming 'user' is saved in localStorage on login
//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace('/login'); // Adjust the path as needed
//     }

    
//   }, [router]);
//   const submit = () => {
//     setOpenPassWord(true);
//   };

//   // Form Hook for PassWord
//   const {
//     register: registerPassWord,
//     handleSubmit: handleSubmitPassWord,
//     setValue: setPassWordValue,
//     formState: { errors: errorsPassWord },
//     control: controlPassWord,
//   } = useForm();

//   const submitPassWord = () => {};

//   const handleSend = () => {
//     router.replace("/send");
//   };

//     // Function to handle currency selection change
//     const handleCurrencyChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
//       setSelectedCurrency(e.target.value);
//       // Recalculate the converted amount when the currency changes
//       calculateAndDisplayConvertedAmount(amount as unknown as number, e.target.value as string);
//     };
  
//     // Function to calculate and display converted amount
//     const calculateAndDisplayConvertedAmount = (inputAmount: number, currency: string) => {
//       if (!conversionRate) return; // Guard clause if conversion rate is not yet fetched
  
//       let convertedValue = 0;
//       if (currency === 'usdc') {
//         // Convert from KES to USDC
//         convertedValue = inputAmount / conversionRate;
//       } else {
//         // Convert from USDC to KES
//         convertedValue = inputAmount * conversionRate;
//       }
//       setConvertedAmount(convertedValue.toFixed(2)); // Update state with converted amount
//     };
  
//     // Event handler for amount input change
//     const handleAmountChange = (e: { target: { value: any; }; }) => {
//       const inputAmount = e.target.value;
//       setAmount(inputAmount); // Update the amount state
//       calculateAndDisplayConvertedAmount(inputAmount, selectedCurrency);
//     };

//     // Example function to convert KES to USDC and vice versa
// // This should already be implemented based on previous steps.
// const convertAmountToUSDC = (amount: number, currency: string) => {
//   if (currency === 'ksh') {
//     return amount / conversionRate; // Convert KES to USDC
//   } else {
//     return amount; // Amount is already in USDC
//   }
// };

// // Adding the send functionality
// const handleSendToken = async (formData: FormData) => {
//   // Extracting form data. Assuming you've registered these fields correctly.
//   const { phoneNumber, additionalNotes } = formData;
//   const amountInUSDC = convertAmountToUSDC(amount as unknown as number, selectedCurrency);

//   // You might need to add the logic to retrieve senderAddress and tokenAddress
//   const senderAddress = 'YOUR_SENDER_ADDRESS';
//   const tokenAddress = 'TOKEN_ADDRESS_FOR_USDC'; // This can be a constant if it's always the same token

//   try {
//     const response = await fetch('/api/token/sendToken', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Include the Authorization header if your API requires authentication
//       },
//       body: JSON.stringify({
//         tokenAddress,
//         recipientIdentifier: phoneNumber,
//         amount: amountInUSDC.toString(),
//         senderAddress,
//         // Include additionalNotes if your backend supports it
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }

//     const result = await response.json();
//     // Handle success
//     alert('Token sent successfully!'); // Replace with a more user-friendly success message or UI update
//     router.replace('/success'); // Redirect to a success page or another relevant page
//   } catch (error) {
//     console.error('Error sending token:', error);
//     // Handle error appropriately in the UI
//     alert('Failed to send token.'); // Replace with a more user-friendly error message or UI update
//   }
// };

// // Modify your form's onSubmit to use handleSendToken
// // For simplicity, the example directly uses handleSendToken, but you should integrate it with your existing form handling logic, potentially as part of the handleSubmit function.

//   const onSubmit: SubmitHandler<FormData> = (data) => {
//     // Now, TypeScript knows `data` is of type FormData
//     handleSendToken(data);
//   };

// return (
//   <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
//     <div className="flex justify-between">
//       <Link href="/send">
//         <ArrowLeft size={24} color="#ffffff" />
//       </Link>
//       <span className="flex flex-col items-center">
//         <h3 className="text-white text-xl">Send Crypto</h3>
//         <h5 className="text-sm text-[#A4A4A4]">200.00 USDC Available</h5>
//       </span>
//       <Scan size={24} color="#ffffff" />
//     </div>

//     <div className="flex flex-col items-center mt-10">
//       <h3 className="text-4xl text-white font-bold">{amount} {selectedCurrency.toUpperCase()}</h3>
//       <h5 className="text-xl text-white">{convertedAmount} {selectedCurrency === 'usdc' ? 'KSH' : 'USDC'}</h5>
//     </div>

//     <Dialog open={openPassWord} onOpenChange={setOpenPassWord}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle className="text-black">Confirm Password</DialogTitle>
//           <DialogDescription></DialogDescription>
//           <hr className="my-4" />
//           <form
//             className="flex flex-col justify-around h-[200px]"
//             onSubmit={handleSubmitPassWord(submitPassWord)}
//           >
//             <input
//               {...registerPassWord("passWord")}
//               type="number"
//               placeholder="Enter PassWord"
//               className="flex justify-around border border-gray-300 bg-white rounded-md py-3 px-6  w-full focus:outline-none ring-offset-[#A5A5A533] focus-visible:bg-transparent text-black"
//             />
//             <button
//               type="submit"
//               className="bg-black text-white font-semibold rounded-lg p-3"
//             >
//               Confirm PassWord
//             </button>
//           </form>
//         </DialogHeader>
//       </DialogContent>
//     </Dialog>

//     {/* <form onSubmit={handleSubmit(submit)} className="mt-10"> */}
//     {/* <form onSubmit={handleSubmit((formData: FormData) => handleSendToken(formData))} className="mt-10"> */}
//     <form onSubmit={handleSubmit(onSubmit)} className="mt-10">

//       <select onChange={handleCurrencyChange} className="border border-[#0795B0] rounded-lg px-4 py-6 bg-black text-white text-sm outline-none w-full">
//         <option value="usdc">USDC</option>
//         <option value="ksh">KSH</option>
//       </select>

//       <input
//         {...register("phoneNumber", { required: true })}
//         type="tel"
//         placeholder="Recipient's Phone Number"
//         className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//       />
//       {errors.phoneNumber && <p className="text-red-500">Phone number is required.</p>}

//       <input
//         value={amount}
//         onChange={handleAmountChange}
//         type="number"
//         step="0.01"
//         placeholder="Amount to Send"
//         className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//       />
//       {errors.amount && <p className="text-red-500">Amount is required and must be greater than 0.</p>}

//       <input
//         type="text"
//         placeholder="Additional Notes"
//         className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//       />

//       <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
//         Continue
//       </button>
//     </form>
//   </section>
// );
// }

// export default SendAmount;




// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ArrowLeft, Scan } from "@phosphor-icons/react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";

// const SendAmount = () => {
//   const router = useRouter();
//   const [openPassWord, setOpenPassWord] = useState(false);
//   const [wallet, setWallet] = useState();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   useEffect(() => {
//     // Check if the user is logged in
//     // const user = localStorage.getItem('user'); // Assuming 'user' is saved in localStorage on login

//   const user = localStorage.getItem('user'); // Retrieves a string
//   const userObject = JSON.parse(user); // Parses the string back into an object
//   console.log(userObject.walletAddress); // Now you can safely access phoneNumber
//   setWallet(userObject.walletAddress);

//     if (!user) {
//       // If not logged in, redirect to the login page
//       router.replace('/login'); // Adjust the path as needed
//     }
//   }, [router]);

//   const onSubmit = async (data) => {
//     const apiUrl = 'http://localhost:8000/api/token/sendToken'; // Replace with your actual backend API URL
    
//     try {
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           tokenAddress: '0xEE49EA567f79e280E4F1602eb8e6479d1Fb9c8C8', // You need to collect this from the form or your application state
//           recipientIdentifier: data.phoneNumber, // Assuming phoneNumber is collected from the form
//           amount: data.amount, // Collected from the form
//           senderAddress: wallet, // Add logic to retrieve or define the sender's address
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log('Success:', result);
//       // Handle success (e.g., show a success message, navigate to a confirmation page, etc.)
//     } catch (error) {
//       console.error('Error:', error);
//       // Handle error (e.g., show an error message)
//     }
//   };

//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
//       <div className="flex justify-between">
//         <Link href="/send">
//           <ArrowLeft size={24} color="#ffffff" />
//         </Link>
//         <span className="flex flex-col items-center">
//           <h3 className="text-white text-xl">Send Crypto</h3>
//           <h5 className="text-sm text-[#A4A4A4]">200.00 USDC Available</h5>
//         </span>
//         <Scan size={24} color="#ffffff" />
//       </div>
//       <div className="flex flex-col items-center mt-10">
//         <h3 className="text-4xl text-white font-bold">ksh 500</h3>
//         <h5 className="text-xl text-white">3.12 USDC</h5>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
//         <Select>
//           <SelectTrigger className="border border-[#0795B0] rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none">
//             <SelectValue placeholder="Select Currency" />
//           </SelectTrigger>
//           <SelectContent className="border border-[#0795B0] rounded-lg bg-black text-white text-sm outline-none">
//             <SelectItem value="usdc">USDC</SelectItem>
//             <SelectItem value="ksh">KSH</SelectItem>
//           </SelectContent>
//         </Select>
//         <input
//           {...register("phoneNumber", { required: true })}
//           type="tel"
//           placeholder="Recipient's Phone Number"
//           className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//         />
//         {errors.phoneNumber && <p className="text-red-500">Phone number is required.</p>}
//         <input
//           {...register("amount", { required: true, min: 0.01 })}
//           type="number"
//           step="0.01"
//           placeholder="Amount to Send"
//           className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//         />
//         {errors.amount && <p className="text-red-500">Amount is
// required and must be greater than 0.</p>}
// {/* <input
//        type="text"
//        placeholder="Additional Notes"
//        className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
//      /> */}
// <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
// Send
// </button>
// </form>
// </section>
// );
// };

// export default SendAmount;




"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Scan } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SendAmount = () => {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [conversionRate, setConversionRate] = useState(1); // Default to 1 for direct 1-to-1 conversion if not fetched
  const [currency, setCurrency] = useState('usdc');
  const [equivalentAmount, setEquivalentAmount] = useState('');
  const [wallet, setWallet] = useState()

  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/usdc/conversionrate');
        const data = await response.json();
        setConversionRate(data.rate);
      } catch (error) {
        console.error('Failed to fetch conversion rate:', error);
      }
    };

    const user = localStorage.getItem('user'); // Retrieves a string
    const userObject = JSON.parse(user); // Parses the string back into an object
    console.log(userObject.walletAddress); // Now you can safely access phoneNumber
    setWallet(userObject.walletAddress);

    fetchConversionRate();
  }, []);

  

  // Watch for changes in the amount input to dynamically display the converted amount
  const amount = watch("amount");

  // useEffect(() => {
  //   if (!amount) setEquivalentAmount('');
  //   else {
  //     const convertedAmount = currency === 'usdc' ? amount / conversionRate : amount * conversionRate;
  //     setEquivalentAmount(`${convertedAmount.toFixed(2)} ${currency === 'usdc' ? 'KSH' : 'USDC'}`);
  //   }
  // }, [amount, currency, conversionRate]);

  useEffect(() => {
    if (!amount) setEquivalentAmount('');
    else {
      // If the user is inputting KSH, convert to USDC by dividing by the rate
      // If the user is inputting USDC, convert to KSH by multiplying by the rate
      const convertedAmount = currency === 'ksh' ? parseFloat(amount) / conversionRate : parseFloat(amount) * conversionRate;
      setEquivalentAmount(`${convertedAmount.toFixed(2)} ${currency === 'usdc' ? 'KSH' : 'USDC'}`);
    }
  }, [amount, currency, conversionRate]);
  
 

  const onSubmit = async (data) => {
    // Use the converted amount if the selected currency is KSH
    // const finalAmount = currency === 'ksh' ? parseFloat(amount) * conversionRate : parseFloat(amount);
    const finalAmount = currency === 'ksh' ? parseFloat(amount) / conversionRate : parseFloat(amount);

    const apiUrl = 'http://localhost:8000/api/token/sendToken';
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress: '0xEE49EA567f79e280E4F1602eb8e6479d1Fb9c8C8',
          recipientIdentifier: data.phoneNumber,
          amount: finalAmount,
          senderAddress: wallet, // Assuming you have a way to input or fetch the wallet address
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      console.log('Success:', result);
      // Additional success handling
    } catch (error) {
      console.error('Error:', error);
      // Error handling
    }
  };

  return (
    <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
      {/* UI elements remain unchanged */}
            <div className="flex justify-between">
        <Link href="/send">
         <ArrowLeft size={24} color="#ffffff" />
       </Link>
       <span className="flex flex-col items-center">
          <h3 className="text-white text-xl">Send Crypto</h3>
           <h5 className="text-sm text-[#A4A4A4]">200.00 USDC Available</h5>
         </span>
       <Scan size={24} color="#ffffff" />
      </div>
      {/* <div className="flex flex-col items-center mt-10">
        <h3 className="text-4xl text-white font-bold">ksh 500</h3>
        <h5 className="text-xl text-white">3.12 USDC</h5>
     </div> */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
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
        {/* Amount Input */}
        <input
          {...register("amount", { required:
            true, min: 0.01 })}
            type="number"
            step="0.01"
            placeholder="Enter Amount"
            className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
            />
            {errors.amount && <p className="text-red-500">Amount is required and must be greater than 0.</p>}
                {/* Display the converted amount */}
    <div className="mt-4 text-white">
      {equivalentAmount && (
        <p>Equivalent in {currency === 'usdc' ? 'KSH' : 'USDC'}: {equivalentAmount}</p>
      )}
    </div>

    {/* Recipient's Phone Number Input */}
    <input
      {...register("phoneNumber", { required: true })}
      type="tel"
      placeholder="Recipient's Phone Number"
      className="border border-[#0795B0] w-full rounded-lg px-4 py-6 bg-transparent text-white text-sm outline-none mt-5"
    />
    {errors.phoneNumber && <p className="text-red-500">Phone number is required.</p>}

    {/* Send Button */}
    <button className="bg-white font-bold text-lg p-3 rounded-xl w-full mt-5">
      Send
    </button>
  </form>
</section>
);
};

export default SendAmount;