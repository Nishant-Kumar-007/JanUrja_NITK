// ==============================================================================
// Marketplace & Smart Matching View
// Shows available nearby energy sources, directional grid compass filter,
// and 'Find Best Energy For Me' AI multi-criteria optimization.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DirectionalCompass from '../components/DirectionalCompass';
import { findBestEnergyForMe } from '../services/agenticEngine';
import {
  Globe,
  Sparkles,
  Sun,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown,
  Filter,
  Check
} from 'lucide-react';

export default function MarketplaceView() {
  const {
    offers,
    currentUser,
    setSelectedOfferForBuy,
    setCurrentView,
    filterZone,
    setFilterZone
  } = useApp();

  const [isMatchingRunning, setIsMatchingRunning] = useState(false);
  const [matchedResult, setMatchedResult] = useState(null);

  // Filter offers by selected grid zone if not ALL
  const filteredOffers = filterZone === 'ALL'
    ? offers
    : offers.filter((o) => o.grid_zone === filterZone);

  // Run AI multi-criteria matching
  const handleRunSmartMatching = () => {
    setIsMatchingRunning(true);
    setMatchedResult(null);

    setTimeout(() => {
      const result = findBestEnergyForMe({
        offers,
        consumerZone: currentUser?.grid_zone || 'S2-East',
        userLocationKm: 0
      });
      setMatchedResult(result);
      setIsMatchingRunning(false);
    }, 700);
  };

  const handleSelectOffer = (offer) => {
    setSelectedOfferForBuy(offer);
    setCurrentView('buy');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Bengaluru Energy Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Discover peer-to-peer solar providers, community microgrids, and green battery reserves.
          </p>
        </div>

        {/* AI "Find Best Energy For Me" Button (Centerpiece feature requested in prompt) */}
        <button
          onClick={handleRunSmartMatching}
          disabled={isMatchingRunning}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1B4D3E] via-[#246B56] to-[#12352B] hover:brightness-110 text-white font-extrabold text-sm shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center space-x-2 flex-shrink-0 cursor-pointer"
        >
          {isMatchingRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Running Agentic Matching...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Find Best Energy For Me (AI Match)</span>
            </>
          )}
        </button>
      </div>

      {/* AI Matched Top Pick Banner (if run) */}
      {matchedResult?.bestMatch && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-[#1B4D3E] to-teal-900 text-white shadow-xl border border-emerald-500/40 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-[#1B4D3E] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> #1 Top AI Pick ({matchedResult.bestMatch.scores.total}/100 Match Score)
                </span>
                <span className="text-xs text-emerald-200">
                  Optimized for Price (40%), Proximity (30%), Clean Mix (20%), Low Congestion (10%)
                </span>
              </div>

              <h3 className="text-xl font-black">
                {matchedResult.bestMatch.node_name} ({matchedResult.bestMatch.seller_name})
              </h3>
              <p className="text-xs text-emerald-100 max-w-2xl">
                {matchedResult.bestMatch.matchReason}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
                <span className="text-emerald-300">Price Score: {matchedResult.bestMatch.scores.priceScore}%</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-300">Proximity: {matchedResult.bestMatch.distance_km} km</span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-300 font-bold">₹{matchedResult.bestMatch.price_per_kwh}/kWh</span>
              </div>
            </div>

            <button
              onClick={() => handleSelectOffer(matchedResult.bestMatch)}
              className="py-3 px-6 rounded-xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
            >
              <span>Instant Buy via UEI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* Directional Node Compass Map */}
      <DirectionalCompass
        selectedZone={filterZone}
        onSelectZone={setFilterZone}
      />

      {/* Marketplace Offers Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Active Energy Listings ({filteredOffers.length})
          </h2>

          {filterZone !== 'ALL' && (
            <button
              onClick={() => setFilterZone('ALL')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Clear Zone Filter ({filterZone})
            </button>
          )}
        </div>

        {filteredOffers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            <Sun className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm">No active listings in {filterZone}.</p>
            <p className="text-xs text-slate-400 mt-1">Switch to another compass zone or list your own surplus!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              const price = Number(offer.price_per_kwh || 6.20);
              const savings = Math.round(((7.80 - price) / 7.80) * 100);

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Zone & Rate */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase font-mono">
                          {offer.grid_zone || 'S2-East'}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-1 group-hover:text-[#1B4D3E] transition-colors">
                          {offer.node_name || 'Solar PV Node'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          by {offer.seller_name || 'Surathkal Prosumer'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-[#1B4D3E]">
                          ₹{price.toFixed(2)}
                        </span>
                        <span className="text-[10px] block font-mono text-slate-400">/ kWh</span>
                        {savings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Save {savings}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Telemetry & Purity Badges */}
                    <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Surplus Available</span>
                        <span className="font-bold text-slate-800">
                          {offer.quantity_kwh} kWh
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Clean Energy</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          {offer.renewable_percentage || 96}%
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Distance: <strong>{offer.distance_km || 0.8} km</strong> away</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Window: {offer.availability_window || '09:00 - 17:00'}</span>
                      </p>
                      {offer.pricing_mode === 'agentic' && (
                        <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 font-sans italic">
                          "Agentic Pricing: {offer.natural_language_rule}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Buy CTA */}
                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectOffer(offer)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 group-hover:bg-[#1B4D3E] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Select & Place Order</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
