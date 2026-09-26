// ==============================================================================
// JanUrja Wallet Full Canvas View (/wallet)
// Features:
// 1. Top Header Banner in matching organic sage brand style
// 2. Add Money via Mock Payment Gateway (UPI, Cards, Net Banking)
// 3. Withdraw Funds to Bank Account (IMPS) or UPI ID
// 4. Passbook Ledger of all wallet activities & settlements
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import WalletModal from '../components/WalletModal';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Smartphone,
  CreditCard,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function WalletView() {
  const { currentUser, setIsWalletModalOpen, getWalletTransactions } = useApp();
  const currentBalance = Number(currentUser?.wallet_balance || 1000);
  const ledger = getWalletTransactions ? getWalletTransactions(currentUser?.id) : [];

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP HEADER BANNER */}
      <div className="w-full bg-[#587550] rounded-b-[40px] sm:rounded-b-[56px] px-6 sm:px-12 pt-8 pb-12 shadow-sm border-b border-[#476040]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Track your energy flow
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-white/90 mt-2 tracking-wide">
              Universal Energy Interface (UEI) • Prosumer Wallet & Instant Settlement
            </p>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-6 py-3.5 bg-[#154533] hover:bg-[#1D5741] text-white rounded-full font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-lg self-start md:self-auto"
          >
            <Wallet className="w-4 h-4 text-emerald-300" />
            <span>Open Wallet Gateway</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WALLET CANVAS */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        
        {/* Balance Card & Quick Actions */}
        <div className="bg-[#154533] rounded-[36px] p-8 text-white shadow-xl border border-[#11382A] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">
                RBI Compliant Escrow Ledger
              </span>
            </div>
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-1">
              ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-100/80 font-medium mt-1">
              Beneficiary: {currentUser?.name || currentUser?.full_name || 'Prosumer'} ({currentUser?.role?.toUpperCase() || 'PROSUMER'})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#154533] font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-md hover:scale-102"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Add Money (Gateway)</span>
            </button>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-md hover:scale-102"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#587550] rounded-3xl p-6 text-white border border-[#476040]/30 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-[#154533] flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <h3 className="font-extrabold text-base text-white">Instant UPI Top-Up</h3>
            <p className="text-xs text-white/85 font-medium mt-1">
              Fund your wallet via Google Pay, PhonePe, Paytm, or Credit/Debit card with 0% gateway surcharge.
            </p>
          </div>

          <div className="bg-[#587550] rounded-3xl p-6 text-white border border-[#476040]/30 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-[#154533] flex items-center justify-center mb-3">
              <Building className="w-5 h-5 text-emerald-300" />
            </div>
            <h3 className="font-extrabold text-base text-white">Instant Bank IMPS Payout</h3>
            <p className="text-xs text-white/85 font-medium mt-1">
              Withdraw earnings directly to any Indian bank account or UPI VPA within 5 seconds 24x7.
            </p>
          </div>

          <div className="bg-[#587550] rounded-3xl p-6 text-white border border-[#476040]/30 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-[#154533] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-emerald-300" />
            </div>
            <h3 className="font-extrabold text-base text-white">Automated Energy Settlement</h3>
            <p className="text-xs text-white/85 font-medium mt-1">
              Beckn protocol auto-credits solar producers upon smart meter telemetry verification.
            </p>
          </div>
        </div>

        {/* Recent Ledger Entries */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300" />
              Wallet Passbook & Settlements
            </h3>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="text-xs font-bold text-white/85 hover:text-white underline cursor-pointer"
            >
              Open Full Modal
            </button>
          </div>

          {ledger.length === 0 ? (
            <div className="bg-black/10 rounded-2xl p-8 text-center text-white/80">
              <p className="text-sm font-bold">No recorded transactions yet.</p>
              <p className="text-xs text-white/60 mt-1">
                Add money through the mock gateway or complete a P2P energy sale to see your ledger fill up.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {ledger.slice(0, 5).map((item) => {
                const isCredit = item.type === 'DEPOSIT';
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-200 shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Ref: {item.gateway_txn_id} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCredit ? '+' : '-'}₹{Number(item.amount).toFixed(2)}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
