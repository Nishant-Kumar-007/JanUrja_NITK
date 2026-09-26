// ==============================================================================
// Global Application Context for JanUrja
// Manages authentication personas, active views, database synchronization,
// realtime protocol streaming, and modal controls.
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/supabaseClient';
import { mockDb } from '../services/mockDatabase';
import {
  INITIAL_PROFILES,
  INITIAL_NODES,
  INITIAL_OFFERS,
  INITIAL_ORDERS
} from '../data/initialData';
import {
  depositToWallet as serviceDeposit,
  withdrawFromWallet as serviceWithdraw,
  getWalletTransactions
} from '../services/walletService';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation View: 'home' | 'buy' | 'sell' | 'marketplace' | 'demo' | 'discom' | 'profile' | 'wallet'
  const [currentView, setCurrentView] = useState('home');

  // Active User & Supabase Session States
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState(null);
  const [authSession, setAuthSession] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  // Datasets
  const [nodes, setNodes] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [protocolEvents, setProtocolEvents] = useState([]);

  // Selected offer when navigating from Marketplace to Buy
  const [selectedOfferForBuy, setSelectedOfferForBuy] = useState(null);

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProtocolMonitorOpen, setIsProtocolMonitorOpen] = useState(false);
  const [selectedPayloadForModal, setSelectedPayloadForModal] = useState(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterZone, setFilterZone] = useState('ALL');

  // Load all data from DB
  const loadData = async () => {
    try {
      const pRes = await db.from('profiles').select('*');
      if (pRes.data && pRes.data.length > 0) {
        setProfiles(pRes.data);
      } else {
        setProfiles(INITIAL_PROFILES);
      }

      const nRes = await db.from('energy_nodes').select('*');
      if (nRes.data && nRes.data.length > 0) {
        setNodes(nRes.data);
      } else {
        setNodes(INITIAL_NODES);
      }

      const oRes = await db.from('energy_offers').select('*').order('created_at', { ascending: false });
      if (oRes.data && oRes.data.length > 0) {
        setOffers(oRes.data);
      } else {
        setOffers(INITIAL_OFFERS);
      }

      const ordRes = await db.from('orders').select('*').order('created_at', { ascending: false });
      if (ordRes.data && ordRes.data.length > 0) {
        setOrders(ordRes.data);
      } else {
        setOrders(INITIAL_ORDERS);
      }

      const tRes = await db.from('transactions').select('*').order('created_at', { ascending: false });
      if (tRes.data) setTransactions(tRes.data);

      const peRes = await db.from('protocol_events').select('*').order('created_at', { ascending: false }).limit(40);
      if (peRes.data) setProtocolEvents(peRes.data);
    } catch (err) {
      console.warn('Error loading initial data from DB:', err);
    }
  };

  // Helper: Fetch or construct profile from profiles table using auth.uid()
  const fetchOrCreateProfile = async (user) => {
    if (!user) return null;
    try {
      const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single();
      if (data && !error) {
        return {
          ...data,
          full_name: data.name || data.full_name,
          name: data.name || data.full_name
        };
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
    }

    // Check if matching an existing demo persona
    const matched = profiles.find((p) => p.email?.toLowerCase() === user.email?.toLowerCase());
    if (matched) return matched;

    // Fallback constructed profile
    const meta = user.user_metadata || {};
    const fallback = {
      id: user.id,
      name: meta.name || user.email?.split('@')[0] || 'Jan Urja Prosumer',
      full_name: meta.name || user.email?.split('@')[0] || 'Jan Urja Prosumer',
      email: user.email,
      role: meta.role || 'consumer',
      grid_zone: 'S2-East',
      solar_capacity_kw: meta.role === 'producer' ? 5.0 : meta.role === 'prosumer' ? 3.2 : 0,
      wallet_balance: 1000.0,
      upi_id: `${user.email?.split('@')[0]}@okaxis`,
      avatar: meta.role === 'producer' ? '☀️' : meta.role === 'consumer' ? '⚡' : '🔄'
    };

    try {
      await db.from('profiles').insert([fallback]);
    } catch (insertErr) {
      console.warn('Fallback profile insert note:', insertErr);
    }

    return fallback;
  };

  useEffect(() => {
    loadData();

    // 1. Detect route navigation from URL hash or pathname
    const handleHashNavigation = () => {
      const hash = window.location.hash || '';
      const path = (window.location.pathname || '').replace(/^\//, '').toLowerCase();

      if (hash.includes('type=recovery') || hash.includes('reset-password') || path === 'reset-password') {
        setCurrentView('reset-password');
      } else if (hash.includes('verify-email') || path === 'verify-email') {
        setCurrentView('verify-email');
      } else if (hash.includes('signup') || path === 'signup') {
        setCurrentView('signup');
      } else if (hash.includes('login') || path === 'login') {
        setCurrentView('login');
      } else if (hash.includes('wallet') || path === 'wallet') {
        setCurrentView('wallet');
      } else if (hash.includes('marketplace') || path === 'marketplace') {
        setCurrentView('marketplace');
      } else if (hash.includes('buy') || path === 'buy') {
        setCurrentView('buy');
      } else if (hash.includes('sell') || path === 'sell') {
        setCurrentView('sell');
      } else if (hash.includes('dashboard') || path === 'dashboard') {
        setCurrentView('home');
      }
    };
    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);

    // 2. Check existing Supabase Auth session on mount
    db.auth.getSession().then(async ({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        setAuthSession(data.session);
        setAuthUser(u);
        const verified = Boolean(u.email_confirmed_at || u.confirmed_at);
        setIsEmailVerified(verified);

        const prof = await fetchOrCreateProfile(u);
        setCurrentUser(prof);

        if (verified) {
          if (['login', 'signup', 'verify-email'].includes(currentView)) {
            setCurrentView('home');
          }
        } else {
          setPendingVerificationEmail(u.email);
        }
      }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    // 3. Subscribe to Supabase Auth State Changes in Realtime
    const { data: authListener } = db.auth.onAuthStateChange(async (event, session) => {
      console.log('JanUrja Auth Event:', event, session?.user?.email);

      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('reset-password');
      }

      if (session?.user) {
        const u = session.user;
        setAuthSession(session);
        setAuthUser(u);
        const verified = Boolean(u.email_confirmed_at || u.confirmed_at);
        setIsEmailVerified(verified);

        const prof = await fetchOrCreateProfile(u);
        setCurrentUser(prof);

        if (verified && ['login', 'signup', 'verify-email'].includes(currentView)) {
          setCurrentView('home');
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthSession(null);
        setAuthUser(null);
        setCurrentUser(null);
        setIsEmailVerified(false);
      }
    });

    // 4. Subscribe to realtime database changes
    const unsubProtocol = db.subscribeToTable('protocol_events', (change) => {
      if (change.new) {
        setProtocolEvents((prev) => [change.new, ...prev.filter((p) => p.id !== change.new.id)]);
      }
    });

    const unsubOrders = db.subscribeToTable('orders', (change) => {
      if (change.new) {
        setOrders((prev) => {
          const index = prev.findIndex((o) => o.id === change.new.id);
          if (index !== -1) {
            const next = [...prev];
            next[index] = change.new;
            return next;
          }
          return [change.new, ...prev];
        });
      }
    });

    const unsubOffers = db.subscribeToTable('energy_offers', (change) => {
      if (change.new) {
        setOffers((prev) => {
          const idx = prev.findIndex((o) => o.id === change.new.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = change.new;
            return next;
          }
          return [change.new, ...prev];
        });
      }
    });

    const unsubTxn = db.subscribeToTable('transactions', (change) => {
      if (change.new) {
        setTransactions((prev) => [change.new, ...prev.filter((t) => t.id !== change.new.id)]);
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
      if (typeof unsubProtocol === 'function') unsubProtocol();
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubOffers === 'function') unsubOffers();
      if (typeof unsubTxn === 'function') unsubTxn();
    };
  }, []);

  // Update current user reference if profiles change
  useEffect(() => {
    if (currentUser) {
      const updated = profiles.find((p) => p.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [profiles]);

  // Persona switcher for testing
  const switchPersona = (personaId) => {
    const found = profiles.find((p) => p.id === personaId);
    if (found) {
      setCurrentUser(found);
      setIsEmailVerified(true);
      setCurrentView('home');
    }
  };

  const getActiveUserNode = () => {
    if (!currentUser) return null;
    return nodes.find((n) => n.owner_id === currentUser.id || n.id === currentUser.node_id) || nodes[0];
  };

  const resetDatabaseToInitial = () => {
    mockDb.initDatabase(true);
    loadData();
  };

  // ----------------------------------------------------------------------------
  // AUTHENTICATION METHODS
  // ----------------------------------------------------------------------------

  // 1. Sign In With Password
  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        // Sanitize error message for UI
        if (error.message?.includes('Invalid login credentials')) {
          return { success: false, error: 'Incorrect email or password. Please verify and try again.' };
        }
        if (error.message?.includes('Email not confirmed')) {
          return { success: false, isUnverified: true, error: 'Your email is not verified yet. Please check your inbox.' };
        }
        return { success: false, error: error.message || 'Authentication failed.' };
      }

      const user = data.user;
      const verified = Boolean(user?.email_confirmed_at || user?.confirmed_at);
      setAuthSession(data.session);
      setAuthUser(user);
      setIsEmailVerified(verified);

      if (!verified) {
        setPendingVerificationEmail(email);
        return { success: false, isUnverified: true, error: 'Email verification pending.' };
      }

      const prof = await fetchOrCreateProfile(user);
      setCurrentUser(prof);
      setCurrentView('home');
      return { success: true, user };
    } catch (err) {
      console.warn('Sign-in error:', err);
      return { success: false, error: err.message || 'Network error connecting to Supabase.' };
    }
  };

  // 2. Sign Up With Email, Name, Role
  const signUpWithEmail = async ({ name, email, password, role }) => {
    try {
      const siteUrl = window.location.origin;
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          },
          emailRedirectTo: `${siteUrl}/#dashboard`
        }
      });

      if (error) {
        if (error.message?.includes('already registered')) {
          return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
        }
        return { success: false, error: error.message || 'Registration failed.' };
      }

      const user = data.user;
      if (user) {
        // Insert profile row in Supabase 'profiles' table using authenticated auth.uid()
        const profilePayload = {
          id: user.id,
          name,
          full_name: name,
          email,
          role,
          wallet_balance: 1000.0,
          solar_capacity_kw: role === 'producer' ? 5.0 : role === 'prosumer' ? 3.2 : 0,
          grid_zone: 'S2-East',
          upi_id: `${email.split('@')[0]}@okaxis`
        };

        try {
          await db.from('profiles').insert([profilePayload]);
        } catch (insertErr) {
          console.warn('Profile table insert notice:', insertErr);
        }

        const verified = Boolean(user.email_confirmed_at || user.confirmed_at);
        setIsEmailVerified(verified);
        setPendingVerificationEmail(email);

        if (verified) {
          setCurrentUser(profilePayload);
          setCurrentView('home');
        }
      }

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.warn('Sign-up error:', err);
      return { success: false, error: err.message || 'Network error connecting to Supabase.' };
    }
  };

  // 3. Send Password Reset
  const sendPasswordReset = async (email) => {
    try {
      const siteUrl = window.location.origin;
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/#reset-password`
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to dispatch password recovery link.' };
    }
  };

  // 4. Update Password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await db.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update password.' };
    }
  };

  // 5. Resend Verification Email
  const resendVerificationEmail = async (email) => {
    try {
      const siteUrl = window.location.origin;
      const { error } = await db.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${siteUrl}/#dashboard`
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to resend verification email.' };
    }
  };

  // 6. Sign Out
  const signOut = async () => {
    try {
      await db.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setAuthSession(null);
    setAuthUser(null);
    setCurrentUser(null);
    setIsEmailVerified(false);
    setCurrentView('login');
  };

  // 7. Delete Account
  const deleteAccount = async () => {
    try {
      if (currentUser?.id) {
        try {
          await db.from('profiles').delete().eq('id', currentUser.id);
        } catch (dbErr) {
          console.warn('Profile deletion error:', dbErr);
        }

        setProfiles((prev) => prev.filter((p) => p.id !== currentUser.id));

        const stored = localStorage.getItem('janurja_profiles');
        if (stored) {
          try {
            const list = JSON.parse(stored);
            const filtered = list.filter((p) => p.id !== currentUser.id);
            localStorage.setItem('janurja_profiles', JSON.stringify(filtered));
          } catch (e) {}
        }
      }
      await signOut();
      return { success: true };
    } catch (err) {
      console.error('Delete account error:', err);
      await signOut();
      return { success: false, error: err.message };
    }
  };

  // 8. Deposit to Wallet via Mock Payment Gateway
  const depositMoney = async (amount, paymentMethod = 'UPI', paymentDetails = {}, simulateFailure = false) => {
    if (!currentUser) throw new Error('Authentication required.');
    const result = await serviceDeposit({
      user: currentUser,
      amount,
      paymentMethod,
      paymentDetails,
      simulateFailure
    });

    // Dynamically update currentUser and profiles in memory
    setCurrentUser((prev) => (prev ? { ...prev, wallet_balance: result.newBalance } : prev));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, wallet_balance: result.newBalance } : p))
    );
    loadData();
    return result;
  };

  // 9. Withdraw Funds from Wallet (Bank IMPS / UPI)
  const withdrawMoney = async (amount, withdrawalMethod = 'BANK', bankDetails = {}, upiDetails = {}, simulateFailure = false) => {
    if (!currentUser) throw new Error('Authentication required.');
    const result = await serviceWithdraw({
      user: currentUser,
      amount,
      withdrawalMethod,
      bankDetails,
      upiDetails,
      simulateFailure
    });

    // Dynamically update currentUser and profiles in memory
    setCurrentUser((prev) => (prev ? { ...prev, wallet_balance: result.newBalance } : prev));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, wallet_balance: result.newBalance } : p))
    );
    loadData();
    return result;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        setCurrentUser,
        authSession,
        authUser,
        authLoading,
        isEmailVerified,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        updatePassword,
        resendVerificationEmail,
        signOut,
        deleteAccount,
        profiles,
        switchPersona,
        nodes,
        offers,
        orders,
        transactions,
        protocolEvents,
        selectedOfferForBuy,
        setSelectedOfferForBuy,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        depositMoney,
        withdrawMoney,
        getWalletTransactions,
        isProtocolMonitorOpen,
        setIsProtocolMonitorOpen,
        selectedPayloadForModal,
        setSelectedPayloadForModal,
        activeReceiptOrder,
        setActiveReceiptOrder,
        isSettingsOpen,
        setIsSettingsOpen,
        filterZone,
        setFilterZone,
        getActiveUserNode,
        resetDatabaseToInitial,
        refreshData: loadData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
