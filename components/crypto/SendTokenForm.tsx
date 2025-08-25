"use client";

import React, { useState } from 'react';
import { useCrypto } from '../../hooks/useCrypto';
import { useAuth } from '../../context/AuthContext';

export const SendTokenForm: React.FC = () => {
  const { sendToken, sendTokenLoading } = useCrypto();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    recipientIdentifier: '',
    amount: '',
    chain: 'arbitrum',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.walletAddress) {
      alert('Please login first');
      return;
    }
    
    try {
      const response = await sendToken({
        recipientIdentifier: formData.recipientIdentifier,
        amount: formData.amount,
        senderAddress: user.walletAddress,
        chain: formData.chain,
      });
      
      if (response.success) {
        // Reset form
        setFormData({
          recipientIdentifier: '',
          amount: '',
          chain: 'arbitrum',
        });
      }
    } catch (error) {
      console.error('Send token error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Send Tokens</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipientIdentifier" className="block text-sm font-medium text-gray-700">
            Recipient (Phone or Wallet Address)
          </label>
          <input
            type="text"
            id="recipientIdentifier"
            name="recipientIdentifier"
            value={formData.recipientIdentifier}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="+254712345678 or 0x..."
            required
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (USDC)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="10.5"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div>
          <label htmlFor="chain" className="block text-sm font-medium text-gray-700">
            Blockchain
          </label>
          <select
            id="chain"
            name="chain"
            value={formData.chain}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="arbitrum">Arbitrum</option>
            <option value="celo">Celo</option>
            <option value="polygon">Polygon</option>
            <option value="base">Base</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={sendTokenLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {sendTokenLoading ? 'Sending...' : 'Send Tokens'}
        </button>
      </form>
    </div>
  );
};