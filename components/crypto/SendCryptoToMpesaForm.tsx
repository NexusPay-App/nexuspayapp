"use client";

import React, { useState, useEffect } from 'react';
import { useMpesa } from '../../hooks/useMpesa';
import { cryptoConverter, CryptoConversion } from '../../lib/crypto-converter';

export const SendCryptoToMpesaForm: React.FC = () => {
  const { withdraw, withdrawLoading } = useMpesa();
  
  const [formData, setFormData] = useState({
    cryptoAmount: '', // Amount in crypto
    phone: '',
    chain: 'arbitrum',
    tokenType: 'USDC',
  });

  // Conversion state
  const [conversion, setConversion] = useState<{
    cryptoAmount: number;
    kesAmount: number;
    conversionRate: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Transaction result state
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
    status?: string;
  } | null>(null);

  // Check authentication status
  const [authStatus, setAuthStatus] = useState({
    hasToken: false,
    token: '',
    user: null as any,
  });

  useEffect(() => {
    const token = localStorage.getItem('nexuspay_token');
    const user = localStorage.getItem('nexuspay_user');
    
    setAuthStatus({
      hasToken: !!token,
      token: token || '',
      user: user ? JSON.parse(user) : null,
    });

    // Auto-fill phone number from user account
    if (user) {
      const userData = JSON.parse(user);
      setFormData(prev => ({
        ...prev,
        phone: userData.phoneNumber || '',
      }));
    }
  }, []);

  // Calculate conversion when crypto amount changes
  useEffect(() => {
    if (formData.cryptoAmount && parseFloat(formData.cryptoAmount) > 0) {
      calculateConversion();
    } else {
      setConversion(null);
    }
  }, [formData.cryptoAmount, formData.tokenType]);

  const calculateConversion = async () => {
    if (!formData.cryptoAmount || parseFloat(formData.cryptoAmount) <= 0) return;
    
    setIsCalculating(true);
    try {
      const rates = await cryptoConverter.getConversionRates();
      const cryptoAmount = parseFloat(formData.cryptoAmount);
      
      // Convert crypto to KES (assuming 1:1 for USDC)
      let kesAmount: number;
      let conversionRate: number;
      
      switch (formData.tokenType) {
        case 'USDC':
          kesAmount = cryptoAmount / rates.kes; // Convert to KES
          conversionRate = 1 / rates.kes;
          break;
        case 'USDT':
          kesAmount = cryptoAmount / rates.kes;
          conversionRate = 1 / rates.kes;
          break;
        default:
          kesAmount = cryptoAmount / rates.kes;
          conversionRate = 1 / rates.kes;
      }
      
      setConversion({
        cryptoAmount,
        kesAmount,
        conversionRate
      });
    } catch (error) {
      console.error('Conversion calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authStatus.hasToken) {
      alert('You must be logged in to send crypto. Please login first.');
      return;
    }

    if (!conversion) {
      alert('Please enter a valid amount to calculate conversion.');
      return;
    }
    
    // Log the data being sent
    const requestData = {
      amount: formData.cryptoAmount, // Send crypto amount
      phoneNumber: formData.phone,
      token: formData.tokenType,
      chain: formData.chain,
    };
    
    console.log('Sending crypto to M-Pesa:', requestData);
    console.log('Conversion details:', conversion);
    
    try {
      const response = await withdraw(requestData);
      
      if (response.success) {
        // Set transaction result
        setTransactionResult({
          success: true,
          message: response.message || 'Crypto sent to M-Pesa successfully',
          data: response.data,
          status: response.data?.status || 'processing'
        });
        
        // Reset form
        setFormData({
          cryptoAmount: '',
          phone: authStatus.user?.phoneNumber || '', // Keep phone number
          chain: 'arbitrum',
          tokenType: 'USDC',
        });
        setConversion(null);
      }
    } catch (error: any) {
      console.error('Send crypto to M-Pesa error:', error);
      console.error('Error response data:', error.response?.data);
      
      // Set error result
      setTransactionResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send crypto to M-Pesa',
        data: error.response?.data,
        status: 'failed'
      });
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Send Crypto to M-Pesa</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="cryptoAmount" className="block text-sm font-medium text-gray-300 mb-2">
              Crypto Amount
            </label>
            <input
              type="number"
              id="cryptoAmount"
              name="cryptoAmount"
              value={formData.cryptoAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              placeholder="10.5"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the amount of crypto you want to send
            </p>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              placeholder="+254712345678"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-filled from your account: {formData.phone || 'Not set'}
            </p>
          </div>
          
          <div>
            <label htmlFor="tokenType" className="block text-sm font-medium text-gray-300 mb-2">
              Token Type
            </label>
            <select
              id="tokenType"
              name="tokenType"
              value={formData.tokenType}
              onChange={handleInputChange}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="chain" className="block text-sm font-medium text-gray-300 mb-2">
              Blockchain
            </label>
            <select
              id="chain"
              name="chain"
              value={formData.chain}
              onChange={handleInputChange}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
            >
              <option value="arbitrum">Arbitrum</option>
              <option value="celo">Celo</option>
              <option value="polygon">Polygon</option>
              <option value="base">Base</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={withdrawLoading || isCalculating}
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md shadow-lg text-lg font-semibold text-white bg-[#0795B0] hover:bg-[#0684A0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0795B0] disabled:opacity-50 transition-all duration-200 mt-8 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {withdrawLoading || isCalculating ? 'Processing...' : 'Send to M-Pesa'}
          </button>
        </form>

        {/* Conversion Display */}
        {isCalculating && (
          <div className="mt-6 p-6 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0795B0] mx-auto mb-3"></div>
            <p className="text-gray-300">Calculating conversion rates...</p>
          </div>
        )}

        {conversion && !isCalculating && (
          <div className="mt-6 p-6 bg-[#1A1E1E] border border-[#0795B0] rounded-md">
            <h3 className="text-lg font-semibold text-white mb-4">💱 Conversion Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0A0E0E] border border-[#0795B0] rounded-md">
                <p className="text-sm text-gray-400 mb-1">You Send</p>
                <p className="text-xl font-bold text-white">
                  {conversion.cryptoAmount.toFixed(6)} {formData.tokenType}
                </p>
              </div>
              <div className="p-4 bg-[#0A0E0E] border border-[#0795B0] rounded-md">
                <p className="text-sm text-gray-400 mb-1">They Receive</p>
                <p className="text-xl font-bold text-white">
                  {conversion.kesAmount.toFixed(0)} KES
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#0A0E0E] border border-[#0795B0] rounded-md">
              <p className="text-sm text-gray-400">
                💡 Rate: 1 {formData.tokenType} = {conversion.conversionRate.toFixed(2)} KES
              </p>
            </div>
          </div>
        )}

        {/* Transaction Result Cards */}
        {transactionResult && (
          <div className="mt-6">
            {transactionResult.success ? (
              <div className="p-6 bg-green-900/20 border border-green-500 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400">Transaction Successful</h3>
                    <p className="text-sm text-green-300">{transactionResult.message}</p>
                  </div>
                </div>
                
                {transactionResult.data && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Transaction ID:</span>
                        <p className="text-white font-mono">{transactionResult.data.transactionId}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <p className="text-green-400 capitalize">{transactionResult.data.status}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Crypto Sent:</span>
                        <p className="text-white">{transactionResult.data.cryptoAmount} {transactionResult.data.tokenType}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">KES Amount:</span>
                        <p className="text-white">{transactionResult.data.kesAmount} KES</p>
                      </div>
                    </div>
                    
                    {transactionResult.data.note && (
                      <div className="p-3 bg-blue-900/30 border border-blue-500/50 rounded">
                        <p className="text-sm text-blue-300">{transactionResult.data.note}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setTransactionResult(null)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xl">✗</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">Transaction Failed</h3>
                    <p className="text-sm text-red-300">{transactionResult.message}</p>
                  </div>
                </div>
                
                {transactionResult.data && (
                  <div className="space-y-3">
                    {transactionResult.data.transactionDetails?.mpesaResultDesc && (
                      <div className="p-3 bg-red-900/30 border border-red-500/50 rounded">
                        <p className="text-sm text-red-300">
                          <strong>Error Details:</strong> {transactionResult.data.transactionDetails.mpesaResultDesc}
                        </p>
                      </div>
                    )}
                    
                    {transactionResult.data.transactionId && (
                      <div className="p-3 bg-gray-900/30 border border-gray-500/50 rounded">
                        <p className="text-sm text-gray-300">
                          <strong>Transaction ID:</strong> {transactionResult.data.transactionId}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setTransactionResult(null)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-[#1A1E1E] border border-[#0795B0] rounded-md">
          <p className="text-sm text-gray-300">
            💡 Your crypto will be converted to KES and sent to the M-Pesa number. 
            The recipient will receive the KES amount directly in their M-Pesa account.
          </p>
        </div>
      </div>
    </div>
  );
};
