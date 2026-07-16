import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Shield, RefreshCw, Star, ArrowDown } from "lucide-react";
import { ChatMessage } from "../../typesNew";


interface ChatbotProps {
  userProfile: { name: string; rank: string; basicPay: number } | null;
  onFilterRank: (rank: string) => void;
}

export default function Chatbot({ userProfile, onFilterRank }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Jai Hind! I am Fauji Sahayak, your dedicated military housing and cantonment guidelines advisor.\n\nTell me your Rank or Basic Pay, and I can calculate your exact 7th CPC HRA and match you with properties fully covered by your allowance. How can I assist you today, Officer?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestions for quick query clicks
  const suggestions = [
    "What properties are best for JCOs?",
    "Calculate HRA for Major (Basic: 69400)",
    "Danapur Cantt safety guidelines",
    "How close is APS Danapur?",
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Send history and current message to server API
      // Only include last 6 messages to keep tokens optimal
      const historyToSend = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      let replyText = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: textToSend,
            history: historyToSend,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to communicate with server assistant");
        }

        const data = await res.json();
        replyText = data.text;
      } catch (serverErr) {
        console.warn("Server chatbot endpoint failed. Checking local API Key...", serverErr);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("No client-side Gemini key and server API failed");
        }

        const sysInstruction = `You are "Fauji Sahayak", an elite, supportive, and knowledgeable military housing assistant on the "FaujiNiwas" portal. Your mission is to assist Indian Armed Forces personnel, veterans (ESM), and defense families with military housing searches, rank-based House Rent Allowance (HRA) calculations, commute advice, and cantonment procedures in Patna and Danapur Cantonment, Bihar.
Patna/Danapur is a 'Y' category city. Under the 7th Pay Commission (CPC), the HRA is 18% of basic pay (with minimum amounts of ₹3600 for Y cities). Total listings = 1,706, Average Rent = ₹12K.
Properties available:
- Property 1: "2 BHK Patna Cantt" (₹18,749/mo, 21m commute, 38 sq.m, Parking, gated community)
- Property 2: "1 BHK Patna Cantt" (₹14,500/mo, 12m commute, 36 sq.m, Parking, secure complex)
- Property 3: "PG/Room Patna Cantt" (₹18,749/mo or cheaper, 21m commute, 60 sq.m)
- Property 4: "3 BHK Officers Bunglow" in Danapur Cantt (₹23,000/mo, 5m commute, 120 sq.m, Private lawn)
- Property 5: "2 BHK Phulwari Block" (₹16,000/mo, 17m commute, 45 sq.m)
- Property 6: "1 BHK Khagaul Haven" (₹11,000/mo, 8m commute, 30 sq.m)
- Property 7: "3 BHK Luxury Cantonment Flat" (₹22,000/mo, 15m commute, 95 sq.m)
Be highly respectful. Use military terms (e.g. Jai Hind, Sir, Officer).`;

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${sysInstruction}\n\nChat history:\n${historyToSend.map(h => `${h.sender === 'user' ? 'User' : 'Model'}: ${h.text}`).join('\n')}\nUser: ${textToSend}` }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
            }
          })
        });

        if (!response.ok) {
          throw new Error("Direct Gemini API call failed");
        }
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Jai Hind! I am ready to assist you.";
      }

      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Dynamic action trigger! If assistant mentions JCO, OR, Major, Sepoy, Captain, Colonel, or Bungalow,
      // we can optionally trigger filters for the user!
      const lowercaseResponse = replyText.toLowerCase();
      if (lowercaseResponse.includes("subedar") || lowercaseResponse.includes("jco")) {
        // Option to recommend filter to user
      }

    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "assistant",
        text: "My apologies, Officer. I encountered a secure connection disruption with the Command Server. Please verify that your GEMINI_API_KEY is configured in AI Studio Secrets or VITE_GEMINI_API_KEY env variable.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (sug: string) => {
    handleSendMessage(sug);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: `Jai Hind! Assistant history re-secured. ${
          userProfile
            ? `I am ready to assist you, ${userProfile.rank} ${userProfile.name}.`
            : "Please feel free to ask about cantonments, ranks, or housing listings."
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chatbot Dialog Box (Glassmorphic Dark Theme matching the screenshot style) */}
      {isOpen && (
        <div className="w-[390px] sm:w-[450px] h-[550px] rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">

          {/* Header */}
          <div className="px-5 py-4 bg-slate-900/90 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white border border-emerald-500/30">
                <Shield size={16} className="text-emerald-100" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-sm text-slate-100 tracking-wide">Fauji Sahayak</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Command Intelligence</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                title="Reset Secure Channel"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Channel */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] text-left ${
                  msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none shadow-md"
                      : "bg-slate-900/95 border border-white/10 text-slate-100 rounded-tl-none shadow-md"
                  }`}
                >
                  {msg.text}
                </div>
                {/* Time stamp */}
                <span className="text-[8px] text-slate-500 font-medium mt-1 uppercase tracking-wide">
                  {msg.timestamp} {msg.sender === "assistant" && "● Secure Link"}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="self-start flex flex-col items-start max-w-[85%] text-left">
                <div className="bg-slate-900/95 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[8px] text-slate-500 font-medium mt-1">Decrypting Response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions wrap box */}
          <div className="px-4 py-2.5 bg-slate-950/40 border-t border-b border-white/5 flex flex-wrap gap-2 shrink-0 text-left">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="bg-slate-900 border border-white/5 hover:border-emerald-500/40 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg px-2.5 py-1 text-[10px] cursor-pointer transition-all duration-300 whitespace-normal text-left"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-4 bg-slate-900/50 border-t border-white/5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
                placeholder="Ask Fauji Sahayak about housing or HRA..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer shadow-lg transition-colors duration-200"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Toggle Chatbot capsule button (Looks like the mockup and flows beautifully) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 backdrop-blur-md border border-white/15 hover:border-emerald-500/30 shadow-2xl transition-all duration-300 cursor-pointer select-none group text-sm font-bold"
      >
        <div className="relative">
          <MessageSquare size={18} className="group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span className="tracking-wide">Fauji Assistant</span>
      </button>
    </div>
  );
}
