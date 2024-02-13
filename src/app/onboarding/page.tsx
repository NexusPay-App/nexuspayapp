"use client";

import React, { useEffect } from "react";
import OnboardingScreenOne from "./OnboardingScreenOne";
import Image from "next/image";
import { NexusLogo } from "@/constants/svg";
import { useRouter } from "next/navigation";
import { onboardingSource } from "@/helpers/onboardingSource";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Onboarding = () => {
  const router = useRouter();

  useEffect(() => {
    ScrollTrigger.create({
      trigger: "#animate",
      start: "right top",
      endTrigger: "#animate",
      end: "+=700",
      pin: true,
      horizontal: true,
    });
  }, []);

  const handleNavigate = () => {
    router.replace("/signup");
  };

  return (
    <main className="onboarding-bg" onClick={handleNavigate}>
      <Image src={NexusLogo} alt="" className="py-[100px]" />
      {/* <article className="">
        <h2 className="text-4xl text-white font-bold">
          Effortless Crypto Transactions
        </h2>
        <h4 className="text-white my-5">
          Send and receive crypto using your phone number
        </h4>
      </article> */}
      <article
        className="flex overflow-x-scroll hide-scroll-bar animate min-w-screen"
        id="animate"
      >
        {onboardingSource.map((element, index) => {
          return (
            <div key={index} className="min-w-[300px]">
              <h2 className="text-4xl text-white font-bold">{element.title}</h2>
              <h4 className="text-white my-5">{element.subtitle}</h4>
            </div>
          );
        })}
      </article>
      <article className="flex my-[100px]">
        <hr className="line w-[150px]" />
        <hr className="line w-[50px]" />
        <hr className="line w-[50px]" />
      </article>
    </main>
  );
};

export default Onboarding;
