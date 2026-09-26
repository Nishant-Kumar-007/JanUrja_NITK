// ==============================================================================
// HomeView Component — Designed after Reference UI Image 1
// Features: 'Track your energy flow' banner, 3 metric capsules (Kwhr Generated,
// Kwhr USED, Kwhr LEFT), Buy/Sell Energy pill buttons, and rounded telemetry feed.
// ==============================================================================

import React from 'react';
import { useApp } from '../context/AppContext';
import DirectionalCompass from '../components/DirectionalCompass';
import {
  TrendingUp,
  ShoppingBag,
  Zap,
  Leaf,
  Clock,
  ChevronRight,
  CheckCircle2,
  Wallet,
  Activity,
  ArrowUpRight,
  Sun
} from 'lucide-react';

export default function HomeView() {
  const {
    currentUser,
    getActiveUserNode,
    setCurrentView,
    offers,
    orders,
    transactions,
    setActiveReceiptOrder,
    filterZone,
    setFilterZone,
    setIsWalletModalOpen
  } = useApp();

  const activeNode = getActiveUserNode();
  const generationKwh = Number(activeNode?.current_generation_kwh ?? 32.5);
  const consumptionKwh = Number(activeNode?.current_consumption_kwh ?? 28.0);
  const surplusKwh = Number((generationKwh - consumptionKwh).toFixed(1));
  const isSurplus = surplusKwh >= 0;

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP HEADER BANNER (From Reference UI: 'Track your energy flow') */}
      <div className="w-full bg-[#587550] rounded-b-[40px] sm:rounded-b-[56px] px-6 sm:px-12 pt-8 pb-12 shadow-sm border-b border-[#476040]/30">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Track your energy flow
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-white/90 mt-2 tracking-wide">
            Real-time peer-to-peer solar telemetry • Bengaluru Urban Microgrid
          </p>
        </div>
      </div>

      {/* 2. MAIN CANVAS AREA (Earthy Sage Background: #8C9F7E) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">

        {/* 3 METRIC CAPSULES ROW (Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Capsule 1: Kwhr Generated (Deep Forest Green) */}
          <div className="bg-[#154533] rounded-[32px] sm:rounded-[40px] p-7 text-white shadow-xl flex flex-col justify-between min-h-[170px] border border-[#11382A] transition-all hover:scale-102">
            <div>
              <span className="text-2xl sm:text-3xl font-black block leading-none tracking-tight text-white">
                Kwhr
              </span>
              <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-emerald-100 mt-1">
                Generated
              </span>
            </div>
            <div className="mt-5 flex items-baseline justify-between pt-2 border-t border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {generationKwh.toFixed(1)} <span className="text-base font-medium text-emerald-200">kWh</span>
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
                Solar
              </span>
            </div>
          </div>

          {/* Capsule 2: Kwhr USED (Warm Coral Red) */}
          <div className="bg-[#DF4F53] rounded-[32px] sm:rounded-[40px] p-7 text-white shadow-xl flex flex-col justify-between min-h-[170px] border border-[#C64145] transition-all hover:scale-102">
            <div>
              <span className="text-2xl sm:text-3xl font-black block leading-none tracking-tight text-white">
                Kwhr
              </span>
              <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-rose-100 mt-1">
                USED
              </span>
            </div>
            <div className="mt-5 flex items-baseline justify-between pt-2 border-t border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {consumptionKwh.toFixed(1)} <span className="text-base font-medium text-rose-200">kWh</span>
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider text-rose-100 bg-white/10 px-3 py-1 rounded-full">
                Consumed
              </span>
            </div>
          </div>

          {/* Capsule 3: Kwhr LEFT (Muted Olive Green) */}
          <div className="bg-[#5D7F57] rounded-[32px] sm:rounded-[40px] p-7 text-white shadow-xl flex flex-col justify-between min-h-[170px] border border-[#4B6946] transition-all hover:scale-102">
            <div>
              <span className="text-2xl sm:text-3xl font-black block leading-none tracking-tight text-white">
                Kwhr
              </span>
              <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-emerald-100 mt-1">
                LEFT
              </span>
            </div>
            <div className="mt-5 flex items-baseline justify-between pt-2 border-t border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {isSurplus ? `+${surplusKwh.toFixed(1)}` : surplusKwh.toFixed(1)} <span className="text-base font-medium text-emerald-100">kWh</span>
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-100 bg-white/10 px-3 py-1 rounded-full">
                {isSurplus ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>

        </div>

        {/* QUICK ACTION BUTTONS (Image 1: Blue 'Buy Energy' + Green 'Sell Energy' Pills) */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap pt-2">
          
          {/* + Buy Energy (Blue Pill) */}
          <button
            onClick={() => setCurrentView('buy')}
            className="bg-[#2E75D3] hover:bg-[#2563B8] active:bg-[#1E529E] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center space-x-2.5 hover:scale-102"
          >
            <span className="text-xl leading-none font-black">+</span>
            <span>Buy Energy</span>
          </button>

          {/* ↗ Sell Energy (Forest Green Pill) */}
          <button
            onClick={() => setCurrentView('sell')}
            className="bg-[#4A7C59] hover:bg-[#3D694A] active:bg-[#32573D] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center space-x-2.5 hover:scale-102"
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span>Sell Energy</span>
          </button>

        </div>

      </div>

      {/* 3. LOWER SECTION CONTAINER (Image 1: Rounded top dark sage container) */}
      <div className="w-full bg-[#587550] rounded-t-[44px] sm:rounded-t-[56px] px-6 sm:px-12 py-12 shadow-2xl mt-6 border-t border-[#476040]/30">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* User Node Profile & Quick Status Row */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                {currentUser?.avatar || '☀️'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">
                    {currentUser?.name || currentUser?.full_name || 'Prosumer'}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#154533] text-emerald-200 border border-emerald-400/30">
                    Role: {currentUser?.role || 'Prosumer'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-black/20 hover:bg-black/35 px-4 py-2.5 rounded-2xl border border-white/20 text-center transition-all hover:scale-105 cursor-pointer group"
                title="Click to Add Money or Withdraw Funds"
              >
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-emerald-200">
                  <Wallet className="w-3 h-3 text-emerald-300" />
                  <span>Wallet</span>
                </div>
                <p className="text-base sm:text-lg font-black text-white">
                  ₹{Number(currentUser?.wallet_balance ?? 1000).toFixed(0)}
                </p>
                <span className="text-[9px] text-emerald-200 font-bold underline block mt-0.5 group-hover:text-emerald-300">
                  Add / Withdraw
                </span>
              </button>
              <div className="bg-black/15 px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-200">Listings</p>
                <p className="text-base sm:text-lg font-black text-white">
                  {offers.filter((o) => o.seller_id === currentUser?.id || o.status === 'active').length}
                </p>
              </div>
              <div className="bg-black/15 px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] uppercase font-bold text-sky-200">Settled</p>
                <p className="text-base sm:text-lg font-black text-white">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          {/* Directional Compass Grid Segment Preview */}
          <DirectionalCompass
            selectedZone={filterZone}
            onSelectZone={(zone) => {
              setFilterZone(zone);
              setCurrentView('marketplace');
            }}
          />

          {/* Recent P2P Settlements & Orders Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#154533]" />
                  Recent P2P Settlements & Orders
                </h3>
                <p className="text-xs text-slate-500">
                  Synchronized live from Beckn protocol transactions
                </p>
              </div>

              <button
                onClick={() => setCurrentView('marketplace')}
                className="text-xs font-bold text-[#154533] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Browse All Active Offers <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* List of Orders / Transactions */}
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  No orders placed yet. Tap "Buy Energy" to get started!
                </p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setActiveReceiptOrder(order)}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          order.protocol_state === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.protocol_state === 'SETTLED' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Zap className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900 font-mono">
                            {order.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {order.protocol_state}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {order.quantity_kwh} kWh @ ₹{order.price_per_kwh}/unit • Total: ₹{order.total_amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <span className="text-xs font-bold text-[#154533] group-hover:underline">
                        View Receipt
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
