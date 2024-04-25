
// "use client"
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft } from '@phosphor-icons/react';
// import { Reclaim } from '@reclaimprotocol/js-sdk';
// import QRCode from 'react-qr-code';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// const ReclaimPage = () => {
//     const router = useRouter();
//     const [verifications, setVerifications] = useState([]);
//     const [isMobile, setIsMobile] = useState(false);

//     useEffect(() => {
//         const userAgent = window.navigator.userAgent;
//         setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
//     }, []);

//     const user = JSON.parse(localStorage.getItem("user") || '{}');
//     const phoneNumber = user.phoneNumber;

//     const storeVerification = async (providerId, providerName, proof, verified) => {
//         const response = await fetch('https://afpaybackend.vercel.app/api/verifications', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ providerId, providerName, proof, verified, phoneNumber })
//         });
//         console.log(response);
//         if (!response.ok) {
//             console.error('Failed to store verification details');
//         }
//     };

//     const providerIds = [
//         { id: '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', name: 'Binance KYC Level' },
//         { id: '68c16c1f-9905-4c50-9887-41a18edf14f9', name: 'Nexuspay Bolt Dropoff Location' },
//         { id: '7f8d8893-2668-4402-84b9-848b053b091a', name: 'Binance Tx History' },
//     ];

//     const initiateVerification = async (providerId, providerName) => {
//         const APP_ID = "0xDc791663472B5facC8c5Fc17976fc0Edf21b9A7a";
//         const APP_SECRET = "0xcb2693d9012df5d62e15c84328b8a81d4ebca5c9fcca070689abacb912cd510e";
//         const reclaimClient = new Reclaim.ProofRequest(APP_ID);
        
//         await reclaimClient.buildProofRequest(providerId);
//         reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
//         const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();

//         setVerifications(prev => {
//             const existing = prev.find(v => v.providerId === providerId);
//             if (existing) {
//                 return prev.map(v => v.providerId === providerId ? { ...v, requestUrl, statusUrl } : v);
//             }
//             return [...prev, { providerId, providerName, requestUrl, statusUrl, verified: false }];
//         });

//         reclaimClient.startSession({
//             onSuccessCallback: proof => {
//                 setVerifications(prev => prev.map(v => v.providerId === providerId ? { ...v, verified: true, proof } : v));
//                 storeVerification(providerId, providerName, proof, true);  // Store the proof and phone number
//             },
//             onFailureCallback: error => {
//                 console.error('Verification failed', error);
//             }
//         });
//     };

//     return (
//         <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
//             <div className="flex justify-between">
//                 <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
//                 <h3 className="text-white text-lg">Verifications</h3>
//             </div>
//             <div className="flex flex-col items-center mt-10">
//                 <h5 className="text-xl text-white">Start Your Verification</h5>
//                 {providerIds.map(provider => (
//                     <div key={provider.id} className="mt-4 text-center">
//                         <h6 className="text-white">{provider.name}</h6>
//                         <div>
//                             {verifications.find(v => v.providerId === provider.id && v.verified) ? (
//                                 <>
//                                     <p className="text-white"><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'blue' }} /> Verified</p>
//                                 </>
//                             ) : (
//                                 <button
//                                     className="bg-[#0795B0] text-white font-bold py-2 px-4 rounded"
//                                     onClick={() => initiateVerification(provider.id, provider.name)}
//                                 >
//                                     Begin Verification
//                                 </button>
//                             )}
//                             {verifications.find(v => v.providerId === provider.id && !v.verified && v.requestUrl) && (
//                                 isMobile ? (
//                                     <a href={verifications.find(v => v.providerId === provider.id).requestUrl} className="bg-[#0795B0] text-white font-bold py-2 px-4 rounded">
//                                         Tap Here to Verify
//                                         </a>
//                                 ) : (
//                                     <div>
//                                         <QRCode value={verifications.find(v => v.providerId === provider.id).requestUrl} size={256} level="H" />
//                                         <p className="text-white mt-2">Scan the QR code to proceed with verification.</p>
//                                     </div>
//                                 )
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </section>
//     );
// };

// export default ReclaimPage;

// "use client";
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Corrected import for router
// import { ArrowLeft } from '@phosphor-icons/react';
// import { Reclaim } from '@reclaimprotocol/js-sdk';
// import QRCode from 'react-qr-code';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
// import styled, { keyframes } from 'styled-components';

// const rotate = keyframes`
//   from {
//     transform: rotate(0deg);
//   }
//   to {
//     transform: rotate(360deg);
//   }
// `;

// const PageContainer = styled.section`
//   background-color: #0A0E0E; // Dark background color from Home component
//   height: 100vh;
//   display: flex;
//   flex-direction: column;
//   padding: 20px 10%;
//   border-top: 3px solid #0795B0; // Cyan accent border from Home component
// `;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   color: #FFF; // White text for consistency
// `;

