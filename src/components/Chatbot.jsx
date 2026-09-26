// ==============================================================================
// JanUrja AI Chatbot Assistant
// Trained on Top 12 FAQs regarding P2P Solar Energy Trading, Beckn UEI Protocol,
// DISCOM wheeling fees, UPI settlements, Agentic Pricing, and Grid stability.
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  ChevronDown,
  HelpCircle,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// Knowledge base of 12 frequently asked questions with keywords and rich answers
export const JANURJA_FAQ_KNOWLEDGE_BASE = [
  {
    id: 1,
    shortTitle: 'What is JanUrja?',
    question: 'What is JanUrja and how does it work?',
    keywords: [
      'what is janurja',
      'about janurja',
      'explain janurja',
      'what does janurja do',
      'overview',
      'dpi',
      'public infrastructure',
      'janurja'
    ],
    answer:
      '⚡ **JanUrja** is an open **Decentralized Public Infrastructure (DPI)** for peer-to-peer (P2P) solar energy trading — functioning as the **"UPI for Clean Electricity"**.\n\nIt enables rooftop solar producers, prosumers, and residential/commercial consumers across Bengaluru to trade surplus clean electricity directly through the open **Beckn Unified Energy Interface (UEI)** without intermediaries.',
    category: 'General'
  },
  {
    id: 2,
    shortTitle: 'How P2P Trading Works',
    question: 'How does peer-to-peer (P2P) solar energy trading work?',
    keywords: [
      'how does it work',
      'how p2p works',
      'peer to peer',
      'how trading works',
      'workflow',
      'process',
      'trade energy',
      'mechanism'
    ],
    answer:
      '🔄 **P2P Solar Trading Workflow:**\n1. **Surplus Generation:** Rooftop solar panels generate surplus kWh measured by IoT smart meters.\n2. **Network Discovery:** The prosumer node broadcasts an open energy offer over Beckn UEI.\n3. **Matching & Contract:** A local buyer selects the offer; JanUrja automatically drafts a Beckn smart contract.\n4. **Physical Wheeling:** Power flows over the existing 11kV BESCOM neighborhood wires.\n5. **Instant UPI Settlement:** Buyer funds transfer directly to the seller VPA with automatic DISCOM fee deduction.',
    category: 'Trading'
  },
  {
    id: 3,
    shortTitle: 'Beckn & UEI Protocol',
    question: 'What is the Unified Energy Interface (UEI) and Beckn Protocol?',
    keywords: [
      'beckn',
      'uei',
      'protocol',
      'unified energy interface',
      'spec',
      'open standard',
      'ondc',
      'architecture'
    ],
    answer:
      '🌐 **UEI (Unified Energy Interface)** is an open, decentralized network protocol powered by the **Beckn Protocol** (the same foundational protocol standardizing ONDC in India).\n\nIt defines 5 standard API schemas:\n• `search` – Discover available energy offers in the local grid\n• `select` – Choose energy volume (kWh) and delivery slot\n• `init` – Initialize transaction terms & wheeling path\n• `confirm` – Lock atomic payment & execute contract\n• `status` – Real-time IoT meter verification & telemetry',
    category: 'Protocol'
  },
  {
    id: 4,
    shortTitle: 'UPI & Payments',
    question: 'How are payments and financial settlements processed?',
    keywords: [
      'payment',
      'settlement',
      'upi',
      'autopay',
      'money',
      'vpa',
      'wallet',
      'transactions',
      'how to pay',
      'banking'
    ],
    answer:
      '💳 **Atomic UPI Settlements:**\n• All trades settle instantly via **NPCI Unified Payments Interface (UPI AutoPay)**.\n• Once energy flow is verified by smart meters, payment moves directly from the buyer to the seller\'s Virtual Payment Address (e.g. `seller@okaxis`).\n• JanUrja programmatically splits and disburses the statutory ₹0.15/kWh wheeling charge to the DISCOM during transaction finalization.',
    category: 'Finances'
  },
  {
    id: 5,
    shortTitle: 'DISCOM Role & Wheeling',
    question: 'What is the role of the DISCOM (BESCOM / MESCOM)?',
    keywords: [
      'discom',
      'bescom',
      'mescom',
      'utility',
      'grid',
      'wheeling',
      'wheeling fee',
      'charges per kwh',
      'carrier',
      'substation'
    ],
    answer:
      '🏢 **DISCOM Partnership & Grid Wheeling:**\n• The local utility (e.g., **BESCOM** in Bengaluru) acts as the licensed physical wires carrier over 11kV distribution networks.\n• For every unit (kWh) wheeled between neighbors, the DISCOM earns an automated **wheeling charge of ₹0.15/kWh**.\n• This converts DISCOMs from vulnerable utilities losing revenue into high-margin platform carriers while avoiding costly substation upgrades.',
    category: 'Utility'
  },
  {
    id: 6,
    shortTitle: 'Savings & Earnings',
    question: 'How much money can buyers save and sellers earn?',
    keywords: [
      'save',
      'earn',
      'savings',
      'earnings',
      'cost',
      'tariff',
      'profit',
      'price',
      'how much money',
      'roi',
      'benefit'
    ],
    answer:
      '💰 **Economics for Buyers and Sellers:**\n• **Buyers:** Purchase clean solar at **₹5.50 – ₹6.20/kWh**, saving **20% to 28%** compared to commercial/residential peak grid tariffs (₹8.50+/kWh).\n• **Sellers:** Earn **₹5.50 – ₹6.50/kWh**, which is **up to 100%+ higher** than traditional DISCOM net-metering feed-in tariffs (which typically pay only ₹2.80 – ₹3.10/kWh).',
    category: 'Finances'
  },
  {
    id: 7,
    shortTitle: 'Agentic AI Pricing',
    question: 'What is Agentic AI Pricing and how does it work?',
    keywords: [
      'agentic',
      'ai',
      'pricing',
      'dynamic pricing',
      'algorithm',
      'rules',
      'engine',
      'smart pricing',
      'agentic ai'
    ],
    answer:
      '🤖 **Agentic AI Dynamic Pricing:**\n• JanUrja embeds an autonomous AI engine that evaluates market conditions every 15 minutes.\n• It analyzes **solar irradiance, battery State of Charge (SoC), neighborhood peak demand**, and **local transformer congestion**.\n• Prosumers can provide natural language instructions (e.g., *"Maximize revenue during evening peak while undercutting grid tariff by 15%"*), and the agent automatically manages live bids.',
    category: 'AI'
  },
  {
    id: 8,
    shortTitle: 'Smart Meters & Hardware',
    question: 'What smart meters or hardware are required to participate?',
    keywords: [
      'smart meter',
      'hardware',
      'meter',
      'is 16444',
      'inverter',
      'device',
      'iot',
      'installation',
      'equipment'
    ],
    answer:
      '📟 **Hardware & Metering Standards:**\n• Requires a **BIS IS 16444 compliant bidirectional smart meter** equipped with cellular/NB-IoT or Wi-Fi communication.\n• Seamlessly interfaces with standard hybrid and on-grid solar inverters (Growatt, Sungrow, Enphase, SolarEdge, Havells).\n• Telemetry is digitally signed at the edge every 15 minutes to guarantee tamper-proof audit trails.',
    category: 'Hardware'
  },
  {
    id: 9,
    shortTitle: 'Duck Curve & Grid Stability',
    question: 'How does JanUrja help solve the solar Duck Curve and stabilize the grid?',
    keywords: [
      'duck curve',
      'grid stability',
      'frequency',
      'curtailment',
      'peak load',
      'blackout',
      'congestion',
      'solar drop'
    ],
    answer:
      '🦆 **Flattening the Solar Duck Curve:**\n• Midday solar over-generation leads to steep grid load valleys followed by extreme evening ramp-ups (the "Duck Curve").\n• JanUrja incentivizes hyper-local neighborhood consumption during peak midday solar and smart battery discharge during evening peak hours (6 PM – 10 PM).\n• This eliminates solar curtailment and prevents local distribution transformer thermal overload.',
    category: 'Grid'
  },
  {
    id: 10,
    shortTitle: 'How to Buy or Sell',
    question: 'How do I buy or sell solar energy on the platform?',
    keywords: [
      'how to buy',
      'how to sell',
      'buy energy',
      'sell solar',
      'order',
      'listing',
      'start trading',
      'how do i'
    ],
    answer:
      '🚀 **Quick Step-by-Step Guide:**\n• **To Buy Solar:** Click the top navbar **BUY ENERGY** button. Browse live listings across Bengaluru zones, specify kWh needed, and confirm via UPI.\n• **To Sell Solar:** Click the top navbar **SELL ENERGY** button. Enter your surplus units and price per unit, or activate **Agentic AI Pricing** to automate pricing based on sunshine and grid demand.',
    category: 'Trading'
  },
  {
    id: 11,
    shortTitle: 'CO₂ Offsets & Certificates',
    question: 'How are carbon emission offsets and green certificates verified?',
    keywords: [
      'carbon',
      'co2',
      'emissions',
      'green certificate',
      'certificate',
      'clean energy',
      'environment',
      'rec',
      'green'
    ],
    answer:
      '🌱 **Carbon Offset & Green Certification:**\n• Each 1 kWh of solar traded through JanUrja offsets approximately **0.54 kg of CO₂** compared to conventional coal thermal generation (per CEA guidelines).\n• Every trade issues a cryptographically signed **Green Energy Certificate** and digital receipt showing transaction hash, exact solar node, and verified carbon savings.',
    category: 'Environment'
  },
  {
    id: 12,
    shortTitle: 'Security & Privacy',
    question: 'How secure is my account and transaction data?',
    keywords: [
      'security',
      'secure',
      'privacy',
      'safe',
      'supabase',
      'rls',
      'auth',
      'encryption',
      'hack',
      'protection'
    ],
    answer:
      '🔒 **Multi-Layered Security:**\n• **Enterprise Database Security:** Protected by PostgreSQL Row-Level Security (RLS) policies guaranteeing strict tenant data isolation.\n• **Authentication:** Managed by Supabase Auth with tokenized sessions and encrypted credentials.\n• **Audit Trail:** Smart meter cryptographic intervals prevent double-spending or fictitious trade logs.',
    category: 'Security'
  }
];

