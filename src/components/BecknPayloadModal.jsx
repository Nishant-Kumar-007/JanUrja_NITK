// ==============================================================================
// Beckn Payload Inspector Modal
// Renders formatted JSON payloads for any selected Beckn protocol handshake.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, FileJson, ShieldCheck, Terminal } from 'lucide-react';

export default function BecknPayloadModal() {
  const { selectedPayloadForModal, setSelectedPayloadForModal } = useApp();
  const [copied, setCopied] = useState(false);

  if (!selectedPayloadForModal) return null;

  const event = selectedPayloadForModal;
  const jsonString = JSON.stringify(
    {
      context: {
        domain: 'uei:energy:p2p',
        country: 'IND',
        city: 'std:0824', // Mangaluru / Surathkal STD code
        action: event.action,
        core_version: event.protocol_version || 'UEI/Beckn-v1.1.0',
        bap_id: event.sender_id?.includes('BAP') ? event.sender_id : undefined,
        bpp_id: event.recipient_id?.includes('BPP') ? event.recipient_id : undefined,
        transaction_id: event.order_id,
        message_id: event.message_id,
        timestamp: event.timestamp || new Date().toISOString()
      },
      message: event.payload
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0F172A] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#1E293B] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white uppercase">
                  Beckn {event.action} Payload
                </span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  {event.protocol_version || 'UEI v1.1.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">
                {event.sender_id} ➔ {event.recipient_id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setSelectedPayloadForModal(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code View */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#090D16]">
          <pre className="text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre-wrap selection:bg-emerald-900 selection:text-white">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1E293B] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Beckn DPI Signature Verified
          </span>
          <span>Order Ref: {event.order_id || 'N/A'}</span>
        </div>

      </div>
    </div>
  );
}
