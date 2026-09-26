// ==============================================================================
// 90-Second Demo Flow (The Centerpiece of JanUrja for Hackathon Judges)
// Fully animated autonomous sequence demonstrating NITK Solar Park (Prosumer)
// trading clean solar power to Priya Nayak (EV Consumer) via Beckn UEI with instant UPI settlement.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import EnergyFlowAnimation from '../components/EnergyFlowAnimation';
import MockUpiModal from '../components/MockUpiModal';
import {
  becknDiscover,
  becknQuote,
  becknInit,
  becknAuthorize,
  becknAllocate,
  becknSettle,
  BECKN_STATES
} from '../services/becknProtocol';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Sparkles,
  Sun,
  Home,
  Zap,
  Leaf,
  ShieldCheck,
  FileCode,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DemoFlowView() {
  const { profiles, nodes, offers, refreshData, setActiveReceiptOrder, setCurrentView } = useApp();

  // Actors in the scenario:
  const producer = profiles.find((p) => p.role === 'prosumer') || profiles[0];
  const consumer = profiles.find((p) => p.role === 'consumer') || profiles[1];
  const producerNode = nodes.find((n) => n.id === 'NODE-2010') || nodes[0];
  const producerOffer = offers.find((o) => o.node_id === 'NODE-2010') || offers[0];

  // Demo playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Discovery, 2: AI Matching, 3: Quotation, 4: UPI Auth, 5: Grid Allocation, 6: Settled
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x or 2x
  const [becknState, setBecknState] = useState(BECKN_STATES.DISCOVERED);
  const [demoOrderData, setDemoOrderData] = useState(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isStepRunning, setIsStepRunning] = useState(false);
  const timerRef = useRef(null);

  const steps = [
    {
      index: 1,
      title: 'Discovery & Telemetry',
      subtitle: 'NITK Solar Park has 15 kWh surplus broadcast to Beckn Gateway',
      state: BECKN_STATES.DISCOVERED
    },
    {
      index: 2,
      title: 'Agentic AI Matching',
      subtitle: "Priya Nayak's EV charger needs clean power; engine discovers closest 1.4km node",
      state: BECKN_STATES.DISCOVERED
    },
    {
      index: 3,
      title: 'Tariff Quotation',
      subtitle: 'Itemized Beckn quote (₹5.80/kWh + ₹0.15 wheeling = ₹49.30 total)',
      state: BECKN_STATES.QUOTED
    },
    {
      index: 4,
      title: 'Instant UPI Checkout',
      subtitle: 'Mock NPCI UPI AutoPay mandate authorized with MPIN',
      state: BECKN_STATES.AUTHORIZED
    },
    {
      index: 5,
      title: 'Smart Meter Allocation',
      subtitle: 'Grid frequency synchronized at 50.01Hz; electron dispatch verified',
      state: BECKN_STATES.ALLOCATED
    },
    {
      index: 6,
      title: 'Settled & Persisted',
      subtitle: 'Instant fund transfer to NITK + 4.59 kg CO₂ certificate generated',
      state: BECKN_STATES.SETTLED
    }
  ];

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const delayForSpeed = (ms) => Math.round(ms / playbackSpeed);

  // Run full sequence
  const startDemo = async () => {
    setIsPlaying(true);
    setCurrentStep(1);
    setBecknState(BECKN_STATES.DISCOVERED);

    try {
      // Step 1: Discovery
      const discoverRes = await becknDiscover({
        buyer: consumer,
        zone: 'S1-North',
        requiredKwh: 8.5
      });

      await new Promise((r) => { timerRef.current = setTimeout(r, delayForSpeed(2000)); });

      // Step 2: AI Matching
      setCurrentStep(2);
      await new Promise((r) => { timerRef.current = setTimeout(r, delayForSpeed(2200)); });

      // Step 3: Quote & Init
      setCurrentStep(3);
      setBecknState(BECKN_STATES.QUOTED);
      const quoteRes = await becknQuote({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        buyer: consumer,
        seller: producer,
        node: producerNode,
        offer: producerOffer,
        quantityKwh: 8.5
      });

      const initRes = await becknInit({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        buyer: consumer,
        totalAmount: 49.30
      });

      setDemoOrderData({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        upiMandateId: initRes.upiMandateId,
        totalAmount: 49.30,
        quantityKwh: 8.5,
        pricePerKwh: 5.80,
        co2AvoidedKg: 4.59
      });

      await new Promise((r) => { timerRef.current = setTimeout(r, delayForSpeed(2000)); });

      // Step 4: UPI Checkout & Authorization
      setCurrentStep(4);
      setBecknState(BECKN_STATES.AUTHORIZED);

      const authRes = await becknAuthorize({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        buyer: consumer,
        seller: producer,
        totalAmount: 49.30,
        upiMandateId: initRes.upiMandateId,
        pin: '1234'
      });

      await new Promise((r) => { timerRef.current = setTimeout(r, delayForSpeed(2200)); });

      // Step 5: Allocate
      setCurrentStep(5);
      setBecknState(BECKN_STATES.ALLOCATED);
      await becknAllocate({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        node: producerNode,
        quantityKwh: 8.5
      });

      await new Promise((r) => { timerRef.current = setTimeout(r, delayForSpeed(2200)); });

      // Step 6: Settle
      setCurrentStep(6);
      setBecknState(BECKN_STATES.SETTLED);
      await becknSettle({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        buyer: consumer,
        seller: producer,
        totalAmount: 49.30,
        co2AvoidedKg: 4.59,
        upiTxnRef: authRes.upiTxnRef
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#2ECC71', '#F1C40F', '#1B4D3E', '#3498DB']
        });
      } catch (e) {}

      setIsPlaying(false);
      refreshData();
    } catch (err) {
      console.error('Demo flow failed:', err);
      setIsPlaying(false);
    }
  };

  const resetDemo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setBecknState(BECKN_STATES.DISCOVERED);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Centerpiece Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              Judges Centerpiece Demo
            </span>
            <span className="text-xs font-bold text-slate-500">
              Core Scenario: NITK Solar (Producer) ➔ Priya Nayak (Consumer)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            90-Second Autonomous Trading Sequence
          </h1>
          <p className="text-xs text-slate-500">
            Witness discovery, AI matching, mock UPI authorization, and smart meter settlement in real time.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : 1))}
            className="px-3 py-2 rounded-xl text-xs font-bold font-mono border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1"
            title="Toggle playback speed"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-600" />
            <span>{playbackSpeed}x Speed</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetDemo}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Reset demo sequence"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Play Button */}
          {isPlaying ? (
            <button
              onClick={() => setIsPlaying(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span>Pause Demo</span>
            </button>
          ) : (
            <button
              onClick={startDemo}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{currentStep === 0 ? 'Start 90-Second Demo' : 'Resume Sequence'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Step Progress Stepper Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {steps.map((st) => {
          const isDone = currentStep > st.index || currentStep === 6;
          const isCurrent = currentStep === st.index;

          return (
            <div
              key={st.index}
              className={`p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-[#1B4D3E] text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40 scale-102'
                  : isDone
                  ? 'bg-emerald-50 text-slate-800 border-emerald-200'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold">
                  STEP 0{st.index}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <h4 className="font-bold text-xs leading-tight truncate">
                {st.title}
              </h4>
              <p className={`text-[10px] mt-1 leading-snug line-clamp-2 ${isCurrent ? 'text-emerald-200' : 'text-slate-500'}`}>
                {st.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Visual Energy & Financial Dual Flow Canvas */}
      <EnergyFlowAnimation
        currentState={becknState}
        producerName="NITK Microgrid Hub (NODE-2010)"
        consumerName="Srinivas EV Station (NODE-3045)"
        quantityKwh={8.5}
        amountInr={49.30}
      />

      {/* Live Stage Detail Explanation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Scenario Context Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            Core Scenario Grounding
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>NITK Research Park</strong> operates a 25 kW rooftop solar array generating daytime surplus over institutional baseload.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Priya Nayak</strong> operates a nearby EV charging hub requiring localized clean energy. JanUrja matches them instantly on UEI.
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-mono">
            <span className="text-slate-500">Physical Feeder:</span>
            <span className="font-bold text-slate-800">Zone S1-North (1.4 km)</span>
          </div>
        </div>

        {/* DPI & Protocol State Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Protocol Verification
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every step triggers client-side async Beckn endpoints writing records to Supabase: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">protocol_events</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">orders</code>.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>BAP (Buyer):</span>
              <span className="font-bold text-slate-800">janurja.bap.priya</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>BPP (Seller):</span>
              <span className="font-bold text-slate-800">janurja.bpp.nitk</span>
            </div>
          </div>
        </div>

        {/* Economic Win-Win Card */}
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Unbundling the Grid: Win-Win
          </h3>
          <ul className="text-xs text-slate-700 space-y-1.5">
            <li>• <strong>Priya saves 25%:</strong> Pays ₹5.80/kWh vs DISCOM commercial tariff of ₹7.80.</li>
            <li>• <strong>NITK Solar earns 100% more:</strong> Gets ₹5.80/kWh vs ₹2.90 net-metering feed-in rate.</li>
            <li>• <strong>MESCOM earns wheeling fee:</strong> Receives ₹0.15/kWh network transit fee without managing billing.</li>
          </ul>
        </div>

      </div>

      {/* Completion & Final Receipt Trigger */}
      {currentStep === 6 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1B4D3E] to-[#246B56] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded">
              Demo Completed Successfully
            </span>
            <h3 className="text-xl font-black mt-1">
              Order Settled in Supabase & Recent Activity Feed
            </h3>
            <p className="text-xs text-emerald-100">
              View the cryptographic carbon offset certificate, or examine the live protocol logs in the developer drawer.
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveReceiptOrder({
                  id: `ord-demo-${Date.now()}`,
                  transaction_id: `TXN-UEI-2026-DEMO`,
                  quantity_kwh: 8.5,
                  price_per_kwh: 5.80,
                  total_amount: 49.30,
                  co2_avoided_kg: 4.59,
                  seller_name: 'NITK Solar Research Park (NODE-2010)',
                  buyer_name: 'Priya Nayak (EV Point)',
                  wheeling_charge: 1.25,
                  protocol_state: 'SETTLED',
                  settled_at: new Date().toISOString()
                });
              }}
              className="px-5 py-3 rounded-xl bg-white text-[#1B4D3E] font-black text-xs shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Inspect Energy Receipt ➔
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
