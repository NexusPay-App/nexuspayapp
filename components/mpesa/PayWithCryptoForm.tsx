"use client";

import React, { useState } from 'react';
import { useMpesa } from '../../hooks/useMpesa';

export const PayWithCryptoForm: React.FC = () => {
  const { payWithCrypto, payWithCryptoLoading } = useMpesa();
  
  const [formData, setFormData] = useState({
    amount: '',
    cryptoAmount: '',
    targetType: 'paybill' as 'paybill' | 'till',
    targetNumber: '',
    accountNumber: '',
    chain: 'polygon',
    tokenType: 'USDC',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await payWithCrypto({
        recipient: formData.targetNumber,
        amount: formData.amount,
        token: formData.tokenType,
        chain: formData.chain,
        paymentType: formData.targetType as 'paybill' | 'till' | 'send',
        businessNumber: formData.targetType === 'paybill' ? formData.targetNumber : undefined,
        accountNumber: formData.targetType === 'paybill' ? formData.accountNumber : undefined,
        tillNumber: formData.targetType === 'till' ? formData.targetNumber : undefined,
      });
      
      if (response.success) {
        // Reset form
        setFormData({
          amount: '',
          cryptoAmount: '',
          targetType: 'paybill',
          targetNumber: '',
          accountNumber: '',
          chain: 'polygon',
          tokenType: 'USDC',
          description: '',
        });
        
        // Show success with transaction details
        alert(`Payment successful! Transaction Hash: ${response.data.cryptoTransactionHash}`);
      }
    } catch (error) {
      console.error('Pay with crypto error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Common paybill numbers for quick selection
  const commonPaybills = [
    { name: 'KPLC (Electricity)', number: '888880' },
    { name: 'Nairobi Water', number: '535353' },
    { name: 'DSTV', number: '820820' },
    { name: 'Safaricom Internet', number: '551500' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">🚀 Pay with Crypto</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Revolutionary feature: Pay bills and shops using your crypto balance!
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="targetType" className="block text-sm font-medium text-gray-700">
            Payment Type
          </label>
          <select
            id="targetType"
            name="targetType"
            value={formData.targetType}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="paybill">Paybill (Bills, Services)</option>
            <option value="till">Till (Shops, Restaurants)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="targetNumber" className="block text-sm font-medium text-gray-700">
            {formData.targetType === 'paybill' ? 'Paybill Number' : 'Till Number'}
          </label>
          <input
            type="text"
            id="targetNumber"
            name="targetNumber"
            value={formData.targetNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={formData.targetType === 'paybill' ? '888880' : '508508'}
            required
          />
          
          {formData.targetType === 'paybill' && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Quick select:</p>
              <div className="flex flex-wrap gap-1">
                {commonPaybills.map((paybill) => (
                  <button
                    key={paybill.number}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, targetNumber: paybill.number }))}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {paybill.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {formData.targetType === 'paybill' && (
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your account number"
              required
            />
          </div>
        )}
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (KES)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="500"
            min="1"
            required
          />
        </div>
        
        <div>
          <label htmlFor="cryptoAmount" className="block text-sm font-medium text-gray-700">
            Crypto Amount to Spend
          </label>
          <input
            type="number"
            id="cryptoAmount"
            name="cryptoAmount"
            value={formData.cryptoAmount}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="3.75"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tokenType" className="block text-sm font-medium text-gray-700">
              Token
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
              Chain
            </label>
            <select
              id="chain"
              name="chain"
              value={formData.chain}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="ethereum">Ethereum</option>
              <option value="base">Base</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Electricity bill payment"
            rows={2}
            maxLength={100}
          />
        </div>
        
        <button
          type="submit"
          disabled={payWithCryptoLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {payWithCryptoLoading ? 'Processing Payment...' : '🚀 Pay with Crypto'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-purple-50 rounded-md">
        <p className="text-sm text-purple-700">
          🌟 <strong>Revolutionary Feature:</strong> Your crypto will be automatically converted 
          and the M-Pesa payment will be made instantly. If payment fails, your crypto is returned!
        </p>
      </div>
    </div>
  );
};