"use client";
import apiClient from "@/lib/api";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Corrected import for router
import { ArrowLeft } from "@phosphor-icons/react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageContainer = styled.section`
  background-color: #0a0e0e;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px 10%;
  border-top: 3px solid #0795b0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
`;

const Title = styled.h3`
  font-size: 1.5rem;
`;

const VerificationButton = styled.button`
  background-color: #0795b0;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #056d8d;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #4a9bab;
    cursor: not-allowed;
  }
`;

const MobileVerificationLink = styled.a`
  display: block;
  background-color: #0795b0;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 8px;
`;

const StatusMessage = styled.p`
  color: #fff;
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
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
  }, []);

  const providerIds = [
    { id: "2b22db5c-78d9-4d82-84f0-a9e0a4ed0470", name: "Binance KYC" },
    {
      id: "68c16c1f-9905-4c50-9887-41a18edf14f9",
      name: "Bolt Dropoff Location",
    },
    { id: "7f8d8893-2668-4402-84b9-848b053b091a", name: "Binance History" },
  ];

  const initiateVerification = async (providerId, providerName) => {
    setIsLoading(true);
    try {
      const { data: response } = await apiClient.post('/verifications/request', { providerId });
      const reclaimClient = await ReclaimProofRequest.fromJsonString(response.data.requestConfig);
      const requestUrl = await reclaimClient.getRequestUrl();
      setVerifications(prev => [...prev.filter(v => v.providerId !== providerId), { providerId, providerName, requestUrl, verified: false }]);
      await reclaimClient.startSession({
        onSuccess: async proof => {
          const { data } = await apiClient.post('/verifications', { sessionId: response.data.sessionId, proof });
          if (data.success) setVerifications(prev => prev.map(v => v.providerId === providerId ? { ...v, verified: true } : v));
        },
        onError: () => { setVerificationError('Verification could not be completed. Please try again.'); },
      });
    } catch (error) {
      setVerificationError(error.response?.data?.message || 'Unable to start verification');
    } finally { setIsLoading(false); }
  };

  return (
    <PageContainer>
      {verificationError && <p role="alert">{verificationError}</p>}
      <Header>
        <ArrowLeft
          size={24}
          color="#ffffff"
          onClick={() => router.replace("/home")}
        />
        <Title>Verifications</Title>
      </Header>
      <div className="flex flex-col items-center mt-10">
        {isLoading ? <LoadingSpinner icon={faSpinner} /> : null}
        {providerIds.map((provider) => (
          <div key={provider.id} className="mt-4 text-center">
            <h6 className="text-white">{provider.name}</h6>
            <div>
              {verifications.find(
                (v) => v.providerId === provider.id && v.verified
              ) ? (
                <StatusMessage>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ color: "green" }}
                  />{" "}
                  Verified
                </StatusMessage>
              ) : (
                <>
                  {!verifications.find(
                    (v) => v.providerId === provider.id && v.requestUrl
                  ) && (
                    <VerificationButton
                      onClick={() =>
                        initiateVerification(provider.id, provider.name)
                      }
                      disabled={isLoading}
                    >
                      Begin Verification
                    </VerificationButton>
                  )}
                  {isMobile &&
                    verifications.find(
                      (v) =>
                        v.providerId === provider.id &&
                        !v.verified &&
                        v.requestUrl
                    ) && (
                      <MobileVerificationLink
                        href={
                          verifications.find(
                            (v) => v.providerId === provider.id
                          ).requestUrl
                        }
                      >
                        Tap Here to Verify
                      </MobileVerificationLink>
                    )}
                </>
              )}
              {!isMobile &&
                verifications.find(
                  (v) =>
                    v.providerId === provider.id && !v.verified && v.requestUrl
                ) && (
                  <div>
                    <QRCode
                      value={
                        verifications.find((v) => v.providerId === provider.id)
                          .requestUrl
                      }
                      size={256}
                      level="H"
                    />
                    <StatusMessage>
                      Scan the QR code to proceed with verification.
                    </StatusMessage>
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