// const Title = styled.h3`
//   font-size: 1.5rem; // Responsive font size
// `;

// const VerificationButton = styled.button`
//   background-color: #0795B0; // Cyan button color from Home component
//   color: white;
//   font-weight: bold;
//   padding: 10px 20px;
//   border-radius: 8px;
//   border: none;
//   cursor: pointer;
//   transition: background-color 0.3s, transform 0.2s;

//   &:hover {
//     background-color: #056D8D; // Darker cyan on hover
//     transform: scale(1.05);
//   }

//   &:disabled {
//     background-color: #4a9bab; // Disabled button color
//     cursor: not-allowed;
//   }
// `;

// const StatusMessage = styled.p`
//   color: #FFF;
//   font-size: 0.9rem;
//   margin-top: 8px;
// `;

// const LoadingSpinner = styled(FontAwesomeIcon)`
//   animation: ${rotate} 2s linear infinite;
// `;

// const ReclaimPage = () => {
//     const router = useRouter();
//     const [verifications, setVerifications] = useState([]);
//     const [isMobile, setIsMobile] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         const userAgent = window.navigator.userAgent;
//         setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
//     }, []);

//     const user = JSON.parse(localStorage.getItem("user") || '{}');
//     const phoneNumber = user.phoneNumber;

//     const storeVerification = async (providerId, providerName, proof, verified) => {
//         setIsLoading(true);
//         const response = await fetch('https://afpaybackend.vercel.app/api/verifications', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ providerId, providerName, proof, verified, phoneNumber })
//         });
//         setIsLoading(false);
//         if (!response.ok) {
//             console.error('Failed to store verification details');
//         }
//     };

//     const providerIds = [
//         { id: '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', name: 'Binance KYC ' },
//         { id: '68c16c1f-9905-4c50-9887-41a18edf14f9', name: 'Bolt Dropoff Location' },
//         { id: '7f8d8893-2668-4402-84b9-848b053b091a', name: 'Binance History' },
//     ];

//     const initiateVerification = async (providerId, providerName) => {
//         setIsLoading(true);
//         const APP_ID = "0xDc791663472B5facC8c5Fc17976fc0Edf21b9A7a";
//         const APP_SECRET = "0xcb2693d9012df5d62e15c84328b8a81d4ebca5c9fcca070689abacb912cd510e";
//         const reclaimClient = new Reclaim.ProofRequest(APP_ID);
        
//         await reclaimClient.buildProofRequest(providerId);
//         reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
//         const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
//         setIsLoading(false);

//         setVerifications(prev => {
//             const existing = prev.find(v => v.providerId === providerId);
//             if (existing) {
//                 return prev.map(v => v.providerId === providerId ? { ...v, requestUrl, statusUrl } : v);
//             }
//             return [...prev, { providerId, providerName, requestUrl, statusUrl, verified: false }];
//         });

//         reclaimClient.startSession({
//             onSuccessCallback: proof => {
//                 setVerifications(prev => prev.map(v => v.providerId === providerId ? { ...v, verified: true, proof } : v));
//                 storeVerification(providerId, providerName, proof, true);
//             },
//             onFailureCallback: error => {
//                 console.error('Verification failed', error);
//             }
//         });
//     };

//     return (
//         <PageContainer>
//             <Header>
//                 <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
//                 <Title>Verifications</Title>
//             </Header>
//             <div className="flex flex-col items-center mt-10">
//                 {/* <Title>Start Your Verification</Title> */}
//                 {isLoading ? <LoadingSpinner icon={faSpinner} /> : null}
//                 {providerIds.map(provider => (
//                     <div key={provider.id} className="mt-4 text-center">
//                         <h6 className="text-white">{provider.name}</h6>
//                         <div>
//                             {verifications.find(v => v.providerId === provider.id && v.verified) ? (
//                                 <>
//                                     <StatusMessage><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} /> Verified</StatusMessage>
//                                 </>
//                             ) : (
//                                 <VerificationButton
//                                     onClick={() => initiateVerification(provider.id, provider.name)}
//                                     disabled={isLoading}
//                                 >
//                                     Begin Verification
//                                 </VerificationButton>
//                             )}
//                             {verifications.find(v => v.providerId === provider.id && !v.verified && v.requestUrl) && (
//                                 isMobile ? (
//                                     <a href={verifications.find(v => v.providerId === provider.id).requestUrl} className="bg-[#0795B0] text-white font-bold py-2 px-4 rounded">
//                                         Tap Here to Verify
//                                     </a>
//                                 ) : (
//                                     <div>
//                                         <QRCode value={verifications.find(v => v.providerId === provider.id).requestUrl} size={256} level="H" />
//                                         <StatusMessage>Scan the QR code to proceed with verification.</StatusMessage>
//                                     </div>
//                                 )
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </PageContainer>
//     );
// };

