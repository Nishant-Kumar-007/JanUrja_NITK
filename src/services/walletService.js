// ==============================================================================
// JanUrja Wallet & Payment Gateway Service
// Features:
// 1. Mock Payment Gateway for Wallet Top-Up / Deposit (UPI, Cards, Net Banking)
// 2. Mock Instant Payout / Withdrawal to Bank Account (IMPS) or UPI ID
// 3. Dual-Engine Persistence: Live Supabase Cloud + LocalStorage Mock DB
// 4. Ledger Transaction Logging & Instant Balance Synchronization
// ==============================================================================

import { db, isLiveSupabaseAvailable } from './supabaseClient';
import { mockDb } from './mockDatabase';

const WALLET_TXN_STORAGE_KEY = 'janurja_wallet_ledger';

/**
 * Fetch all wallet ledger transactions (Deposits, Withdrawals, Energy settlements)
 */
export function getWalletTransactions(userId) {
  try {
    const raw = localStorage.getItem(WALLET_TXN_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!userId) return list;
    return list.filter((t) => t.user_id === userId);
  } catch (err) {
    console.warn('Error reading wallet transactions:', err);
    return [];
  }
}

/**
 * Save a transaction to the local wallet ledger
 */
function recordLocalWalletTransaction(txn) {
  try {
    const raw = localStorage.getItem(WALLET_TXN_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(txn);
    localStorage.setItem(WALLET_TXN_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error recording wallet transaction:', err);
  }
}

/**
 * 1. DEPOSIT MONEY TO WALLET VIA MOCK PAYMENT GATEWAY
 * Simulates UPI apps, Credit/Debit cards, or Net Banking
 */
export async function depositToWallet({
  user,
  amount,
  paymentMethod = 'UPI', // 'UPI' | 'CARD' | 'NETBANKING'
  paymentDetails = {},
  simulateFailure = false
}) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Please enter a valid deposit amount greater than ₹0');
  }

  // Artificial network latency simulation (500ms - 900ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (simulateFailure) {
    throw new Error('Payment was declined by issuing bank / gateway simulator.');
  }

  const currentBalance = Number(user.wallet_balance || 0);
  const newBalance = Number((currentBalance + numAmount).toFixed(2));

  const txnId = `PAY-MOCK-${Date.now().toString().slice(-8)}`;
  const timestamp = new Date().toISOString();

  const transactionRecord = {
    id: `txn-dep-${Date.now()}`,
    type: 'DEPOSIT',
    user_id: user.id,
    user_name: user.name || user.full_name || 'JanUrja Prosumer',
    amount: numAmount,
    currency: 'INR',
    payment_method: paymentMethod,
    gateway_txn_id: txnId,
    payer_details: paymentMethod === 'UPI' 
      ? (paymentDetails.upiId || `${user.email?.split('@')[0]}@okaxis`)
      : paymentMethod === 'CARD'
      ? `Card ending in ${paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : '4242'}`
      : `${paymentDetails.bankName || 'HDFC Bank'} Net Banking`,
    status: 'SUCCESS',
    description: `Wallet Top-Up via ${paymentMethod}`,
    previous_balance: currentBalance,
    new_balance: newBalance,
    created_at: timestamp
  };

  // 1. Update in Supabase if live
  if (db.isLive()) {
    try {
      await db.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
    } catch (err) {
      console.warn('Supabase profile balance update note:', err);
    }
  }

  // 2. Update in mockDb
  try {
    mockDb.update('profiles', user.id, { wallet_balance: newBalance });
  } catch (err) {
    console.warn('MockDb profile balance update note:', err);
  }

  // 3. Record in wallet ledger
  recordLocalWalletTransaction(transactionRecord);

  // 4. Record in general transactions table for unified feed
  try {
    const generalTxn = {
      id: transactionRecord.id,
      buyer_name: user.name || user.full_name,
      seller_name: 'JanUrja Escrow Gateway',
      amount: numAmount,
      upi_txn_ref: txnId,
      payer_vpa: transactionRecord.payer_details,
      payee_vpa: 'janurja.escrow@rbi',
      co2_avoided_kg: 0,
      status: 'SUCCESS',
      created_at: timestamp
    };
    if (db.isLive()) {
      await db.from('transactions').insert([generalTxn]).catch(() => {});
    } else {
      mockDb.insert('transactions', generalTxn);
    }
  } catch (e) {}

  return {
    success: true,
    transaction: transactionRecord,
    newBalance,
    txnId
  };
}

