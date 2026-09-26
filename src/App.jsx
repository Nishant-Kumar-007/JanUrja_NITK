// ==============================================================================
// JanUrja Main Application Component
// Universal Energy Interface (UEI) P2P Solar Energy Trading
// NITK Surathkal • Build for Billions Track 3
// ==============================================================================

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LiveProtocolMonitor from './components/LiveProtocolMonitor';
import BecknPayloadModal from './components/BecknPayloadModal';
import ReceiptModal from './components/ReceiptModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import WalletModal from './components/WalletModal';

import HomeView from './views/HomeView';
import BuyView from './views/BuyView';
import SellView from './views/SellView';
import MarketplaceView from './views/MarketplaceView';
import DemoFlowView from './views/DemoFlowView';
import DiscomDashboardView from './views/DiscomDashboardView';
import AuthView from './views/AuthView';
import AuthProfileView from './views/AuthProfileView';
import WalletView from './views/WalletView';

import AuthPage from './views/auth/AuthPages';
import { Sun, Activity } from 'lucide-react';

function AppContent() {
  const {
    currentUser,
    authSession,
    authLoading,
    isEmailVerified,
    currentView,
    setCurrentView,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProtocolMonitorOpen,
    setIsProtocolMonitorOpen,
    protocolEvents
  } = useApp();

  // 1. Sleek loading screen while restoring Supabase session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B1512] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl flex items-center justify-center border border-slate-200 overflow-hidden animate-pulse">
          <img src="/logo.png" alt="JanUrja" className="w-full h-full object-contain" />
        </div>
        <p className="text-xs font-mono text-emerald-400 tracking-wider">
          Securing Jan Urja Supabase Auth Session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Guard: Redirect any unauthorized attempt to Auth Flow
  const isAuthRoute = ['login', 'signup', 'forgot-password', 'reset-password', 'verify-email'].includes(currentView);

  if (!currentUser) {
    return <AuthPage initialMode={isAuthRoute ? currentView : 'login'} />;
  }

  // 3. Email Verification Guard: Unverified accounts cannot access Dashboard or Trading
  if (authSession && !isEmailVerified) {
    return <AuthPage initialMode="verify-email" />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
      case 'home':
        return <HomeView />;
      case 'auth':
      case 'login':
      case 'signup':
        return <HomeView />;
      case 'buy':
        return <BuyView />;
      case 'sell':
        return <SellView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'demo':
        return <DemoFlowView />;
      case 'discom':
        return <DiscomDashboardView />;
      case 'profile':
        return <AuthView />;
      case 'wallet':
        return <WalletView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#8C9F7E] text-[#1A2E1C]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {renderActiveView()}
      </main>

      {/* JanUrja AI Chatbot Assistant (Trained on FAQs) */}
      <Chatbot />

      {/* Modals & Developer Drawers */}
      <WalletModal />
      <LiveProtocolMonitor />
      <BecknPayloadModal />
      <ReceiptModal />
      <SettingsModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Spacer for bottom padding */}
      <div className="pb-12" />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
