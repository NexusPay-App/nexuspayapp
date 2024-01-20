

import { NexusLogo } from "@/constants/svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const OnboardingScreenOne = () => {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.replace("/signup")
  }

  return (
    <main className="onboarding-bg" onClick={handleNavigate}>
      <Image src={NexusLogo} alt="" />
      <article className="">
        <h2 className="text-4xl text-white font-bold">
          Effortless Crypto Transactions
        </h2>
        <h4 className="text-white my-5">
          Send and receive crypto using your phone number
        </h4>
      </article>
      {/* <article className="hidden">
        {onboardingSource.map((element, index) => {
          return (
            <div key={index} className="w-screen">
              <h2 className="text-4xl text-white font-bold">
                {element.title}
              </h2>
              <h4 className="text-white my-5">
              {element.subtitle}
              </h4>
            </div>
          );
        })}
      </article> */}
      <article className="flex">
        <hr className="line w-[150px]" />
        <hr className="line w-[50px]" />
        <hr className="line w-[50px]" />
      </article>
    </main>
  );
};

export default OnboardingScreenOne;