/**
 * 2. WITHDRAW FUNDS FROM WALLET TO BANK ACCOUNT / UPI
 * Simulates IMPS instant bank payout or UPI Direct transfer
 */
export async function withdrawFromWallet({
  user,
  amount,
  withdrawalMethod = 'BANK', // 'BANK' | 'UPI'
  bankDetails = {},
  upiDetails = {},
  simulateFailure = false
}) {
  const numAmount = parseFloat(amount);
  const currentBalance = Number(user.wallet_balance || 0);

  if (isNaN(numAmount) || numAmount < 100) {
    throw new Error('Minimum withdrawal amount is ₹100');
  }

  if (numAmount > currentBalance) {
    throw new Error(`Insufficient wallet balance. You have ₹${currentBalance.toFixed(2)} available.`);
  }

  if (withdrawalMethod === 'BANK') {
    if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
      throw new Error('Please provide valid Bank Account Number and IFSC Code.');
    }
  } else if (withdrawalMethod === 'UPI') {
    if (!upiDetails.upiId || !upiDetails.upiId.includes('@')) {
      throw new Error('Please enter a valid UPI ID (e.g., name@okaxis).');
    }
  }

  // Latency simulation for IMPS clearing (600ms - 1000ms)
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (simulateFailure) {
    throw new Error('Withdrawal rejected by beneficiary bank / IMPS Switch.');
  }

  const newBalance = Number((currentBalance - numAmount).toFixed(2));
  const payoutRefId = `WTH-IMPS-${Date.now().toString().slice(-8)}`;
  const timestamp = new Date().toISOString();

  const destinationDesc = withdrawalMethod === 'BANK'
    ? `${bankDetails.bankName || 'Bank'} A/C ••••${bankDetails.accountNumber.slice(-4)} (${bankDetails.ifscCode?.toUpperCase()})`
    : `UPI: ${upiDetails.upiId}`;

  const transactionRecord = {
    id: `txn-wth-${Date.now()}`,
    type: 'WITHDRAWAL',
    user_id: user.id,
    user_name: user.name || user.full_name || 'JanUrja Prosumer',
    amount: numAmount,
    currency: 'INR',
    withdrawal_method: withdrawalMethod,
    gateway_txn_id: payoutRefId,
    payout_ref: payoutRefId,
    destination: destinationDesc,
    status: 'SUCCESS',
    description: `Wallet Payout to ${withdrawalMethod === 'BANK' ? 'Bank Account (IMPS)' : 'UPI VPA'}`,
    previous_balance: currentBalance,
    new_balance: newBalance,
    created_at: timestamp
  };

  // 1. Update in Supabase if live
  if (db.isLive()) {
    try {
      await db.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
    } catch (err) {
      console.warn('Supabase profile balance update note:', err);
    }
  }

  // 2. Update in mockDb
  try {
    mockDb.update('profiles', user.id, { wallet_balance: newBalance });
  } catch (err) {
    console.warn('MockDb profile balance update note:', err);
  }

  // 3. Record in wallet ledger
  recordLocalWalletTransaction(transactionRecord);

  // 4. Record in general transactions table for unified feed
  try {
    const generalTxn = {
      id: transactionRecord.id,
      buyer_name: 'JanUrja Escrow Gateway',
      seller_name: user.name || user.full_name,
      amount: numAmount,
      upi_txn_ref: payoutRefId,
      payer_vpa: 'janurja.escrow@rbi',
      payee_vpa: destinationDesc,
      co2_avoided_kg: 0,
      status: 'SUCCESS',
      created_at: timestamp
    };
    if (db.isLive()) {
      await db.from('transactions').insert([generalTxn]).catch(() => {});
    } else {
      mockDb.insert('transactions', generalTxn);
    }
  } catch (e) {}

  return {
    success: true,
    transaction: transactionRecord,
    newBalance,
    payoutRefId
  };
}
