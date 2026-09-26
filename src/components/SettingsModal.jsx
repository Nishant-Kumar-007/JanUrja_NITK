// ==============================================================================
// Settings & Supabase Configuration Modal
// Enables live Supabase project configuration, seed reset, and database audit.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/supabaseClient';
import { X, Database, ShieldCheck, RefreshCw, Key, Check, AlertTriangle, ExternalLink } from 'lucide-react';

export default function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, resetDatabaseToInitial } = useApp();
  const credentials = db.getCredentials();

  const [url, setUrl] = useState(localStorage.getItem('janurja_custom_supabase_url') || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('janurja_custom_supabase_key') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    db.configureCredentials(url, anonKey);
    setSavedSuccess(true);
  };

  const handleClearCredentials = () => {
    db.configureCredentials('', '');
    setUrl('');
    setAnonKey('');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all nodes, orders, transactions, and offers back to NITK Surathkal demo state?')) {
      resetDatabaseToInitial();
      alert('Database restored to initial state!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">JanUrja Infrastructure Settings</h3>
              <p className="text-xs text-slate-400">Supabase Backend & DPI Config</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Current Connection Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Database Engine Status
              </span>
              <p className="font-extrabold text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
                {credentials.isLive ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected to Supabase Cloud
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Local High-Speed Persistence (Offline Demo Mode)
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {credentials.isLive
                  ? 'Real-time WebSocket replication active on Supabase Postgres tables.'
                  : 'Zero external dependencies required. Ready for instant presentation.'}
              </p>
            </div>
          </div>

          {/* Connect Live Supabase Project */}
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                Connect Live Supabase Project (Optional)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Run <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">supabase/schema.sql</code> in your Supabase SQL Editor, then paste your credentials here:
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#246B56] text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save & Connect
              </button>
              {(url || anonKey) && (
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Reset Demo Data Action */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-xs text-slate-800">Restore Default Seed Data</h5>
                <p className="text-[11px] text-slate-500">
                  Resets microgrid nodes, orders, and clean protocol audit logs.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                Reset Data
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>NITK Surathkal • Build for Billions</span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="font-bold text-[#1B4D3E] hover:underline"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
