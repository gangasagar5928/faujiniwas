import React, { useContext } from 'react';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';
import ListingCard from '../Sidebar/ListingCard';
import MarketCard from '../Sidebar/MarketCard';
import DormCard from '../Sidebar/DormCard';

export default function UnifiedBentoDashboard() {
  const ctx = useContext(ModalContext);
  const { user, isAdmin } = useAuth();
  
  // Zustand store bindings
  const { 
    activeView, setActiveView,
    smartSearchQ, setSmartSearchQ,
    maxPrice, setMaxPrice,
    bhkFilter, setBhkFilter
  } = useFilterStore();

  const allState = useFilterStore((s) => s);
  const listings = getFilteredListings(allState);
  const isLoaded = allState.listings.length > 0;

  const isMarketEntry = (item) => item._collection === 'market' || item._collection === 'marketplace';

  // HRA allowance helper
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

  // Secure admin button check
  const showAdminButton = user && (isAdmin || user.email === 'admin@faujiniwas.com' || user.isAdmin);

  return (
    <div className="app-container">
      
      {/* 1. HEADER spans full width */}
      <header className="header justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-slate-300 flex items-center gap-2">
            <a href="/" className="hover:text-white transition-colors uppercase tracking-wider">FaujiNiwas</a> 
            <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 bg-[#171c24] rounded-full border border-[#232833]">v4.2.0</span>
          </span>
        </div>

        {/* Dynamic Collection Tab Switcher */}
        <div className="flex gap-1 bg-[#171c24] border border-[#2d3646] p-1 rounded-full">
          {[
            { id: 'rentals', label: '🏠 Rentals' },
            { id: 'market', label: '📦 Marketplace' },
            { id: 'dorms', label: '🏨 SSB Dorms' },
            { id: 'saved', label: '⭐ Shortlist' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                activeView === tab.id ? 'bg-[#c9a84c] text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar, HRA Filter & BHK Filter */}
        <div className="flex items-center gap-3 bg-[#171c24] border border-[#2d3646] px-4 py-1.5 rounded-full">
          <input 
            type="text" 
            placeholder="Search cantt, city, area..." 
            value={smartSearchQ}
            onChange={(e) => setSmartSearchQ(e.target.value)}
            className="bg-transparent text-xs text-white outline-none w-48 placeholder-slate-600"
          />
          <div className="h-4 w-[1px] bg-slate-800" />
          
          {/* HRA Filter */}
          <select 
            value={getHraValue()}
            onChange={handleHraChange}
            className="bg-transparent text-xs text-slate-400 outline-none cursor-pointer font-medium"
            title="HRA Budget Tier"
          >
            <option value="Officer">Officer (₹30k+)</option>
            <option value="JCO">JCO (₹15k-₹30k)</option>
            <option value="OR">OR (₹5k-₹15k)</option>
          </select>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* BHK Filter */}
          <select 
            value={bhkFilter}
            onChange={(e) => setBhkFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-400 outline-none cursor-pointer font-medium"
            title="BHK Size"
          >
            <option value="all">All BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3+">3+ BHK</option>
          </select>
        </div>

        {/* Post Button & Account Actions */}
        <div className="flex items-center gap-3">
          
          {/* Admin SIEM shortcut */}
          {showAdminButton && (
            <button 
              onClick={() => ctx.openAdmin && ctx.openAdmin()}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/20 transition-all"
              title="Admin & Security"
            >
              🛡️
            </button>
          )}

          {/* Profile Button */}
          <button 
            onClick={() => ctx.openProfile && ctx.openProfile()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c222c] border border-[#2d3646] text-slate-300 hover:text-white"
            title="Profile Locker"
          >
            👤
          </button>

          {/* Post Listing Button */}
          <button 
            onClick={() => ctx.openPost && ctx.openPost()}
            className="post-listing-btn"
          >
            + Post Listing
          </button>

        </div>
      </header>

      {/* 2. LEFT SIDEBAR (grid-row: 2, grid-column: 1) */}
      <Sidebar />

      {/* 3. MAP Container (grid-row: 2, grid-column: 2) */}
      <div id="map">
        <MapView />
      </div>

      {/* 4. BOTTOM PANEL horizontal scroll listing cards (grid-row: 3, grid-column: 1 / -1) */}
      <div className="listings-panel custom-scrollbar">
        
        {/* Special Card: Station Metrics */}
        <div 
          className="listing-card"
          style={{ width: '280px', minWidth: '280px', height: '150px', padding: '16px', background: '#0f1923', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
        >
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">Fauji Niwas Station Metrics</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Zero-brokerage routing infrastructure built to secure locational privacy across active transfer corridors.
            </p>
          </div>
          <div className="text-[9px] text-[#c9a84c] font-mono uppercase tracking-wider font-bold">
            🛡️ Encrypted Database
          </div>
        </div>

        {/* Special Card: Active Cantonment Housing */}
        <div 
          className="listing-card"
          style={{ width: '380px', minWidth: '380px', height: '150px', background: '#141e2e', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '12px', alignItems: 'center', borderRadius: '12px' }}
        >
          <div className="w-[100px] h-[126px] rounded-lg overflow-hidden relative bg-slate-800 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="House" />
          </div>
          <div className="flex-1 h-full flex flex-col justify-between py-1.5 pr-1">
            <div>
              <span className="px-2 py-0.5 bg-[#1c222c] text-amber-400 border border-amber-900/50 text-[8px] font-black tracking-wider uppercase rounded-full">🎖️ Command Recommended</span>
              <h3 className="text-xs font-bold text-white mt-1.5">Active Cantonment Housing</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">3BHK • Independent Floor • Secure Boundary</p>
            </div>
            <div className="flex justify-between items-center border-t border-[#232833] pt-1.5">
              <span className="text-[10px] font-bold text-emerald-400">Verified Direct</span>
              <button 
                onClick={() => alert("Secure request logged. Admin will review credentials.")} 
                className="px-2.5 py-1 bg-white text-[#0d0f12] text-[9px] font-bold rounded-full shadow hover:bg-slate-200 transition-all"
              >
                Request Link ↗
              </button>
            </div>
          </div>
        </div>

        {/* Render dynamic listing cards */}
        {!isLoaded ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="listing-card" style={{ height: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="w-full h-12 bg-slate-800 animate-pulse rounded-md" />
              <div className="w-2/3 h-4 bg-slate-800 animate-pulse rounded-md" />
              <div className="w-1/2 h-3 bg-slate-800 animate-pulse rounded-md" />
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="text-slate-400 text-xs px-4">No matching listings found. Try resetting filters.</div>
        ) : (
          listings.slice(0, 30).map((r, i) => {
            if (activeView === 'dorms') {
              return <DormCard key={r.id} dorm={r} onFoodClick={ctx.openFood} />;
            }
            return isMarketEntry(r)
              ? <MarketCard key={r.id} item={r} index={i} onClick={() => ctx.openDetail(r.id)} />
              : <ListingCard key={r.id} listing={r} index={i} onClick={() => ctx.openDetail(r.id)} />;
          })
        )}

      </div>

    </div>
  );
}
