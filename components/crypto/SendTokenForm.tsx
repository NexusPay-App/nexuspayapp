"use client";

import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../hooks/useCrypto';
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, validateRecipientIdentifier } from '../../lib/crypto';

export const SendTokenForm: React.FC = () => {
  const {
    sendToken,
    sendFormData,
    updateSendForm,
    resetSendForm,
    sendTokenLoading,
    sendTokenData,
    sendTokenError,
    getCurrentUserAddress,
  } = useCrypto();

  const [validationError, setValidationError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'googleAuth'>('password');
  const [authValue, setAuthValue] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUserAddress, setCurrentUserAddress] = useState<string>('');
  const [loadingWallet, setLoadingWallet] = useState(true);

  // Get current user's wallet address automatically
  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        setLoadingWallet(true);
        const address = await getCurrentUserAddress();
        setCurrentUserAddress(address);
      } catch (error) {
        console.error('Failed to fetch wallet address:', error);
        setCurrentUserAddress('');
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletAddress();
  }, [getCurrentUserAddress]);

  // Handle form submission - just show auth modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate amount
    if (!sendFormData.amount || parseFloat(sendFormData.amount) <= 0) {
      setValidationError('Please enter a valid amount');
      return;
    }

    // Validate sender address
    if (!currentUserAddress || currentUserAddress.trim() === '') {
      setValidationError('Wallet address not found. Please ensure you are logged in.');
      return;
    }

    // Validate recipient identifier
    if (!validateRecipientIdentifier(sendFormData.recipientIdentifier)) {
      setValidationError('Please enter a valid recipient identifier');
      return;
    }

    // Show authentication modal
    setShowAuthModal(true);
  };

  // Handle authentication and send
  const handleAuthenticateAndSend = async () => {
    if (!authValue.trim()) {
      setValidationError('Please enter your password or Google Authenticator code');
      return;
    }

    setValidationError('');

    const requestData = {
      recipientIdentifier: sendFormData.recipientIdentifier,
      amount: parseFloat(sendFormData.amount),
      senderAddress: currentUserAddress,
      chain: sendFormData.chain,
      tokenType: sendFormData.tokenType,
      ...(authMethod === 'password' 
        ? { password: authValue }
        : { googleAuthCode: authValue }
      ),
    };

    try {
      const response = await sendToken(requestData);

      if (response.success) {
        setShowAuthModal(false);
        setShowSuccess(true);
        resetSendForm();
        setAuthValue('');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Validation failed';
        const errorDetails = error.response?.data?.error?.details;
        
        if (errorDetails && Array.isArray(errorDetails)) {
          // Show specific validation errors
          const specificErrors = errorDetails.map((detail: any) => 
            `${detail.field}: ${detail.message}`
          ).join(', ');
          setValidationError(`Validation Error: ${specificErrors}`);
        } else {
          setValidationError(`Error: ${errorMessage}`);
        }
      } else {
        setValidationError(error.message || 'Failed to send crypto');
      }
    }
  };

  // Get placeholder text showing all options
  const getPlaceholder = () => {
    return 'email, phone & address';
  };

  // Get validation message
  const getValidationMessage = () => {
    return 'Enter a valid email address, phone number, or wallet address. The system will automatically detect the type.';
  };

  return (
    <div className="w-full">
      <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Send Crypto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient */}
          <div>
            <label htmlFor="recipientIdentifier" className="block text-sm font-medium text-gray-300 mb-2">
              Recipient
            </label>
            <input
              type="text"
              id="recipientIdentifier"
              value={sendFormData.recipientIdentifier}
              onChange={(e) => updateSendForm('recipientIdentifier', e.target.value)}
              placeholder="email, phone & address"
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={sendFormData.amount}
              onChange={(e) => updateSendForm('amount', e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              required
            />
          </div>

          {/* Token & Chain */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300 mb-2">
                Token
              </label>
              <select
                id="tokenType"
                value={sendFormData.tokenType}
                onChange={(e) => updateSendForm('tokenType', e.target.value)}
                className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              >
                {SUPPORTED_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="chain" className="block text-sm font-medium text-gray-300 mb-2">
                Chain
              </label>
              <select
                id="chain"
                value={sendFormData.chain}
                onChange={(e) => updateSendForm('chain', e.target.value)}
                className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Display */}
          {validationError && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-red-300 text-sm">{validationError}</p>
            </div>
          )}

          {/* Debug Info - Temporary */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-md">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">🔍 Debug Info:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><strong>Loading Wallet:</strong> {loadingWallet ? '⏳ Loading...' : '✅ Loaded'}</p>
              <p><strong>Detected Wallet:</strong> {currentUserAddress || 'Not found'}</p>
              <p><strong>Auth Token:</strong> {localStorage.getItem('nexuspay_token') ? '✅ Present' : '❌ Missing'}</p>
              <p><strong>User Data:</strong> {localStorage.getItem('nexuspay_user') ? '✅ Present' : '❌ Missing'}</p>
            </div>
            <button
              onClick={async () => {
                console.log('🔍 Refreshing wallet address...');
                try {
                  const address = await getCurrentUserAddress();
                  console.log('Fresh wallet address:', address);
                  setCurrentUserAddress(address);
                } catch (error) {
                  console.error('Failed to refresh wallet address:', error);
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Refresh Wallet
            </button>
          </div>



          {/* Send Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md shadow-lg text-lg font-semibold text-white bg-[#0795B0] hover:bg-[#0684A0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0795B0] transition-all duration-200 mt-8 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Send Crypto
          </button>
        </form>

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4 text-center">🔐 Authentication Required</h3>
              
              <div className="space-y-4">
                {/* Auth Method Selection */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={`flex-1 py-2 px-3 rounded-md border transition-all duration-200 ${
                      authMethod === 'password'
                        ? 'bg-[#0795B0] text-white border-[#0795B0]'
                        : 'bg-[#1A1E1E] text-gray-300 border-[#0795B0] hover:bg-[#0A0E0E]'
                    }`}
                  >
                    🔐 Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('googleAuth')}
                    className={`flex-1 py-2 px-3 rounded-md border transition-all duration-200 ${
                      authMethod === 'googleAuth'
                        ? 'bg-[#0795B0] text-white border-[#0795B0]'
                        : 'bg-[#1A1E1E] text-gray-300 border-[#0795B0] hover:bg-[#0A0E0E]'
                    }`}
                  >
                    📱 Google Auth
                  </button>
                </div>

                {/* Auth Input */}
                <input
                  type={authMethod === 'password' ? 'password' : 'text'}
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  placeholder={authMethod === 'password' ? 'Enter your password' : 'Enter Google Auth code'}
                  className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent"
                  autoFocus
                />

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      setAuthValue('');
                    }}
                    className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAuthenticateAndSend}
                    disabled={sendTokenLoading || !authValue.trim()}
                    className="flex-1 py-2 px-4 bg-[#0795B0] text-white rounded-md hover:bg-[#0684A0] disabled:opacity-50 transition-colors duration-200"
                  >
                    {sendTokenLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Card */}
        {showSuccess && sendTokenData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-xl p-6 w-full max-w-md mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Transaction Successful!</h3>
                <p className="text-gray-400">Your crypto has been sent successfully</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono text-xs">{sendTokenData.data.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">{sendTokenData.data.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Hash:</span>
                  <span className="text-white font-mono text-xs">{sendTokenData.data.transactionHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccess(false);
                  setAuthValue('');
                }}
                className="w-full mt-6 py-3 bg-[#0795B0] text-white rounded-md hover:bg-[#0684A0] transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};