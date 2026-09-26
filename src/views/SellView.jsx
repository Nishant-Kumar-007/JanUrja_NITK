// ==============================================================================
// SellView Component — Designed after Reference UI Image 3
// Features: 'Track your energy flow' banner, 'Amount of Kwhr Being sold' capsule,
// clean input box, prominent 'EXECUTE' pill button, and prosumer pricing setup.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/supabaseClient';
import { mockDb } from '../services/mockDatabase';
import { evaluateAgenticPricing } from '../services/agenticEngine';
import { logProtocolEvent } from '../services/becknProtocol';
import {
  TrendingUp,
  Sun,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';

const SAMPLE_PRODUCER_LISTINGS = [
  {
    id: 'sample-list-1',
    quantity_kwh: 5.0,
    price_per_kwh: 6.10,
    grid_zone: 'North Bengaluru (Hebbal Feeder)',
    status: 'Active',
    pricing_mode: 'fixed',
    is_sample: true
  },
  {
    id: 'sample-list-2',
    quantity_kwh: 12.0,
    price_per_kwh: 5.80,
    grid_zone: 'South Bengaluru (Koramangala 11kV)',
    status: 'Active',
    pricing_mode: 'agentic',
    is_sample: true
  },
  {
    id: 'sample-list-3',
    quantity_kwh: 8.5,
    price_per_kwh: 6.30,
    grid_zone: 'East Bengaluru (Indiranagar Feeder)',
    status: 'Active',
    pricing_mode: 'fixed',
    is_sample: true
  }
];

export default function SellView() {
  const { currentUser, getActiveUserNode, refreshData, setCurrentView, offers } = useApp();
  const activeNode = getActiveUserNode();

  const userListings = offers.filter((o) => o.seller_id === currentUser?.id || o.status === 'active');
  const activeListings = userListings.length > 0 ? userListings : SAMPLE_PRODUCER_LISTINGS;

  const maxSurplus = Number(activeNode?.current_surplus_kwh || 3.2);

  const [quantityKwh, setQuantityKwh] = useState(maxSurplus > 0 ? maxSurplus : 3.0);
  const [pricingMode, setPricingMode] = useState('agentic'); // 'agentic' | 'fixed'
  const [fixedPrice, setFixedPrice] = useState('6.20');
  const [agenticRule, setAgenticRule] = useState(
    'Auto-price dynamically: Undercut grid tariff (₹7.80) by 15% and stay above ₹5.50/unit.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOffer, setSuccessOffer] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Compute live agentic price preview
  const pricingEvaluation = evaluateAgenticPricing({
    basePrice: 6.20,
    rule: agenticRule,
    gridTariff: 7.80,
    feedInRate: 2.90,
    zoneCongestion: 0.42
  });

  const activePricePerKwh = pricingMode === 'agentic' ? pricingEvaluation.finalPrice : parseFloat(fixedPrice) || 6.20;
  const estimatedRevenue = Number((quantityKwh * activePricePerKwh).toFixed(2));
  const discomNetMeteringRevenue = Number((quantityKwh * 2.90).toFixed(2));
  const additionalEarnings = Number((estimatedRevenue - discomNetMeteringRevenue).toFixed(2));

  // Handler: Publish Solar Surplus (Triggered by EXECUTE button)
  const handlePublishOffer = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    if (!quantityKwh || quantityKwh <= 0) {
      setErrorMsg('Please enter a valid amount of kWh to sell.');
      return;
    }

    setIsSubmitting(true);

    const newOffer = {
      id: `offer-${Date.now()}`,
      node_id: activeNode?.id || 'NODE-2010',
      seller_id: currentUser?.id,
      seller_name: currentUser?.full_name || currentUser?.name || 'Solar Prosumer',
      node_name: activeNode?.node_name || 'NITK Microgrid Hub',
      grid_zone: currentUser?.grid_zone || 'S1-North',
      price_per_kwh: activePricePerKwh,
      quantity_kwh: quantityKwh,
      min_quantity_kwh: 0.5,
      status: 'active',
      pricing_mode: pricingMode,
      natural_language_rule: pricingMode === 'agentic' ? agenticRule : 'Fixed Rate Listing',
      renewable_percentage: activeNode?.renewable_percentage || 96,
      distance_km: 0.8,
      availability_window: '09:00 - 17:00',
      created_at: new Date().toISOString()
    };

    try {
      if (db.isLive()) {
        await db.from('energy_offers').insert([newOffer]);
      } else {
        mockDb.insert('energy_offers', newOffer);
      }

      // Log Beckn BPP broadcast event
      await logProtocolEvent({
        orderId: `ord-pub-${Date.now().toString().slice(-4)}`,
        action: 'on_search',
        senderId: `BPP:janurja.seller.${activeNode?.id || '1042'}`,
        recipientId: 'BG:gateway.uei.karnataka.gov.in',
        payload: {
          catalog: {
            bpp_descriptor: { name: newOffer.node_name },
            providers: [{
              id: newOffer.node_id,
              items: [{
                id: newOffer.id,
                price: { currency: 'INR', value: String(activePricePerKwh) },
                descriptor: { name: `${quantityKwh} kWh Clean Solar Power` }
              }]
            }]
          }
        }
      });

      if (typeof refreshData === 'function') refreshData();
      setSuccessOffer(newOffer);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to publish offer:', err);
      setErrorMsg('Failed to broadcast offer to Beckn protocol.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP HEADER BANNER (Reference UI: 'Track your energy flow') */}
      <div className="w-full bg-[#587550] rounded-b-[40px] sm:rounded-b-[56px] px-6 sm:px-12 pt-8 pb-12 shadow-sm border-b border-[#476040]/30">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Track your energy flow
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-white/90 mt-2 tracking-wide">
            Broadcast Rooftop Solar Surplus to Bengaluru Beckn Network
          </p>
        </div>
      </div>

      {/* 2. MAIN SELL FORM CANVAS (Reference UI Image 3) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">

        {/* Center Interaction: Capsule + Input Field */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          
          {/* Left Capsule: Amount of KW/h Being Sold */}
          <div className="bg-[#154533] rounded-[32px] sm:rounded-[36px] p-7 sm:p-8 text-white shadow-xl min-w-[280px] sm:min-w-[320px] border border-[#11382A]">
            <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-white">
              Amount of KW/h
            </span>
            <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-emerald-100 mt-1">
              Being Sold
            </span>
          </div>

          {/* Right Input: Light Clean Input Box */}
          <div className="w-full sm:w-auto flex-1 max-w-[280px]">
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={quantityKwh}
              onChange={(e) => setQuantityKwh(parseFloat(e.target.value) || 0)}
              className="w-full h-24 sm:h-28 bg-[#D8DFD5] hover:bg-[#E2E8DF] focus:bg-white text-[#163A1D] rounded-[28px] text-3xl sm:text-4xl font-black text-center border-2 border-transparent focus:border-[#154533] outline-none shadow-inner transition-all"
              placeholder="0.0"
            />
          </div>

        </div>

        {/* Success Confirmation Toast */}
        {successOffer && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-center shadow-md animate-in fade-in">
            <p className="font-extrabold text-sm">Offer Broadcast Successfully! 🎉</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Listed {successOffer.quantity_kwh} kWh @ ₹{successOffer.price_per_kwh}/unit on Beckn UEI.
            </p>
          </div>
        )}

        {/* Error message if any */}
        {errorMsg && (
          <div className="max-w-md mx-auto p-3 rounded-2xl bg-rose-100 text-rose-800 text-xs font-bold text-center border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* EXECUTE BUTTON (Reference UI Image 3) */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handlePublishOffer}
            disabled={isSubmitting || quantityKwh <= 0}
            className="bg-[#4A7C59] hover:bg-[#3D694A] active:bg-[#32573D] disabled:opacity-50 text-white px-16 sm:px-20 py-4 sm:py-4.5 rounded-full font-black text-base sm:text-lg uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-102 flex items-center space-x-3"
          >
            {isSubmitting ? (
              <span>LISTING...</span>
            ) : (
              <span>EXECUTE</span>
            )}
          </button>
        </div>

      </div>

      {/* 3. LOWER SECTION CONTAINER (Rounded top dark sage container) */}
      <div className="w-full bg-[#587550] rounded-t-[44px] sm:rounded-t-[56px] px-6 sm:px-12 py-12 shadow-2xl mt-8 border-t border-[#476040]/30 text-[#163A1D]">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Prosumer Pricing & Projected Revenue Breakdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 text-white">
            <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              Prosumer Revenue Optimization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-emerald-200 font-bold uppercase">JanUrja Direct Sale</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{estimatedRevenue.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-300">@ ₹{activePricePerKwh.toFixed(2)}/kWh</p>
              </div>

              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-slate-300 font-bold uppercase">Standard Net-Metering</p>
                <p className="text-xl sm:text-2xl font-black text-slate-300 mt-1">₹{discomNetMeteringRevenue.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">@ ₹2.90/kWh DISCOM rate</p>
              </div>

              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-amber-200 font-bold uppercase">Your Extra Profit</p>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">+₹{additionalEarnings.toFixed(2)}</p>
                <p className="text-[10px] text-amber-200">~{Math.round((additionalEarnings / (discomNetMeteringRevenue || 1)) * 100)}% higher earnings</p>
              </div>
            </div>

            {/* Pricing Mode Toggle: Agentic AI vs Fixed */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-white">Pricing Engine Mode</p>
                <p className="text-xs text-emerald-200">Choose between autonomous AI optimization or fixed price</p>
              </div>

              <div className="flex bg-black/20 p-1 rounded-full border border-white/15">
                <button
                  type="button"
                  onClick={() => setPricingMode('agentic')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    pricingMode === 'agentic'
                      ? 'bg-[#154533] text-white shadow-sm'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  🤖 Agentic AI
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('fixed')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    pricingMode === 'fixed'
                      ? 'bg-[#154533] text-white shadow-sm'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Fixed Tariff
                </button>
              </div>
            </div>

            {pricingMode === 'fixed' && (
              <div className="mt-4 flex items-center space-x-3">
                <label className="text-xs font-bold text-white">Ask Price (₹/kWh):</label>
                <input
                  type="number"
                  step="0.10"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  className="w-28 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-sm text-center border-none outline-none"
                />
              </div>
            )}
          </div>

          {/* Active Listings in Network */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  Your Active Solar Listings
                </h4>
                <p className="text-xs text-slate-500">
                  Discoverable by nearby consumers across Bengaluru grid
                </p>
              </div>
              <button
                onClick={() => setCurrentView('marketplace')}
                className="text-xs font-bold text-[#154533] hover:underline cursor-pointer"
              >
                View Marketplace
              </button>
            </div>

            <div className="space-y-2.5">
              {activeListings.slice(0, 4).map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#154533] text-white flex items-center justify-center font-bold text-sm">
                      ☀️
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-sm text-slate-900">{offer.quantity_kwh} kWh Available</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {offer.status || 'Active'}
                        </span>
                        {offer.is_sample && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            (Sample Listing)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Ask: ₹{Number(offer.price_per_kwh).toFixed(2)}/kWh • Zone: {offer.grid_zone || 'S1-North'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Live on UEI
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
