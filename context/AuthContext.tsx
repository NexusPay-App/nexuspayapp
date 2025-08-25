"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, tokenUtils, userUtils, User } from "../lib/auth";
import toast from "react-hot-toast";

// Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Registration flow
  register: (data: any) => Promise<any>;
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
  
  // Logout
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (userUtils.isAuthenticated()) {
          const userData = userUtils.getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data
        tokenUtils.removeToken();
        userUtils.removeUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper function to handle successful authentication
  const handleAuthSuccess = (response: any) => {
    console.log("Processing auth success with response:", response);
    
    // Extract token from multiple possible locations
    const token = response?.data?.token || 
                 response?.token || 
                 response?.data?.data?.token ||
                 response?.data?.accessToken ||
                 response?.accessToken;
    
    if (token) {
      // Extract user data from response
      const responseData = response.data || response;
      const userFromResponse = responseData.user || responseData;
      
      const userData: User = {
        email: responseData.email || userFromResponse?.email || '',
        phoneNumber: responseData.phoneNumber || userFromResponse?.phoneNumber || '',
        arbitrumWallet: responseData.arbitrumWallet || userFromResponse?.arbitrumWallet || responseData.walletAddress || '',
        celoWallet: responseData.celoWallet || userFromResponse?.celoWallet || responseData.walletAddress || '',
        walletAddress: responseData.walletAddress || responseData.arbitrumWallet || userFromResponse?.arbitrumWallet || '', // fallback for compatibility
        token,
      };
      
      console.log("Storing user data:", userData);
      
      tokenUtils.setToken(token);
      userUtils.setUser(userData);
      setUser(userData);
      
      toast.success(response.message || 'Authentication successful');
      return userData;
    } else {
      console.error("No token found in response:", response);
      throw new Error("Authentication failed - no token received");
    }
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

  // Verify email
  const verifyEmail = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyEmail(data);
      
      if (response.success && response.data.token) {
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
      
      if (response.success && response.data.token) {
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

  // Login
  const login = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.login(data);
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify login
  const verifyLogin = async (data: any) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyLogin(data);
      
      console.log("Full OTP verification response:", response);
      
      // Check multiple possible response structures for token
      const token = response?.data?.token || 
                   response?.token || 
                   response?.data?.data?.token ||
                   response?.data?.accessToken ||
                   response?.accessToken;
      
      if (response.success && token) {
        return handleAuthSuccess(response);
      } else {
        console.error("No token found in response. Response structure:", response);
        throw new Error("Authentication failed - no token received");
      }
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login verification failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
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
      
      if (response.success && response.data.token) {
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

  // Logout
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await authAPI.logout();
    } catch (error) {
      // Continue with local logout even if server call fails
      console.error('Server logout failed:', error);
    } finally {
      tokenUtils.removeToken();
      userUtils.removeUser();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && userUtils.isAuthenticated(),
    register,
    verifyEmail,
    verifyPhone,
    login,
    verifyLogin,
    requestPasswordReset,
    resetPassword,
    googleAuth,
    linkGoogle,
    getGoogleConfig,
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
