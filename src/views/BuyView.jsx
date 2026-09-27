// ==============================================================================
// BuyView Component — Designed after Reference UI Image 2
// Features: 'Track your energy flow' banner, 'Amount of Kwhr Being Bought' capsule,
// clean input box, prominent 'EXECUTE' pill button, and rounded order breakdown.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  becknDiscover,
  becknQuote,
  becknInit,
  becknAuthorize,
  becknAllocate,
  becknSettle,
  BECKN_STATES
} from '../services/becknProtocol';
import MockUpiModal from '../components/MockUpiModal';
import {
  ShoppingBag,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Leaf,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronRight,
  Check
} from 'lucide-react';

const VERIFIED_PEER_OFFERS = [
  {
    id: 'offer-2010',
    node_id: 'NODE-2010',
    price_per_kwh: 5.80,
    quantity_kwh: 15.00,
    seller_name: 'Hebbal Solar Research Park',
    node_name: 'Hebbal 11kV Microgrid Hub',
    grid_zone: 'S1-North',
    renewable_percentage: 99.5,
    distance_km: 0.8
  },
  {
    id: 'offer-6032',
    node_id: 'NODE-6032',
    price_per_kwh: 6.20,
    quantity_kwh: 22.50,
    seller_name: 'Indiranagar Commercial Rooftop Co-op',
    node_name: 'Indiranagar Commercial Rooftop Node',
    grid_zone: 'S2-East',
    renewable_percentage: 95.0,
    distance_km: 1.2
  },
  {
    id: 'offer-3088',
    node_id: 'NODE-3045',
    price_per_kwh: 6.75,
    quantity_kwh: 4.00,
    seller_name: 'Koramangala EV Reserve (V2G)',
    node_name: 'Koramangala EV Fast Charge Point',
    grid_zone: 'S3-South',
    renewable_percentage: 92.0,
    distance_km: 1.5
  },
  {
    id: 'offer-5021',
    node_id: 'NODE-5021',
    price_per_kwh: 6.10,
    quantity_kwh: 14.00,
    seller_name: 'Malleshwaram Solar Co-op',
    node_name: 'Malleshwaram Solar Co-op Hub',
    grid_zone: 'S4-West',
    renewable_percentage: 98.0,
    distance_km: 1.9
  },
  {
    id: 'offer-4015',
    node_id: 'NODE-4015',
    price_per_kwh: 7.10,
    quantity_kwh: 35.00,
    seller_name: 'BESCOM Grid Buffer (Central)',
    node_name: 'BESCOM Central Substation Feeder #4',
    grid_zone: 'Central-Hub',
    renewable_percentage: 82.0,
    distance_km: 0.0
  }
];

