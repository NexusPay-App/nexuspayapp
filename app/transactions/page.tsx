"use client";

import React, { useState } from 'react';
import { TransactionHistory } from '../../components/transactions/TransactionHistory';
import { TransactionAnalytics } from '../../components/transactions/TransactionAnalytics';
import { TransactionExport } from '../../components/transactions/TransactionExport';
import { useAuth } from '../../context/AuthContext';

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'analytics' | 'export'>('history');
  
  console.log('🏠 TransactionsPage: Component rendered');
  
  // Check if user has admin privileges (you can adjust this logic based on your user model)
  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.isAdmin;
  
  const tabs = [
    { id: 'history', label: 'Transaction History', icon: '📋' },
    ...(isAdmin ? [
      { id: 'analytics', label: 'Analytics', icon: '📊' },
      { id: 'export', label: 'Export Data', icon: '📤' },
    ] : []),
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E0E] via-[#0F1419] to-[#0A0E0E] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
          <p className="text-gray-400">
            {activeTab === 'history' && 'View and manage all your cryptocurrency transactions'}
            {activeTab === 'analytics' && 'Analyze transaction patterns and performance metrics'}
            {activeTab === 'export' && 'Export transaction data for external analysis'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-[#1A1E1E] p-1 rounded-lg border border-[#0795B0]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#0795B0] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#0A0E0E]'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'history' && (
            <TransactionHistory />
          )}
          
          {activeTab === 'analytics' && isAdmin && (
            <TransactionAnalytics />
          )}
          
          {activeTab === 'export' && isAdmin && (
            <TransactionExport />
          )}
        </div>

        {/* Admin Notice */}
        {!isAdmin && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-blue-400 text-2xl">ℹ️</div>
              <div>
                <h3 className="text-blue-300 font-semibold">Limited Access</h3>
                <p className="text-blue-200 text-sm">
                  Analytics and export features are available to administrators only. 
                  Contact support if you need access to these features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">💸</div>
            <h3 className="text-white font-semibold mb-2">Send Crypto</h3>
            <p className="text-gray-400 text-sm mb-4">Transfer tokens to another wallet</p>
            <button 
              onClick={() => window.location.href = '/send'}
              className="w-full px-4 py-2 bg-[#0795B0] text-white rounded hover:bg-[#0684A0] transition-colors duration-200"
            >
              Send Now
            </button>
          </div>

          <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-white font-semibold mb-2">Buy Crypto</h3>
            <p className="text-gray-400 text-sm mb-4">Purchase crypto with M-Pesa</p>
            <button 
              onClick={() => window.location.href = '/buy-crypto'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
            >
              Buy Now
            </button>
          </div>

          <div className="bg-[#0A0E0E] border border-[#0795B0] rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-white font-semibold mb-2">Pay Bills</h3>
            <p className="text-gray-400 text-sm mb-4">Pay utilities with crypto</p>
            <button 
              onClick={() => window.location.href = '/pay'}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
            >
              Pay Bills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
