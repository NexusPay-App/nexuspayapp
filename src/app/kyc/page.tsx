// "use client"
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "@phosphor-icons/react";
// import { Reclaim } from '@reclaimprotocol/js-sdk'; // Import the Reclaim SDK

// const KYC: React.FC = () => {
//   const router = useRouter();
//   const [showToast, setShowToast] = useState<boolean>(false);
//   const [toastMessage, setToastMessage] = useState<string>("");


//   const getVerificationReq = async () => {
//     console.log("step 1")
//     const APP_ID = "0x3A5A5C23298A807c612Fa2dA203599B738FDB60B";
//     const reclaimClient = new Reclaim.ProofRequest(APP_ID);
//     const providerIds = [
//     '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', // Binance KYC Level
//     ];

//     console.log("step 2")

//     await reclaimClient.buildProofRequest(providerIds[0])
//     const APP_SECRET ="0x808880bb6168657f7956ec3fd58f065ef462ed6703ebf06f4813a13c8ab034ee"  // your app secret key.
    
//     console.log("step 3")

//     reclaimClient.setSignature(
//         await reclaimClient.generateSignature(APP_SECRET)
//     )

//     console.log("step 4")

//     const { requestUrl, statusUrl } =
//       await reclaimClient.createVerificationRequest()

//       console.log("step 5")

//     await reclaimClient.startSession({
//       onSuccessCallback: proof => {
//         console.log('Verification success', proof)
//         // Your business logic here
//         setToastMessage("KYC Verification Successful");
//         setShowToast(true);
//       },
//       onFailureCallback: error => {
//         console.error('Verification failed', error)
//         // Your business logic here to handle the error
//         setToastMessage("KYC Verification Failed");
//         setShowToast(true);
//       }
//     })
// };

//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
//       {showToast && (
//         <div style={{
//           position: 'fixed',
//           bottom: '20px',
//           left: '50%',
//           transform: 'translateX(-50%)',
//           backgroundColor: 'black',
//           color: 'white',
//           padding: '10px',
//           borderRadius: '5px',
//           zIndex: 1000,
//         }}>
//           {toastMessage}
//         </div>
//       )}
//       <div className="flex justify-between">
//         <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
//         <h3 className="text-white text-lg">KYC Verification</h3>
//         <span></span>
//       </div>
//       <div className="flex flex-col items-center mt-10">
//         <h5 className="text-xl text-white">Start Your Verification</h5>
//         <p className="text-white text-center mt-4">Click the button below to begin the KYC verification process with Reclaim Protocol.</p>
//         <button
//           className="mt-10 bg-[#0795B0] text-white font-bold py-2 px-4 rounded"
//           onClick={getVerificationReq}
//         >
//           Begin Verification
//         </button>
//       </div>
//     </section>
//   );
// };

// export default KYC;


// "use client"
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "@phosphor-icons/react";
// import { Reclaim } from '@reclaimprotocol/js-sdk'; // Import the Reclaim SDK
// import QRCode from "react-qr-code"; // Import QRCode component

// const KYC: React.FC = () => {
//   const router = useRouter();
//   const [showToast, setShowToast] = useState<boolean>(false);
//   const [toastMessage, setToastMessage] = useState<string>("");
//   const [requestUrl, setRequestUrl] = useState<string>(""); // State for storing the verification request URL

//   const getVerificationReq = async () => {
//     const APP_ID = "0x3A5A5C23298A807c612Fa2dA203599B738FDB60B"; // Use your actual APP_ID
//     const reclaimClient = new Reclaim.ProofRequest(APP_ID);
//     const providerIds = [
//       '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', // Binance KYC Level
//     ];

//     await reclaimClient.buildProofRequest(providerIds[0]);
//     const APP_SECRET = "0x808880bb6168657f7956ec3fd58f065ef462ed6703ebf06f4813a13c8ab034ee"; // Your app secret key.

//     reclaimClient.setSignature(
//       await reclaimClient.generateSignature(APP_SECRET)
//     );

//     const { requestUrl } = await reclaimClient.createVerificationRequest();
//     setRequestUrl(requestUrl); // Store the verification request URL in state
//     console.log(requestUrl)
//     await reclaimClient.startSession({
//       onSuccessCallback: proof => {
//         // Your business logic here
//         setToastMessage("KYC Verification Successful");
//         setShowToast(true);
//         setTimeout(() => setShowToast(false), 3000);
//       },
//       onFailureCallback: error => {
//         // Your business logic here to handle the error
//         setToastMessage("KYC Verification Failed");
//         setShowToast(true);
//         setTimeout(() => setShowToast(false), 3000);
//       }
//     });
//   };

