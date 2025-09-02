"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import GoogleConfigGuide from "./GoogleConfigGuide";

interface GoogleSignInProps {
	mode: "login" | "signup";
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

declare global {
	interface Window {
		google: any;
		gapi: any;
	}
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
	mode,
	onSuccess,
	onError,
}) => {
	const { googleAuth, getGoogleConfig } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [googleConfig, setGoogleConfig] = useState<any>(null);
	const [showConfigGuide, setShowConfigGuide] = useState(false);

	useEffect(() => {
		const loadGoogleConfig = async () => {
			try {
				let clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

				try {
					const config = await getGoogleConfig();
					if (config.data?.clientId) {
						clientId = config.data.clientId;
					}
					setGoogleConfig(config);
				} catch {
					if (clientId) {
						setGoogleConfig({ data: { clientId } });
					}
				}

				if (!clientId) {
					throw new Error("No Google Client ID available");
				}

				// Load Google Identity Services
				const script = document.createElement("script");
				script.src = "https://accounts.google.com/gsi/client";
				script.async = true;
				script.defer = true;
				document.body.appendChild(script);

				script.onload = () => {
					if (window.google && clientId) {
						window.google.accounts.id.initialize({
							client_id: clientId,
							callback: handleGoogleResponse,
							auto_select: false,
							cancel_on_tap_outside: true,
						});

						// Render inside styled container
						setTimeout(() => {
							const buttonElement = document.getElementById(
								"google-signin-button",
							);
							if (buttonElement && window.google) {
								window.google.accounts.id.renderButton(buttonElement, {
									theme: "default",
									size: "extra-large",
									shape: "pill",
									width: "100%", // force full width
									text: mode === "login" ? "signin_with" : "signup_with",
								});
							}
						}, 300);
					}
				};

				script.onerror = () => {
					onError?.("Failed to load Google Sign-In script.");
				};

				return () => {
					if (document.body.contains(script)) {
						document.body.removeChild(script);
					}
				};
			} catch (error) {
				console.error("Failed to load Google config:", error);
				onError?.("Google Sign-In initialization failed.");
			}
		};

		loadGoogleConfig();
	}, []);

	const handleGoogleResponse = async (response: any) => {
		try {
			setIsLoading(true);
			const result = await googleAuth({
				idToken: response.credential,
			});
			if (result) {
				onSuccess?.();
				router.replace("/home");
			}
		} catch (error: any) {
			onError?.(error.message || "Google authentication failed");
		} finally {
			setIsLoading(false);
		}
	};

	if (!googleConfig && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
		return (
			<div className="w-full">
				<div className="bg-gray-300 text-gray-500 p-3 rounded-full text-center font-bold">
					Google Sign-In Unavailable
				</div>
				<p className="text-center text-sm text-gray-400 mt-2">
					Google authentication is not configured
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="w-full">
				{/* Styled wrapper to mimic pill input */}
				<div className="w-full ">
					<div
						id="google-signin-button"
						className="w-full px-6 py-2 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center"
					/>
				</div>

				{isLoading && (
					<p className="text-center text-sm text-gray-400 mt-2">
						Authenticating with Google...
					</p>
				)}
			</div>

			<GoogleConfigGuide
				isOpen={showConfigGuide}
				onClose={() => setShowConfigGuide(false)}
			/>
		</>
	);
};

export default GoogleSignIn;
