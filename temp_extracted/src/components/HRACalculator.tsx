import React from "react";
import { RANKS_HRA } from "../data";
import { Calculator, Star, Coins, ArrowRightLeft } from "lucide-react";

interface HRACalculatorProps {
  selectedRank: string;
  onRankSelect: (rank: string) => void;
  basicPay: number;
  onBasicPayChange: (pay: number) => void;
  onClose?: () => void;
}

export default function HRACalculator({
  selectedRank,
  onRankSelect,
  basicPay,
  onBasicPayChange,
  onClose,
}: HRACalculatorProps) {
  const activeRankInfo = RANKS_HRA.find((r) => r.rank === selectedRank) || RANKS_HRA[0];

  // HRA rate in Patna/Danapur is 18% of basic pay under 7th pay commission (Y category cities)
  const calculatedHRA = Math.round(basicPay * (activeRankInfo.hraRateY / 100));

  // Change default basic pay when rank changes
  const handleRankSelect = (rankName: string) => {
    onRankSelect(rankName);
    const rInfo = RANKS_HRA.find((r) => r.rank === rankName);
    if (rInfo) {
      onBasicPayChange(rInfo.minBasicPay);
    }
  };

  return (
    <div className="bg-slate-900/90 text-white rounded-2xl p-4 border border-white/10 shadow-xl flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-emerald-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            HRA Calculator (7th CPC)
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-300">
          City Class Y (18%)
        </span>
      </div>

      {/* Selector Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {/* Rank select */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Service Rank</span>
          <select
            value={selectedRank}
            onChange={(e) => handleRankSelect(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {RANKS_HRA.map((r) => (
              <option key={r.rank} value={r.rank} className="bg-slate-950 text-white">
                {r.rank}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Pay Slider or input */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Basic Pay</span>
            <span className="text-[8px] text-slate-500">
              Min: ₹{activeRankInfo.minBasicPay.toLocaleString()}
            </span>
          </div>
          <input
            type="number"
            min={activeRankInfo.minBasicPay}
            max={activeRankInfo.maxBasicPay}
            value={basicPay}
            onChange={(e) => onBasicPayChange(Number(e.target.value))}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Pay slider */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={activeRankInfo.minBasicPay}
          max={activeRankInfo.maxBasicPay}
          step={500}
          value={basicPay}
          onChange={(e) => onBasicPayChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Output Results box */}
      <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5 flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Your Housing Allowance</span>
            <span className="text-xs text-slate-200">Calculated HRA Claim</span>
          </div>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-base font-extrabold text-emerald-400">
            ₹{calculatedHRA.toLocaleString()}
          </span>
          <span className="text-[8px] text-slate-500">Per Month Max</span>
        </div>
      </div>

      {/* Help Note */}
      <p className="text-[9px] text-slate-400 text-left leading-relaxed">
        ※ Renting a property below this budget keeps you fully covered. Select any property in the sidebar to view HRA compatibility immediately.
      </p>
    </div>
  );
}
