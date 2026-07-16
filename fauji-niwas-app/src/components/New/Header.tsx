import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, User, Home } from "lucide-react";

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

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function CustomDropdown({ value, onChange, options, placeholder }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={containerRef} className="relative shrink-0 min-w-[125px] sm:min-w-[150px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-4 pr-8 py-2 rounded-xl bg-white/40 hover:bg-white/50 dark:bg-slate-900/60 dark:hover:bg-slate-900/80 border border-white/40 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer shadow-sm flex items-center justify-between transition-all duration-200 focus:outline-none select-none text-left"
        style={{ paddingLeft: "12px", paddingRight: "24px" }}
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          size={12}
          className={`text-slate-700 dark:text-slate-300 transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[1000] bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-xs transition-colors duration-150 cursor-pointer ${
                opt.value === value
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-200 hover:bg-white/15 hover:text-white"
              }`}
              style={{ paddingLeft: "16px", paddingRight: "16px" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
  const rankOptions = [
    { value: "All", label: "Filter by Rank" },
    { value: "OR", label: "OR" },
    { value: "JCO", label: "JCO" },
    { value: "OFFIcers", label: "Officers" },
  ];

  const bhkOptions = [
    { value: "All", label: "Filter by BHK" },
    { value: "1 BHK", label: "1 BHK" },
    { value: "2 BHK", label: "2 BHK" },
    { value: "3 BHK", label: "3 BHK" },
    { value: "PG/Room", label: "PG/Room" },
  ];

  const budgetOptions = [
    { value: "All", label: "Filter by Budget" },
    { value: "under-15k", label: "Under ₹15,000" },
    { value: "15k-20k", label: "₹15,000 - ₹20,000" },
    { value: "over-20k", label: "Over ₹20,000" },
  ];

  const renderUserButton = (isMobile: boolean) => {
    if (userProfile) {
      return (
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 rounded-xl px-2.5 py-1 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-[9px] font-bold">
            <User size={10} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-bold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[80px]">
              {userProfile.rank} {userProfile.name.split(' ')[0]}
            </span>
            <button
              onClick={onLogout}
              className="text-[7.5px] text-red-700 font-extrabold hover:underline leading-none text-left mt-0.5 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }
    return (
      <button
        onClick={onOpenAuthModal}
        className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white/85 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-[10px] font-bold transition-all duration-300 shadow-sm cursor-pointer border border-white/40 dark:border-white/10"
      >
        Sign In
      </button>
    );
  };

  const handleSearch = () => {
    if (typeof (window as any).geocodeSearch === "function") {
      (window as any).geocodeSearch(searchQuery);
    }
  };

  return (
    <header 
      className="absolute top-4 left-4 right-4 z-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 bg-white/40 dark:bg-slate-950/80 border border-white/30 dark:border-white/10 shadow-xl rounded-2xl"
      style={{
        backdropFilter: 'blur(25.2px) saturate(180%)',
        WebkitBackdropFilter: 'blur(25.2px) saturate(180%)'
      }}
    >
      {/* Row 1 — Logo + Auth (mobile) / Logo (desktop) */}
      <div className="flex items-center justify-between gap-3">
        <a 
          href="index.html" 
          onClick={(e) => { e.preventDefault(); window.location.href = "index.html"; }}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
            <div className="relative flex items-center justify-center">
              <Home size={16} className="text-white fill-amber-400/20" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full border border-slate-900" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-sans text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">FaujiNiwas</span>
            <span className="text-[7.5px] tracking-widest font-mono font-extrabold text-slate-800 dark:text-slate-400 uppercase leading-none mt-0.5">Defense Housing Portal</span>
          </div>
        </a>

        {/* Search bar (inline on mobile row 1 after logo) */}
        <div className="flex-1 relative md:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search city or area..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-white/50 dark:bg-slate-900/60 border border-white/35 dark:border-white/10 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 shadow-sm"
          />
          <button
            onClick={handleSearch}
            className="absolute inset-y-0 right-2.5 flex items-center text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search size={13} className="opacity-80" />
          </button>
        </div>

        {/* Auth Button for Mobile View */}
        <div className="md:hidden shrink-0">
          {renderUserButton(true)}
        </div>
      </div>

      {/* Row 2 — Filters scrollable (mobile only) + desktop search+filters */}
      <div className="flex flex-row items-center gap-2 w-full md:flex-1 md:justify-end overflow-x-auto md:overflow-x-visible scrollbar-none py-0.5">
        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-sm relative mr-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search cantonment, area or city..."
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-white/40 dark:bg-slate-900/60 border border-white/35 dark:border-white/10 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600/60 transition-all duration-300 shadow-sm"
          />
          <button
            onClick={handleSearch}
            className="absolute inset-y-0 right-3 flex items-center text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search size={13} className="opacity-80" />
          </button>
        </div>

        <CustomDropdown value={selectedRank} onChange={onRankChange} options={rankOptions} placeholder="Filter by Rank" />
        <CustomDropdown value={selectedBhk} onChange={onBhkChange} options={bhkOptions} placeholder="Filter by BHK" />
        <CustomDropdown value={selectedBudgetRange} onChange={onBudgetChange} options={budgetOptions} placeholder="Filter by Budget" />

        <div className="hidden md:block shrink-0">
          {renderUserButton(false)}
        </div>
      </div>
    </header>
  );
}

