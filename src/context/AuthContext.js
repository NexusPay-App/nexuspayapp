
"use client"
// AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Simulate retrieving token from localStorage/sessionStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (userData) => {
    // Here you would usually call your backend to authenticate the user,
    // then save the returned user data (and possibly a token) in the state
    // and also in localStorage/sessionStorage for persistence across refreshes.
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};



