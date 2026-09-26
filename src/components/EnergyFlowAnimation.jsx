// ==============================================================================
// Energy & Financial Flow Visualizer Component
// Displays dual synchronized animated flows:
// 1. Clean Electron Energy Flow (Producer -> Grid -> Consumer)
// 2. Mock UPI Financial Flow (Consumer -> Gateway -> Producer)
// Merges into instant green settlement verification!
// ==============================================================================

import React from 'react';
import { Sun, Home, Zap, IndianRupee, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export default function EnergyFlowAnimation({
  currentState = 'SETTLED',
  producerName = 'NITK Microgrid Hub',
  consumerName = 'Srinivas EV Station',
  quantityKwh = 3.2,
  amountInr = 19.10
}) {
  const isAuthorized = ['AUTHORIZED', 'ALLOCATED', 'SETTLED'].includes(currentState);
  const isAllocated = ['ALLOCATED', 'SETTLED'].includes(currentState);
  const isSettled = currentState === 'SETTLED';

  return (
    <div className="w-full bg-[#0F172A] rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2ECC71_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      {/* Header with Protocol Stage Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-Time Physical & Financial Telemetry
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            P2P Microgrid Flow Routing
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Beckn State:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase border ${
              isSettled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : isAllocated
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : isAuthorized
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
            }`}
          >
            {currentState}
          </span>
        </div>
      </div>

      {/* Main Interactive Flow Topology Canvas */}
      <div className="relative py-4 my-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          
          {/* Node 1: Producer (Solar) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg text-center relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
              <Sun className="w-7 h-7 text-amber-400 animate-spin-slow" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 uppercase tracking-wider">
              Seller Node (BPP)
            </span>
            <h4 className="font-bold text-sm text-white mt-1.5 truncate">{producerName}</h4>
            <p className="text-xs text-slate-400 font-mono">Surathkal Campus (S1-North)</p>
            
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs flex justify-between font-mono">
              <span className="text-slate-400">Surplus:</span>
              <span className="text-emerald-400 font-bold">+{quantityKwh} kWh</span>
            </div>
          </div>

          {/* Node 2: Central Aggregating Grid & UPI Escrow Settlement */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 shadow-xl text-center relative">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-2 border border-sky-500/30">
              <Zap className="w-6 h-6 text-sky-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800 uppercase tracking-wider">
              UEI Gateway & DISCOM Hub
            </span>
            <h4 className="font-bold text-sm text-white mt-1.5">MESCOM 110kV Substation</h4>
            <p className="text-xs text-slate-400 font-mono">Wheeling Fee: ₹0.15/kWh</p>

            <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs flex justify-between font-mono">
              <span className="text-slate-400">Grid Freq:</span>
              <span className="text-sky-300 font-bold">49.98 Hz (Balanced)</span>
            </div>
          </div>

          {/* Node 3: Consumer (EV Hub) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg text-center relative">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
              <Home className="w-6 h-6 text-amber-300" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 uppercase tracking-wider">
              Buyer Node (BAP)
            </span>
            <h4 className="font-bold text-sm text-white mt-1.5 truncate">{consumerName}</h4>
            <p className="text-xs text-slate-400 font-mono">Srinivasnagar (S3-South)</p>

            <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs flex justify-between font-mono">
              <span className="text-slate-400">Demand:</span>
              <span className="text-amber-400 font-bold">-{quantityKwh} kWh</span>
            </div>
          </div>

        </div>

        {/* Animated Connecting SVG Flows */}
        <div className="my-6 p-4 rounded-xl bg-black/40 border border-slate-800/80 space-y-4">
          
          {/* Energy Flow Line (Producer -> Consumer) */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                Physical Electron Flow: {quantityKwh} kWh Clean Solar Power
              </span>
              <span className="text-[11px] text-slate-400">Producer ➔ Consumer</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 ${
                  isAllocated ? 'w-full animate-flow-dash' : 'w-1/3'
                }`}
              ></div>
            </div>
          </div>

          {/* Financial Flow Line (Consumer -> Producer) */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                Instant UPI Mandate Settlement: ₹{amountInr.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400">Consumer ➔ Producer</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 ${
                  isSettled ? 'w-full' : isAuthorized ? 'w-2/3' : 'w-1/4'
                }`}
              ></div>
            </div>
          </div>

        </div>

        {/* Settlement Confirmation Callout */}
        {isSettled && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-xs text-white">
                  Atomic Contract Cleared & Settled
                </p>
                <p className="text-[11px] text-emerald-300 font-mono">
                  Smart meters synchronized via UEI • ₹{amountInr.toFixed(2)} credited to seller's UPI
                </p>
              </div>
            </div>

            <div className="text-right font-mono flex-shrink-0">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-900/80 px-2.5 py-1 rounded border border-emerald-700">
                1.62 kg CO₂ Saved
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
