// ==============================================================================
// Directional Node Compass Map Component
// Faithful implementation of the architectural sketch:
// S1 (North), S2 (East), S3 (South), S4 (West) arranged around Central DISCOM Hub.
// Filterable, clickable, and shows live grid segment health & clearing price.
// ==============================================================================

import React from 'react';
import { Compass, Zap, Shield, ArrowUp, ArrowDown, Activity, Check } from 'lucide-react';
import { GRID_ZONES } from '../data/initialData';

export default function DirectionalCompass({ selectedZone = 'ALL', onSelectZone }) {
  const getZone = (code) => GRID_ZONES.find((z) => z.code === code || z.alias === code) || {};

  const s1 = getZone('North-BLR');
  const s2 = getZone('East-BLR');
  const s3 = getZone('South-BLR');
  const s4 = getZone('West-BLR');
  const central = getZone('Central-BLR');

  const renderZoneCard = (zone, positionClass, directionLabel) => {
    const isSelected = selectedZone === zone.code;
    const isSurplus = (zone.surplus_kwh || 0) >= (zone.deficit_kwh || 0);

    return (
      <div
        onClick={() => onSelectZone(isSelected ? 'ALL' : zone.code)}
        className={`absolute ${positionClass} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-20`}
      >
        <div
          className={`w-38 sm:w-44 p-2.5 rounded-xl border backdrop-blur-md shadow-md transition-all ${
            isSelected
              ? 'bg-[#1B4D3E] text-white border-emerald-400 ring-2 ring-emerald-400/50 scale-105 shadow-emerald-900/30'
              : 'bg-white/95 text-slate-800 border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:scale-102'
          }`}
        >
          {/* Header with Direction tag */}
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                isSelected ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {directionLabel} • {zone.code}
            </span>
            <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-300' : 'text-[#1B4D3E]'}`}>
              ₹{zone.avg_price?.toFixed(2)}
            </span>
          </div>

          <p className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
            {zone.name?.split('&')[0]}
          </p>

          {/* Metric Badges */}
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100/30 text-[10px]">
            <span
              className={`flex items-center font-bold px-1.5 py-0.2 rounded ${
                isSurplus
                  ? isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                  : isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isSurplus ? (
                <>
                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> +{zone.surplus_kwh} kWh
                </>
              ) : (
                <>
                  <ArrowDown className="w-2.5 h-2.5 mr-0.5" /> -{zone.deficit_kwh} kWh
                </>
              )}
            </span>

            <span className={isSelected ? 'text-emerald-200' : 'text-slate-500'}>
              {zone.active_nodes} nodes
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1B4D3E] flex items-center justify-center">
            <Compass className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-1.5">
              Directional Microgrid Topology Map
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Bengaluru Zones (N, S, E, W, Central)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Click any compass node to filter local P2P offers by physical feeder segment
            </p>
          </div>
        </div>

        {/* Filter Reset / All Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectZone('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedZone === 'ALL'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            Show All Zones
          </button>
          {selectedZone !== 'ALL' && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3" /> Filtered: {selectedZone}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Compass Topology Canvas */}
      <div className="relative w-full h-[400px] sm:h-[460px] my-2 flex items-center justify-center overflow-hidden">
        {/* SVG Interconnecting Feeder Grid Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2ECC71" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Hub Glow */}
          <circle cx="50%" cy="50%" r="130" fill="url(#hubGlow)" />
          
          {/* Outer Compass Guide Ring */}
          <circle cx="50%" cy="50%" r="150" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

          {/* Lines from Central Hub to N, E, S, W */}
          <line x1="50%" y1="50%" x2="50%" y2="12%" stroke="#2ECC71" strokeWidth="2.5" strokeDasharray="6 4" className="animate-flow-dash" />
          <line x1="50%" y1="50%" x2="88%" y2="50%" stroke="#2ECC71" strokeWidth="2.5" strokeDasharray="6 4" className="animate-flow-dash" />
          <line x1="50%" y1="50%" x2="50%" y2="88%" stroke="#F1C40F" strokeWidth="2.5" strokeDasharray="6 4" className="animate-flow-dash-reverse" />
          <line x1="50%" y1="50%" x2="12%" y2="50%" stroke="#2ECC71" strokeWidth="2.5" strokeDasharray="6 4" className="animate-flow-dash" />
        </svg>

        {/* NORTH: S1 - NITK Academic & Solar Park */}
        {renderZoneCard(s1, 'left-1/2 top-[13%]', 'NORTH')}

        {/* EAST: S2 - Surathkal Market & Beach Rd Feeder */}
        {renderZoneCard(s2, 'left-[82%] sm:left-[83%] top-1/2', 'EAST')}

        {/* SOUTH: S3 - Srinivasnagar Residential & EV Point */}
        {renderZoneCard(s3, 'left-1/2 top-[87%]', 'SOUTH')}

        {/* WEST: S4 - Coastal Fishery & Cold Storage */}
        {renderZoneCard(s4, 'left-[18%] sm:left-[17%] top-1/2', 'WEST')}

        {/* CENTER HUB: Central DISCOM Substation & Clearing House */}
        <div
          onClick={() => onSelectZone(selectedZone === 'Central-Hub' ? 'ALL' : 'Central-Hub')}
          className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-all duration-300 ${
            selectedZone === 'Central-Hub' ? 'scale-110' : 'hover:scale-105'
          }`}
        >
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-gradient-to-br from-[#1B4D3E] via-[#246B56] to-[#12352B] p-1 shadow-xl shadow-emerald-900/30 flex items-center justify-center border-2 border-emerald-400">
            <div className="w-full h-full rounded-full bg-[#1B4D3E] flex flex-col items-center justify-center p-2 text-center text-white">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              </div>
              <p className="font-extrabold text-[11px] leading-tight text-emerald-200">
                CENTRAL HUB
              </p>
              <p className="text-[9px] text-slate-300 font-medium">BESCOM 110kV</p>
              <span className="mt-1 text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                DPI Clearing
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-2 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Surplus Generation
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Deficit / Demand
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Wheeling Backbone
          </span>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          Physical electricity flows via localized 11kV feeders • Software settlement via Beckn UEI
        </p>
      </div>
    </div>
  );
}
