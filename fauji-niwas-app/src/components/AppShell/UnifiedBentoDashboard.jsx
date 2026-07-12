import React, { useContext, useState, useEffect } from 'react';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore } from '../../store/filterStore';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';

export default function UnifiedBentoDashboard() {
  const ctx = useContext(ModalContext);
  const { user, isAdmin } = useAuth();

  const {
    activeView, setActiveView,
    smartSearchQ, setSmartSearchQ,
    maxPrice, setMaxPrice,
    bhkFilter, setBhkFilter,
    sidebarOpen, setSidebarOpen
  } = useFilterStore();

  const [activeMobileTab, setActiveMobileTab] = useState('listings');
  const [isDesktop, setIsDesktop] = useState(window.matchMedia('(min-width: 769px)').matches);
  const [rankDropdownOpen, setRankDropdownOpen] = useState(false);
  const [bhkDropdownOpen, setBhkDropdownOpen] = useState(false);
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const shouldRenderMap = isDesktop || activeMobileTab === 'map';

  const closeAllDropdowns = () => {
    setRankDropdownOpen(false);
    setBhkDropdownOpen(false);
    setBudgetDropdownOpen(false);
  };

  const getRankLabel = () => {
    if (maxPrice <= 15000) return 'Jawan (OR)';
    if (maxPrice <= 30000) return 'JCO';
    if (maxPrice <= 60000) return 'Officer';
    return 'All Ranks';
  };

  const getBhkLabel = () => {
    if (bhkFilter === 'all') return 'Any BHK';
    return `${bhkFilter} BHK`;
  };

  const getBudgetLabel = () => {
    if (maxPrice >= 100000) return 'Any Budget';
    return `Under ₹${(maxPrice / 1000).toFixed(0)}K`;
  };

  const StatsRow = () => (
    <div className="flex items-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden divide-x divide-white/10">
       <div className="px-3 py-2 flex items-center gap-1.5 text-xs text-white/80">
          <span className="opacity-75">📋</span>
          Total listings <span className="font-black text-emerald-400">1706</span>
       </div>
       <div className="px-3 py-2 flex items-center gap-1.5 text-xs text-white/80">
          <span className="opacity-75">📈</span>
          Average rent <span className="font-black text-emerald-400">₹12.4K</span>
       </div>
    </div>
  );

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#030712] select-none text-white font-sans flex flex-col" onClick={(e) => {
      if (!e.target.closest('.filter-dropdown-wrapper')) closeAllDropdowns();
    }}>

      {/* BACKGROUND MAP */}
      <div id="map" className="absolute inset-0 z-0">
        {shouldRenderMap && <MapView />}
      </div>

      {/* TOP OVERLAYS (Header, Search, Filters, Stats) */}
      <div className="absolute top-0 inset-x-0 z-[1000] flex flex-col pointer-events-none">
        
        {/* Header Row */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 pointer-events-auto bg-[#0b1325]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border border-white/20 shadow-lg">
              <span className="text-white text-lg">🪖</span>
            </div>
            <span className="text-xl font-black tracking-wider text-white">FaujiNiwas</span>
          </div>

          {/* Desktop Search & Filters - INLINE (matching Image 1) */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-4xl mx-8">
             {/* Search input pill */}
             <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 shadow-inner w-72 focus-within:border-emerald-500/50 transition-colors">
                <input
                  type="text"
                  placeholder="Search cantonment, area or city..."
                  value={smartSearchQ}
                  onChange={(e) => setSmartSearchQ(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none w-full placeholder-white/40 font-medium"
                />
                <button className="text-white/40 ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
             </div>

             {/* Filters */}
             <div className="relative filter-dropdown-wrapper">
               <button onClick={() => { setRankDropdownOpen(!rankDropdownOpen); setBhkDropdownOpen(false); setBudgetDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-white/95">
                 Rank: {getRankLabel()}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </button>
               {rankDropdownOpen && (
                 <div className="absolute top-full mt-2 left-0 bg-[#0d1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                   {[
                     { label: 'All Ranks', val: 100000 },
                     { label: 'Officer', val: 60000 },
                     { label: 'JCO', val: 30000 },
                     { label: 'OR / Jawan', val: 15000 },
                   ].map(opt => (
                     <button key={opt.val} onClick={() => { setMaxPrice(opt.val); setRankDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
             </div>

             <div className="relative filter-dropdown-wrapper">
               <button onClick={() => { setBhkDropdownOpen(!bhkDropdownOpen); setRankDropdownOpen(false); setBudgetDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-white/95">
                 BHK: {getBhkLabel()}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </button>
               {bhkDropdownOpen && (
                 <div className="absolute top-full mt-2 left-0 bg-[#0d1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 min-w-[140px] overflow-hidden">
                   {[{ label: 'Any BHK', val: 'all' }, { label: '1 BHK', val: '1' }, { label: '2 BHK', val: '2' }, { label: '3+ BHK', val: '3+' }].map(opt => (
                     <button key={opt.val} onClick={() => { setBhkFilter(opt.val); setBhkDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
             </div>

             <div className="relative filter-dropdown-wrapper">
               <button onClick={() => { setBudgetDropdownOpen(!budgetDropdownOpen); setRankDropdownOpen(false); setBhkDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-white/95">
                 Budget: {getBudgetLabel()}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </button>
               {budgetDropdownOpen && (
                 <div className="absolute top-full mt-2 left-0 bg-[#0d1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                   {[{ label: 'Any Budget', val: 100000 }, { label: 'Under ₹10k', val: 10000 }, { label: 'Under ₹20k', val: 20000 }, { label: 'Under ₹30k', val: 30000 }].map(opt => (
                     <button key={opt.val} onClick={() => { setMaxPrice(opt.val); setBudgetDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
             </div>

             <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-white/95">
               Military
             </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-white/80 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0b1325]"></span>
            </button>
            <div onClick={() => ctx.openProfile && ctx.openProfile()} className="w-9 h-9 rounded-full overflow-hidden border border-white/30 cursor-pointer shadow-lg transition-transform hover:scale-105">
              <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fauji'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Mobile-only Search Bar Row (matching Image 2) */}
        <div className="lg:hidden px-4 py-2.5 pointer-events-auto">
          <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2.5 shadow-lg">
            <input
              type="text"
              placeholder="Search cantonment, area or city..."
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              className="bg-transparent text-sm text-white outline-none w-full placeholder-white/50 font-medium"
            />
            <button className="text-white/60 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile-only Filters Row (matching Image 2) */}
        <div className="lg:hidden px-4 py-1 pointer-events-auto overflow-x-auto custom-scrollbar flex items-center gap-3">
          <div className="relative filter-dropdown-wrapper shrink-0">
            <button onClick={() => { setRankDropdownOpen(!rankDropdownOpen); setBhkDropdownOpen(false); setBudgetDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b354d]/70 backdrop-blur-md border border-white/20 shadow-lg text-xs text-white/90">
              Rank
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {rankDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-[#0d1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                {[
                  { label: 'All Ranks', val: 100000 },
                  { label: 'Officer', val: 60000 },
                  { label: 'JCO', val: 30000 },
                  { label: 'OR / Jawan', val: 15000 },
                ].map(opt => (
                  <button key={opt.val} onClick={() => { setMaxPrice(opt.val); setRankDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative filter-dropdown-wrapper shrink-0">
            <button onClick={() => { setBhkDropdownOpen(!bhkDropdownOpen); setRankDropdownOpen(false); setBudgetDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b354d]/70 backdrop-blur-md border border-white/20 shadow-lg text-xs text-white/90">
              BHK
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {bhkDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-[#0d1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 min-w-[140px] overflow-hidden">
                {[{ label: 'Any BHK', val: 'all' }, { label: '1 BHK', val: '1' }, { label: '2 BHK', val: '2' }, { label: '3+ BHK', val: '3+' }].map(opt => (
                  <button key={opt.val} onClick={() => { setBhkFilter(opt.val); setBhkDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative filter-dropdown-wrapper shrink-0">
            <button onClick={() => { setBudgetDropdownOpen(!budgetDropdownOpen); setRankDropdownOpen(false); setBhkDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b354d]/70 backdrop-blur-md border border-white/20 shadow-lg text-xs text-white/90">
              Budget
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {budgetDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-[#0d1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                {[{ label: 'Any Budget', val: 100000 }, { label: 'Under ₹10k', val: 10000 }, { label: 'Under ₹20k', val: 20000 }, { label: 'Under ₹30k', val: 30000 }].map(opt => (
                  <button key={opt.val} onClick={() => { setMaxPrice(opt.val); setBudgetDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b354d]/70 backdrop-blur-md border border-white/20 shadow-lg text-xs text-white/90 shrink-0 pointer-events-auto">
            Military
          </button>
        </div>

        {/* Mobile-only Stats Pill Row (matching Image 2) */}
        <div className="lg:hidden px-4 py-2 pointer-events-auto flex">
           <StatsRow />
        </div>
      </div>

      {/* LEFT PANEL / SIDEBAR (Listings - matching Image 1 & Image 2) */}
      <div className={`absolute z-[800] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col bg-[#051310]/85 backdrop-blur-3xl border-t border-emerald-500/20 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] ${sidebarOpen ? 'top-[50%] inset-x-0 bottom-0 rounded-t-[32px] lg:top-24 lg:bottom-6 lg:left-6 lg:w-[420px] lg:rounded-2xl lg:border' : 'top-[100%] inset-x-0 bottom-0 lg:top-[100%]'}`}>
        
        {/* Mobile drag handle */}
        <div className="w-full h-8 flex items-center justify-center cursor-pointer shrink-0 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div className="w-12 h-1.5 bg-white/25 rounded-full"></div>
        </div>

        {/* Desktop close button + Stats Row integrated at top of Sidebar on Desktop */}
        <div className="hidden lg:flex flex-col gap-3.5 px-6 pt-5 pb-4 border-b border-white/10">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-wider text-emerald-400 uppercase">{activeView === 'rentals' ? 'Housing' : activeView === 'market' ? 'Market' : 'Dorms'}</h2>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-300">✕</button>
           </div>
           <StatsRow />
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden relative custom-scrollbar-panel px-4 lg:px-6 py-2">
          <Sidebar activeMobileView={true} />
        </div>
      </div>

      {/* FLOATING ACTION BUTTON (To open bottom sheet) - only visible when closed */}
      <button 
        className={`lg:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-[750] px-6 py-3.5 rounded-full bg-[#051310]/90 backdrop-blur-xl border border-emerald-500/30 text-white font-bold tracking-wide shadow-xl flex items-center gap-2 transition-all ${sidebarOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
        onClick={() => setSidebarOpen(true)}
      >
        <span>📋</span> View Listings
      </button>

    </div>
  );
}
