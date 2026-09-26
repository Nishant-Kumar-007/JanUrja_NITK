// ==============================================================================
// Mock UPI Payment Authorization Modal (Google Pay / BHIM Style)
// Provides clean, realistic NPCI/UPI authorization with simulated MPIN verification.
// ==============================================================================

import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight, Zap } from 'lucide-react';

export default function MockUpiModal({
  isOpen,
  onClose,
  onAuthorize,
  onConfirmPin,
  orderDetails = {},
  amount,
  payeeVpa,
  payeeName,
  unitsKwh,
  ratePerKwh,
  isProcessing = false
}) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Flexible attribute resolution
  const displaySellerName = orderDetails?.sellerName || payeeName || 'NITK Solar Research Park';
  const displaySellerVpa = orderDetails?.sellerVpa || payeeVpa || 'nitksolar@icici';
  const displayAmount = Number(orderDetails?.totalAmount ?? amount ?? 19.10);
  const displayUnits = Number(orderDetails?.quantityKwh ?? unitsKwh ?? 3.2);
  const displayPricePerKwh = Number(orderDetails?.pricePerKwh ?? ratePerKwh ?? (displayAmount / (displayUnits || 1)));
  const displayEnergyCharge = (displayUnits * (displayPricePerKwh || 5.80)).toFixed(2);
  const displayWheelingCharge = (displayUnits * 0.15).toFixed(2);
  const displayCo2 = orderDetails?.co2AvoidedKg || (displayUnits * 0.54).toFixed(2);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`upi-pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`upi-pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const triggerAuthorization = (pinToUse) => {
    const fn = onAuthorize || onConfirmPin;
    if (typeof fn === 'function') {
      fn(pinToUse || '1234');
    } else {
      console.warn('MockUpiModal: No onAuthorize or onConfirmPin handler attached.');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const enteredPin = pin.join('');
    const finalPin = enteredPin.length === 4 ? enteredPin : '1234';
    if (enteredPin.length < 4) {
      setPin(['1', '2', '3', '4']);
    }
    triggerAuthorization(finalPin);
  };

  const handleOneTapAutoFill = () => {
    setPin(['1', '2', '3', '4']);
    setError('');
    setTimeout(() => {
      triggerAuthorization('1234');
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        
        {/* NPCI / UPI Branded Top Bar */}
        <div className="bg-[#1B4D3E] p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400 text-[#1B4D3E] flex items-center justify-center font-black text-xs">
              UPI
            </div>
            <div>
              <p className="font-extrabold text-sm tracking-wide">JanUrja Smart Energy Mandate</p>
              <p className="text-[10px] text-emerald-200">Powered by NPCI UPI AutoPay</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-emerald-200 border border-white/20">
            TEST SANDBOX
          </span>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Paying Energy Seller
          </p>
          <h3 className="text-base font-bold text-slate-800 mt-0.5">
            {displaySellerName}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            VPA: {displaySellerVpa}
          </p>

          <div className="my-4">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              ₹{displayAmount.toFixed(2)}
            </span>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" /> For {displayUnits} kWh Solar Energy
            </p>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Energy Charge:</span>
              <span className="font-semibold text-slate-800">
                ₹{displayEnergyCharge}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>MESCOM Grid Wheeling:</span>
              <span className="font-semibold text-slate-800">₹{displayWheelingCharge}</span>
            </div>
            <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-1">
              <span className="text-emerald-700 font-bold">CO₂ Avoided:</span>
              <span className="font-bold text-emerald-700">{displayCo2} kg</span>
            </div>
          </div>
        </div>

        {/* MPIN Input Section */}
        <div className="p-6">
          <div className="text-center mb-4">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Enter 4-Digit UPI MPIN
            </label>
            <div className="flex justify-center space-x-3">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`upi-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isProcessing}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-300 focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/30 outline-none transition-all bg-slate-50 text-slate-900"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && <p className="text-xs text-rose-500 mt-2 font-medium">{error}</p>}
          </div>

          {/* Quick Demo Helper: 1-Tap Auto Authorize */}
          <button
            type="button"
            onClick={handleOneTapAutoFill}
            disabled={isProcessing}
            className="w-full py-2 mb-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            ⚡ Auto-Fill Mock PIN (1234) & Pay Instantly
          </button>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#246B56] text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Simulated End-to-End Encrypted UPI Sandbox
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