//   return (
//     <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
//       {showToast && (
//         <div style={{
//           position: 'fixed',
//           bottom: '20px',
//           left: '50%',
//           transform: 'translateX(-50%)',
//           backgroundColor: 'black',
//           color: 'white',
//           padding: '10px',
//           borderRadius: '5px',
//           zIndex: 1000,
//         }}>
//           {toastMessage}
//         </div>
//       )}
//       <div className="flex justify-between">
//         <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
//         <h3 className="text-white text-lg">KYC Verification</h3>
//         <span></span>
//       </div>
//       <div className="flex flex-col items-center mt-10">
//         <h5 className="text-xl text-white">Start Your Verification</h5>
//         {!requestUrl && (
//           <p className="text-white text-center mt-4">Click the button below to begin the KYC verification process with Reclaim Protocol.</p>
//         )}
//         {!requestUrl ? (
//           <button
//             className="mt-10 bg-[#0795B0] text-white font-bold py-2 px-4 rounded"
//             onClick={getVerificationReq}
//           >
//             Begin Verification
//           </button>
//         ) : (
//           <div className="mt-4">
//             <QRCode value={requestUrl} size={256} level={"H"} />
//             <p className="text-white text-center mt-4">Scan the QR code with your mobile device to proceed with verification.</p>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default KYC;



"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { Reclaim } from '@reclaimprotocol/js-sdk'; // Import the Reclaim SDK
import QRCode from "react-qr-code"; // Import QRCode component

const KYC: React.FC = () => {
  const router = useRouter();
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [requestUrl, setRequestUrl] = useState<string>(""); // State for storing the verification request URL
  const [isMobile, setIsMobile] = useState<boolean>(false); // State to store if the device is mobile

  useEffect(() => {
    // Simple mobile detection based on window width, can be enhanced
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobile(/android|iphone|ipad|ipod|opera|iemobile|wpdesktop/i.test(userAgent));
  }, []);

  const getVerificationReq = async () => {
    const APP_ID = "0x3A5A5C23298A807c612Fa2dA203599B738FDB60B"; // Use your actual APP_ID
    const reclaimClient = new Reclaim.ProofRequest(APP_ID);
    const providerIds = [
      '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', // Binance KYC Level
    ];

    await reclaimClient.buildProofRequest(providerIds[0]);
    const APP_SECRET = "0x808880bb6168657f7956ec3fd58f065ef462ed6703ebf06f4813a13c8ab034ee"; // Your app secret key.

    reclaimClient.setSignature(
      await reclaimClient.generateSignature(APP_SECRET)
    );

    const { requestUrl } = await reclaimClient.createVerificationRequest();
    setRequestUrl(requestUrl); // Store the verification request URL in state
 console.log(requestUrl)
    await reclaimClient.startSession({
      onSuccessCallback: proof => {
        // Your business logic here
        setToastMessage("KYC Verification Successful");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      },
      onFailureCallback: error => {
        // Your business logic here to handle the error
        setToastMessage("KYC Verification Failed");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    });
  };

  return (
    <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
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
        <h3 className="text-white text-lg">KYC Verification</h3>
        <span></span>
      </div>
      <div className="flex flex-col items-center mt-10">
        <h5 className="text-xl text-white">Start Your Verification</h5>
        {!requestUrl && (
          <p className="text-white text-center mt-4">Click the button below to begin the KYC verification process with Reclaim Protocol.</p>
        )}
        {!requestUrl ? (
          <button
            className="mt-10 bg-[#0795B0] text-white font-bold py-2 px-4 rounded"
            onClick={getVerificationReq}
          >
            Begin Verification
          </button>
        ) : isMobile ? (
          <a href={requestUrl} className="mt-10 bg-[#0795B0] text-white font-bold py-2 px-4 rounded">
            Tap Here to Verify
          </a>
        ) : (
          <div className="mt-4">
            <QRCode value={requestUrl} size={256} level={"H"} />
            <p className="text-white text-center mt-4">Scan the QR code with your mobile device to proceed with verification.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default KYC;
