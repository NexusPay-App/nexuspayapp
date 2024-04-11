"use client"

// contexts/BalanceContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const BalanceContext = createContext();

export const useBalance = () => useContext(BalanceContext);

// Provider component
export const BalanceProvider = ({ children }) => {
    const [balance, setBalance] = useState({ balanceInUSDC: 0, balanceInKES: '0', rate: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                // Retrieve the user object from localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.walletAddress) {
                    const response = await fetch(`https://afpaybackend.vercel.app/api/usdc/usdc-balance/${user.walletAddress}`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setBalance(data);
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    return (
        <BalanceContext.Provider value={{ balance, loading }}>
            {children}
        </BalanceContext.Provider>
    );
};
