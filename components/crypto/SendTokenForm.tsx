"use client";

import NetworkFeeNotice from "./NetworkFeeNotice";
import { usePaymentNetworks } from '@/hooks/usePaymentNetworks';
import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../hooks/useCrypto';
import { validateRecipientIdentifier, normalizeRecipientPhone } from '../../lib/crypto';

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

  const { networks, tokens, isBot } = usePaymentNetworks(sendFormData.chain);

  // Selecting a BOT network must not keep a legacy token symbol selected.
  useEffect(() => {
    if (isBot && tokens.length && !tokens.some(t => t.symbol === sendFormData.tokenType)) {
      updateSendForm('tokenType', 'USDT');
    }
  }, [isBot, tokens, sendFormData.tokenType, updateSendForm]);

  const [validationError, setValidationError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authValue, setAuthValue] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentUserAddress, setCurrentUserAddress] = useState<string>('');
  const [loadingWallet, setLoadingWallet] = useState(true);

  // Get current user's wallet address automatically
  useEffect(() => {
    let active = true;
    const fetchWalletAddress = async () => {
      try {
        setLoadingWallet(true);
        setCurrentUserAddress('');
        const address = await getCurrentUserAddress(sendFormData.chain);
        if (active) setCurrentUserAddress(address);
      } catch (error) {
        console.error('Failed to fetch wallet address:', error);
        if (active) setCurrentUserAddress('');
      } finally {
        if (active) setLoadingWallet(false);
      }
    };

    fetchWalletAddress();
    return () => { active = false; };
  }, [getCurrentUserAddress, sendFormData.chain]);

  // Handle form submission - just show auth modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate amount
    if (!sendFormData.amount || parseFloat(sendFormData.amount) <= 0) {
      setValidationError('Please enter a valid amount');
      return;
    }

    if (!networks.some(n => n.id === sendFormData.chain && n.transfers !== false)) {
      setValidationError('Select an available payment network.');
      return;
    }

    // Validate sender address
    if (!currentUserAddress || currentUserAddress.trim() === '') {
      setValidationError('Wallet address not found. Please ensure you are logged in.');
      return;
    }

    // Validate recipient identifier (phone-like values are normalized to E.164)
    const normalizedRecipient = normalizeRecipientPhone(sendFormData.recipientIdentifier);
    if (!validateRecipientIdentifier(normalizedRecipient) || /^G[A-Z2-7]{55}$/.test(normalizedRecipient)) {
      setValidationError('Please enter a valid recipient identifier');
      return;
    }
    if (normalizedRecipient !== sendFormData.recipientIdentifier) {
      updateSendForm('recipientIdentifier', normalizedRecipient);
    }

    // Show authentication modal
    setShowAuthModal(true);
  };

  // Handle authentication and send
  const handleAuthenticateAndSend = async () => {
    if (!authValue.trim()) {
      setValidationError('Please enter your account password');
      return;
    }

    setValidationError('');

    const requestData = {
      recipientIdentifier: sendFormData.recipientIdentifier,
      amount: sendFormData.amount,
      senderAddress: currentUserAddress,
      chain: sendFormData.chain,
      tokenSymbol: sendFormData.tokenType, // API expects tokenSymbol, not tokenType
      password: authValue,
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
      setShowAuthModal(false);
      setAuthValue('');
      
      const displayMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Unable to send this payment. Check transaction history before retrying.';

      setErrorMessage(displayMessage);
      setShowError(true);
    }
  };

  // Get placeholder text showing all options
  const getPlaceholder = () => {
    return 'Phone number, email, or 0x wallet address';
  };

  // Get validation message
  const getValidationMessage = () => {
    return 'Use a registered phone number (for example +254…), email, or a wallet address on the selected network.';
  };

  return (
    <div className="w-full">
      <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Send Crypto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <NetworkFeeNotice network={sendFormData.chain} />
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
              placeholder={getPlaceholder()}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{getValidationMessage()}</p>
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
              <label htmlFor="tokenType" className="block text-sm font-medium text-gray-300 mb-2">
                Token
              </label>
              <select
                id="tokenType"
                value={sendFormData.tokenType}
                onChange={(e) => updateSendForm('tokenType', e.target.value)}
                className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              >
                {tokens.map((token) => (
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
                {networks.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.id === 'stellar' ? '🌟 ' : ''}{chain.name}
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
                {/* Account password */}
                <input
                  type="password" autoComplete="current-password"
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  placeholder="Enter your account password"
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
                  <span className="text-2xl">{sendTokenData.data.botStatus === 'failed' ? '×' : sendTokenData.data.botStatus && sendTokenData.data.botStatus !== 'confirmed' ? '…' : '✓'}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{sendTokenData.data.botStatus === 'failed' ? 'Payment Failed' : sendTokenData.data.botStatus && sendTokenData.data.botStatus !== 'confirmed' ? 'Payment Submitted' : 'Transaction Successful!'}</h3>
                <p className="text-gray-400">
                  {sendTokenData.data.botStatus === 'failed' ? sendTokenData.message : sendTokenData.data.botStatus && sendTokenData.data.botStatus !== 'confirmed'
                    ? 'Pending confirmation on BOT Chain. This is not confirmed yet.'
                    : 'Your crypto has been sent successfully'}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono text-xs">
                    {sendTokenData.data.recipient?.identifier || sendTokenData.data.recipient?.address || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">
                    {sendTokenData.data.transaction?.amountDisplay || sendTokenData.data.amount || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain:</span>
                  <span className="text-white capitalize">{sendTokenData.data.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Hash:</span>
                  <span className="text-white font-mono text-xs">
                    {sendTokenData.data.transactionHash || sendTokenData.data.transaction?.hash || 'N/A'}
                  </span>
                </div>
                {sendTokenData.data.explorerUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Explorer:</span>
                    <a 
                      href={sendTokenData.data.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                    >
                      View on Explorer
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">
                    {sendTokenData.data.timestamp?.local || new Date().toLocaleString()}
                  </span>
                </div>
                {sendTokenData.data.security && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Security:</span>
                    <span className="text-white capitalize">
                      {sendTokenData.data.security.authMethod} ({sendTokenData.data.security.level})
                    </span>
                  </div>
                )}
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

        {/* Error Card */}
        {showError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0A0E0E] border border-red-500 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
                <p className="text-gray-400">There was an error sending your crypto</p>
              </div>

              <div className="bg-red-900/20 border border-red-500 rounded-md p-4 mb-6">
                <p className="text-red-300 text-sm">{errorMessage}</p>
                <a href="/settings" className="mt-3 inline-block text-sm text-white underline">Account and password settings</a>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowError(false);
                    setErrorMessage('');
                  }}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowError(false);
                    setErrorMessage('');
                    setShowAuthModal(true);
                  }}
                  className="flex-1 py-3 bg-[#0795B0] text-white rounded-md hover:bg-[#0684A0] transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
