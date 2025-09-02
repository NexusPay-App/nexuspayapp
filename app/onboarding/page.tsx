"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Adjust the path as needed
import Image from "next/image";
import { NexusLogo } from "@/constants/svg"; // ✅ use named import for NexusLogo
import { onboardingSource } from "@/helpers/onboardingSource";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountTypeDialog } from "@/components/dialog/accountTypeDialog"; // ✅ switched to default import

// ✅ GSAP imports
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Onboarding = () => {
	const router = useRouter();
	const { user } = useAuth() as unknown as { user: any };
	const [dialogOpen, setDialogOpen] = useState(false);

	// ✅ Re-enable gsap + auth redirect
	useEffect(() => {
		// Redirect if logged in
		if (user) {
			router.replace("/home");
		}

		// Register plugin once
		gsap.registerPlugin(ScrollTrigger);

		// Example animation (pinning the carousel container)
		ScrollTrigger.create({
			trigger: "#animate",
			start: "top top",
			end: "+=700",
			pin: true,
			scrub: true,
		});
	}, [router, user]);

	return (
		<main className="onboarding-bg p-8 h-screen">
			<div className="flex justify-around w-full">
				<Image src={NexusLogo} alt="Logo" className="mb-[100px]" />
			</div>

			<div id="animate" className="xsm:flex justify-center">
				<Carousel className="xsm:w-[400px]">
					<CarouselContent>
						{onboardingSource.map((element, index) => (
							<CarouselItem key={index}>
								<div className="flex flex-col justify-around h-[400px]">
									<h2 className="text-4xl text-white font-bold">
										{element.title}
									</h2>
									<h4 className="text-white my-5">{element.subtitle}</h4>
									<article className="flex">
										{[0, 1, 2].map((i) => (
											<hr
												key={i}
												className="line"
												style={{ width: index === i ? "150px" : "50px" }}
											/>
										))}
									</article>
									<div className="flex flex-col justify-center">
										<Button
											onClick={() => setDialogOpen(true)}
											className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-full "
										>
											Get Started
										</Button>

										<Link
											href="/login"
											className="bg-white p-3 rounded-full mt-5 mb-3 font-bold cursor-pointer text-center w-full sm:w-[400px]"
										>
											Login
										</Link>

										<AccountTypeDialog
											open={dialogOpen}
											onOpenChange={setDialogOpen}
										/>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		</main>
	);
};

export default Onboarding;