// export default ReclaimPage;

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for router
import { ArrowLeft } from '@phosphor-icons/react';
import { Reclaim } from '@reclaimprotocol/js-sdk';
import QRCode from 'react-qr-code';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageContainer = styled.section`
  background-color: #0A0E0E;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px 10%;
  border-top: 3px solid #0795B0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #FFF;
`;

const Title = styled.h3`
  font-size: 1.5rem;
`;

const VerificationButton = styled.button`
  background-color: #0795B0;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #056D8D;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #4a9bab;
    cursor: not-allowed;
  }
`;

const MobileVerificationLink = styled.a`
  display: block;
  background-color: #0795B0;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 8px;
`;

const StatusMessage = styled.p`
  color: #FFF;
  font-size: 0.9rem;
  margin-top: 8px;
`;

const LoadingSpinner = styled(FontAwesomeIcon)`
  animation: ${rotate} 2s linear infinite;
`;

const ReclaimPage = () => {
    const router = useRouter();
    const [verifications, setVerifications] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
    }, []);

    const user = JSON.parse(localStorage.getItem("user") || '{}');
    const phoneNumber = user.phoneNumber;

    const storeVerification = async (providerId, providerName, proof, verified) => {
        setIsLoading(true);
        const response = await fetch('https://afpaybackend.vercel.app/api/verifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ providerId, providerName, proof, verified, phoneNumber })
        });
        setIsLoading(false);
        if (!response.ok) {
            console.error('Failed to store verification details');
        }
    };

    const providerIds = [
        { id: '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', name: 'Binance KYC' },
        { id: '68c16c1f-9905-4c50-9887-41a18edf14f9', name: 'Bolt Dropoff Location' },
        { id: '7f8d8893-2668-4402-84b9-848b053b091a', name: 'Binance History' },
    ];

    const initiateVerification = async (providerId, providerName) => {
        setIsLoading(true);
        const APP_ID = "0xDc791663472B5facC8c5Fc17976fc0Edf21b9A7a";
        const APP_SECRET = "0xcb2693d9012df5d62e15c84328b8a81d4ebca5c9fcca070689abacb912cd510e";
        const reclaimClient = new Reclaim.ProofRequest(APP_ID);
        
        await reclaimClient.buildProofRequest(providerId);
        reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
        const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
        setIsLoading(false);

        setVerifications(prev => {
            const existing = prev.find(v => v.providerId === providerId);
            if (existing) {
                return prev.map(v => v.providerId === providerId ? { ...v, requestUrl, statusUrl } : v);
            }
            return [...prev, { providerId, providerName, requestUrl, statusUrl, verified: false }];
        });

        reclaimClient.startSession({
            onSuccessCallback: proof => {
                setVerifications(prev => prev.map(v => v.providerId === providerId ? { ...v, verified: true, proof } : v));
                storeVerification(providerId, providerName, proof, true);
            },
            onFailureCallback: error => {
                console.error('Verification failed', error);
            }
        });
    };

    return (
        <PageContainer>
            <Header>
                <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
                <Title>Verifications</Title>
            </Header>
            <div className="flex flex-col items-center mt-10">
                {isLoading ? <LoadingSpinner icon={faSpinner} /> : null}
                {providerIds.map(provider => (
                    <div key={provider.id} className="mt-4 text-center">
                        <h6 className="text-white">{provider.name}</h6>
                        <div>
                            {verifications.find(v => v.providerId === provider.id && v.verified) ? (
                                <StatusMessage><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} /> Verified</StatusMessage>
                            ) : (
                                <>
                                    {!verifications.find(v => v.providerId === provider.id && v.requestUrl) && (
                                        <VerificationButton
                                            onClick={() => initiateVerification(provider.id, provider.name)}
                                            disabled={isLoading}
                                        >
                                            Begin Verification
                                        </VerificationButton>
                                    )}
                                    {isMobile && verifications.find(v => v.providerId === provider.id && !v.verified && v.requestUrl) && (
                                        <MobileVerificationLink href={verifications.find(v => v.providerId === provider.id).requestUrl}>
                                            Tap Here to Verify
                                        </MobileVerificationLink>
                                    )}
                                </>
                            )}
                            {!isMobile && verifications.find(v => v.providerId === provider.id && !v.verified && v.requestUrl) && (
                                <div>
                                    <QRCode value={verifications.find(v => v.providerId === provider.id).requestUrl} size={256} level="H" />
                                    <StatusMessage>Scan the QR code to proceed with verification.</StatusMessage>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
};

export default ReclaimPage;