export default function BuyView() {
  const {
    currentUser,
    offers,
    nodes,
    profiles,
    selectedOfferForBuy,
    setSelectedOfferForBuy,
    setActiveReceiptOrder,
    refreshData,
    setCurrentView
  } = useApp();

  const availableOffers = (offers && offers.length > 0) ? offers : VERIFIED_PEER_OFFERS;
  const defaultOffer = selectedOfferForBuy || availableOffers[0];

  const [activeOffer, setActiveOffer] = useState(defaultOffer);
  const [quantityKwh, setQuantityKwh] = useState(5.0);

  // Order Placement & Protocol Stepper State
  const [orderStage, setOrderStage] = useState('IDLE');
  const [activeOrderData, setActiveOrderData] = useState(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const pricePerKwh = Number(activeOffer.price_per_kwh || 5.80);
  const energyTotal = Number((quantityKwh * pricePerKwh).toFixed(2));
  const wheelingCharge = Number((quantityKwh * 0.15).toFixed(2));
  const regulatoryCess = 0.05;
  const grandTotal = Number((energyTotal + wheelingCharge + regulatoryCess).toFixed(2));
  const co2AvoidedKg = Number((quantityKwh * 0.54).toFixed(2));
  const gridStandardTariff = 7.80;
  const savingsVsGrid = Number(((gridStandardTariff - pricePerKwh) * quantityKwh).toFixed(2));

  // Handler: Initiate Buy Order (Triggered by EXECUTE button)
  const handleInitiateBuy = async () => {
    setErrorMsg('');
    if (!quantityKwh || quantityKwh <= 0) {
      setErrorMsg('Please enter a valid amount of kWh to purchase.');
      return;
    }

    setIsProcessing(true);
    setOrderStage(BECKN_STATES.DISCOVERED);

    try {
      const seller = profiles.find((p) => p.id === activeOffer.seller_id) || profiles[0] || {
        id: 'usr-nitk-01',
        name: activeOffer.seller_name || 'NITK Solar Research Park',
        full_name: activeOffer.seller_name || 'NITK Solar Research Park',
        upi_id: 'nitksolar@icici'
      };
      const node = nodes.find((n) => n.id === activeOffer.node_id) || nodes[0] || {
        id: activeOffer.node_id || 'NODE-2010',
        smart_meter_id: 'SM-SUR-2010-P2P'
      };
      const buyer = currentUser || {
        id: 'usr-buyer',
        name: 'Priya Nayak',
        full_name: 'Priya Nayak',
        upi_id: 'priya@okhdfcbank'
      };

      // 1. Discover
      const discoverRes = await becknDiscover({
        buyer,
        zone: activeOffer.grid_zone || 'S1-North',
        requiredKwh: quantityKwh
      });

      setOrderStage(BECKN_STATES.QUOTED);

      // 2. Quote
      const quoteRes = await becknQuote({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        buyer,
        seller,
        node,
        offer: activeOffer,
        quantityKwh
      });

      // 3. Init
      const initRes = await becknInit({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        buyer,
        totalAmount: grandTotal
      });

      setActiveOrderData({
        orderId: discoverRes.orderId,
        bapId: discoverRes.bapId,
        bppId: discoverRes.bppId,
        seller,
        node,
        buyer,
        upiMandateId: initRes.upiMandateId,
        quoteRes
      });

      setIsProcessing(false);
      setIsUpiModalOpen(true);
    } catch (err) {
      console.error('Buy flow error:', err);
      setErrorMsg('Failed to establish Beckn connection. Please retry.');
      setIsProcessing(false);
      setOrderStage('IDLE');
    }
  };

  // Handler: When UPI MPIN is authorized
  const handleUpiAuthorization = async (enteredPin) => {
    setIsProcessing(true);
    setIsUpiModalOpen(false);
    setOrderStage(BECKN_STATES.AUTHORIZED);

    try {
      const activeData = activeOrderData || {};
      const orderId = activeData.orderId || `ord-${Date.now()}`;
      const bapId = activeData.bapId || 'janurja.bap.client';
      const bppId = activeData.bppId || 'janurja.bpp.node1042';
      const seller = activeData.seller || profiles.find((p) => p.id === activeOffer.seller_id) || {
        id: 'usr-nitk-01',
        name: activeOffer.seller_name || 'NITK Solar Research Park',
        full_name: activeOffer.seller_name || 'NITK Solar Research Park',
        upi_id: 'nitksolar@icici'
      };
      const node = activeData.node || nodes.find((n) => n.id === activeOffer.node_id) || {
        id: activeOffer.node_id || 'NODE-2010',
        smart_meter_id: 'SM-SUR-2010-P2P'
      };
      const buyer = activeData.buyer || currentUser || {
        id: 'usr-buyer',
        name: 'Priya Nayak',
        full_name: 'Priya Nayak',
        upi_id: 'priya@okhdfcbank'
      };
      const upiMandateId = activeData.upiMandateId || `UPI-MAND-${Date.now().toString().slice(-6)}-OKSBI`;

      // 4. Authorize
      await becknAuthorize({
        orderId,
        bapId,
        bppId,
        buyer,
        seller,
        totalAmount: grandTotal,
        upiMandateId,
        pin: enteredPin || '1234'
      });

      setOrderStage(BECKN_STATES.ALLOCATED);

      // 5. Allocate
      await becknAllocate({
        orderId,
        bapId,
        bppId,
        buyer,
        seller,
        node,
        quantityKwh
      });

      setOrderStage(BECKN_STATES.SETTLED);

      // 6. Settle
      const settledOrder = await becknSettle({
        orderId,
        bapId,
        bppId,
        buyer,
        seller,
        node,
        quantityKwh,
        totalAmount: grandTotal,
        pricePerKwh,
        co2AvoidedKg
      });

      setIsProcessing(false);
      if (typeof refreshData === 'function') refreshData();

      setActiveReceiptOrder({
        id: orderId,
        transaction_id: settledOrder?.upiTxnRef || settledOrder?.transaction_id || `TXN-UEI-${Date.now().toString().slice(-8)}`,
        quantity_kwh: quantityKwh,
        price_per_kwh: pricePerKwh,
        total_amount: grandTotal,
        wheeling_charge: wheelingCharge,
        discom_fee: regulatoryCess,
        co2_avoided_kg: co2AvoidedKg,
        seller_name: seller.full_name || seller.name || activeOffer.seller_name || 'NITK Solar Research Park',
        buyer_name: buyer.full_name || buyer.name || 'Priya Nayak',
        protocol_state: 'SETTLED',
        settled_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Settlement error:', err);
      setErrorMsg('Failed to complete UPI settlement: ' + (err?.message || 'Please retry.'));
      setIsProcessing(false);
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
            Universal Energy Interface (UEI) • Order Placement
          </p>
        </div>
      </div>

      {/* 2. MAIN BUY FORM CANVAS (Reference UI Image 2) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">

        {/* Center Interaction: Capsule + Input Field */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          
          {/* Left Capsule: Amount of KW/h Being Bought */}
          <div className="bg-[#154533] rounded-[32px] sm:rounded-[36px] p-7 sm:p-8 text-white shadow-xl min-w-[280px] sm:min-w-[320px] border border-[#11382A]">
            <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-white">
              Amount of KW/h
            </span>
            <span className="text-2xl sm:text-3xl font-black block leading-tight tracking-tight text-emerald-100 mt-1">
              Being Bought
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

        {/* Error message if any */}
        {errorMsg && (
          <div className="max-w-md mx-auto p-3 rounded-2xl bg-rose-100 text-rose-800 text-xs font-bold text-center border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* EXECUTE BUTTON (Reference UI Image 2) */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleInitiateBuy}
            disabled={isProcessing || quantityKwh <= 0}
            className="bg-[#4A7C59] hover:bg-[#3D694A] active:bg-[#32573D] disabled:opacity-50 text-white px-16 sm:px-20 py-4 sm:py-4.5 rounded-full font-black text-base sm:text-lg uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-102 flex items-center space-x-3"
          >
            {isProcessing ? (
              <span>PROCESSING...</span>
            ) : (
              <span>EXECUTE</span>
            )}
          </button>
        </div>

      </div>

      {/* 3. LOWER SECTION CONTAINER (Rounded top dark sage container) */}
      <div className="w-full bg-[#587550] rounded-t-[44px] sm:rounded-t-[56px] px-6 sm:px-12 py-12 shadow-2xl mt-8 border-t border-[#476040]/30 text-[#163A1D]">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Real-time Order Economics Breakdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 text-white">
            <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-300" />
              Real-time Order Economics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-emerald-200 font-bold uppercase">Rate per Unit</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{pricePerKwh.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-300">Clean solar tariff</p>
              </div>

              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-emerald-200 font-bold uppercase">Wheeling Fee</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{wheelingCharge.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-300">₹0.15/kWh to DISCOM</p>
              </div>

              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-amber-200 font-bold uppercase">Estimated Bill</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{grandTotal.toFixed(2)}</p>
                <p className="text-[10px] text-amber-300">Instant UPI AutoPay</p>
              </div>

              <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
                <p className="text-[11px] text-sky-200 font-bold uppercase">Your Savings</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{savingsVsGrid.toFixed(2)}</p>
                <p className="text-[10px] text-sky-300">vs commercial grid</p>
              </div>
            </div>
          </div>

          {/* Select Available Verified Peer Solar Listings */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  Select Verified Peer Seller Offer
                </h4>
                <p className="text-xs text-slate-500">
                  Energy will be drawn over physical 11kV BESCOM feeder wires
                </p>
              </div>
              <span className="text-xs font-bold text-[#154533] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {availableOffers.length} Nodes Live
              </span>
            </div>

            <div className="space-y-2.5">
              {availableOffers.slice(0, 4).map((offer) => {
                const isSelected = activeOffer.id === offer.id;
                return (
                  <div
                    key={offer.id}
                    onClick={() => setActiveOffer(offer)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-[#154533] shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#154533] text-white flex items-center justify-center font-bold text-sm">
                        ☀️
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-sm text-slate-900">
                            {offer.seller_name || 'Solar Research Park'}
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {offer.grid_zone || 'S1-North'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {offer.quantity_kwh} kWh available • {offer.renewable_percentage || 98}% Renewable
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-black text-base text-[#154533]">
                          ₹{Number(offer.price_per_kwh).toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-500">/unit</span>
                        </p>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#154533] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Mock UPI Authorization Modal */}
      <MockUpiModal
        isOpen={isUpiModalOpen}
        onClose={() => {
          setIsUpiModalOpen(false);
          setIsProcessing(false);
        }}
        onAuthorize={handleUpiAuthorization}
        onConfirmPin={handleUpiAuthorization}
        orderDetails={{
          sellerName: activeOrderData?.seller?.name || activeOrderData?.seller?.full_name || activeOffer.seller_name || 'NITK Solar Research Park',
          sellerVpa: activeOrderData?.seller?.upi_id || 'nitksolar@icici',
          totalAmount: grandTotal,
          quantityKwh: quantityKwh,
          pricePerKwh: pricePerKwh,
          co2AvoidedKg: co2AvoidedKg
        }}
        amount={grandTotal}
        payeeVpa={activeOrderData?.seller?.upi_id || 'nitksolar@icici'}
        payeeName={activeOrderData?.seller?.name || activeOffer.seller_name || 'NITK Solar Research Park'}
        unitsKwh={quantityKwh}
        ratePerKwh={pricePerKwh}
        isProcessing={isProcessing}
      />

    </div>
  );
}
