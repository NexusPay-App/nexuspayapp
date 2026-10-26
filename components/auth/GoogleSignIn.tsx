"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPostAuthPath } from "@/lib/auth";

interface GoogleSignInProps {
  mode: "login" | "signup" | "continue";
  redirectTo?: "/home" | "/signup/business";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export default function GoogleSignIn({
  mode,
  redirectTo,
  onSuccess,
  onError,
}: GoogleSignInProps) {
  const { googleAuth, getGoogleConfig } = useAuth();
  const router = useRouter();
  const button = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const handlers = useRef({
    googleAuth,
    getGoogleConfig,
    onSuccess,
    onError,
    redirectTo,
  });
  const [status, setStatus] = useState<
    "loading" | "ready" | "authenticating" | "error"
  >("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    handlers.current = {
      googleAuth,
      getGoogleConfig,
      onSuccess,
      onError,
      redirectTo,
    };
  });

  useEffect(() => {
    let active = true;
    let script: HTMLScriptElement | null = null;
    let initialize = () => {};
    const fail = (message: string) => {
      if (!active) return;
      setError(message);
      setStatus("error");
      handlers.current.onError?.(message);
    };
    const failedToLoad = () =>
      fail(
        "Google sign-in could not load. Try reloading or continue with your phone.",
      );
    const timeout = setTimeout(failedToLoad, 15_000);

    async function load() {
      let clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      try {
        const config = await handlers.current.getGoogleConfig();
        clientId = config.data?.clientId || config.clientId || clientId;
      } catch {
        /* Use the deployment client ID if the configuration endpoint is unavailable. */
      }
      if (!active) return;
      if (!clientId) {
        clearTimeout(timeout);
        fail("Google sign-in is unavailable. Continue with your phone.");
        return;
      }
      initialize = () => {
        if (!active || !window.google?.accounts?.id || !button.current) return;
        clearTimeout(timeout);
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async ({ credential }: { credential: string }) => {
            if (!active || busy.current) return;
            busy.current = true;
            setStatus("authenticating");
            try {
              const result = await handlers.current.googleAuth({
                idToken: credential,
              });
              if (!result?.token)
                throw new Error(
                  "Google sign-in did not complete. Please try again.",
                );
              handlers.current.onSuccess?.();
              router.replace(handlers.current.redirectTo || getPostAuthPath());
            } catch {
              fail("Google sign-in did not complete. Please try again.");
            } finally {
              busy.current = false;
            }
          },
        });
        window.google.accounts.id.renderButton(button.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: Math.min(400, Math.floor(button.current.clientWidth)),
          text:
            mode === "continue"
              ? "continue_with"
              : mode === "login"
                ? "signin_with"
                : "signup_with",
        });
        setStatus("ready");
      };
      if (window.google?.accounts?.id) {
        initialize();
        return;
      }
      script = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initialize);
      script.addEventListener("error", failedToLoad);
    }
    void load().catch(failedToLoad);
    return () => {
      active = false;
      clearTimeout(timeout);
      script?.removeEventListener("load", initialize);
      script?.removeEventListener("error", failedToLoad);
    };
  }, [mode, router]);

  return (
    <div className="w-full">
      <div ref={button} className="flex min-h-11 w-full justify-center" />
      {status === "loading" && (
        <p role="status" className="mt-2 text-center text-sm text-white/60">
          Loading Google sign-in…
        </p>
      )}
      {status === "authenticating" && (
        <p role="status" className="mt-2 text-center text-sm text-white/70">
          Signing you in…
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 text-center text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}
