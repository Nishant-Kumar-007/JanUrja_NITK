// ==============================================================================
// Live Protocol Monitor Component (Developer-Style Drawer & Beckn Visualizer)
// Subscribed in real-time to protocol_events; displays timestamped handshakes,
// animated Beckn architecture topology, and raw JSON payload inspector.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Activity,
  Terminal,
  Code2,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  Sun,
  Home,
  Zap,
  Building,
  Radio,
  FileJson,
  RotateCcw
} from 'lucide-react';

export default function LiveProtocolMonitor() {
  const {
    isProtocolMonitorOpen,
    setIsProtocolMonitorOpen,
    protocolEvents,
    setSelectedPayloadForModal
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('ALL');

  if (!isProtocolMonitorOpen) return null;

  const filteredEvents = activeFilter === 'ALL'
    ? protocolEvents
    : protocolEvents.filter((e) => e.action?.toLowerCase() === activeFilter.toLowerCase());

  const getActionBadge = (action) => {
    switch (action) {
      case 'search':
      case 'on_search':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'select':
      case 'on_select':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'init':
      case 'on_init':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'confirm':
      case 'on_confirm':
      case 'settle':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'allocate':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0F172A] text-slate-100 shadow-2xl border-l border-slate-700/80 flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#1E293B]/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Terminal className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white tracking-wide">
                UEI / Beckn Live Protocol Stream
              </h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Realtime WebSocket stream • Beckn Protocol v1.1.0
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsProtocolMonitorOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Animated Node Graph Topology */}
      <div className="p-3 bg-[#0B1120] border-b border-slate-800">
        <p className="text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          Active Beckn Network Mesh Topology
        </p>

        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
          {/* Solar Rooftop (BPP) */}
          <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/40 relative overflow-hidden group">
            <Sun className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <p className="font-bold text-emerald-300">Rooftop BPP</p>
            <p className="text-[9px] text-slate-500">Node #1042</p>
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          </div>

          {/* Beckn Gateway */}
          <div className="p-2 rounded-lg bg-slate-900 border border-sky-500/40 relative overflow-hidden">
            <Zap className="w-4 h-4 mx-auto text-sky-400 mb-1" />
            <p className="font-bold text-sky-300">UEI Gateway</p>
            <p className="text-[9px] text-slate-500">Registry BAP/BPP</p>
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></div>
          </div>

          {/* Consumer (BAP) */}
          <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/40 relative overflow-hidden">
            <Home className="w-4 h-4 mx-auto text-amber-300 mb-1" />
            <p className="font-bold text-amber-300">Bakery BAP</p>
            <p className="text-[9px] text-slate-500">Node #1088</p>
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-400"></div>
          </div>

          {/* Main Grid DISCOM */}
          <div className="p-2 rounded-lg bg-slate-900 border border-purple-500/40 relative overflow-hidden">
            <Building className="w-4 h-4 mx-auto text-purple-400 mb-1" />
            <p className="font-bold text-purple-300">MESCOM RTU</p>
            <p className="text-[9px] text-slate-500">Substation</p>
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
          </div>
        </div>
      </div>

      {/* Action Filters Bar */}
      <div className="px-4 py-2 bg-[#1E293B]/50 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          {['ALL', 'search', 'select', 'init', 'confirm', 'allocate'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                activeFilter === filter
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono text-slate-400 flex-shrink-0 ml-2">
          {filteredEvents.length} events
        </span>
      </div>

      {/* Scrollable Events Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
            <p>No protocol handshakes recorded yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Place a buy or sell order to watch live Beckn protocol events.
            </p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const isClickable = Boolean(event.payload);
            return (
              <div
                key={event.id || idx}
                onClick={() => isClickable && setSelectedPayloadForModal(event)}
                className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all ${
                  isClickable ? 'cursor-pointer hover:bg-slate-800/80 group' : ''
                }`}
              >
                {/* Event Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getActionBadge(
                        event.action
                      )}`}
                    >
                      {event.action}
                    </span>
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {event.timestamp || 'Just now'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
                      <FileJson className="w-3 h-3" /> View JSON
                    </span>
                  </div>
                </div>

                {/* Handshake Route */}
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-300 truncate my-1">
                  <span className="font-semibold text-sky-400 truncate max-w-[140px]">
                    {event.sender_id || 'BAP'}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="font-semibold text-emerald-400 truncate max-w-[140px]">
                    {event.recipient_id || 'BPP'}
                  </span>
                </div>

                {/* Micro Payload Preview */}
                {event.payload && (
                  <div className="mt-2 p-1.5 rounded bg-black/40 text-[10px] text-slate-400 truncate border border-slate-800/80 font-mono">
                    {JSON.stringify(event.payload).slice(0, 95)}...
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#0B1120] border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>Beckn Core Schema 1.1.0 (UEI Specification)</span>
        <span className="text-emerald-400">● Live Stream Enabled</span>
      </div>

    </div>
  );
}
