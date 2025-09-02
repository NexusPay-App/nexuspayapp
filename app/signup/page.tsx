"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useAuth as useAuthOriginal } from "@/context/AuthContext";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import type {
	AuthContextType,
	OTPFormData,
	SignUpFormData,
} from "@/types/form-types";
import useAxios from "@/hooks/useAxios";
import { useMutation } from "@tanstack/react-query";
import LoadingDialog from "@/components/dialog/LoadingDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import Link from "next/link";
import GoogleSignIn from "@/components/auth/GoogleSignIn";

const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const Signup = () => {
	const { login } = useAuth();
	const [openOTP, setOpenOTP] = useState(false);
	const router = useRouter();
	const [tillNumberParts, setTillNumberParts] = useState("");
	const [openSigningUp, setOpenSigningUp] = useState(false);
	const [openConfirmingOTP, setOpenConfirmingOTP] = useState(false);
	const [openAccErr, setOpenAccErr] = useState(false);
	const api = useAxios();
	const [userDetails, setUserDetails] = useState<SignUpFormData>({
		phoneNumber: "",
		password: "",
		confirmPassword: "",
	});

	const {
		register: registerOTP,
		setValue: setOTPValue,
		handleSubmit: handleOTPSubmit,
		formState: { errors: otpErrors },
	} = useForm<OTPFormData>();

	const initiateRegisterUser = useMutation({
		mutationFn: (initiateRegisterUserPost: SignUpFormData) => {
			setOpenConfirmingOTP(true);
			return api.post(
				"auth/register/initiate",
				{
					phoneNumber: initiateRegisterUserPost.phoneNumber,
					password: initiateRegisterUserPost.password,
				},
				{
					method: "POST",
				},
			);
		},
		onSuccess: (data, variables, context) => {
			setOpenSigningUp(false);
			setUserDetails(variables);
			setOpenOTP(true);
		},
		onError: (error, variables, context) => {
			console.error("Failed to initiate sign-up.");
			setOpenAccErr(true);
		},
		onSettled: (data, error, variables, context) => {
			setOpenConfirmingOTP(false);
		},
	});

	const loginUser = useMutation({
		mutationFn: (loginUserPost: SignUpFormData) => {
			return api.post(
				"auth/login",
				{
					phoneNumber: loginUserPost.phoneNumber,
					password: loginUserPost.password,
				},
				{
					method: "POST",
				},
			);
		},
		onSuccess: (data, variables, context) => {
			login(data);
			setOpenSigningUp(false);
			router.replace("/home");
		},
		onError: (error, variables, context) => {
			setOpenAccErr(true);
		},
		onSettled: (data, error, variables, context) => {},
	});

	const verifyUser = useMutation({
		mutationFn: (verifyUserPost) => {
			return api.post(
				"auth/register/verify/phone",
				{
					phoneNumber: userDetails.phoneNumber,
					otp: tillNumberParts,
				},
				{
					method: "POST",
				},
			);
		},
		onSuccess: (data, variables, context) => {
			if (data.data.token) {
				login(data);
				setOpenSigningUp(false);
				router.replace("/home");
			} else {
				loginUser.mutate(userDetails);
			}
		},
		onError: (error, variables, context) => {
			console.error("Failed to verify OTP.");
			setOpenAccErr(true);
		},
		onSettled: (data, error, variables, context) => {
			console.log(data);
		},
	});

	const verifyOTP = async (otpData: OTPFormData) => {
		if (!userDetails) return;
		const promise = verifyUser.mutate();
		console.log("promise", promise);
	};

	return (
		<section className="home-background p-3 h-auto">
			<Dialog open={openOTP} onOpenChange={setOpenOTP}>
				<DialogContent className="bg-white">
					<DialogHeader>
						<DialogTitle className="text-black">
							Confirm OTP-code sent to Phone Number
						</DialogTitle>
						<hr className="my-4" />
						<form
							onSubmit={handleOTPSubmit(verifyOTP)}
							className="flex flex-col justify-around h-[200px]"
						>
							<div className="flex justify-center space-x-2">
								{[0, 1, 2, 3, 4, 5].map((index) => (
									<input
										key={index}
										type="text"
										maxLength={1}
										value={tillNumberParts[index] || ""}
										onChange={(e) => {
											const newOtp = tillNumberParts.split("");
											newOtp[index] = e.target.value;
											setTillNumberParts(newOtp.join(""));

											if (
												e.target.value &&
												index < 5 &&
												typeof document !== "undefined"
											) {
												const nextInput = document.querySelector(
													`input[data-signup-index="${index + 1}"]`,
												) as HTMLInputElement;
												if (nextInput) nextInput.focus();
											}
										}}
										onKeyDown={(e) => {
											if (
												e.key === "Backspace" &&
												!tillNumberParts[index] &&
												index > 0 &&
												typeof document !== "undefined"
											) {
												const prevInput = document.querySelector(
													`input[data-signup-index="${index - 1}"]`,
												) as HTMLInputElement;
												if (prevInput) prevInput.focus();
											}
										}}
										data-signup-index={index}
										className="w-10 h-10 text-center text-lg font-semibold border border-black rounded-lg focus:border-[#0795B0] focus:outline-none bg-white text-black"
									/>
								))}
							</div>
							<button
								type="submit"
								className="bg-black text-white font-semibold rounded-lg p-3 w-auto"
							>
								Confirm OTP Code
							</button>
						</form>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			<LoadingDialog
				message="Creating Account"
				openLoading={openSigningUp}
				setOpenLoading={setOpenSigningUp}
			/>
			<LoadingDialog
				message="Sending OTP Code...."
				openLoading={openConfirmingOTP}
				setOpenLoading={setOpenConfirmingOTP}
			/>
			<ErrorDialog
				message="Failed to Create Account"
				openError={openAccErr}
				setOpenError={setOpenAccErr}
			/>
			<div className="w-full max-w-lg mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
				<div className="text-center mb-8">
					<h2 className="text-3xl text-white font-bold mb-2">
						Sign Up to NexusPay
					</h2>
					<p className="text-gray-400 text-sm">
						Enter your Details to Sign Up to NexusPay
					</p>
				</div>
				<div className="mb-6">
					<GoogleSignIn
						mode="signup"
						onSuccess={() => {
							setOpenSigningUp(true);
							setTimeout(() => {
								router.replace("/home");
							}, 1000);
						}}
						onError={(error) => {
							console.error("Google signup error:", error);
							setOpenAccErr(true);
						}}
					/>
					<div className="flex items-center justify-center my-6">
						<div className="border-t border-gray-600 flex-grow"></div>
						<span className="px-4 text-gray-400 text-sm">or continue with</span>
						<div className="border-t border-gray-600 flex-grow"></div>
					</div>
				</div>
				<Formik
					initialValues={{
						phoneNumber: "",
						password: "",
						confirmPassword: "",
					}}
					validationSchema={Yup.object({
						phoneNumber: Yup.number()
							.min(13, "Min of 13 Characters required")
							.required("Phone Number is Required"),
						password: Yup.string()
							.max(20, "Must be 20 characters or less")
							.min(5, "Min of 5 Characters required")
							.required("Password is Required"),
						confirmPassword: Yup.string()
							.max(20, "Must be 20 characters or less")
							.min(5, "Min of 5 Characters required")
							.oneOf([Yup.ref("password"), undefined], "Passwords must match")
							.required("Confirm Password is Required"),
					})}
					onSubmit={(values, { setSubmitting }) => {
						setTimeout(async () => {
							setOpenSigningUp(true);
							let modifiedPhoneNumber = values.phoneNumber;
							if (
								modifiedPhoneNumber.toString().startsWith("1") ||
								modifiedPhoneNumber.toString().startsWith("7")
							) {
								modifiedPhoneNumber =
									"+254" + values.phoneNumber.toString().substring(0);
							}

							const requestData = {
								...values,
								phoneNumber: modifiedPhoneNumber,
							};

							console.log(requestData);
							initiateRegisterUser.mutate(requestData);
							setOpenSigningUp(false);
							setSubmitting(false);
						}, 400);
					}}
				>
					<Form >
						<div className="space-y-4">
						<TextInput
							label="Phone Number"
							name="phoneNumber"
							type="number"
							placeholder="Enter your Phone Number eg (0720****20)"
						/>
						<PasswordInput
							label="Password"
							name="password"
							placeholder="Enter your Password"
						/>
						<PasswordInput
							label="Confirm Password"
							name="confirmPassword"
							placeholder="Confirm your Password"
							className="mb-6"
						/>
					
						</div>
						
						<button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-full transition-colors duration-200 mt-12"
						>
							Create Account
						</button>
							<div className="flex flex-col space-y-2 w-full justify-center items-center pt-2">
							<p className="text-gray-400 text-sm">
								Have an account?{" "}
								<Link
									href="/login"
									className="text-blue-400 hover:text-blue-300 transition-colors"
								>
									Login
								</Link>
							</p>
							<p className="text-gray-400 text-sm">
								<Link
									href="/signup/business"
									className="text-blue-400 hover:text-blue-300 transition-colors"
								>
									Create a Business Account?
								</Link>
							</p>
						</div>
					</Form>
				</Formik>
			</div>
		</section>
	);
};

export default Signup;
