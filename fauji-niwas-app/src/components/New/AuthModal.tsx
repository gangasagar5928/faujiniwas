import React, { useState } from "react";
import { X, ShieldCheck, Star, StarHalf, Compass, LogIn } from "lucide-react";
import { RANKS_HRA } from "../../dataNew";


interface AuthModalProps {
  onClose: () => void;
  onSuccess: (profile: { name: string; rank: string; basicPay: number }) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [name, setName] = useState("");
  const [selectedRank, setSelectedRank] = useState("Major");
  const [basicPay, setBasicPay] = useState(69400);
  const [service, setService] = useState("Indian Army");

  const handleRankChange = (rankName: string) => {
    setSelectedRank(rankName);
    const rInfo = RANKS_HRA.find((r) => r.rank === rankName);
    if (rInfo) {
      setBasicPay(rInfo.minBasicPay);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      name: name || "Officer",
      rank: selectedRank,
      basicPay: basicPay,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-5 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white border border-emerald-600/30">
            <ShieldCheck size={22} className="text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-serif font-extrabold text-lg text-slate-900 leading-tight">Defense Housing Portal</h3>
            <p className="text-[10px] text-emerald-800 uppercase tracking-widest font-mono font-bold">Secure Command Login</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Officer Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aman Kumar"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/80 font-medium"
            />
          </div>

          {/* Service branch selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Service Branch</label>
            <div className="grid grid-cols-3 gap-2">
              {["Indian Army", "Indian Navy", "Indian Air Force"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setService(b)}
                  className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                    service === b
                      ? "bg-emerald-800 border-emerald-800 text-white shadow-md"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {b.replace("Indian ", "")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Rank Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Armed Rank</label>
              <select
                value={selectedRank}
                onChange={(e) => handleRankChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {RANKS_HRA.map((r) => (
                  <option key={r.rank} value={r.rank}>
                    {r.rank}
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Pay */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Basic Pay (₹)</label>
              <input
                type="number"
                value={basicPay}
                onChange={(e) => setBasicPay(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Subtext warning */}
          <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed">
            ※ This portal is secure and only processes simulated credentials. Your basic pay serves to pre-fill the HRA calculator automatically.
          </p>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn size={14} />
            <span>Establish Secure Session</span>
          </button>
        </form>
      </div>
    </div>
  );
}
