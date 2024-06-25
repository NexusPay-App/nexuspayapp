import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/style.css";
import { AuthProvider } from "@/context/AuthContext"; // Ensure this path matches the location of your AuthContext file
import { BalanceProvider } from "@/context/BalanceContext";
import { ChainProvider } from "@/context/ChainContext";
import ClientOnly from "./ClientOnly";
import { ReactQueryClientProvider } from "@/providers/ReactQueryClientProvider";
import { Toaster } from "react-hot-toast";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  applicationName: "NexusPay",
  title: {
    default: "Nexuspay App",
    template: "Nexuspay App",
  },
  metadataBase: new URL("https://app.nexuspayapp.xyz"),
  description: "Stablecoin Payment Wallet",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexuspay App",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "NexusPay",
    title: {
      default: "Nexuspay App",
      template: "Nexuspay App",
    },
    description: "Stablecoin Payment Wallet",
  },
  twitter: {
    card: "summary",
    title: {
      default: "Nexuspay App",
      template: "Nexuspay App",
    },
    description: "Stablecoin Payment Wallet",
  },
};



export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryClientProvider>
          <AuthProvider>
            <ChainProvider>
            <BalanceProvider>
              <ClientOnly>{children}</ClientOnly>
              <Toaster />
            </BalanceProvider>
            </ChainProvider>
          </AuthProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
