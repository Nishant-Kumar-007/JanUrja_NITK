// ==============================================================================
// Clean, Streamlined Header Component for JanUrja
// Requested: Home, BIG BUY button, BIG SELL button, and Bengaluru Location Selector
// (North, South, East, West, Central Bengaluru).
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Home,
  ShoppingBag,
  TrendingUp,
  MapPin,
  ChevronDown,
  Menu,
  Trash2,
  User,
  Check,
  ShieldCheck,
  Zap,
  Activity,
  LogOut,
  Wallet
} from 'lucide-react';
import { isLiveSupabaseAvailable } from '../services/supabaseClient';

export const BENGALURU_LOCATIONS = [
  { id: 'ALL', label: 'All Bengaluru Grid', desc: 'BESCOM Metro Microgrid' },
  { id: 'North-BLR', label: 'North Bengaluru', desc: 'Hebbal, Yelahanka, Manyata' },
  { id: 'South-BLR', label: 'South Bengaluru', desc: 'Koramangala, Jayanagar, HSR' },
  { id: 'East-BLR', label: 'East Bengaluru', desc: 'Indiranagar, Whitefield, Marathahalli' },
  { id: 'West-BLR', label: 'West Bengaluru', desc: 'Malleshwaram, Rajajinagar' },
  { id: 'Central-BLR', label: 'Central Bengaluru', desc: 'MG Road, Shivajinagar, BESCOM HQ' }
];

export default function Navbar() {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchPersona,
    signOut,
    deleteAccount,
    profiles,
    filterZone,
    setFilterZone,
    isProtocolMonitorOpen,
    setIsProtocolMonitorOpen,
    setIsSettingsOpen,
    setIsAuthModalOpen,
    setIsWalletModalOpen
  } = useApp();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Determine current active Bengaluru location label
  const currentLocation = BENGALURU_LOCATIONS.find(
    (loc) => loc.id === filterZone || loc.id.includes(filterZone?.split('-')[0])
  ) || BENGALURU_LOCATIONS[0];

  const handleSelectLocation = (locId) => {
    setFilterZone(locId);
    setIsLocationOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8DFD5] bg-white shadow-xs font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        
        {/* LEFT: Brand Logo & Title from reference image */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md shadow-slate-900/10 border border-slate-200 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Jan-Urja Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#154533] block leading-none">
                Jan-Urja
              </span>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide mt-1">
                Professional dashboard
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Home Pill + Settings Pill + Location + Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          
          {/* Home Pill Button (From reference image: dark green pill) */}
          <button
            onClick={() => setCurrentView('home')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
              currentView === 'home'
                ? 'bg-[#154533] text-white hover:bg-[#1D5741]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          {/* Wallet Balance Pill Button */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 hover:scale-102"
            title="JanUrja Wallet & Instant Payout Gateway"
          >
            <Wallet className="w-4 h-4 text-emerald-700" />
            <span>₹{Number(currentUser?.wallet_balance ?? 1000).toFixed(0)}</span>
          </button>

          {/* Bengaluru Location Selector Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-slate-800 text-xs font-bold cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{currentLocation.label.replace(' Bengaluru', '')}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Locations Dropdown */}
            {isLocationOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150"
                onClick={() => setIsLocationOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Select Bengaluru Feeder Zone
                  </p>
                </div>
                <div className="space-y-1">
                  {BENGALURU_LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc.id)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentLocation.id === loc.id
                          ? 'bg-emerald-50 text-[#154533] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{loc.label}</span>
                      {currentLocation.id === loc.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Three Horizontal Lines Menu Button */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 transition-all cursor-pointer flex items-center justify-center focus:outline-none"
              title="Menu"
              aria-label="Navigation Menu"
            >
              <Menu className="w-4 sm:w-5 h-4 sm:h-5 text-slate-700" />
            </button>

            {/* Menu Dropdown - Exactly 3 Options */}
            {isProfileOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />

                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Option 1: Profile Name and Role */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
                      {currentUser?.avatar || <User className="w-5 h-5 text-emerald-700" />}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {currentUser?.full_name || currentUser?.name || 'My Profile'}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold capitalize tracking-wide">
                        {currentUser?.role || 'Consumer'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Option: Wallet & Payouts */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsWalletModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-emerald-900 hover:bg-emerald-50 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Wallet & Payouts</span>
                      </div>
                      <span className="font-extrabold text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300/40">
                        ₹{Number(currentUser?.wallet_balance ?? 1000).toFixed(0)}
                      </span>
                    </button>

                    {/* Option 2: Delete my account */}
                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        const confirmed = window.confirm(
                          'Are you sure you want to permanently delete your account? This action cannot be undone.'
                        );
                        if (confirmed) {
                          await deleteAccount();
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>Delete my account</span>
                    </button>

                    {/* Option 3: Log out */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
