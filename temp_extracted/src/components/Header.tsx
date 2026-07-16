import React from "react";
import { Search, ChevronDown, LogIn, User, Shield, Star, Home } from "lucide-react";
import { RANKS_HRA } from "../data";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRank: string;
  onRankChange: (rank: string) => void;
  selectedBhk: string;
  onBhkChange: (bhk: string) => void;
  selectedBudgetRange: string;
  onBudgetChange: (budgetRange: string) => void;
  userProfile: { name: string; rank: string; basicPay: number } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  selectedRank,
  onRankChange,
  selectedBhk,
  onBhkChange,
  selectedBudgetRange,
  onBudgetChange,
  userProfile,
  onOpenAuthModal,
  onLogout,
}: HeaderProps) {
  return (
    <header className="absolute top-4 left-4 right-4 z-50 flex flex-col md:flex-row items-center justify-between gap-3 px-5 py-2.5 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl">
      {/* Brand Logo & Name - exactly matching mockup styled as FaujiNiwas */}
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <div className="w-9 h-9 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
          <div className="relative flex items-center justify-center">
            <Home size={18} className="text-white fill-amber-400/20" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-slate-900" />
          </div>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-sans text-lg font-bold tracking-tight text-slate-900 leading-none">
            FaujiNiwas
          </span>
          <span className="text-[8px] tracking-widest font-mono font-extrabold text-slate-800 uppercase leading-none mt-1">
            Defense Housing Portal
          </span>
        </div>
      </div>

      {/* Floating Modern Combined Search Bar with right search icon */}
      <div className="flex-1 max-w-sm relative w-full md:mx-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cantonment, area or city..."
          className="w-full pl-4 pr-10 py-2 rounded-xl bg-white/40 border border-white/35 text-slate-900 text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600/60 transition-all duration-300 shadow-sm"
        />
        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-700">
          <Search size={14} className="opacity-80" />
        </div>
      </div>

      {/* Filter Toggles Bar - with exact literal labels including Fliter typos matching the mockup! */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Filter by Rank Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={selectedRank}
            onChange={(e) => onRankChange(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-8 py-2 rounded-xl bg-white/35 hover:bg-white/50 border border-white/40 text-slate-800 text-xs font-semibold cursor-pointer shadow-sm focus:outline-none transition-all duration-200"
          >
            <option value="All" className="text-slate-900 bg-white">Fliter by Rank</option>
            {RANKS_HRA.map((r) => (
              <option key={r.rank} value={r.rank} className="text-slate-900 bg-white">
                {r.rank}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-700">
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Filter by BHK Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={selectedBhk}
            onChange={(e) => onBhkChange(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-8 py-2 rounded-xl bg-white/35 hover:bg-white/50 border border-white/40 text-slate-800 text-xs font-semibold cursor-pointer shadow-sm focus:outline-none transition-all duration-200"
          >
            <option value="All" className="text-slate-900 bg-white">Fliter by BHK</option>
            <option value="1 BHK" className="text-slate-900 bg-white">1 BHK</option>
            <option value="2 BHK" className="text-slate-900 bg-white">2 BHK</option>
            <option value="3 BHK" className="text-slate-900 bg-white">3 BHK</option>
            <option value="PG/Room" className="text-slate-900 bg-white">PG/Room</option>
          </select>
          <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-700">
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Filter by Budget Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={selectedBudgetRange}
            onChange={(e) => onBudgetChange(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-8 py-2 rounded-xl bg-white/35 hover:bg-white/50 border border-white/40 text-slate-800 text-xs font-semibold cursor-pointer shadow-sm focus:outline-none transition-all duration-200"
          >
            <option value="All" className="text-slate-900 bg-white">Filter by Budget</option>
            <option value="under-15k" className="text-slate-900 bg-white">Under ₹15,000</option>
            <option value="15k-20k" className="text-slate-900 bg-white">₹15,000 - ₹20,000</option>
            <option value="over-20k" className="text-slate-900 bg-white">Over ₹20,000</option>
          </select>
          <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-700">
            <ChevronDown size={12} />
          </div>
        </div>

        {/* User Auth Portal / Sign In / Sign Up Button */}
        {userProfile ? (
          <div className="flex items-center gap-2 bg-white/50 border border-white/40 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
              <User size={11} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-900 leading-none">
                {userProfile.rank} {userProfile.name}
              </span>
              <button
                onClick={onLogout}
                className="text-[8px] text-red-700 font-extrabold hover:underline leading-none text-left mt-0.5 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white/85 text-slate-900 text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.02] border border-white/40"
          >
            Sign in / Sign Up
          </button>
        )}
      </div>
    </header>
  );
}
