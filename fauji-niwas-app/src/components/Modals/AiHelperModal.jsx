import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Fauji Sahayak — centered AI housing assistant (opens in the middle of the
 * screen via the shared liquid-glass modal shell). Falls back to Gemini API.
 */
const WELCOME = "Jai Hind! I am Fauji Sahayak, your military housing & cantonment advisor.\n\nTell me your Rank or Basic Pay and I'll calculate your 7th CPC HRA and match you with fully-covered properties. How can I assist you, Officer?";

const SUGGESTIONS = [
  'What properties are best for JCOs?',
  'Calculate HRA for Major (Basic: 69400)',
  'Best cantonments near Danapur',
  'How close is APS Danapur?',
];

const SYSTEM_PROMPT = `You are "Fauji Sahayak", an elite, supportive, and knowledgeable military housing assistant on the "FaujiNiwas" portal. Assist Indian Armed Forces personnel, veterans (ESM), and defense families with military housing searches, rank-based House Rent Allowance (HRA) calculations, commute advice, and cantonment procedures.
Patna/Danapur is a 'Y' category city. Under the 7th CPC the HRA is 18% of basic pay (min ₹3600 for Y cities). Total listings ≈ 1,706, Average Rent ₹12K.
Be highly respectful. Use military terms (e.g. Jai Hind, Sir, Officer). Keep answers concise.`;

export default function AiHelperModal({ onClose }) {
  const [messages, setMessages] = useState([{ id: 'welcome', sender: 'assistant', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const ask = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: textToSend };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let replyText = '';
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSend, history: messages.slice(-6) }),
        });
        if (!res.ok) throw new Error('server');
        replyText = (await res.json()).text;
      } catch {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('No key');
        const ep = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const resp = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${textToSend}` }] }],
            generationConfig: { temperature: 0.7 },
          }),
        });
        if (!resp.ok) throw new Error('gemini');
        const data = await resp.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Jai Hind! I am ready to assist you, Officer.';
      }
      setMessages((p) => [...p, { id: `a-${Date.now()}`, sender: 'assistant', text: replyText }]);
    } catch {
      setMessages((p) => [...p, {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: 'My apologies, Officer. I encountered a secure connection disruption with the Command Server. Please verify your GEMINI_API_KEY / VITE_GEMINI_API_KEY is configured.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ width: '92%', maxWidth: '440px', height: 'min(640px, 88vh)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--lg-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-2xl text-white"
              style={{ background: 'linear-gradient(150deg, #059669, #34d399)', boxShadow: '0 8px 20px rgba(5,150,105,.35)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-[15px] tracking-tight" style={{ color: 'var(--text)' }}>Fauji Sahayak</span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>● Command Intelligence · Online</span>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer liquid-glass-chip"
            style={{ fontSize: 15, color: 'var(--muted)' }}
            aria-label="Close"
          >
            ✕
          </motion.button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col max-w-[86%] text-left ${m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div
                className="rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
                style={m.sender === 'user'
                  ? { background: 'linear-gradient(150deg,#059669,#10b981)', color: '#fff', borderRadius: '16px 16px 4px 16px' }
                  : { background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--text)', borderRadius: '16px 16px 16px 4px' }}
              >
                {m.text}
              </div>
              <span className="text-[9px] mt-1 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {m.sender === 'assistant' ? '● Secure Link' : 'You'}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="self-start flex flex-col items-start max-w-[86%] text-left">
              <div className="flex items-center gap-1 px-4 py-3 rounded-2xl" style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted)', animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted)', animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted)', animationDelay: '300ms' }} />
              </div>
              <span className="text-[9px] mt-1" style={{ color: 'var(--muted)' }}>Decrypting response...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2.5 flex flex-wrap gap-2 shrink-0 text-left" style={{ borderTop: '1px solid var(--lg-border)' }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => ask(s)}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
              style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--text)' }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3.5 shrink-0" style={{ borderTop: '1px solid var(--lg-border)' }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask(input)}
              placeholder="Ask about housing or HRA..."
              className="flex-1 rounded-xl px-4 py-3 text-[13.5px] font-medium outline-none"
              style={{ background: 'var(--lg-top)', border: '1px solid var(--lg-border)', color: 'var(--text)' }}
            />
            <motion.button
              onClick={() => ask(input)}
              disabled={!input.trim() || isLoading}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="flex items-center justify-center w-12 h-12 rounded-xl text-white cursor-pointer shrink-0"
              style={{ background: 'linear-gradient(150deg,#059669,#10b981)', boxShadow: '0 8px 22px rgba(5,150,105,.4)', opacity: !input.trim() || isLoading ? 0.5 : 1 }}
              aria-label="Send"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4z" />
                <path d="M22 2 11 13" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
