import React, { useContext, useState } from 'react';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore } from '../../store/filterStore';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';

const IndianArmyEmblem = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="shrink-0 select-none ml-2">
    <circle cx="50" cy="50" r="46" fill="#0b1325" stroke="#fbbf24" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="41" stroke="#fbbf24" strokeDasharray="3 3" strokeWidth="1" />
    {/* Crossed Swords */}
    <path d="M30 70 L70 30" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M70 70 L30 30" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M26 66 L34 74" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
    <path d="M74 66 L66 74" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
    {/* State Emblem */}
    <path d="M44 55 C44 48 46 44 50 44 C54 44 56 48 56 55 Z" fill="#fbbf24" />
    <path d="M42 35 C42 22 45 18 50 18 C55 18 58 22 58 35 Z" fill="#fbbf24" />
    <path d="M45 44 C45 35 47 32 50 32 C53 32 55 35 55 44 Z" fill="#0b1325" />
    <circle cx="50" cy="38" r="4.5" fill="#fbbf24" />
    {/* Pedestal */}
    <rect x="42" y="56" width="16" height="4" rx="1.5" fill="#fbbf24" />
    <path d="M38 60 L62 60 L58 65 L42 65 Z" fill="#fbbf24" />
  </svg>
);

export default function UnifiedBentoDashboard() {
  const ctx = useContext(ModalContext);
  const { user, dbUser, isAdmin } = useAuth();
  
  // Zustand store bindings
  const { 
    activeView, setActiveView,
    smartSearchQ, setSmartSearchQ,
    maxPrice, setMaxPrice,
    bhkFilter, setBhkFilter,
    sidebarOpen, setSidebarOpen
  } = useFilterStore();

  // Mobile layout active tab state
  const [activeMobileTab, setActiveMobileTab] = useState('listings');

  // Rank/HRA filter dropdown state
  const [rankDropdownOpen, setRankDropdownOpen] = useState(false);
  const [bhkDropdownOpen, setBhkDropdownOpen] = useState(false);
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);

  const getHraValue = () => {
    if (maxPrice <= 15000) return 'OR';
    if (maxPrice <= 30000) return 'JCO';
    return 'Officer';
  };

  const getHraLabel = () => {
    if (maxPrice <= 15000) return 'OR (Jawan)';
    if (maxPrice <= 30000) return 'JCO';
    return 'All Ranks';
  };

  const getBhkLabel = () => {
    if (bhkFilter === 'all') return 'Any BHK';
    return `${bhkFilter} BHK`;
  };

  const getBudgetLabel = () => {
    if (maxPrice >= 100000) return 'Any Budget';
    if (maxPrice <= 10000) return 'Under ₹10K';
    if (maxPrice <= 20000) return 'Under ₹20K';
    if (maxPrice <= 30000) return 'Under ₹30K';
    return `Under ₹${(maxPrice/1000).toFixed(0)}K`;
  };

  const showAdminButton = user && (isAdmin || user.email === 'admin@faujiniwas.com' || user.isAdmin);

  const closeAllDropdowns = () => {
    setRankDropdownOpen(false);
    setBhkDropdownOpen(false);
    setBudgetDropdownOpen(false);
  };

  return (
    <div className={`app-container select-none ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} onClick={(e) => {
      // Close dropdowns on outside click
      if (!e.target.closest('.filter-dropdown-wrapper')) closeAllDropdowns();
    }}>
      
      {/* 1. TOP HEADER */}
      <header className="header justify-between" style={{ height: '64px' }}>
        
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-2 text-slate-100 uppercase tracking-widest font-heading font-black">
            <span className="flex flex-col text-left">
              <span className="text-sm font-black tracking-tight text-white leading-none">FAUJINIWAS</span>
              <span className="text-[7px] text-[#22c55e] font-bold tracking-wider mt-0.5 font-sans">SECURE. VERIFIED. FOR OURS.</span>
            </span>
          </span>
          <IndianArmyEmblem />
        </div>

        {/* Center: Underline Tab Swappers */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center h-full">
          <div className="flex gap-8 h-full items-center">
            {[
              { id: 'rentals', label: 'ACCOMMODATION' },
              { id: 'market', label: 'MARKETPLACE' },
              { id: 'dorms', label: 'SSR DORMS' },
              { id: 'saved', label: 'SHORTLIST' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`h-full px-1 flex items-center justify-center text-[10px] font-extrabold tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
                  activeView === tab.id 
                    ? 'border-[#22c55e] text-white font-black' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                style={{ height: '64px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Notification and Dropdown Profile badge */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Notification Bell */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[#10192e]/40 border border-[#1e293b] text-slate-300 hover:text-white transition-all cursor-pointer">
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/20 text-[#22c55e] border border-emerald-500/40 flex items-center justify-center text-[8px] font-black font-mono">3</span>
          </button>

          {/* Help button */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[#10192e]/40 border border-[#1e293b] text-slate-300 hover:text-white transition-all cursor-pointer text-xs font-bold" title="Help">
            ?
          </button>

          {/* User Profile dropdown Badge */}
          {user ? (
            <div 
              onClick={() => ctx.openProfile && ctx.openProfile()}
              className="flex items-center gap-2.5 bg-[#10192e]/40 border border-[#1e293b] pl-2 pr-3.5 py-1.5 rounded-full cursor-pointer hover:border-amber-500/50 transition-all text-left"
              title="Profile Locker"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-600/30 text-[#22c55e] border border-[#22c55e]/25 flex items-center justify-center shrink-0">
                <span className="text-xs font-black select-none">🪖</span>
              </div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-extrabold text-white">
                  {dbUser?.name || user.displayName || user.phoneNumber || "Soldier"}
                </span>
                {dbUser?.verified === true && (
                  <span className="text-[10px] text-[#22c55e] select-none" title="Verified Military Status">✓</span>
                )}
              </div>
              <span className="text-slate-500 text-[8px] font-bold ml-1">▼</span>
            </div>
          ) : (
            <button 
              onClick={() => ctx.openProfile && ctx.openProfile()}
              className="flex items-center gap-1.5 bg-amber-500 text-[#000000] px-4 py-1.5 rounded-full cursor-pointer hover:scale-105 transition-all text-[10px] font-black uppercase tracking-wider"
            >
              <span>👤</span>
              <span>SIGN IN</span>
            </button>
          )}

        </div>
      </header>

      {/* 2. SUB-HEADER STATS BAR */}
      <div className="bento-row px-4 py-2 border-b border-[#1e293b] bg-[#0b1222]">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          
          {/* Stats Beacons */}
          <div className="flex items-center gap-4 text-[10px] font-black tracking-wider uppercase text-slate-400 font-mono shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-xs">📋</span>
              <span>Total: <strong className="text-white">1,395</strong></span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 text-xs">🔄</span>
              <span>New: <strong className="text-emerald-400">48</strong></span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 text-xs">💸</span>
              <span>Avg: <strong className="text-amber-400">₹12,452</strong></span>
            </div>
          </div>

          {/* Center: Search bar */}
          <div className="flex items-center bg-[#070b13] border border-[#1e293b] px-3 py-1.5 rounded-lg flex-1 max-w-xs hover:border-[#22c55e]/40 transition-colors">
            <span className="text-slate-500 mr-2 text-xs select-none">🔍</span>
            <input 
              type="text" 
              placeholder="Search cantonment, area or city..." 
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              className="bg-transparent text-[11px] text-white outline-none w-full placeholder-slate-500 font-medium"
            />
          </div>

          {/* Right: Filter Pills */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Filter by Rank */}
            <div className="relative filter-dropdown-wrapper">
              <button
                onClick={() => { setRankDropdownOpen(!rankDropdownOpen); setBhkDropdownOpen(false); setBudgetDropdownOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  maxPrice < 100000
                    ? 'border-[#22c55e] text-[#22c55e] bg-[#22c55e]/10'
                    : 'border-[#22c55e]/50 text-[#22c55e] hover:border-[#22c55e] hover:bg-[#22c55e]/10'
                }`}
              >
                🎖️ Filter by Rank
                {maxPrice < 100000 && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0"></span>}
                <span className="text-[8px]">▾</span>
              </button>
              {rankDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 bg-[#0d1628] border border-[#1e293b] rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden animate-in">
                  {[
                    { label: 'All Ranks', val: 100000, sub: 'No budget cap' },
                    { label: 'Officer', val: 60000, sub: 'Up to ₹60,000' },
                    { label: 'JCO', val: 30000, sub: 'Up to ₹30,000' },
                    { label: 'OR / Jawan', val: 15000, sub: 'Up to ₹15,000' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setMaxPrice(opt.val); setRankDropdownOpen(false); }}
                      className={`w-full flex flex-col items-start px-4 py-2.5 text-left transition-colors cursor-pointer ${
                        maxPrice === opt.val ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'text-slate-300 hover:bg-[#1e293b]'
                      }`}
                    >
                      <span className="text-[11px] font-bold">{opt.label}</span>
                      <span className="text-[9px] text-slate-500">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter by BHK */}
            <div className="relative filter-dropdown-wrapper">
              <button
                onClick={() => { setBhkDropdownOpen(!bhkDropdownOpen); setRankDropdownOpen(false); setBudgetDropdownOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  bhkFilter !== 'all'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-amber-500/50 text-amber-400 hover:border-amber-500 hover:bg-amber-500/10'
                }`}
              >
                🏠 Filter by BHK
                {bhkFilter !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>}
                <span className="text-[8px]">▾</span>
              </button>
              {bhkDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 bg-[#0d1628] border border-[#1e293b] rounded-xl shadow-2xl z-50 min-w-[140px] overflow-hidden animate-in">
                  {[
                    { label: 'Any BHK', val: 'all' },
                    { label: '1 BHK', val: '1' },
                    { label: '2 BHK', val: '2' },
                    { label: '3+ BHK', val: '3+' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setBhkFilter(opt.val); setBhkDropdownOpen(false); }}
                      className={`w-full flex items-start px-4 py-2.5 text-left text-[11px] font-bold transition-colors cursor-pointer ${
                        bhkFilter === opt.val ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:bg-[#1e293b]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter by Budget */}
            <div className="relative filter-dropdown-wrapper">
              <button
                onClick={() => { setBudgetDropdownOpen(!budgetDropdownOpen); setRankDropdownOpen(false); setBhkDropdownOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  maxPrice < 100000
                    ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa]/10'
                    : 'border-[#a78bfa]/50 text-[#a78bfa] hover:border-[#a78bfa] hover:bg-[#a78bfa]/10'
                }`}
              >
                💰 Filter by Budget
                {maxPrice < 100000 && <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] shrink-0"></span>}
                <span className="text-[8px]">▾</span>
              </button>
              {budgetDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 bg-[#0d1628] border border-[#1e293b] rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden animate-in">
                  {[
                    { label: 'Any Budget', val: 100000 },
                    { label: 'Under ₹10,000', val: 10000 },
                    { label: 'Under ₹20,000', val: 20000 },
                    { label: 'Under ₹30,000', val: 30000 },
                    { label: 'Under ₹50,000', val: 50000 },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setMaxPrice(opt.val); setBudgetDropdownOpen(false); }}
                      className={`w-full flex items-start px-4 py-2.5 text-left text-[11px] font-bold transition-colors cursor-pointer ${
                        maxPrice === opt.val ? 'bg-[#a78bfa]/15 text-[#a78bfa]' : 'text-slate-300 hover:bg-[#1e293b]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. LEFT-MOST NAVIGATION SIDEBAR */}
      <aside className="nav-sidebar">
        
        {/* Sidebar Toggle at very top */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer mb-1 ${
            sidebarOpen
              ? 'bg-[#22c55e]/15 border border-[#22c55e]/30 text-emerald-400'
              : 'bg-transparent border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={sidebarOpen ? 'Close Listings Panel' : 'Open Listings Panel'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}>
            <rect x="1" y="2" width="12" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="1" y="6.25" width="7" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="1" y="10.5" width="10" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>

        <div className="w-8 h-px bg-[#1e293b] my-1"></div>

        {/* Navigation list */}
        <div className="flex flex-col items-center gap-3">
          {[
            { id: 'rentals', label: '🏠', title: 'Accommodation', active: activeView === 'rentals' },
            { id: 'market', label: '🛍️', title: 'Marketplace', active: activeView === 'market' },
            { id: 'dorms', label: '👥', title: 'SSR Dorms', active: activeView === 'dorms' },
            { id: 'saved', label: '⭐', title: 'Shortlist', active: activeView === 'saved' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveView(btn.id)}
              title={btn.title}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                btn.active 
                  ? 'bg-[#22c55e]/15 border border-[#22c55e]/30 text-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.15)]' 
                  : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="text-sm">{btn.label}</span>
            </button>
          ))}

          {/* Secure Chat icon */}
          <button 
            onClick={() => alert("Secure Encrypted Chat Tunnel Initiated...")}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-transparent border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5 cursor-pointer"
            title="Secure Messaging"
          >
            <span className="text-sm">💬</span>
          </button>

          {/* Settings icon */}
          <button 
            onClick={() => {
              setMaxPrice(100000);
              setBhkFilter('all');
              setSmartSearchQ('');
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-transparent border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5 cursor-pointer"
            title="Reset Filters"
          >
            <span className="text-sm">⚙️</span>
          </button>
        </div>

        {/* Bottom Theme toggle trigger */}
        <button 
          onClick={() => alert("Command Center dark mode is locked to secure tactical levels.")}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-transparent border border-transparent text-slate-500 hover:text-slate-300 cursor-pointer"
          title="Toggle Darkness Mode"
        >
          <span className="text-sm">🌙</span>
        </button>

      </aside>

      {/* 4. COLLAPSIBLE LISTINGS SIDEBAR */}
      {sidebarOpen && (
        <Sidebar activeMobileView={activeMobileTab === 'listings'} />
      )}

      {/* 5. MAP COLUMN */}
      <div id="map" className={`relative ${activeMobileTab === 'map' ? 'active-mobile-view' : ''} ${sidebarOpen ? 'map-with-sidebar' : ''}`}>
        
        {/* Leaflet map renderer */}
        <MapView />

      </div>

      {/* 6. BOTTOM STATUS FOOTER */}
      <footer className="status-footer px-6 py-1.5 bg-[#090d16] border-t border-[#1e293b] flex items-center justify-between text-[8px] font-mono tracking-widest text-slate-500 select-none shrink-0 h-8">
        
        {/* Left: Encryption shield */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#22c55e]">
            <span className="text-xs">🟢</span>
            <span className="font-extrabold uppercase">SECURE CONNECTION</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span>🇮🇳</span>
            <span className="font-extrabold uppercase">INDIA</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-extrabold uppercase">HELP DESK:</span>
            <button onClick={() => alert("Initiating admin messaging gateway...")} className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold">💬 CHAT</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => alert("Dialing military support operator...")} className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold">📞 CALL</button>
          </div>
        </div>

        {/* Right: Support */}
        <button
          onClick={() => alert("Support ticket system launching...")}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] rounded-full font-black uppercase text-[7px] tracking-widest hover:bg-[#22c55e]/25 transition-all cursor-pointer"
        >
          📡 SUPPORT
        </button>

      </footer>

      {/* 7. MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`nav-item ${activeMobileTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('map')}
        >
          <span className="nav-item-icon">🗺️</span>
          <span>Map</span>
        </button>
        <button 
          className={`nav-item ${activeMobileTab === 'listings' && activeView === 'rentals' ? 'active' : ''}`}
          onClick={() => {
            setActiveMobileTab('listings');
            setActiveView('rentals');
          }}
        >
          <span className="nav-item-icon">📋</span>
          <span>Housing</span>
        </button>
        <button 
          className={`nav-item ${activeMobileTab === 'listings' && activeView === 'market' ? 'active' : ''}`}
          onClick={() => {
            setActiveMobileTab('listings');
            setActiveView('market');
          }}
        >
          <span className="nav-item-icon">📦</span>
          <span>Market</span>
        </button>
        <button 
          className="nav-item"
          onClick={() => ctx.openProfile && ctx.openProfile()}
        >
          <span className="nav-item-icon">👤</span>
          <span>Profile</span>
        </button>
      </nav>

    </div>
  );
}
