import Image from "next/image";
import Link from "next/link";
import { NexusLogo } from "@/constants/svg";
import OnboardingCarousel from "@/components/auth/OnboardingCarousel";
import { Smartphone, ArrowUpRight } from "lucide-react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";

const Onboarding = () => (
  <main className="onboarding-bg flex flex-col px-5 py-6 sm:px-8 sm:py-8">
    <header className="mx-auto w-full max-w-6xl">
      <Image src={NexusLogo} alt="NexusPay" priority className="h-12 w-auto" />
    </header>

    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 py-6 sm:py-10 lg:flex-row lg:gap-16">
      <section className="w-full max-w-xl text-center lg:text-left" aria-label="About NexusPay">
        <OnboardingCarousel />
      </section>

      <section className="w-full max-w-md rounded-3xl border border-[#0795B0]/40 bg-[#0A0E0E]/95 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)] sm:p-8" aria-labelledby="auth-title">
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-[#0795B0]" aria-hidden="true" />
        <h2 id="auth-title" className="text-center text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
          Sign in or create an account
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-white/70">
          Use Google for quick access, or continue with your phone number and password.
        </p>

        <div className="mt-7">
          <GoogleSignIn mode="continue" />
        </div>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#0795B0]/25" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">or</span>
          <span className="h-px flex-1 bg-[#0795B0]/25" />
        </div>

        <Link
          href="/login"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#0795B0]/70 bg-[#0795B0]/10 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-[#0795B0] hover:bg-[#0795B0]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0795B0]"
        >
          <Smartphone className="h-4 w-4 shrink-0 text-[#39BED3]" aria-hidden="true" />
          Continue with phone and password
        </Link>

        <div className="mt-7 space-y-5 border-t border-[#0795B0]/20 pt-6 text-center text-sm">
          <div>
            <p className="text-white/60">New to NexusPay?</p>
            <Link href="/signup" className="mt-1 inline-flex min-h-9 items-center gap-1 font-semibold text-[#39BED3] underline-offset-4 hover:text-[#70D6E6] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0795B0]">
              Create a personal account
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <p className="text-white/60">Setting up for a business?</p>
            <Link href="/signup/business" className="mt-1 inline-flex min-h-9 items-center gap-1 font-semibold text-[#39BED3] underline-offset-4 hover:text-[#70D6E6] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0795B0]">
              Create a business account
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  </main>
);

export default Onboarding;
