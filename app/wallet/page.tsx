"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import WalletOverview from "@/components/wallet/WalletOverview";
import TokenTest from "@/components/debug/TokenTest";
import { RecentTransactions } from "@/components/transactions/RecentTransactions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const WalletPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/home" 
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Debug Component - Remove in production */}
          <TokenTest />
          
          <div className="mt-8">
            <WalletOverview />
          </div>
          
          {/* Recent Transactions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <RecentTransactions />
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/send"
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💸</div>
              <div className="font-medium">Send</div>
            </Link>
            <Link 
              href="/receive"
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📥</div>
              <div className="font-medium">Receive</div>
            </Link>
            <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium">M-Pesa</div>
              </div>
            </button>
            <Link 
              href="/transactions"
              className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">History</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default WalletPage;