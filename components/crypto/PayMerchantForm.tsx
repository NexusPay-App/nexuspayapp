import React, { useState } from 'react';
import { useCrypto } from '../../hooks/useCrypto';
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from '../../lib/crypto';

export const PayMerchantForm: React.FC = () => {
  const {
    payMerchant,
    payFormData,
    updatePayForm,
    resetPayForm,
    payMerchantLoading,
    payMerchantData,
    payMerchantError,
    getCurrentUserAddress,
  } = useCrypto();

  const [validationError, setValidationError] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'onchain' | 'offchain'>('onchain');
  const [googleAuthCode, setGoogleAuthCode] = useState<string>('');

  // Get current user's wallet address
  const currentUserAddress = getCurrentUserAddress();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate amount
    if (!payFormData.amount || parseFloat(payFormData.amount) <= 0) {
      setValidationError('Please enter a valid amount');
      return;
    }

    // Validate merchant ID
    if (!payFormData.merchantId.trim()) {
      setValidationError('Please enter a merchant ID');
      return;
    }

    // Validate confirmation
    if (!payFormData.confirm) {
      setValidationError('Please confirm the payment before proceeding');
      return;
    }

    // Validate Google auth code
    if (!googleAuthCode.trim()) {
      setValidationError('Please enter your Google Authenticator code');
      return;
    }

    try {
      const response = await payMerchant({
        senderAddress: currentUserAddress,
        merchantId: payFormData.merchantId,
        amount: parseFloat(payFormData.amount),
        confirm: payFormData.confirm,
        chainName: payFormData.chainName,
        tokenSymbol: payFormData.tokenSymbol,
        googleAuthCode: googleAuthCode,
      });

      if (response.success) {
        // Reset form on success
        resetPayForm();
        setGoogleAuthCode('');
      }
    } catch (error: any) {
      setValidationError(error.message || 'Failed to pay merchant');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#0A0E0E] rounded-xl border border-[#0795B0] p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Pay Merchant</h2>
        
        {/* Payment Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Payment Method:
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPaymentType('onchain')}
              className={`flex-1 py-2 px-3 rounded-md border transition-all duration-200 ${
                paymentType === 'onchain'
                  ? 'bg-[#0795B0] text-white border-[#0795B0]'
                  : 'bg-[#1A1E1E] text-gray-300 border-[#0795B0] hover:bg-[#0A0E0E]'
              }`}
            >
              🔗 On-Chain Crypto
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('offchain')}
              className={`flex-1 py-2 px-3 rounded-md border transition-all duration-200 ${
                paymentType === 'offchain'
                  ? 'bg-[#0795B0] text-white border-[#0795B0]'
                  : 'bg-[#1A1E1E] text-gray-300 border-[#0795B0] hover:bg-[#0A0E0E]'
              }`}
            >
              💰 Crypto to MPesa
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {paymentType === 'onchain' 
              ? 'Pay directly with crypto on the blockchain' 
              : 'Convert your crypto to MPesa for the merchant'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Merchant ID */}
          <div>
            <label htmlFor="merchantId" className="block text-sm font-medium text-gray-300 mb-2">
              Merchant ID
            </label>
            <input
              type="text"
              id="merchantId"
              value={payFormData.merchantId}
              onChange={(e) => updatePayForm('merchantId', e.target.value)}
              placeholder="MERCH123"
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the unique merchant ID provided by the business
            </p>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount {paymentType === 'offchain' ? '(in Crypto)' : ''}
            </label>
            <input
              type="number"
              id="amount"
              value={payFormData.amount}
              onChange={(e) => updatePayForm('amount', e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              required
            />
            {paymentType === 'offchain' && (
              <p className="text-xs text-gray-400 mt-1">
                Amount in crypto. Will be converted to MPesa for the merchant
              </p>
            )}
          </div>

          {/* Token Selection */}
          <div>
            <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300 mb-2">
              Token
            </label>
            <select
              id="tokenSymbol"
              value={payFormData.tokenSymbol}
              onChange={(e) => updatePayForm('tokenSymbol', e.target.value)}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
            >
              {SUPPORTED_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chain Selection - Only show for on-chain payments */}
          {paymentType === 'onchain' && (
            <div>
              <label htmlFor="chainName" className="block text-sm font-medium text-gray-300 mb-2">
                Blockchain
              </label>
              <select
                id="chainName"
                value={payFormData.chainName}
                onChange={(e) => updatePayForm('chainName', e.target.value)}
                className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* MPesa Phone Number - Only show for off-chain payments */}
          {paymentType === 'offchain' && (
            <div>
              <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-300 mb-2">
                Merchant MPesa Phone
              </label>
              <input
                type="tel"
                id="mpesaPhone"
                placeholder="+254712345678"
                className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                MPesa phone number where the merchant will receive the payment
              </p>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="confirm"
              checked={payFormData.confirm}
              onChange={(e) => updatePayForm('confirm', e.target.checked)}
              className="w-4 h-4 text-[#0795B0] bg-[#1A1E1E] border-[#0795B0] rounded focus:ring-[#0795B0] focus:ring-2"
              required
            />
            <label htmlFor="confirm" className="text-sm text-gray-300">
              I confirm that I want to pay this amount to the merchant
            </label>
          </div>

          {/* Google Auth Verification */}
          <div>
            <label htmlFor="googleAuthCode" className="block text-sm font-medium text-gray-300 mb-2">
              Google Authenticator Code
            </label>
            <input
              type="text"
              id="googleAuthCode"
              value={googleAuthCode}
              onChange={(e) => setGoogleAuthCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-3 py-3 bg-[#1A1E1E] border border-[#0795B0] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0795B0] focus:border-transparent hover:border-[#0AA5C0] transition-colors duration-200"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter your 6-digit Google Authenticator code for security verification
            </p>
          </div>

          {/* Error Display */}
          {(validationError || payMerchantError) && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-red-300 text-sm">
                {validationError || payMerchantError || 'An error occurred'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={payMerchantLoading || !payFormData.confirm || !googleAuthCode.trim()}
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md shadow-lg text-lg font-semibold text-white bg-[#0795B0] hover:bg-[#0684A0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0795B0] disabled:opacity-50 transition-all duration-200 mt-8 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {payMerchantLoading ? 'Processing...' : `Pay Merchant ${paymentType === 'offchain' ? '(Crypto to MPesa)' : '(On-Chain)'}`}
          </button>
        </form>

        {/* Success Display */}
        {payMerchantData && (
          <div className="mt-6 p-6 bg-[#1A1E1E] border border-[#0795B0] rounded-md">
            <h3 className="text-lg font-semibold text-white mb-4">✅ Payment Successful!</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Business Name:</strong> {payMerchantData.data.businessName}</p>
              <p><strong>Transaction Hash:</strong> {payMerchantData.data.transactionHash}</p>
              <p><strong>Authentication Method:</strong> {payMerchantData.data.authenticationMethod}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-[#1A1E1E] border border-[#0795B0] rounded-md">
          <p className="text-sm text-gray-300">
            💡 <strong>Payment Options:</strong> 
            {paymentType === 'onchain' 
              ? ' Pay directly with crypto on the blockchain for instant settlement.' 
              : ' Convert your crypto to MPesa for the merchant. The merchant receives MPesa while you pay with crypto.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
