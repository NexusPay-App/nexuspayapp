"use client";

import React, { useState } from 'react';
import { useMpesa } from '../../hooks/useMpesa';

export const BuyCryptoForm: React.FC = () => {
  const { buyCrypto, buyCryptoLoading } = useMpesa();
  
  const [formData, setFormData] = useState({
    cryptoAmount: '',
    phone: '',
    chain: 'arbitrum',
    tokenType: 'USDC',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await buyCrypto({
        cryptoAmount: formData.cryptoAmount,
        phone: formData.phone,
        chain: formData.chain,
        tokenType: formData.tokenType,
      });
      
      if (response.success) {
        // Reset form
        setFormData({
          cryptoAmount: '',
          phone: '',
          chain: 'arbitrum',
          tokenType: 'USDC',
        });
        
        // Show success message with transaction details
        alert(`Crypto purchase initiated! Transaction ID: ${response.data.transactionId}`);
      }
    } catch (error) {
      console.error('Buy crypto error:', error);
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
      <h2 className="text-2xl font-bold mb-6 text-center">Buy Crypto with M-Pesa</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cryptoAmount" className="block text-sm font-medium text-gray-700">
            Crypto Amount
          </label>
          <input
            type="number"
            id="cryptoAmount"
            name="cryptoAmount"
            value={formData.cryptoAmount}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.5"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            M-Pesa Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="+254712345678"
            required
          />
        </div>
        
        <div>
          <label htmlFor="tokenType" className="block text-sm font-medium text-gray-700">
            Token Type
          </label>
          <select
            id="tokenType"
            name="tokenType"
            value={formData.tokenType}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
          </select>
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
          disabled={buyCryptoLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {buyCryptoLoading ? 'Processing...' : 'Buy Crypto'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          💡 You&apos;ll receive an M-Pesa prompt to complete the payment. 
          Your crypto will be automatically transferred to your wallet once payment is confirmed.
        </p>
      </div>
    </div>
  );
};