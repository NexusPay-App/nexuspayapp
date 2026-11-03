import { headers } from "next/headers";
import type { Metadata } from "next";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import SplashScreen from "@/components/splashscreen/SplashScreen";

async function isSecurityHost() {
  const requestHeaders = await headers();
  return [requestHeaders.get("x-forwarded-host"), requestHeaders.get("host")]
    .filter(Boolean)
    .some((value) =>
      value!
        .split(",")[0]
        .split(":")[0]
        .trim()
        .toLowerCase() === "security.nexuspayapp.xyz",
    );
}

export async function generateMetadata(): Promise<Metadata> {
  if (await isSecurityHost()) {
    return {
      title: "Security console",
      robots: { index: false, follow: false },
    };
  }

  return {};
}

export default async function Home() {
  if (await isSecurityHost()) {
    return <SecurityDashboard />;
  }

  return (
    <section className="app-background">
      <SplashScreen />
    </section>
  );
}
