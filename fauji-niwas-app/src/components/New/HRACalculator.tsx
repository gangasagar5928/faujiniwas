import React, { useState } from "react";
import { RANKS_HRA } from "../../dataNew";
import { Calculator, Coins } from "lucide-react";

interface HRACalculatorProps {
  selectedRank: string;
  onRankSelect: (rank: string) => void;
  basicPay: number;
  onBasicPayChange: (pay: number) => void;
  onClose?: () => void;
}

const CITY_CLASSES = [
  { label: "X — Metro", value: "X", rate: 27, example: "Mumbai, Delhi, Bengaluru…" },
  { label: "Y — Major City", value: "Y", rate: 18, example: "Lucknow, Jaipur, Patna…" },
  { label: "Z — Other City", value: "Z", rate: 9,  example: "Smaller cantt towns" },
];

export default function HRACalculator({
  selectedRank,
  onRankSelect,
  basicPay,
  onBasicPayChange,
}: HRACalculatorProps) {
  const [cityClass, setCityClass] = useState<"X" | "Y" | "Z">("Y");

  const activeRankInfo = RANKS_HRA.find((r) => r.rank === selectedRank) || RANKS_HRA[0];
  const activeClass = CITY_CLASSES.find((c) => c.value === cityClass)!;
  const calculatedHRA = Math.round(basicPay * (activeClass.rate / 100));

  const handleRankSelect = (rankName: string) => {
    onRankSelect(rankName);
    const rInfo = RANKS_HRA.find((r) => r.rank === rankName);
    if (rInfo) onBasicPayChange(rInfo.minBasicPay);
  };

  return (
    <div
      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg flex flex-col gap-4 text-left dark:bg-slate-900 dark:border-slate-800"
      style={{ borderRadius: "24px" }}
    >
      {/* Title */}
      <div
        className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"
      >
        <div className="flex items-center gap-2">
          <Calculator size={18} style={{ color: "#059669" }} />
          <span
            className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200"
          >
            HRA Calculator (7th CPC)
          </span>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
        >
          City {cityClass} ({activeClass.rate}%)
        </span>
      </div>

      {/* City Class Selector */}
      <div className="flex flex-col gap-1.5">
        <span
          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          City Class
        </span>
        <div className="flex gap-2">
          {CITY_CLASSES.map((cc) => (
            <button
              key={cc.value}
              onClick={() => setCityClass(cc.value as "X" | "Y" | "Z")}
              className={`flex-1 py-1.5 rounded-xl text-[11px] cursor-pointer text-center transition-all ${
                cityClass === cc.value
                  ? "border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-extrabold"
                  : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold"
              }`}
            >
              <div className="font-extrabold text-xs">{cc.label.split(" ")[0]}</div>
              <div className="text-[9px] mt-0.5 font-medium">{cc.rate}%</div>
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">eg. {activeClass.example}</span>
      </div>

      {/* Rank + Pay Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Service Rank
          </span>
          <select
            value={selectedRank}
            onChange={(e) => handleRankSelect(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              fontSize: 12,
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {RANKS_HRA.map((r) => (
              <option key={r.rank} value={r.rank}>
                {r.rank}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Basic Pay
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              Min: ₹{activeRankInfo.minBasicPay.toLocaleString()}
            </span>
          </div>
          <input
            type="number"
            min={activeRankInfo.minBasicPay}
            max={activeRankInfo.maxBasicPay}
            value={basicPay}
            onChange={(e) => onBasicPayChange(Number(e.target.value))}
            style={{
              fontWeight: "bold",
              padding: "8px 12px",
              borderRadius: "12px",
              fontSize: 12,
            }}
            className="bg-slate-50 border border-slate-200 text-emerald-600 dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={activeRankInfo.minBasicPay}
        max={activeRankInfo.maxBasicPay}
        step={500}
        value={basicPay}
        onChange={(e) => onBasicPayChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg cursor-pointer accent-emerald-600 bg-slate-200 dark:bg-slate-700"
      />

      {/* Result */}
      <div
        className="bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800/80"
        style={{
          padding: "16px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Coins size={18} style={{ color: "#d97706", flexShrink: 0 }} />
          <div className="flex flex-col">
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }} className="text-slate-600 dark:text-slate-300">
              Your Housing Allowance
            </span>
            <span style={{ fontSize: 11 }} className="text-slate-500 dark:text-slate-400">Class {cityClass} City · {activeClass.rate}% of Basic Pay</span>
          </div>
        </div>
        <div className="text-right flex flex-col">
          <span style={{ fontWeight: 800, fontSize: 20 }} className="text-emerald-600 dark:text-emerald-400">
            ₹{calculatedHRA.toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500">Per Month Max</span>
        </div>
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
        ※ Class X = HRA 27% (metro cities), Y = 18% (major cities), Z = 9% (other cantonments). Based on 7th CPC orders.
      </p>
    </div>
  );
}
