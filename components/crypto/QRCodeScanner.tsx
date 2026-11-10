"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { PayMerchantForm } from "./PayMerchantForm";
import { QrCode, X, Camera } from "lucide-react";

interface BusinessQRData {
  type: "business_payment";
  businessName: string;
  merchantId: string;
  walletAddress: string;
  businessType: string;
  phoneNumber: string;
  timestamp: string;
}

interface QRCodeScannerProps {
  onClose?: () => void;
  onScanSuccess?: (data: BusinessQRData) => void;
}

function parseQRData(qrString: string): BusinessQRData | null {
  try {
    const data = JSON.parse(qrString);
    if (
      data.type === "business_payment" &&
      data.businessName &&
      data.merchantId &&
      data.walletAddress
    ) {
      return data as BusinessQRData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Scan a business payment QR. The camera starts immediately; a decoded
 * business QR opens the payment form. Anything else in frame is ignored.
 */
export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onClose,
  onScanSuccess,
}) => {
  const [phase, setPhase] = useState<"starting" | "scanning" | "error">(
    "starting",
  );
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [scannedData, setScannedData] = useState<BusinessQRData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const busyRef = useRef(false);
  const lastRawRef = useRef<string | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const decodeFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(decodeFrame);
      return;
    }
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(image.data, image.width, image.height, {
      inversionAttempts: "attemptBoth",
    });
    if (code?.data) {
      const parsed = parseQRData(code.data);
      if (parsed) {
        busyRef.current = true;
        stopCamera();
        setScannedData(parsed);
        onScanSuccessRef.current?.(parsed);
        return;
      }
      if (lastRawRef.current !== code.data) {
        lastRawRef.current = code.data;
        setHint("That's not a business QR code.");
      }
    } else if (lastRawRef.current !== null) {
      lastRawRef.current = null;
      setHint("");
    }
    rafRef.current = requestAnimationFrame(decodeFrame);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setPhase("starting");
    setError("");
    setHint("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setPhase("scanning");
      rafRef.current = requestAnimationFrame(decodeFrame);
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Camera access is blocked. Allow camera access, then retry."
          : "Camera unavailable on this device.",
      );
      setPhase("error");
    }
  }, [decodeFrame]);

  useEffect(() => {
    void startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  if (scannedData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {scannedData.businessName}
              </h2>
              <p className="text-sm text-gray-400">
                {scannedData.merchantId} · {scannedData.businessType}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <PayMerchantForm initialMerchantId={scannedData.merchantId} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-lg p-5 max-w-md w-full">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0795B0]/20 rounded-lg">
              <QrCode className="h-5 w-5 text-[#0795B0]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Scan QR code</h2>
              <p className="text-xs text-gray-400">
                Point at a business QR code
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {phase === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-[#39BED3] rounded-lg opacity-70" />
            </div>
          )}
          {phase === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Camera className="h-8 w-8 text-white/60 animate-pulse" />
            </div>
          )}
          {phase === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
              <p className="text-sm text-gray-300">{error}</p>
              <Button
                onClick={() => void startCamera()}
                className="bg-[#0795B0] hover:bg-[#0684A0] text-white"
                size="sm"
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        <p
          className="mt-3 min-h-5 text-center text-xs text-amber-400/90"
          role="status"
        >
          {hint}
        </p>
      </div>
    </div>
  );
};
