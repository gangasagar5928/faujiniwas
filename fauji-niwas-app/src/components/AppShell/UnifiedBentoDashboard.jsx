import React, { useContext, useState } from 'react';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore } from '../../store/filterStore';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';

export default function UnifiedBentoDashboard() {
  const ctx = useContext(ModalContext);
  const { user, isAdmin } = useAuth();
  
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

  const handleHraChange = (e) => {
    const val = e.target.value;
    if (val === 'OR') {
      setMaxPrice(15000);
    } else if (val === 'JCO') {
      setMaxPrice(30000);
    } else if (val === 'Officer') {
      setMaxPrice(100000);
    } else {
      setMaxPrice(100000);
    }
  };

  const getHraValue = () => {
    if (maxPrice <= 15000) return 'OR';
    if (maxPrice <= 30000) return 'JCO';
    return 'Officer';
  };

  const showAdminButton = user && (isAdmin || user.email === 'admin@faujiniwas.com' || user.isAdmin);

  return (
    <div className={`app-container select-none ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      
      {/* 1. TOP HEADER */}
      <header className="header justify-between">
        
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-2 text-slate-100 uppercase tracking-widest font-heading font-black">
            <span className="text-amber-500 text-lg">🪖</span> 
            <span className="flex flex-col text-left">
              <span className="text-sm font-black tracking-tight text-white leading-none">FAUJINIWAS</span>
              <span className="text-[7px] text-[#22c55e] font-bold tracking-wider mt-0.5">SECURE. VERIFIED. FOR OURS.</span>
            </span>
          </span>
        </div>

        {/* Center: Search & Capsule Tab Swappers */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-4xl px-4">
          
          {/* Header Search input */}
          <div className="flex items-center bg-[#090d16] border border-[#1e293b] px-3.5 py-1.5 rounded-full w-[280px] hover:border-amber-500/30 transition-colors">
            <span className="text-slate-500 mr-2 text-[10px]">🔍</span>
            <input 
              type="text" 
              placeholder="Search cantonment, area or city..." 
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              className="bg-transparent text-[10px] text-white outline-none w-full placeholder-slate-500 font-medium"
            />
            <span className="text-slate-600 text-[8px] font-mono ml-2 border border-slate-800 px-1.5 py-0.25 rounded">⌘K</span>
          </div>

          {/* Capsule Tab Switcher */}
          <div className="flex gap-1 bg-[#090d16] border border-[#1e293b] p-1 rounded-full whitespace-nowrap">
            {[
              { id: 'rentals', label: 'Rentals', icon: '🏠' },
              { id: 'market', label: 'Marketplace', icon: '🛍️' },
              { id: 'dorms', label: 'SSR Dorms', icon: '🏨' },
              { id: 'saved', label: 'Shortlist', icon: '⭐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  activeView === tab.id 
                    ? 'bg-[#18233c] text-white border border-[#1e293b] shadow-md' 
                    : 'text-slate-500 border border-transparent hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Right: Notification and Dropdown Profile badge */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notification Bell */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[#10192e] border border-[#1e293b] text-slate-300 hover:text-white transition-all cursor-pointer">
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/20 text-[#22c55e] border border-emerald-500/40 flex items-center justify-center text-[8px] font-black font-mono">3</span>
          </button>

          {/* User Profile dropdown Badge */}
          <div 
            onClick={() => ctx.openProfile && ctx.openProfile()}
            className="flex items-center gap-2.5 bg-[#10192e] border border-[#1e293b] pl-2 pr-3.5 py-1 rounded-full cursor-pointer hover:border-amber-500/50 transition-all text-left"
            title="Profile Locker"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-600/30 text-[#22c55e] border border-[#22c55e]/25 flex items-center justify-center text-[10px] font-bold font-mono">AS</div>
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-extrabold text-white">Major Sharma</span>
              <span className="text-[7px] font-bold text-[#22c55e] uppercase tracking-wider">JCO COMMAND</span>
            </div>
            <span className="text-slate-500 text-[8px] font-bold ml-1">▼</span>
          </div>

        </div>
      </header>

      {/* 2. BENTO METRICS BAR */}
      <div className="bento-row px-6 py-3 border-b border-[#1e293b] bg-[#0b1120]">
        <div className="max-w-[1920px] mx-auto grid grid-cols-6 gap-4">
          
          {/* Card 1: Verified Listings */}
          <div className="bg-[#10192e] border border-[#1e293b] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-emerald-400">
              ⚡
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Verified Listings</span>
              <span className="text-lg font-black text-white mt-0.5">1,395</span>
              <span className="text-[7px] font-bold uppercase text-[#22c55e] tracking-widest mt-0.5">Active Beacons</span>
            </div>
          </div>

          {/* Card 2: Today's New */}
          <div className="bg-[#10192e] border border-[#1e293b] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              🌸
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Today's New</span>
              <span className="text-lg font-black text-white mt-0.5">48</span>
              <span className="text-[7px] font-bold uppercase text-slate-500 tracking-widest mt-0.5 font-mono">New Additions</span>
            </div>
          </div>

          {/* Card 3: Average Rent */}
          <div className="bg-[#10192e] border border-[#1e293b] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              🪙
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Average Rent</span>
              <span className="text-lg font-black text-white mt-0.5">₹12,452</span>
              <span className="text-[7px] font-bold uppercase text-slate-500 tracking-widest mt-0.5 font-mono">Per Month</span>
            </div>
          </div>

          {/* Card 4: Occupancy Rate */}
          <div className="bg-[#10192e] border border-[#1e293b] p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                📊
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Occupancy Rate</span>
                <span className="text-lg font-black text-white mt-0.5">86%</span>
                <span className="text-[7px] font-bold uppercase text-slate-500 tracking-widest mt-0.5 font-mono">Across India</span>
              </div>
            </div>
            <span className="text-slate-500 text-xs font-mono pr-1 select-none">&gt;</span>
          </div>

          {/* Card 5: AppSec Status */}
          <div className="bg-[#10192e] border border-[#1e293b] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-emerald-400">
              🛡️
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">AppSec Status</span>
              <span className="text-lg font-black text-[#22c55e] mt-0.5">ACTIVE</span>
              <span className="text-[7px] font-bold uppercase text-[#22c55e] tracking-widest mt-0.5 font-mono">AES-256 Encrypted</span>
            </div>
          </div>

          {/* Card 6: Family Accommodation */}
          <div className="bg-[#10192e] border border-[#1e293b] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              👥
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Family Accommodation</span>
              <span className="text-[10px] font-black text-white mt-1 uppercase tracking-wider">Family Quarters</span>
              <span className="text-[7px] font-bold uppercase text-[#22c55e] tracking-widest mt-0.5">View Options</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. LEFT-MOST NAVIGATION SIDEBAR */}
      <aside className="nav-sidebar">
        
        {/* Navigation list */}
        <div className="flex flex-col items-center gap-3">
          {[
            { id: 'rentals', label: '🏠', active: activeView === 'rentals' },
            { id: 'market', label: '🛍️', active: activeView === 'market' },
            { id: 'dorms', label: '👥', active: activeView === 'dorms' },
            { id: 'saved', label: '⭐', active: activeView === 'saved' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveView(btn.id)}
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
            title="Reset Controls"
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

      {/* 4. LEFT SIDEBAR PANEL */}
      <Sidebar activeMobileView={activeMobileTab === 'listings'} />

      {/* 5. MAP COLUMN */}
      <div id="map" className={`relative ${activeMobileTab === 'map' ? 'active-mobile-view' : ''}`}>
        
        {/* Leaflet map renderer */}
        <MapView />

        {/* Sidebar pop-out toggle button for desktop/tablet */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-[1000] w-6 h-16 bg-[#10192e]/90 hover:bg-[#18233c] text-slate-300 hover:text-white border-y border-r border-[#1e293b] rounded-r-xl items-center justify-center cursor-pointer shadow-2xl transition-all hover:w-7"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <span className="text-[10px]">{sidebarOpen ? '◀' : '▶'}</span>
        </button>

        {/* Map filter facilities toolbar (Schools, Hospitals, Canteens, ATMs, More) */}
        <div className="absolute bottom-5 right-5 z-[500] bg-[#10192e]/95 border border-[#1e293b] rounded-2xl p-2.5 shadow-xl flex items-center gap-4 text-[9px] font-black uppercase tracking-wider text-slate-300 backdrop-blur-md">
          <button 
            onClick={() => alert("Filtering local schools near cantonment...")}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none font-bold"
          >
            <span>🏫</span> Schools
          </button>
          <div className="w-px h-3.5 bg-[#1e293b]"></div>
          <button 
            onClick={() => alert("Filtering local Military and ECHS Hospitals...")}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none font-bold"
          >
            <span>🏥</span> Hospitals
          </button>
          <div className="w-px h-3.5 bg-[#1e293b]"></div>
          <button 
            onClick={() => alert("Filtering local CSD Canteens...")}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none font-bold"
          >
            <span>🛍️</span> Canteens
          </button>
          <div className="w-px h-3.5 bg-[#1e293b]"></div>
          <button 
            onClick={() => alert("Filtering local ATMs near base corridor...")}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none font-bold"
          >
            <span>🏧</span> ATMs
          </button>
          <div className="w-px h-3.5 bg-[#1e293b]"></div>
          <button 
            onClick={() => alert("Expanding extra local amenities...")}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none font-bold"
          >
            <span>•••</span> More
          </button>
        </div>

      </div>

      {/* 6. BOTTOM STATUS FOOTER */}
      <footer className="status-footer px-6 py-1.5 bg-[#090d16] border-t border-[#1e293b] flex items-center justify-between text-[8px] font-mono tracking-widest text-slate-500 select-none shrink-0 h-9">
        
        {/* Left: Encryption shield */}
        <div className="flex items-center gap-1.5 text-[#22c55e]">
          <span className="text-xs">🛡️</span>
          <span className="font-extrabold uppercase">SECURE LINK</span>
          <span className="text-slate-500 font-medium">· AES-256 ENCRYPTED</span>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-4 text-[8px] font-bold">
          
          <div className="flex items-center gap-1">
            <span>🌐</span>
            <span className="text-slate-400 uppercase">INDIA</span>
          </div>

          <div className="h-3 w-px bg-[#1e293b]"></div>

          <button 
            onClick={() => alert("Pinpointing base coordinates via secure network...")}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer uppercase"
          >
            <span>🎯</span> LOCATE ME
          </button>

          <div className="h-3 w-px bg-[#1e293b]"></div>

          <div className="flex items-center gap-1.5">
            <span className="uppercase text-slate-400">OFFLINE</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-6 h-3 bg-[#10192e] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#22c55e] after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-[#22c55e]/20 border border-[#1e293b]"></div>
            </label>
          </div>

        </div>

        {/* Right: Help options */}
        <div className="flex items-center gap-3">
          <span className="uppercase text-slate-500 font-extrabold">HELP DESK:</span>
          <button onClick={() => alert("Initiating admin messaging gateway...")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">💬 CHAT</button>
          <span className="text-slate-700">|</span>
          <button onClick={() => alert("Dialing military support operator...")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">📞 CALL</button>
        </div>

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
