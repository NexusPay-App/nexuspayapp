"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth as useAuthOriginal } from "@/context/AuthContext";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import type {
	AuthContextType,
	OTPFormData,
	SignUpBusinessFormData,
} from "@/types/form-types";
import useAxios from "@/hooks/useAxios";
import { useMutation } from "@tanstack/react-query";
import LoadingDialog from "@/components/dialog/LoadingDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import Link from "next/link";
import SuccessDialog from "@/components/dialog/SuccessDialog";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { ChevronLeft, ChevronRight } from "lucide-react";

const useAuth = () => useAuthOriginal() as unknown as AuthContextType;

const SignupBusiness = () => {
	const { login } = useAuth();
	const [openOTP, setOpenOTP] = useState(false);
	const router = useRouter();
	const [openMerchantSuccess, setOpenMerchantSuccess] = useState(false);
	const [openSigningUp, setOpenSigningUp] = useState(false);
	const [openConfirmingOTP, setOpenConfirmingOTP] = useState(false);
	const [openAccErr, setOpenAccErr] = useState(false);
	const api = useAxios();
	const [userDetails, setUserDetails] = useState<SignUpBusinessFormData>({
		ownerName: "",
		businessName: "",
		location: "",
		phoneNumber: "",
		password: "",
		confirmPassword: "",
	});

	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 3;
	const tillNumberParts = ""; // Declare the variable here

	const stepValidationSchemas = [
		// Step 1: Business and Owner Name
		Yup.object({
			businessName: Yup.string()
				.min(5, "Min of 5 Characters required")
				.required("Business Name is Required"),
			ownerName: Yup.string()
				.min(6, "Min of 6 Characters required")
				.required("Business Owner Name is Required"),
		}),
		// Step 2: Phone and Location
		Yup.object({
			phoneNumber: Yup.number()
				.min(13, "Min of 13 Characters required")
				.required("Phone Number is Required"),
			location: Yup.string()
				.min(4, "Min of 4 Characters required")
				.required("Location is Required"),
		}),
		// Step 3: Password
		Yup.object({
			password: Yup.string()
				.max(20, "Must be 20 characters or less")
				.min(5, "Min of 5 Characters required")
				.required("Password is Required"),
			confirmPassword: Yup.string()
				.max(20, "Must be 20 characters or less")
				.min(5, "Min of 5 Characters required")
				.oneOf([Yup.ref("password"), undefined], "Passwords must match")
				.required("Confirm Password is Required"),
		}),
	];

	const nextStep = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-4">
						<TextInput
							label="Business Name"
							name="businessName"
							type="text"
							placeholder="Enter your Business Name"
						/>
						<TextInput
							label="Business Owner Name"
							name="ownerName"
							type="text"
							placeholder="Enter your Business Owner Name"
						/>
					</div>
				);
			case 2:
				return (
					<div className="space-y-4">
						<TextInput
							label="Phone Number"
							name="phoneNumber"
							type="number"
							placeholder="Enter your Phone Number eg (0720****20)"
						/>
						<TextInput
							label="Location"
							name="location"
							type="text"
							placeholder="Enter your Location"
						/>
					</div>
				);
			case 3:
				return (
					<div className="space-y-4">
						<PasswordInput
							label="Password"
							name="password"
							placeholder="Enter your Password"
						/>
						<PasswordInput
							label="Confirm Password"
							name="confirmPassword"
							placeholder="Confirm your Password"
						/>
					</div>
				);
			default:
				return null;
		}
	};

	const getStepTitle = () => {
		switch (currentStep) {
			case 1:
				return "Business Information";
			case 2:
				return "Contact Details";
			case 3:
				return "Security Setup";
			default:
				return "";
		}
	};

	// Form hook for OTP verification
	const {
		register: registerOTP,
		setValue: setOTPValue,
		handleSubmit: handleOTPSubmit,
		formState: { errors: otpErrors },
	} = useForm<OTPFormData>();

	// Mutation to Initiate Register User
	const initiateRegisterUser = useMutation({
		mutationFn: (initiateRegisterUserPost: SignUpBusinessFormData) => {
			setOpenSigningUp(true);
			return api.post(
				"auth/register/initiate",
				{
					email: `${initiateRegisterUserPost.businessName
						.toLowerCase()
						.replace(/\s+/g, "")}@business.nexuspay.app`,
					phoneNumber: initiateRegisterUserPost.phoneNumber,
					password: initiateRegisterUserPost.password,
					verifyWith: "phone",
					accountType: "business",
					businessName: initiateRegisterUserPost.businessName,
					ownerName: initiateRegisterUserPost.ownerName,
					location: initiateRegisterUserPost.location,
				},
				{
					method: "POST",
				},
			);
		},
		onSuccess: (data, variables, context) => {
			setOpenSigningUp(false);
			setUserDetails(variables);

			if (data.data.token) {
				login(data);
				setOpenMerchantSuccess(true);
				setTimeout(() => {
					router.replace("/home");
				}, 2000);
			} else {
				setOpenOTP(true);
			}
		},
		onError: (error, variables, context) => {
			console.error("Failed to initiate sign-up.");
			setOpenAccErr(true);
		},
		onSettled: (data, error, variables, context) => {
			//   setOpenConfirmingOTP(false);
		},
	});

	// Mutation Side Effect to Login User
	const loginUser = useMutation({
		mutationFn: (loginUserPost: SignUpBusinessFormData) => {
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
				setOpenMerchantSuccess(true);
				setTimeout(() => {
					router.replace("/home");
				}, 2000);
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

	return (
		<section className="home-background p-3 min-h-screen">
			<LoadingDialog
				message="Creating Merchant Account"
				openLoading={openSigningUp}
				setOpenLoading={setOpenSigningUp}
			/>
			<LoadingDialog
				message="Sending OTP Code...."
				openLoading={openConfirmingOTP}
				setOpenLoading={setOpenConfirmingOTP}
			/>
			<SuccessDialog
				message="Merchant Account Created Successfully"
				openSuccess={openMerchantSuccess}
				setOpenSuccess={setOpenMerchantSuccess}
			/>
			<ErrorDialog
				message="Failed to Create Account"
				openError={openAccErr}
				setOpenError={setOpenAccErr}
			/>

						<div className="w-full max-w-lg mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">

				<div className="mb-8">
					<h2 className="text-3xl text-white text-center w-full font-bold mb-6">
						Sign Up to NexusPay For Business
					</h2>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg text-white font-medium">{getStepTitle()}</h3>
						<span className="text-sm text-gray-300">
							Step {currentStep} of {totalSteps}
						</span>
					</div>

					{/* Progress bar */}
					<div className="w-full bg-gray-700 rounded-full h-2 mb-6">
						<div
							className="bg-white h-2 rounded-full transition-all duration-500 ease-in-out"
							style={{ width: `${(currentStep / totalSteps) * 100}%` }}
						></div>
					</div>
				</div>

				<Formik
					initialValues={{
						ownerName: "",
						businessName: "",
						location: "",
						phoneNumber: "",
						password: "",
						confirmPassword: "",
					}}
					validationSchema={stepValidationSchemas[currentStep - 1]}
					onSubmit={async (values, { setSubmitting, validateForm }) => {
						// If not on final step, validate current step and move to next
						if (currentStep < totalSteps) {
							const errors = await validateForm();
							const currentStepFields = Object.keys(
								stepValidationSchemas[currentStep - 1].fields,
							);
							const hasCurrentStepErrors = currentStepFields.some(
								(field) => (errors as Record<string, unknown>)[field],
							);

							if (!hasCurrentStepErrors) {
								nextStep();
							}
							setSubmitting(false);
							return;
						}

						// Final step submission
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

							initiateRegisterUser.mutate(requestData);
							setOpenSigningUp(false);
							setSubmitting(false);
						}, 400);
					}}
				>
					{({ isSubmitting, validateForm }) => (
						<Form>
							<div className="min-h-[200px] transition-all duration-300 ease-in-out">
								{renderStepContent()}
							</div>

							<div className="flex justify-between items-center mt-8 mb-6">
								{currentStep > 1 ? (
									<button
										type="button"
										onClick={prevStep}
										className="flex items-center px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-black transition-colors duration-200"
									>
										<ChevronLeft className="w-4 h-4 mr-1" />
										Previous
									</button>
								) : (
									<div></div>
								)}

								<button
									type="submit"
									disabled={isSubmitting}
									className="flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
								>
									{currentStep === totalSteps ? (
										"Create Account"
									) : (
										<>
											Next
											<ChevronRight className="w-4 h-4 ml-1" />
										</>
									)}
								</button>
							</div>

							{currentStep === 1 && (
								<div className="flex flex-col justify-center items-center w-full ">
									<p className="text-[#909090] p-1 text-sm font-semibold">
										Have an account?{" "}
										<Link
											href="/login"
											className="hover:text-blue-800 text-blue-700"
										>
											Login
										</Link>
									</p>
									<p className="text-[#909090] p-1 text-sm font-semibold">
										<Link href="/signup" className="hover:text-blue-800 text-blue-700">
											Create a Personal Account?
										</Link>
									</p>
								</div>
							)}
						</Form>
					)}
				</Formik>

				{/*currentStep === 1 && (
				<div className="mt-6">
						<div className="flex items-center justify-center mb-4">
							<div className="border-t border-gray-300 flex-grow"></div>
							<span className="px-4 text-white text-sm">or</span>
							<div className="border-t border-gray-300 flex-grow"></div>
						</div>
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
					</div>
				)*/}
			</div>
		</section>
	);
};

export default SignupBusiness;
