import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Fauji Sahayak — embedded rule-based housing wizard (no external API).
 * Mirrors the logic from public/chatbot.js but renders inside a
 * centered liquid-glass modal that works on mobile AND desktop.
 */

/* ── Data (copied from chatbot.js) ── */
const HRA_LIMITS = {
  OR:      { max: 9000,  label: 'Other Rank (OR)',    icon: '🪖' },
  NCO:     { max: 11000, label: 'NCO / Havildar',     icon: '⭐' },
  JCO:     { max: 15000, label: 'JCO / Sub / Nb Sub', icon: '🎖️' },
  OFFICER: { max: 28000, label: 'Officer (Lt–Col)',    icon: '🌟' },
  SR_OFF:  { max: 40000, label: 'Senior Officer',      icon: '🏅' },
};

const CANTONMENTS = [
  'Pune','Delhi','Ambala','Secunderabad','Bengaluru','Meerut','Lucknow',
  'Jalandhar','Dehradun','Chandigarh','Jodhpur','Jaipur','Mhow','Jabalpur',
  'Belagavi','Kolkata','Guwahati','Pathankot','Ooty','Ranchi','Srinagar',
  'Jammu','Kochi','Udhampur','Leh','Bathinda','Bikaner','Bareilly','Roorkee',
  'Patna','Shillong','Vizag','Wellington','Allahabad','Prayagraj','Agra',
  'Mathura','Bhopal','Hyderabad','Chennai','Mumbai','Nagpur','Vadodara',
];

const FLOW = [
  {
    id: 'start',
    msg: '👋 Jai Hind! I\'m your AI Transfer Assistant.\n\nI\'ll help you find the perfect home for your next posting. Let\'s start — what\'s your rank category?',
    options: Object.entries(HRA_LIMITS).map(([k, v]) => ({
      label: `${v.icon} ${v.label}`,
      value: k,
    })),
    key: 'rank',
  },
  {
    id: 'station',
    msg: '📍 Got it! Now, which cantonment are you posting to?',
    freeText: true,
    placeholder: 'e.g. Pune, Ambala, Secunderabad…',
    key: 'station',
  },
  {
    id: 'bhk',
    msg: '🏠 What type of home does your family need?',
    options: [
      { label: '🛏️ PG / Room (Bachelor)', value: 'PG/Room' },
      { label: '🏠 1 BHK', value: '1BHK' },
      { label: '🏡 2 BHK', value: '2BHK' },
      { label: '🏘️ 3 BHK', value: '3BHK' },
      { label: '🔍 Show All Types', value: 'any' },
    ],
    key: 'bhk',
  },
  {
    id: 'budget',
    msg: (state) => {
      const limit = HRA_LIMITS[state.rank]?.max || 15000;
      return `💰 Your HRA limit is approx ₹${limit.toLocaleString()}/month.\nShould I filter within your HRA, or search a custom range?`;
    },
    options: (state) => {
      const limit = HRA_LIMITS[state.rank]?.max || 15000;
      return [
        { label: `✅ Within HRA (up to ₹${limit.toLocaleString()})`, value: 'hra' },
        { label: '🔼 Slightly above HRA (+20%)', value: 'above' },
        { label: '🔍 Show all prices', value: 'all' },
      ];
    },
    key: 'budget',
  },
];

