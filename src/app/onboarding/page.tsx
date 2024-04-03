"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Adjust the path as needed
import Image from "next/image";
import { NexusLogo } from "@/constants/svg";
import { onboardingSource } from "@/helpers/onboardingSource";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const Onboarding = () => {
  const router = useRouter();
  const { user } = useAuth() as unknown as { user: any }; // Or as { user: YourUserTypeHere };

  // useEffect(() => {
  //   // Check if the user is already logged in
  //   if (user) {
  //     // User is logged in, redirect to homepage
  //     router.replace("/home"); // Adjust this to your homepage route
  //   }
  //   // Else, stay on the onboarding page, allowing the user to navigate to login manually

  //   ScrollTrigger.create({
  //     trigger: "#animate",
  //     start: "right top",
  //     endTrigger: "#animate",
  //     end: "+=700",
  //     pin: true,
  //     horizontal: true,
  //   });
  // }, [router, user]); // Add `user` dependency to react to changes in authentication status

  const handleNavigate = () => {
    if (user) {
      // User is logged in, redirect to homepage
      router.replace("/home"); // Adjust this to your homepage route
    } else {
      router.replace("/login"); // This will only be triggered if user clicks, and `useEffect` hasn't redirected them yet
    }
  };

  return (
    <main className="onboarding-bg" onClick={handleNavigate}>
      <div className="flex justify-around w-full">
        <Image src={NexusLogo} alt="" className="py-[100px]" />
      </div>
      <Carousel>
        <CarouselContent>
          {onboardingSource.map((element, index) => {
            return (
              <CarouselItem key={index}>
                <div className="flex flex-col justify-around h-[300px]">
                  <h2 className="text-4xl text-white font-bold">
                    {element.title}
                  </h2>
                  <h4 className="text-white my-5">{element.subtitle}</h4>
                  <article className="flex">
                    <hr
                      className="line"
                      style={
                        index == 0 ? { width: "150px" } : { width: "50px" }
                      }
                    />
                    <hr
                      className="line"
                      style={
                        index == 1 ? { width: "150px" } : { width: "50px" }
                      }
                    />
                    <hr
                      className="line"
                      style={
                        index == 2 ? { width: "150px" } : { width: "50px" }
                      }
                    />
                  </article>
                  <Link
                    href="/home"
                    className="bg-white p-3 rounded-2xl mt-5 font-bold  cursor-pointer text-center"
                  >
                    Continue
                  </Link>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </main>
  );
};

export default Onboarding;
