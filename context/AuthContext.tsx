"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userUtils, User } from "../lib/auth";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { clearLegacyBalanceStorage } from "@/lib/balanceCache";
import { authUtils } from "@/lib/api";
import { preloadBalanceAfterLogin } from '@/lib/balance-preloader';

// Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Registration flow
  register: (data: any) => Promise<any>;
  completeRegistration: (data: any) => Promise<any>;
  verifyEmail: (data: any) => Promise<any>;
  verifyPhone: (data: any) => Promise<any>;
  
  // Login flow
  login: (data: any) => Promise<any>;
  verifyLogin: (data: any) => Promise<any>;
  
  // Password reset
  requestPasswordReset: (data: any) => Promise<any>;
  resetPassword: (data: any) => Promise<any>;
  
  // Google authentication
  googleAuth: (data: any) => Promise<any>;
  linkGoogle: (data: any) => Promise<any>;
  getGoogleConfig: () => Promise<any>;
  
  // User profile
  getUserProfile: () => Promise<any>;
  
  // Logout
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authUtils.clearAuth();
    authAPI.getMe().then(response => {
      if (active && response.success && response.data?.user) {
        userUtils.setUser(response.data.user);
        setUser(response.data.user);
      }
    }).catch(() => { userUtils.removeUser(); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleAuthSuccess = async (response: any) => {
    if (!response.data?.sessionActive) throw new Error('Sign-in did not establish a session');
    const profile = await authAPI.getMe();
    const userData: User = profile.data.user;
    if (!profile.success || !userData?.id) throw new Error('Session could not be verified');
    queryClient.clear();
    clearLegacyBalanceStorage();
    userUtils.setUser(userData);
    setUser(userData);
    toast.success(response.message || 'Signed in');
    return userData;
  };

  // Registration (using initiate for backward compatibility)
  const register = async (data: any) => {
    try {
      setLoading(true);
      // Use registerInitiate for the first step to maintain compatibility
      const response = await authAPI.registerInitiate(data);
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (data: any) => {
    const response = await authAPI.register(data);
    if (!response.success || !response.data?.sessionActive) throw new Error(response.message || 'Registration did not complete');
    return handleAuthSuccess(response);
  };

  // Verify email
  const verifyEmail = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyEmail(data);
      
      if (response.success && response.data.sessionActive) {
        return handleAuthSuccess(response);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify phone
  const verifyPhone = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyPhone(data);
      
      if (response.success && response.data.sessionActive) {
        return handleAuthSuccess(response);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Phone verification failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: any) => {
    const response = await authAPI.login(data);
    if (response.success && response.data?.sessionActive) await handleAuthSuccess(response);
    return response;
  };

  const verifyLogin = async (data: any) => {
    const response = await authAPI.verifyLogin(data);
    if (!response.success || !response.data?.sessionActive) throw new Error('Sign-in could not be verified. Please request a new code.');
    return handleAuthSuccess(response);
  };

  // Request password reset
  const requestPasswordReset = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.requestPasswordReset(data);
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset request failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.resetPassword(data);
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google authentication
  const googleAuth = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.googleAuth(data);
      
      if (response.success && response.data.sessionActive) {
        return handleAuthSuccess(response);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google authentication failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Link Google account
  const linkGoogle = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.linkGoogle(data);
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to link Google account';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get Google config
  const getGoogleConfig = async () => {
    try {
      const response = await authAPI.getGoogleConfig();
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get Google configuration';
      toast.error(message);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      // Since the backend endpoint doesn't exist yet, return the current user data
      const profileData = {
        id: user?.id,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        googleId: user?.googleId,
        arbitrumWallet: user?.arbitrumWallet,
        celoWallet: user?.celoWallet,
        walletAddress: user?.walletAddress,
        authMethods: user?.phoneNumber ? ['phone'] : [],
        ...(user?.email && { authMethods: [...(user?.phoneNumber ? ['phone'] : []), 'email'] })
      };
      
      return {
        success: true,
        data: profileData,
        message: 'Profile loaded successfully'
      };
    } catch (error: any) {
      console.error("Failed to get user profile:");
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    let revokeFailed = false;
    try {
      await authAPI.logout();
    } catch {
      revokeFailed = true;
    } finally {
      authUtils.clearAuth();
      userUtils.removeUser();
      clearLegacyBalanceStorage();
      queryClient.clear();
      setUser(null);
    }
    if (revokeFailed) {
      toast.error('Signed out here, but this session could not be revoked on the server.');
    } else {
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && userUtils.isAuthenticated(),
    register,
    completeRegistration,
    verifyEmail,
    verifyPhone,
    login,
    verifyLogin,
    requestPasswordReset,
    resetPassword,
    googleAuth,
    linkGoogle,
    getGoogleConfig,
    getUserProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
