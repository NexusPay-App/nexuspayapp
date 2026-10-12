import Image from "next/image";
import Link from "next/link";
import { NexusLogo } from "@/constants/svg";
import { onboardingSource } from "@/helpers/onboardingSource";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import GoogleSignIn from "@/components/auth/GoogleSignIn";

const Onboarding = () => (
  <main className="onboarding-bg flex flex-col px-5 py-6 sm:px-8 sm:py-8">
    <header className="mx-auto w-full max-w-6xl">
      <Image src={NexusLogo} alt="NexusPay" priority className="h-12 w-auto" />
    </header>

    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 py-8 lg:flex-row lg:gap-16">
      <section className="w-full max-w-xl text-center lg:text-left" aria-label="About NexusPay">
        <Carousel className="w-full">
          <CarouselContent>
            {onboardingSource.map((element, index) => (
              <CarouselItem key={element.title}>
                <div className="flex min-h-[210px] flex-col justify-center gap-5 sm:min-h-[250px]">
                  <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                    {element.title}
                  </h1>
                  <p className="text-lg text-white/80 sm:text-xl">{element.subtitle}</p>
                  <div className="flex justify-center gap-2 lg:justify-start" aria-label={`Slide ${index + 1} of ${onboardingSource.length}`}>
                    {onboardingSource.map((slide, slideIndex) => (
                      <span
                        key={slide.title}
                        className={`h-1.5 rounded-full transition-all ${slideIndex === index ? "w-12 bg-white" : "w-5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-[#07111f]/85 p-6 shadow-2xl backdrop-blur-md sm:p-8" aria-labelledby="auth-title">
        <h2 id="auth-title" className="text-center text-2xl font-bold text-white sm:text-3xl">
          Sign in or create an account
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-white/70">
          Start with Google, or use your phone number and password. Google works for new and returning users.
        </p>

        <div className="mt-7 rounded-2xl bg-white p-2">
          <GoogleSignIn mode="continue" />
        </div>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-white/20" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">or</span>
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <Link
          href="/login"
          className="flex min-h-12 w-full items-center justify-center rounded-full border border-white/40 px-5 text-center font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Continue with phone and password
        </Link>

        <p className="mt-6 text-center text-sm text-white/70">
          New to NexusPay?{" "}
          <Link href="/signup" className="font-bold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
            Create a personal account
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-white/60">
          Setting up for a business?{" "}
          <Link href="/signup/business" className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
            Create a business account
          </Link>
        </p>
      </section>
    </div>
  </main>
);

export default Onboarding;
