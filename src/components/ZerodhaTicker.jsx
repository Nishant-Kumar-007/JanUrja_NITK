// ==============================================================================
// Zerodha-Style Ticker Strip Component
// High-density market overview: live local clearing rate, grid frequency,
// zone balance, renewable purity, and DISCOM tariff benchmark.
// ==============================================================================

import React from 'react';
import { TrendingUp, Activity, Sun, BatteryCharging, Shield, Leaf, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ZerodhaTicker() {
  const { getActiveUserNode, currentUser } = useApp();
  const activeNode = getActiveUserNode();

  const isSurplus = (activeNode?.current_surplus_kwh || 0) > 0;

  return (
    <div className="w-full bg-[#1A252F] text-slate-200 border-b border-slate-700/60 shadow-inner select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs font-mono">
          
          {/* Market Status & Zone Indicator */}
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              UEI MARKET: <span className="text-emerald-400">ACTIVE</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 text-[11px] font-sans">
              Node: <strong className="text-slate-200">{activeNode?.id || 'NODE-2010'}</strong> ({currentUser?.grid_zone || 'S1-North'})
            </span>
          </div>

          {/* Core Metrics: Live Clearing Rate, Surplus/Deficit, Renewable % */}
          <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar py-0.5">
            
            {/* Live Clearing Price */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <span className="text-slate-400 text-[11px] font-sans">Local Rate:</span>
              <span className="text-emerald-400 font-bold text-sm">₹6.15/kWh</span>
              <span className="flex items-center text-[10px] text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800">
                <ArrowUpRight className="w-3 h-3" /> +₹0.25 (4.2%)
              </span>
            </div>

            {/* DISCOM Standard Tariff Comparison */}
            <div className="hidden md:flex items-center space-x-1.5 flex-shrink-0">
              <span className="text-slate-400 text-[11px] font-sans">MESCOM Tariff:</span>
              <span className="text-amber-400 line-through">₹7.80</span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/50 px-1.5 py-0.2 rounded">
                Save 21%
              </span>
            </div>

            {/* User Active Balance (Surplus / Deficit) */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <span className="text-slate-400 text-[11px] font-sans">
                {isSurplus ? 'Your Surplus:' : 'Your Demand:'}
              </span>
              <span className={`font-bold ${isSurplus ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSurplus
                  ? `+${activeNode?.current_surplus_kwh} kWh`
                  : `-${activeNode?.current_deficit_kwh || 4.5} kWh`}
              </span>
            </div>

            {/* Renewable Energy Mix */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px] font-sans">Clean Energy:</span>
              <span className="text-white font-bold">{activeNode?.renewable_percentage || 96}%</span>
            </div>

            {/* Grid Frequency */}
            <div className="hidden lg:flex items-center space-x-1.5 flex-shrink-0">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400 text-[11px] font-sans">Grid Freq:</span>
              <span className="text-sky-300 font-bold">{activeNode?.frequency_hz || 49.98} Hz</span>
            </div>

            {/* CO2 Avoided Metric */}
            <div className="hidden xl:flex items-center space-x-1.5 flex-shrink-0">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 text-[11px] font-sans">CO₂ Offset:</span>
              <span className="text-emerald-300 font-bold">{activeNode?.co2_saved_all_time_kg || 142.5} kg</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