/* ── Chat Bubble Component ── */
function ChatBubble({ sender, text }) {
  const isUser = sender === 'user';
  return (
    <div className={`flex flex-col max-w-[86%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
      <div
        className="rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap"
        style={
          isUser
            ? { background: 'linear-gradient(150deg,#059669,#10b981)', color: '#fff', borderRadius: '16px 16px 4px 16px' }
            : { background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--text)', borderRadius: '16px 16px 16px 4px' }
        }
      >
        {text}
      </div>
      <span className="text-[9px] mt-1 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {isUser ? 'You' : '● Secure Link'}
      </span>
    </div>
  );
}

/* ── Option Button ── */
function OptBtn({ label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-left cursor-pointer transition-colors"
      style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--text)' }}
    >
      {label}
    </motion.button>
  );
}

/* ── Listing Result Card ── */
function ListingCard({ listing, onOpen }) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(listing)}
      className="rounded-xl p-3 cursor-pointer transition-colors"
      style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)' }}
    >
      <div className="font-bold text-[13px]" style={{ color: 'var(--text)' }}>
        {listing.name || listing.type + ' ' + listing.city}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
          📍 {listing.area || 'Cantt Area'}, {listing.city}{listing.verified ? ' · ✅ Verified' : ''}
        </span>
        <span className="text-[14px] font-bold" style={{ color: 'var(--accent)' }}>
          ₹{(listing.price || 0).toLocaleString()}/mo
        </span>
      </div>
      {listing.distance && (
        <span className="text-[11px] mt-1 block" style={{ color: 'var(--muted)' }}>
          🚗 {listing.distance} km from gate
        </span>
      )}
    </motion.div>
  );
}

/* ── Main Modal ── */
export default function AiHelperModal({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'assistant', text: FLOW[0].msg },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [botState, setBotState] = useState({});
  const [input, setInput] = useState('');
  const [showOptions, setShowOptions] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showOptions, showInput, results]);

  /* ── Helpers ── */
  const addBotMsg = (text) => {
    setMessages((p) => [...p, { id: `b-${Date.now()}`, sender: 'assistant', text }]);
  };
  const addUserMsg = (text) => {
    setMessages((p) => [...p, { id: `u-${Date.now()}`, sender: 'user', text }]);
  };

  /* ── Wizard progression ── */
  const advanceStep = (key, value, displayLabel) => {
    addUserMsg(displayLabel || value);
    const newState = { ...botState, [key]: value };
    setBotState(newState);
    setShowOptions(false);
    setShowInput(false);
    setSuggestions([]);

    const nextIdx = currentStep + 1;
    if (nextIdx >= FLOW.length) {
      // All steps done → show results
      showResults(newState);
      return;
    }

    setTimeout(() => {
      const step = FLOW[nextIdx];
      const msg = typeof step.msg === 'function' ? step.msg(newState) : step.msg;
      addBotMsg(msg);
      setCurrentStep(nextIdx);

      if (step.freeText) {
        setShowInput(true);
        setTimeout(() => inputRef.current?.focus(), 200);
      } else {
        setShowOptions(true);
      }
    }, 350);
  };

  /* ── Station free-text submit ── */
  const submitStation = () => {
    const val = input.trim();
    if (val.length < 3) {
      addBotMsg('⚠️ Please type at least 3 letters of your cantonment name.');
      setInput('');
      return;
    }
    const lower = val.toLowerCase();
    const matched =
      CANTONMENTS.find((c) => c.toLowerCase().startsWith(lower)) ||
      CANTONMENTS.find((c) => c.toLowerCase().includes(lower));

    if (!matched) {
      addBotMsg(`❌ "${val}" is not a recognised cantonment.\n\nTry: Pune, Ambala, Bengaluru, Delhi, Secunderabad, Lucknow…`);
      setInput('');
      return;
    }
    advanceStep('station', matched, matched);
  };

  /* ── Autocomplete for station input ── */
  const handleStationInput = (val) => {
    setInput(val);
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const lower = val.trim().toLowerCase();
    const matches = CANTONMENTS.filter(
      (c) => c.toLowerCase().startsWith(lower) || c.toLowerCase().includes(lower)
    ).slice(0, 5);
    setSuggestions(matches);
  };

  /* ── Show results (rule-based filter from chatbot.js) ── */
  const showResults = (state) => {
    setShowOptions(false);
    setShowInput(false);
    addBotMsg('🔍 Searching listings…');

    setTimeout(() => {
      let allListings = [];
      if (window.__fauji_listings?.length) {
        allListings = window.__fauji_listings;
      } else if (window.state?.listings?.length) {
        allListings = window.state.listings;
      }

      const station = state.station || '';
      const bhk = state.bhk || 'any';
      const rank = state.rank || 'JCO';
      const budgetMode = state.budget || 'hra';
      const limit = HRA_LIMITS[rank]?.max || 15000;

      let maxPrice = limit;
      if (budgetMode === 'above') maxPrice = Math.round(limit * 1.2);
      if (budgetMode === 'all') maxPrice = 999999;

      let filtered = allListings.filter((l) => {
        const cityLower = (l.city || '').toLowerCase();
        const stationLower = station.toLowerCase();
        const cityMatch =
          !station ||
          cityLower === stationLower ||
          cityLower.startsWith(stationLower) ||
          stationLower.startsWith(cityLower) ||
          cityLower.includes(stationLower) ||
          (l.area || '').toLowerCase().includes(stationLower);
        const bhkMatch = bhk === 'any' || l.type === bhk;
        const priceMatch = l.price <= maxPrice;
        return cityMatch && bhkMatch && priceMatch;
      });

      filtered = filtered
        .sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);

      if (!filtered.length) {
        addBotMsg(`😔 No listings found in ${station} matching your criteria yet. Try a broader search or check back soon.`);
        setResults([]);
        return;
      }

      addBotMsg(`✅ Found ${filtered.length} listing${filtered.length > 1 ? 's' : ''} for ${HRA_LIMITS[rank]?.label || rank} in ${station}:`);
      setResults(filtered);
    }, 600);
  };

  /* ── Open listing detail ── */
  const openListing = (listing) => {
    if (listing.id && window.openDetailModal) {
      onClose();
      window.openDetailModal(listing.id);
    }
  };

  /* ── Restart wizard ── */
  const restart = () => {
    setMessages([{ id: 'welcome', sender: 'assistant', text: FLOW[0].msg }]);
    setCurrentStep(0);
    setBotState({});
    setInput('');
    setShowOptions(true);
    setShowInput(false);
    setResults(null);
    setSuggestions([]);
  };

  /* ── Current step data ── */
  const step = FLOW[currentStep];
  const options =
    step && !step.freeText
      ? typeof step.options === 'function'
        ? step.options(botState)
        : step.options
      : [];

  return (
    <div className="modal-backdrop ai-helper-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ width: '92%', maxWidth: '440px', height: 'min(640px, 88vh)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--lg-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-2xl text-white shrink-0"
              style={{ background: 'linear-gradient(150deg, #059669, #34d399)', boxShadow: '0 8px 20px rgba(5,150,105,.35)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="font-black text-[15px] tracking-tight" style={{ color: 'var(--text)' }}>Fauji Sahayak</span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>● AI Transfer Assistant</span>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer shrink-0"
            style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--muted)', fontSize: 15 }}
            aria-label="Close"
          >
            ✕
          </motion.button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((m) => (
            <ChatBubble key={m.id} sender={m.sender} text={m.text} />
          ))}

          {/* Option buttons */}
          {showOptions && options.length > 0 && (
            <div className="flex flex-col gap-2 self-start w-full max-w-[86%]">
              {options.map((opt, i) => (
                <OptBtn key={i} label={opt.label} onClick={() => advanceStep(step.key, opt.value, opt.label)} />
              ))}
            </div>
          )}

          {/* Station free-text input */}
          {showInput && (
            <div className="self-start w-full max-w-[86%] relative">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => handleStationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitStation()}
                  placeholder={step?.placeholder || 'Type here…'}
                  className="flex-1 rounded-xl px-4 py-3 text-[13.5px] font-medium outline-none"
                  style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--text)' }}
                />
                <motion.button
                  onClick={submitStation}
                  disabled={!input.trim()}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="flex items-center justify-center w-11 h-11 rounded-xl text-white cursor-pointer shrink-0"
                  style={{ background: 'linear-gradient(150deg,#059669,#10b981)', opacity: input.trim() ? 1 : 0.5 }}
                  aria-label="Submit"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" />
                  </svg>
                </motion.button>
              </div>

              {/* Autocomplete suggestions */}
              {suggestions.length > 0 && (
                <div
                  className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden flex flex-col z-20"
                  style={{ background: 'var(--card, #1a2540)', border: '1px solid var(--lg-border)', boxShadow: '0 -8px 24px rgba(0,0,0,.4)' }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); setSuggestions([]); }}
                      className="px-3.5 py-2.5 text-[13px] text-left cursor-pointer transition-colors border-b border-white/5 last:border-0"
                      style={{ color: 'var(--text)', background: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,153,51,.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      📍 {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Results */}
        {results && results.length > 0 && (
          <div className="px-4 pb-3 flex flex-col gap-2 shrink-0" style={{ borderTop: '1px solid var(--lg-border)' }}>
            <div className="overflow-y-auto max-h-[180px] flex flex-col gap-2 pt-3" style={{ scrollbarWidth: 'thin' }}>
              {results.map((l) => (
                <ListingCard key={l.id || l.name} listing={l} onOpen={openListing} />
              ))}
            </div>
          </div>
        )}

        {/* Restart */}
        {results !== null && (
          <div className="px-4 pb-3 shrink-0">
            <button
              onClick={restart}
              className="w-full rounded-xl px-4 py-2.5 text-[12px] font-semibold cursor-pointer transition-colors"
              style={{ background: 'transparent', border: '1px solid var(--lg-border)', color: 'var(--muted)' }}
            >
              ↺ Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
