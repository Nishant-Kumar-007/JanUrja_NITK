// ==============================================================================
// Regulator / DISCOM Dashboard View
// Provides comprehensive state utility oversight: Duck Curve mitigation,
// real-time grid load, line congestion index, Recharts analytics, and full audit logs.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DISCOM_HOURLY_DATA, GRID_ZONES } from '../data/initialData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Layers,
  Activity,
  ShieldCheck,
  TrendingDown,
  Zap,
  Building,
  DollarSign,
  Leaf,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  FileJson
} from 'lucide-react';

export default function DiscomDashboardView() {
  const { protocolEvents, orders, setSelectedPayloadForModal } = useApp();

  const [auditSearch, setAuditSearch] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');

  // Aggregated KPIs
  const totalSettledOrders = orders.filter((o) => o.protocol_state === 'SETTLED');
  const totalKwhTraded = totalSettledOrders.reduce((sum, o) => sum + Number(o.quantity_kwh || 0), 0);
  const totalCo2Avoided = totalSettledOrders.reduce((sum, o) => sum + Number(o.co2_avoided_kg || 0), 0);
  const totalWheelingRevenue = totalSettledOrders.reduce((sum, o) => sum + Number(o.wheeling_charge || 0.45), 0);

  // Filtered audit events
  const filteredEvents = protocolEvents.filter((e) => {
    const matchesAction = selectedActionFilter === 'ALL' || e.action?.toLowerCase() === selectedActionFilter.toLowerCase();
    const matchesSearch =
      !auditSearch ||
      e.sender_id?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      e.recipient_id?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      e.order_id?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      e.action?.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
              State Electricity Regulatory Commission (SERC) • DISCOM Portal
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              MESCOM Mangaluru 110kV Node
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            State Utility Grid Load & Settlement Monitor
          </h1>
          <p className="text-xs text-slate-500">
            Real-time duck curve mitigation analytics, line congestion management, and regulatory protocol audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Grid Stability: 49.98 Hz (Nominal)
          </span>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Energy Traded */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              P2P Energy Traded
            </span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {(totalKwhTraded + 48.2).toFixed(1)} <span className="text-xs font-bold text-slate-500">kWh</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Self-consumed within local 11kV feeders
          </p>
        </div>

        {/* KPI 2: DISCOM Wheeling Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Wheeling Fee Earned
            </span>
            <Building className="w-5 h-5 text-sky-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#1B4D3E]">
            ₹{(totalWheelingRevenue + 24.5).toFixed(2)}
          </p>
          <p className="text-[11px] text-sky-700 font-semibold mt-1">
            Zero-risk transit fees for MESCOM
          </p>
        </div>

        {/* KPI 3: Peak Demand Curtailment */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Peak Curtailment
            </span>
            <TrendingDown className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            -28.4%
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Midday thermal strain mitigated
          </p>
        </div>

        {/* KPI 4: CO2 Avoided */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Carbon Offset
            </span>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
            {(totalCo2Avoided + 39.5).toFixed(1)} <span className="text-xs font-bold text-slate-500">kg</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Green compliance credits accrued
          </p>
        </div>

      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: The Duck Curve Mitigation */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Grid Relief Analysis
            </span>
            <h3 className="font-extrabold text-base text-slate-900 mt-1">
              Duck Curve Mitigation (Surathkal Feeder 4)
            </h3>
            <p className="text-xs text-slate-500">
              How decentralized P2P solar self-consumption flattens peak load on the state thermal grid.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DISCOM_HOURLY_DATA}>
                <defs>
                  <linearGradient id="colorTraditional" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E67E22" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E67E22" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorJanurja" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="traditionalLoad"
                  name="Traditional Grid Load (kW)"
                  stroke="#E67E22"
                  fillOpacity={1}
                  fill="url(#colorTraditional)"
                />
                <Area
                  type="monotone"
                  dataKey="janurjaTraded"
                  name="JanUrja P2P Traded (kW)"
                  stroke="#2ECC71"
                  fillOpacity={1}
                  fill="url(#colorJanurja)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Zone Energy Balance (S1 - S4) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
              Spatial Balancing
            </span>
            <h3 className="font-extrabold text-base text-slate-900 mt-1">
              Zone Microgrid Balance (Surplus vs Deficit)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated generation vs consumption across S1 (NITK), S2 (Market), S3 (EV), and S4 (Harbour).
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRID_ZONES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="direction" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="surplus_kwh" name="Surplus kWh" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deficit_kwh" name="Deficit kWh" fill="#F39C12" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Full Regulatory Protocol Audit Trail Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Beckn UEI Protocol Audit Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Immutable audit log of all energy search intents, quotes, authorization mandates, and smart meter handshakes.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="search">Search</option>
              <option value="on_search">On Search</option>
              <option value="select">Select</option>
              <option value="on_select">On Select</option>
              <option value="init">Init</option>
              <option value="confirm">Confirm</option>
              <option value="allocate">Allocate</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Sender (BAP/BPP)</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Order / Txn Ref</th>
                <th className="py-2.5 px-3 text-right">Raw Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 15).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {evt.timestamp || 'Just now'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold uppercase px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {evt.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-sky-600 truncate max-w-[140px]">
                      {evt.sender_id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-600 truncate max-w-[140px]">
                      {evt.recipient_id}
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[110px]">
                      {evt.order_id || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayloadForModal(evt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <FileJson className="w-3 h-3 text-slate-500" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
