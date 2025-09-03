"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Smartphone, Mail, Link, Unlink, ArrowLeft, CheckCircle, AlertCircle, Copy, Eye, EyeOff, User, Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";
import AuthGuard from "../../components/auth/AuthGuard";

const SettingsPage = () => {
  const { user, isAuthenticated, getUserProfile, linkGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUserId, setShowUserId] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
    }
  }, [isAuthenticated, user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

  const handleLinkGoogle = async () => {
    try {
      setLoading(true);
      // This would typically open Google OAuth flow
      toast("Google linking feature coming soon!", { icon: "ℹ️" });
    } catch (error) {
      console.error("Failed to link Google:", error);
      toast.error("Failed to link Google account");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPhone = async () => {
    try {
      setLoading(true);
      // This would typically open phone verification flow
      toast("Phone linking feature coming soon!", { icon: "ℹ️" });
    } catch (error) {
      console.error("Failed to link phone:", error);
      toast.error("Failed to link phone number");
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push("/home")}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Account Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your basic account details and User ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 font-mono">{user?.email || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-gray-900 font-mono">{user?.phoneNumber || "Not set"}</p>
                </div>
              </div>
              
              {/* User ID Section */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">User ID</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    {showUserId ? (
                      <span className="text-gray-900">{userProfile?.id || user?.id || "Loading..."}</span>
                    ) : (
                      <span className="text-gray-400">••••••••••••••••</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserId(!showUserId)}
                    className="border-gray-300"
                  >
                    {showUserId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUserId}
                    className="border-gray-300"
                    disabled={!userProfile?.id && !user?.id}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-green-600 text-xs mt-1">Copied to clipboard!</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  💡 This User ID is required for creating business accounts
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                Wallet Information
              </CardTitle>
              <CardDescription>
                Your personal wallet addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Arbitrum Wallet</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-sm">
                      <span className="text-gray-900">{user?.arbitrumWallet || user?.walletAddress || "Not set"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(user?.arbitrumWallet || user?.walletAddress || "")}
                      className="border-gray-300"
                      disabled={!user?.arbitrumWallet && !user?.walletAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Celo Wallet</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-sm">
                      <span className="text-gray-900">{user?.celoWallet || user?.walletAddress || "Not set"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(user?.celoWallet || user?.walletAddress || "")}
                      className="border-gray-300"
                      disabled={!user?.celoWallet && !user?.walletAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Methods */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Authentication Methods
              </CardTitle>
              <CardDescription>
                Link your phone number and Google account for secure access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone Number */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="text-gray-900 font-medium">Phone Number</h3>
                    <p className="text-gray-500 text-sm">
                      {user?.phoneNumber || "No phone number linked"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getAuthMethodStatus('phone').icon}
                  <Button
                    onClick={handleLinkPhone}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    {user?.phoneNumber ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    {user?.phoneNumber ? "Unlink" : "Link"}
                  </Button>
                </div>
              </div>

              {/* Google Account */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="text-gray-900 font-medium">Google Account</h3>
                    <p className="text-gray-500 text-sm">
                      {userProfile?.googleId ? "Google account linked" : "No Google account linked"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getAuthMethodStatus('google').icon}
                  <Button
                    onClick={handleLinkGoogle}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    {userProfile?.googleId ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    {userProfile?.googleId ? "Unlink" : "Link"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-gray-900 font-medium">Two-Factor Authentication</h3>
                  <p className="text-gray-500 text-sm">Add an extra layer of security</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Coming Soon
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-gray-900 font-medium">Password Change</h3>
                  <p className="text-gray-500 text-sm">Update your account password</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Coming Soon
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={loadUserProfile}
              disabled={loading}
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
      </div>
    </AuthGuard>
  );
};

export default SettingsPage;
