
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { Reclaim } from '@reclaimprotocol/js-sdk';
import QRCode from 'react-qr-code';

const ReclaimPage = () => {
    const router = useRouter();
    const [verifications, setVerifications] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
    }, []);

    const storeVerification = async (providerId, providerName, proof, verified) => {
        const response = await fetch('https://afpaybackend.vercel.app/api/verifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ providerId, providerName, proof, verified })
        });
        console.log(response);
        if (!response.ok) {
            console.error('Failed to store verification details');
        }
    };

    const providerIds = [
        { id: '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', name: 'Binance KYC Level' },
        { id: '68c16c1f-9905-4c50-9887-41a18edf14f9', name: 'Nexuspay Bolt Dropoff Location' },
        { id: '7f8d8893-2668-4402-84b9-848b053b091a', name: 'Binance Tx History' },
    ];

    const initiateVerification = async (providerId, providerName) => {
        const APP_ID = "0xDc791663472B5facC8c5Fc17976fc0Edf21b9A7a";
        const APP_SECRET = "0xcb2693d9012df5d62e15c84328b8a81d4ebca5c9fcca070689abacb912cd510e";
        const reclaimClient = new Reclaim.ProofRequest(APP_ID);
        
        await reclaimClient.buildProofRequest(providerId);
        reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
        const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
        console.log(requestUrl);

        setVerifications(prev => {
            const existing = prev.find(v => v.providerId === providerId);
            if (existing) {
                return prev.map(v => v.providerId === providerId ? { ...v, requestUrl, statusUrl, verified: false } : v);
            }
            return [...prev, { providerId, providerName, requestUrl, statusUrl, verified: false }];
        });

        reclaimClient.startSession({
            onSuccessCallback: proof => {
                setVerifications(prev => prev.map(v => v.providerId === providerId ? { ...v, verified: true, proof } : v));
                console.log('Verification success', proof);
                storeVerification(providerId, providerName, proof, true);
            },
            onFailureCallback: error => {
                console.error('Verification failed', error);
            }
        });
    };

    return (
        <section className="home-background h-screen flex flex-col p-5 xl:px-[200px]">
            <div className="flex justify-between">
                <ArrowLeft size={24} color="#ffffff" onClick={() => router.replace("/home")} />
                <h3 className="text-white text-lg">Verifications</h3>
            </div>
            <div className="flex flex-col items-center mt-10">
                <h5 className="text-xl text-white">Start Your Verification</h5>
                {providerIds.map(provider => (
                    <div key={provider.id} className="mt-4 text-center">
                        <h6 className="text-white">{provider.name}</h6>
                        {verifications.find(v => v.providerId === provider.id) ? (
                            verifications.find(v => v.providerId === provider.id).verified ? (
                                <p className="text-green-500">Verified!</p>
                            ) : (
                                isMobile ? (
                                    <a href={verifications.find(v => v.providerId === provider.id).requestUrl} className="bg-[#0795B0] text-white font-bold py-2 px-4 rounded">
                                        Tap Here to Verify
                                    </a>
                                ) : (
                                    <div>
                                        <QRCode value={verifications.find(v => v.providerId === provider.id).requestUrl} size={256} level="H" />
                                        <p className="text-white mt-2">Scan the QR code to proceed with verification.</p>
                                    </div>
                                )
                            )
                        ) : (
                            <button
                                className="bg-[#0795B0] text-white font-bold py-2 px-4 rounded"
                                onClick={() => initiateVerification(provider.id, provider.name)}
                            >
                                Begin Verification
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ReclaimPage;