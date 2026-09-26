// ==============================================================================
// JanUrja Interactive Mock Payment Gateway & Wallet Modal
// Features:
// 1. Add Money / Deposit via Mock Gateway (UPI, Cards, Net Banking)
// 2. Withdraw Funds to Bank Account (IMPS) or UPI ID with validation
// 3. Dual-Engine Realtime Balance Synchronization & Ledger
// 4. Test Sandbox Mode (Simulate Success / Bank Decline) for Hackathon Demos
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Lock,
  Download,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const PRESET_AMOUNTS = [200, 500, 1000, 2000, 5000];

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', ifsc: 'HDFC0000128' },
  { id: 'SBI', name: 'State Bank of India', ifsc: 'SBIN0000691' },
  { id: 'ICICI', name: 'ICICI Bank', ifsc: 'ICIC0000001' },
  { id: 'AXIS', name: 'Axis Bank', ifsc: 'UTIB0000005' }
];

export default function WalletModal() {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    currentUser,
    depositMoney,
    withdrawMoney,
    getWalletTransactions,
    transactions
  } = useApp();

  // Active Tab: 'deposit' | 'withdraw' | 'history'
  const [activeTab, setActiveTab] = useState('deposit');

  // Deposit States
  const [depositAmount, setDepositAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiId, setUpiId] = useState(currentUser?.upi_id || 'prosumer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');
  const [cardName, setCardName] = useState(currentUser?.name || 'JanUrja Prosumer');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [withdrawalMethod, setWithdrawalMethod] = useState('BANK'); // 'BANK' | 'UPI'
  const [accountHolder, setAccountHolder] = useState(currentUser?.name || currentUser?.full_name || 'JanUrja Prosumer');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('987654321098');
  const [ifscCode, setIfscCode] = useState('HDFC0000128');
  const [withdrawUpiId, setWithdrawUpiId] = useState(currentUser?.upi_id || 'prosumer@okaxis');

  // Processing & Feedback States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Local ledger list
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    if (isWalletModalOpen && currentUser) {
      const records = getWalletTransactions ? getWalletTransactions(currentUser.id) : [];
      setLedger(records);
      setErrorMsg('');
      setSuccessReceipt(null);
      if (currentUser.upi_id) {
        setUpiId(currentUser.upi_id);
        setWithdrawUpiId(currentUser.upi_id);
      }
      const displayName = currentUser.full_name || currentUser.name || 'JanUrja Prosumer';
      setAccountHolder(displayName);
      setCardName(displayName);
    }
  }, [isWalletModalOpen, currentUser]);

  if (!isWalletModalOpen) return null;

  const currentBalance = currentUser?.wallet_balance !== undefined && currentUser?.wallet_balance !== null
    ? Number(currentUser.wallet_balance)
    : 1000;

  // Reset modal state
  const handleClose = () => {
    setIsWalletModalOpen(false);
    setIsProcessing(false);
    setErrorMsg('');
    setSuccessReceipt(null);
  };

  // 1. Handle Deposit via Mock Payment Gateway
  const handleDepositSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessReceipt(null);

    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid deposit amount greater than ₹0');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Connecting to JanUrja Escrow Payment Switch...');

    try {
      setTimeout(() => setProcessingStep('Authorizing through Mock Gateway...'), 400);

      const res = await depositMoney(
        num,
        paymentMethod,
        {
          upiId,
          cardNumber,
          bankName: selectedBank
        },
        simulateFailure
      );

      setProcessingStep('Payment Approved! Crediting Wallet...');
      setTimeout(() => {
        setIsProcessing(false);
        setSuccessReceipt({
          type: 'DEPOSIT',
          amount: num,
          txnId: res.txnId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method: paymentMethod,
          newBalance: res.newBalance
        });
        if (getWalletTransactions) {
          setLedger(getWalletTransactions(currentUser.id));
        }
      }, 500);
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment simulation failed.');
    }
  };

  // 2. Handle Withdrawal to Bank / UPI
  const handleWithdrawSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessReceipt(null);

    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num < 100) {
      setErrorMsg('Minimum withdrawal amount is ₹100.');
      return;
    }

    if (num > currentBalance) {
      setErrorMsg(`Insufficient balance. Maximum withdrawable: ₹${currentBalance.toFixed(2)}`);
      return;
    }

    if (withdrawalMethod === 'BANK') {
      if (!accountNumber || accountNumber !== confirmAccountNumber) {
        setErrorMsg('Bank account numbers do not match.');
        return;
      }
      if (!ifscCode || ifscCode.length < 5) {
        setErrorMsg('Please enter a valid IFSC Code.');
        return;
      }
    } else {
      if (!withdrawUpiId || !withdrawUpiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI VPA.');
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStep('Validating Microgrid Solar Escrow Ledger...');

    try {
      setTimeout(() => setProcessingStep('Dispatching Instant IMPS / UPI Direct Payout...'), 400);

      const res = await withdrawMoney(
        num,
        withdrawalMethod,
        {
          accountHolder,
          accountNumber,
          ifscCode,
          bankName: POPULAR_BANKS.find((b) => ifscCode.toUpperCase().startsWith(b.id))?.name || 'Scheduled Commercial Bank'
        },
        { upiId: withdrawUpiId },
        simulateFailure
      );

      setProcessingStep('Payout Confirmed & Cleared!');
      setTimeout(() => {
        setIsProcessing(false);
        setSuccessReceipt({
          type: 'WITHDRAWAL',
          amount: num,
          txnId: res.payoutRefId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method: withdrawalMethod,
          destination: withdrawalMethod === 'BANK' ? `Bank A/C ••••${accountNumber.slice(-4)}` : withdrawUpiId,
          newBalance: res.newBalance
        });
        if (getWalletTransactions) {
          setLedger(getWalletTransactions(currentUser.id));
        }
      }, 500);
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Withdrawal simulation failed.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-xl bg-[#8C9F7E] rounded-[36px] shadow-2xl border border-[#A2B594] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-[#587550] px-6 py-5 text-white flex items-center justify-between border-b border-[#476040]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#154533] border border-white/20 flex items-center justify-center shadow-inner">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                JanUrja Microgrid Wallet
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-[#154533]">
                  MOCK GATEWAY
                </span>
              </h2>
              <p className="text-xs text-white/85 font-medium">
                Instant UPI & Bank Settlement • RBI Sandbox Standard
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BALANCE BANNER */}
        <div className="bg-[#154533] mx-5 mt-5 p-6 rounded-3xl text-white shadow-xl border border-[#11382A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-200/80">
              Available Trading Balance
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                100% Liquid
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/70 font-medium mt-1">
              Account: {currentUser?.name || currentUser?.full_name || 'Prosumer'} ({currentUser?.role?.toUpperCase() || 'PROSUMER'})
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => {
                setActiveTab('deposit');
                setSuccessReceipt(null);
                setErrorMsg('');
              }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-emerald-400 text-[#154533] shadow-md scale-102'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Add Money</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('withdraw');
                setSuccessReceipt(null);
                setErrorMsg('');
              }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-rose-400 text-slate-900 shadow-md scale-102'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="px-5 pt-4">
          <div className="bg-[#587550]/40 p-1 rounded-2xl flex space-x-1 border border-white/10">
            <button
              onClick={() => {
                setActiveTab('deposit');
                setSuccessReceipt(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-[#154533] text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Add Money (Deposit)
            </button>
            <button
              onClick={() => {
                setActiveTab('withdraw');
                setSuccessReceipt(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-[#154533] text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Withdraw Funds (Payout)
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setSuccessReceipt(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#154533] text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Passbook Ledger
            </button>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-900 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SCROLLABLE BODY CONTENT */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* ========================================================================= */}
          {/* SUCCESS RECEIPT VIEW */}
          {/* ========================================================================= */}
          {successReceipt ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 text-center shadow-lg border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                {successReceipt.type === 'DEPOSIT' ? 'Payment Successful!' : 'Withdrawal Dispatched!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {successReceipt.type === 'DEPOSIT'
                  ? 'Funds instantly credited to your JanUrja trading wallet.'
                  : `Transferred successfully to ${successReceipt.destination}.`}
              </p>

              <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-left text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Transaction Amount</span>
                  <span className="font-black text-slate-900 text-base">
                    ₹{Number(successReceipt.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Transaction Reference ID</span>
                  <div className="flex items-center space-x-1 font-mono font-bold text-slate-800">
                    <span>{successReceipt.txnId}</span>
                    <button
                      onClick={() => copyToClipboard(successReceipt.txnId)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Payment Channel</span>
                  <span className="font-bold text-slate-800">{successReceipt.method}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>New Wallet Balance</span>
                  <span className="font-black text-emerald-700 text-sm">
                    ₹{Number(successReceipt.newBalance).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessReceipt(null)}
                  className="flex-1 py-3 bg-[#154533] text-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-[#1C5B44] transition-all cursor-pointer shadow-sm"
                >
                  Make Another Transaction
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* TAB 1: ADD MONEY / DEPOSIT */}
              {/* ========================================================================= */}
              {activeTab === 'deposit' && (
                <form onSubmit={handleDepositSubmit} className="space-y-5">
                  
                  {/* Amount Selection */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Enter Deposit Amount (INR)
                    </label>
                    <div className="relative mb-3">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="1000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-2xl font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt.toString())}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            depositAmount === amt.toString()
                              ? 'bg-[#154533] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Gateway Options */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Select Payment Method (Mock Gateway)
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'UPI'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-emerald-700" />
                        <span className="text-xs font-extrabold">UPI Apps</span>
                        <span className="text-[10px] text-slate-400">GPay, PhonePe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'CARD'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-emerald-700" />
                        <span className="text-xs font-extrabold">Cards</span>
                        <span className="text-[10px] text-slate-400">Debit / Credit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('NETBANKING')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'NETBANKING'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Building className="w-5 h-5 text-emerald-700" />
                        <span className="text-xs font-extrabold">Net Banking</span>
                        <span className="text-[10px] text-slate-400">Major Banks</span>
                      </button>
                    </div>

                    {/* Method Detail Sub-form */}
                    {paymentMethod === 'UPI' && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Enter UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okaxis"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Instant 0% transaction fee</span>
                          <span className="font-mono text-emerald-700 font-bold">AutoPay Enabled</span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 •••• •••• 8821"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                            <input
                              type="password"
                              maxLength="3"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'NETBANKING' && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Select Bank
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                        >
                          {POPULAR_BANKS.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Test Gateway Edge Case Toggle */}
                  <div className="bg-[#587550]/20 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-950" />
                      <span className="text-xs font-bold text-slate-900">
                        Gateway Simulation Mode
                      </span>
                    </div>
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                      <span className={simulateFailure ? 'text-rose-900' : 'text-emerald-950'}>
                        {simulateFailure ? 'Simulate Bank Failure' : 'Force Success'}
                      </span>
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-[#154533] hover:bg-[#1D5741] text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                        <span>{processingStep || 'Processing Payment...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-emerald-300" />
                        <span>Pay ₹{parseFloat(depositAmount || 0).toFixed(2)} Securely</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: WITHDRAW FUNDS (PAYOUT) */}
              {/* ========================================================================= */}
              {activeTab === 'withdraw' && (
                <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                  
                  {/* Amount Selection */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Withdrawal Amount (INR)
                      </label>
                      <span className="text-xs font-bold text-slate-600">
                        Max Withdrawable: <strong className="text-slate-900">₹{currentBalance.toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="relative mb-3">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="100"
                        max={currentBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="500"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-2xl font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>

                    {/* Quick Percentage Presets */}
                    <div className="flex gap-2">
                      {[
                        { label: '25%', factor: 0.25 },
                        { label: '50%', factor: 0.5 },
                        { label: '75%', factor: 0.75 },
                        { label: '100% (All)', factor: 1.0 }
                      ].map((preset) => {
                        const calculated = Math.floor(currentBalance * preset.factor);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setWithdrawAmount(calculated.toString())}
                            className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Destination Selection */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payout Destination
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawalMethod('BANK')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                          withdrawalMethod === 'BANK'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Building className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-extrabold">Bank IMPS (24x7)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawalMethod('UPI')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                          withdrawalMethod === 'UPI'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-extrabold">Instant UPI VPA</span>
                      </button>
                    </div>

                    {/* Bank Transfer Details */}
                    {withdrawalMethod === 'BANK' ? (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Beneficiary Account Name
                          </label>
                          <input
                            type="text"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Account Number
                            </label>
                            <input
                              type="password"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Confirm Account Number
                            </label>
                            <input
                              type="text"
                              value={confirmAccountNumber}
                              onChange={(e) => setConfirmAccountNumber(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Bank IFSC Code
                          </label>
                          <input
                            type="text"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                            required
                            placeholder="HDFC0000128"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-800"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Beneficiary UPI ID
                          </label>
                          <input
                            type="text"
                            value={withdrawUpiId}
                            onChange={(e) => setWithdrawUpiId(e.target.value)}
                            required
                            placeholder="prosumer@okaxis"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                          />
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Funds will be routed instantly through NPCI UPI payout switch.
                        </p>
                      </div>
                    )}

                    {/* Fee Summary */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Withdrawal Fee</span>
                        <span className="font-bold text-emerald-600">₹0.00 (Free UEI Prosumer Benefit)</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Estimated Transfer Speed</span>
                        <span className="font-bold text-slate-800">Instant (&lt; 5 seconds via IMPS)</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1.5">
                        <span>Net Credited to Account</span>
                        <span className="text-slate-900 font-black">
                          ₹{parseFloat(withdrawAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isProcessing || currentBalance <= 0}
                    className="w-full py-4 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>{processingStep || 'Dispatching Payout...'}</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Withdraw ₹{parseFloat(withdrawAmount || 0).toFixed(2)} to {withdrawalMethod === 'BANK' ? 'Bank Account' : 'UPI'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: PASSBOOK LEDGER */}
              {/* ========================================================================= */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white/90 px-1">
                    <span>Recent Wallet Transactions</span>
                    <span>Total: {ledger.length} entries</span>
                  </div>

                  {ledger.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No wallet activity yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use "Add Money" to deposit funds into your trading account or "Withdraw" to send earnings to your bank.
                      </p>
                    </div>
                  ) : (
                    ledger.map((item) => {
                      const isCredit = item.type === 'DEPOSIT';
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isCredit
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="w-5 h-5" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">
                                {item.description || (isCredit ? 'Wallet Top-Up' : 'Bank Payout')}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Ref: {item.gateway_txn_id || item.id} •{' '}
                                {new Date(item.created_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span
                              className={`text-sm font-black block ${
                                isCredit ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isCredit ? '+' : '-'}₹{Number(item.amount).toFixed(2)}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
