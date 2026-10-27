"use client";

import { usePathname } from "next/navigation";
import BotChainFooter from "@/components/BotChainFooter";

const FOOTER_PATHS = [
  "/",
  "/ecosystem",
  "/onboarding",
  "/login",
  "/signup",
  "/signup/business",
  "/forgotpassword",
  "/offline",
];

export default function RouteFooter() {
  const pathname = usePathname() ?? "/";
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (!FOOTER_PATHS.includes(normalized)) return null;
  return <BotChainFooter />;
}
