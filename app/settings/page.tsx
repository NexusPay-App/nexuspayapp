"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useChain } from "../../context/ChainContext";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Smartphone, Mail, Link, Unlink, ArrowLeft, CheckCircle, AlertCircle, Copy, Eye, EyeOff, User, Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";
import AuthGuard from "../../components/auth/AuthGuard";

const SettingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { wallet, hasWallet, loading, initializeWallet } = useWallet();
  const { chain } = useChain();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUserId, setShowUserId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
    }
  }, [isAuthenticated, user]);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      // Since the backend endpoint doesn't exist yet, we'll use the user data we have
      // and simulate the profile loading
      setUserProfile({
        id: user?.id || `user_${Date.now()}`, // Generate a temporary ID if none exists
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        googleId: user?.googleId,
        authMethods: user?.phoneNumber ? ['phone'] : [],
        ...(user?.email && { authMethods: [...(user?.phoneNumber ? ['phone'] : []), 'email'] })
      });
      toast.success("Profile loaded successfully");
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile - using cached data");
      // Fallback to user data
      setUserProfile({
        id: user?.id || `user_${Date.now()}`,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        googleId: user?.googleId,
        authMethods: user?.phoneNumber ? ['phone'] : [],
        ...(user?.email && { authMethods: [...(user?.phoneNumber ? ['phone'] : []), 'email'] })
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const copyUserId = async () => {
    const userId = userProfile?.id || user?.id;
    if (userId) {
      try {
        await navigator.clipboard.writeText(userId);
        setCopied(true);
        toast.success("User ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy user ID:', error);
        toast.error("Failed to copy user ID");
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    if (text && text !== "Not set") {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  // Wallet helpers (match Receive page behavior)
  const universalWalletAddress = wallet?.walletAddress || wallet?.address || user?.walletAddress || "";
  const phoneNumber = wallet?.phoneNumber || user?.phoneNumber || "";
  const email = wallet?.email || user?.email || "";
  const supportedChains = wallet?.supportedChains || [];

  const handleInitializeWallet = async () => {
    try {
      setInitializing(true);
      await initializeWallet();
      toast.success('Wallet set up successfully!');
    } catch (error) {
      // handled in context
    } finally {
      setInitializing(false);
    }
  };

  const formatWalletAddress = (address: string) => {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'No wallet address';
  };

  const handleLinkGoogle = async () => {
    try {
      setProfileLoading(true);
      // This would typically open Google OAuth flow
      toast("Google linking feature coming soon!", { icon: "ℹ️" });
    } catch (error) {
      console.error("Failed to link Google:", error);
      toast.error("Failed to link Google account");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLinkPhone = async () => {
    try {
      setProfileLoading(true);
      // This would typically open phone verification flow
      toast("Phone linking feature coming soon!", { icon: "ℹ️" });
    } catch (error) {
      console.error("Failed to link phone:", error);
      toast.error("Failed to link phone number");
    } finally {
      setProfileLoading(false);
    }
  };

  const getAuthMethodStatus = (method: string) => {
    if (!userProfile) return { linked: false, icon: <AlertCircle className="h-4 w-4 text-gray-400" /> };
    
    const linked = userProfile.authMethods?.includes(method) || 
                   (method === 'phone' && userProfile.phoneNumber) ||
                   (method === 'google' && userProfile.googleId);
    
    return {
      linked,
      icon: linked ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-gray-400" />
    };
  };

  return (
    <AuthGuard>
      <section className="home-background min-h-screen">
        {/* Top bar to match app theme */}
        <article className="bg-[#0A0E0E] flex flex-col p-5 xl:px-[200px] border-0 border-b border-[#0795B0]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center text-white hover:text-[#0795B0] transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-lg font-medium">Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <span />
          </div>
        </article>

        {/* Main content */}
        <article className="mt-8 flex flex-col items-center p-5 xl:px-[200px]">
          <div className="w-full max-w-4xl space-y-6">
            {/* Account Information */}
            <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 text-white">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" /> Account Information
                </h2>
                <p className="text-gray-400 text-sm">Your basic account details and User ID</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#A4A4A4]">Email</label>
                  <p className="font-mono">{email || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm text-[#A4A4A4]">Phone Number</label>
                  <p className="font-mono">{phoneNumber || "Not set"}</p>
                </div>
              </div>

              <div className="border-t border-[#0795B0]/50 pt-4 mt-4">
                <label className="text-sm text-[#A4A4A4] mb-2 block">User ID</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-sm">
                    {showUserId ? (
                      <span>{userProfile?.id || user?.id || "Loading..."}</span>
                    ) : (
                      <span className="text-gray-400">••••••••••••••••</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserId(!showUserId)}
                    className="border-[#0795B0] text-white"
                  >
                    {showUserId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUserId}
                    className="border-[#0795B0] text-white"
                    disabled={!userProfile?.id && !user?.id}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-green-400 text-xs mt-1">Copied to clipboard!</p>
                )}
                <p className="text-[#A4A4A4] text-xs mt-2">
                  This User ID is required for creating business accounts
                </p>
              </div>
            </div>

            {/* Wallet Information (Universal and per-chain) */}
            <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 text-white">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full" /> Wallet Information
                </h2>
                <p className="text-gray-400 text-sm">Your universal wallet and chain addresses</p>
              </div>

              {/* Universal wallet */}
              <div className="flex flex-col mb-4">
                <label className="text-sm text-[#A4A4A4]">Universal Wallet Address</label>
                <div className="flex justify-between items-center border border-[#0795B0] rounded-lg p-3 bg-[#0A0E0E]">
                  <span className="flex-1 mr-2 text-sm">{universalWalletAddress ? formatWalletAddress(universalWalletAddress) : 'Not available'}</span>
                  {universalWalletAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(universalWalletAddress)}
                      className="border-[#0795B0] text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!universalWalletAddress && (
                  <div className="mt-3">
                    <Button
                      onClick={handleInitializeWallet}
                      disabled={initializing || loading || hasWallet}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {initializing ? 'Setting up...' : 'Set Up Wallet'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Per-chain display from user fallback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#A4A4A4]">Arbitrum Wallet</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-sm">
                      <span>{user?.arbitrumWallet || user?.walletAddress || "Not set"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(user?.arbitrumWallet || user?.walletAddress || "")}
                      className="border-[#0795B0] text-white"
                      disabled={!user?.arbitrumWallet && !user?.walletAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#A4A4A4]">Celo Wallet</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-sm">
                      <span>{user?.celoWallet || user?.walletAddress || "Not set"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(user?.celoWallet || user?.walletAddress || "")}
                      className="border-[#0795B0] text-white"
                      disabled={!user?.celoWallet && !user?.walletAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Supported Chains */}
              {supportedChains.length > 0 && (
                <div className="mt-6 p-4 bg-black/40 border border-[#0795B0]/40 rounded-lg">
                  <h4 className="font-semibold mb-3">Supported Networks:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {supportedChains.map((chain: any) => (
                      <div key={chain.id} className="flex items-center space-x-2 p-2 bg-black/40 rounded">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">{chain.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Methods */}
            <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 text-white">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" /> Authentication Methods
                </h2>
                <p className="text-gray-400 text-sm">Link your phone number and Google account for secure access</p>
              </div>

              {/* Phone Number */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="font-medium">Phone Number</h3>
                    <p className="text-gray-400 text-sm">{phoneNumber || "No phone number linked"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getAuthMethodStatus('phone').icon}
                  <Button
                    onClick={handleLinkPhone}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="border-[#0795B0] text-white"
                  >
                    {user?.phoneNumber ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    {user?.phoneNumber ? "Unlink" : "Link"}
                  </Button>
                </div>
              </div>

              {/* Google Account */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg mt-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-400" />
                  <div>
                    <h3 className="font-medium">Google Account</h3>
                    <p className="text-gray-400 text-sm">{userProfile?.googleId ? "Google account linked" : "No Google account linked"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getAuthMethodStatus('google').icon}
                  <Button
                    onClick={handleLinkGoogle}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="border-[#0795B0] text-white"
                  >
                    {userProfile?.googleId ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    {userProfile?.googleId ? "Unlink" : "Link"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 text-white">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Security</h2>
                <p className="text-gray-400 text-sm">Manage your security preferences</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg mt-3">
                <div>
                  <h3 className="font-medium">Password Change</h3>
                  <p className="text-gray-400 text-sm">Update your account password</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={loadUserProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Refresh Profile
              </Button>
              <Button
                onClick={() => router.push("/signup/business")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Create Business Account
              </Button>
            </div>
          </div>
        </article>
      </section>
    </AuthGuard>
  );
};

export default SettingsPage;
