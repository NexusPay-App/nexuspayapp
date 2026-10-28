"use client";

import PWAInstallButton from "@/components/pwa/PWAInstallButton";

import { NexusMark, UserIcon } from "@/constants/svg";
import { List } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import loadingJson from "@/public/json/loading.json";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";

// Dynamically import Player to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

/**
 * The logged-in app header (navigation sheet, logo, install button, account
 * menu) extracted verbatim from the home page so every sub-page renders the
 * same top bar and alignment.
 */
export default function AppHeader() {
  const { user, logout } = useAuth();
  const { currentBusiness, businessAccounts, loadBusinessAccounts } =
    useBusiness();
  const router = useRouter();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  // Logs out the User
  const handleLogout = () => {
    setOpenLogoutDialog(true);
    logout();
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  // Handle settings click
  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <header className="shrink-0 border-b border-white/10">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger aria-label="Open navigation" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/5">
              <List size={24} color="#ffffff" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <ul className="flex flex-col justify-around items-start text-base font-DM text-black w-auto">
                  <Link
                    href="/home"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Home
                  </Link>
                  <Link
                    href="/business"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Business
                  </Link>
                  <Link
                    href="/reclaim"
                    className="my-2 mx-2 min-w-[100px] text-black hover:text-aqua hover:cursor-pointer "
                  >
                    Reclaim
                  </Link>
                </ul>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Link href="/home" aria-label="NexusPay home">
            <Image src={NexusMark} alt="NexusPay" className="h-8 w-auto" priority />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="My Account"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0795B0]"
                onClick={() => {
                  // Load business accounts when user opens dropdown
                  if (user?.id && businessAccounts.length === 0) {
                    loadBusinessAccounts();
                  }
                }}
              >
                <Image src={UserIcon} alt="" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Settings */}
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              {/* Business Account Switcher */}
              {currentBusiness ? (
                <DropdownMenuItem
                  onClick={() => {
                    console.log('Switch to Business clicked');
                    router.push('/business/home');
                  }}
                  className="hover:bg-blue-50"
                >
                  <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Switch to {currentBusiness.businessName}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    console.log('Browse Business Accounts clicked');
                    router.push('/business');
                  }}
                  className="hover:bg-blue-50"
                >
                  <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Business Accounts</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialog to LogOut the User */}
        <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="mb-[5px]">Logging you out</DialogTitle>
              <Player
                keepLastFrame
                autoplay
                loop={true}
                src={loadingJson}
                style={{ height: "200px", width: "200px" }}
              ></Player>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