// Helper to calculate question match score
function matchQuestion(query) {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return null;

  // Handle common greetings
  if (['hi', 'hello', 'hey', 'namaste', 'greetings', 'who are you', 'help'].includes(cleanQuery)) {
    return {
      type: 'greeting',
      message:
        "Hello! 👋 I'm **JanUrja AI**, your solar energy and Beckn UEI guide. I can answer questions about peer-to-peer solar trading, DISCOM wheeling fees, UPI payments, Agentic AI pricing, smart meters, and how to buy or sell clean energy. Select a question below or ask me anything!"
    };
  }

  // Tokenize user query
  const queryTokens = cleanQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let bestMatch = null;
  let highestScore = 0;
  let allScores = [];

  for (const item of JANURJA_FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    const lowerQuestion = item.question.toLowerCase();
    const lowerAnswer = item.answer.toLowerCase();

    // 1. Direct question substring or equality
    if (lowerQuestion.includes(cleanQuery) || cleanQuery.includes(lowerQuestion)) {
      score += 60;
    }

    // 2. Keyword exact matches
    for (const kw of item.keywords) {
      if (cleanQuery.includes(kw)) {
        score += 25;
      }
    }

    // 3. Token overlap with keywords
    for (const token of queryTokens) {
      if (item.keywords.some((kw) => kw.includes(token))) {
        score += 8;
      }
      if (lowerQuestion.includes(token)) {
        score += 6;
      }
      if (lowerAnswer.includes(token)) {
        score += 2;
      }
    }

    allScores.push({ item, score });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold check
  if (highestScore >= 12 && bestMatch) {
    // Collect 2 secondary suggestions
    const secondary = allScores
      .filter((s) => s.item.id !== bestMatch.id && s.score > 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((s) => s.item);

    return {
      type: 'match',
      item: bestMatch,
      related: secondary
    };
  }

  return {
    type: 'fallback',
    message:
      "I couldn't find an exact match for that specific question, but I am trained on JanUrja's P2P solar trading, Beckn UEI protocol, DISCOM wheeling tariffs, and UPI settlements. Here are some of the most frequently asked topics you can explore:"
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text:
        "👋 Welcome to **JanUrja AI Assistant**!\n\nI am trained on the most frequently asked questions about peer-to-peer solar trading, Beckn UEI Protocol, DISCOM wheeling fees, and UPI settlements.\n\nHow can I help you today?",
      suggestions: [
        'What is JanUrja?',
        'How does P2P trading work?',
        'How much can I save/earn?',
        'What is Beckn UEI?'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!query || !query.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const matchResult = matchQuestion(query);

      let botMsg;
      if (matchResult.type === 'greeting') {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: matchResult.message,
          suggestions: [
            'What is JanUrja?',
            'How does P2P trading work?',
            'What is Agentic AI Pricing?',
            'How are payments handled?'
          ]
        };
      } else if (matchResult.type === 'match') {
        const relatedTitles = matchResult.related.map((r) => r.shortTitle || r.question);
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: matchResult.item.answer,
          matchedQuestion: matchResult.item.question,
          category: matchResult.item.category,
          suggestions: relatedTitles.length > 0 ? relatedTitles : ['How to Buy or Sell', 'Duck Curve & Grid Stability']
        };
      } else {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: matchResult.message,
          suggestions: [
            'What is JanUrja?',
            'How does P2P trading work?',
            'Savings & Earnings',
            'DISCOM Role & Wheeling',
            'Smart Meters & Hardware'
          ]
        };
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text:
          "👋 Welcome back! Ask me any question regarding JanUrja P2P solar trading, Beckn protocol, tariffs, or UPI payments.",
        suggestions: [
          'What is JanUrja?',
          'How does P2P trading work?',
          'How much can I save/earn?',
          'What is Beckn UEI?'
        ]
      }
    ]);
  };

  // Helper to format text with bold, bullet points, and clean typography
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      // Bold replacer: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-emerald-950">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed text-[13px] my-0.5'}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button (Replaces Beckn UEI Stream button in bottom right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group px-4 py-3 rounded-full bg-[#154533] hover:bg-[#1C5540] text-white shadow-xl shadow-black/25 flex items-center space-x-2.5 border border-emerald-400/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
          title="Open JanUrja AI Assistant (Trained on FAQs)"
          aria-label="Open JanUrja AI Assistant"
        >
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white p-0.5 overflow-hidden shadow-xs">
            <img src="/logo.png" alt="JanUrja" className="w-full h-full object-contain" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-[#154533]" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black tracking-wide font-sans block">Jan-Urja AI</span>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
            Ask AI
          </span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[calc(100vh-5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Header */}
          <div className="bg-[#154533] text-white px-4 py-3.5 flex items-center justify-between flex-shrink-0 shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-inner overflow-hidden">
                <img src="/logo.png" alt="JanUrja Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-white leading-tight">JanUrja AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-tight">
                  Trained on 12 Core P2P Energy & Beckn FAQs
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Suggestion Bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar flex-shrink-0 text-[11px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center flex-shrink-0 pl-1">
              <Sparkles className="w-3 h-3 text-amber-500 mr-1" /> FAQs:
            </span>
            {JANURJA_FAQ_KNOWLEDGE_BASE.slice(0, 5).map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleSendMessage(faq.question)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 transition-all font-medium text-[11px] cursor-pointer"
              >
                {faq.shortTitle}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFCFB]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#1B4D3E] to-[#256B57] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {/* Category / Question Header if matched */}
                  {msg.matchedQuestion && (
                    <div className="mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-800 line-clamp-1">
                        {msg.matchedQuestion}
                      </span>
                      {msg.category && (
                        <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
                          {msg.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="space-y-1">
                    {msg.sender === 'user' ? (
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>
                </div>

                {/* Follow-up Interactive Suggestion Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 border border-slate-200/80 text-[11px] font-medium transition-all shadow-2xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>{suggestion}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 w-20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.3s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200/90 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about P2P solar, Beckn, tariffs..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-150 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#256B57] disabled:opacity-40 text-white shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 font-mono">
              <span>Trained on 12 Top JanUrja Questions</span>
              <span>Beckn UEI v1.1.0</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
