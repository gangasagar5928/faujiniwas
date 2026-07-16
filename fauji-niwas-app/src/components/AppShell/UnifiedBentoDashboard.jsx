import React, { useContext, useState, useMemo } from 'react';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import MapView from '../Map/MapView';
import ListingCard from '../Sidebar/ListingCard';
import MarketCard from '../Sidebar/MarketCard';
import DormCard from '../Sidebar/DormCard';

export default function UnifiedBentoDashboard() {
  const ctx = useContext(ModalContext);
  const { user } = useAuth();
  const allState = useFilterStore((s) => s);
  const { activeView, setActiveView, smartSearchQ, setSmartSearchQ, maxPrice, setMaxPrice, bhkFilter, setBhkFilter } = allState;
  const listings = getFilteredListings(allState);

  // Filter items based on active tab and search query
  const items = useMemo(() => {
    if (activeView === 'dorms') {
      if (!smartSearchQ) return SSB_DORMS;
      const q = smartSearchQ.toLowerCase();
      return SSB_DORMS.filter(
        d => d.name.toLowerCase().includes(q) || 
             d.ssb.toLowerCase().includes(q) || 
             d.city.toLowerCase().includes(q) || 
             d.area.toLowerCase().includes(q)
      );
    }
    return listings;
  }, [activeView, listings, smartSearchQ]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none">
      
      {/* ══ MAP BACKGROUND ══ */}
      <div id="map">
        <MapView />
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className="navbar">
        <a className="logo" href="#" onClick={(e) => e.preventDefault()}>
          <span className="logo-icon">🏠</span>
          FaujiNiwas
        </a>
        <div className="search-wrap">
          <input 
            type="text" 
            placeholder="Search cantonment, area or city…"
            value={smartSearchQ}
            onChange={e => setSmartSearchQ(e.target.value)}
          />
          <svg className="s-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <button className="filter-btn" onClick={() => ctx.openFilter?.('rank')}>
          Filter by Rank
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <button className="filter-btn" onClick={() => ctx.openFilter?.('bhk')}>
          Filter by BHK
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <button className="filter-btn" onClick={() => ctx.openFilter?.('budget')}>
          Filter by Budget
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div className="nav-gap"></div>
        {user ? (
          <button onClick={() => ctx.openProfile?.()} className="sign-btn">
            Profile
          </button>
        ) : (
          <button onClick={() => ctx.openProfile?.()} className="sign-btn">
            Sign in / Sign Up
          </button>
        )}
      </nav>

      {/* ══ STATS ══ */}
      <div className="stats-bar">
        <div className="stat-pill">
          <span className="live-dot"></span>
          Total listings <strong style={{marginLeft:'3px'}}>{items.length}</strong>
        </div>
        <div className="stat-pill">
          <span className="live-dot" style={{background:'#f59e0b',boxShadow:'0 0 8px #f59e0b'}}></span>
          Average rent <strong style={{marginLeft:'3px'}}>₹18K</strong>
        </div>
      </div>

      {/* ══ PANEL ══ */}
      <div className="panel" id="panel">
        
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-4 pb-2 border-b border-black/5 bg-[#0b1325]/5 p-1 rounded-xl">
          {[
            { id: 'rentals', label: 'Rent Cantt HRA', icon: '🏠' },
            { id: 'dorms', label: 'SSB Dorms', icon: '🏨' },
            { id: 'market', label: 'Marketplace', icon: '🏷️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                activeView === tab.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
                  : 'bg-black/5 text-slate-700 border-black/5 hover:bg-black/10 hover:border-black/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrolling List */}
        <div className="flex flex-col gap-3">
          {items.length > 0 ? (
            items.slice(0, 15).map(item => {
              if (activeView === 'dorms') {
                return (
                  <DormCard
                    key={item.id}
                    dorm={item}
                    onFoodClick={(city) => ctx.openFood(item.city)}
                  />
                );
              } else if (activeView === 'market') {
                return (
                  <MarketCard
                    key={item.id}
                    item={item}
                    onClick={() => ctx.openDetail?.(item.id)}
                  />
                );
              } else {
                return (
                  <ListingCard
                    key={item.id}
                    item={item}
                    onClick={() => ctx.openDetail?.(item.id)}
                  />
                );
              }
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <span className="text-3xl mb-2 opacity-60">🗺️</span>
              <p className="text-slate-500 text-xs">No matches found.<br/>Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT COLUMN ══ */}
      <div className="right-col">
        {/* LEGEND */}
        <div className="legend">
          <div className="legend-title">Nearby Facilities</div>
          <div className="legend-item"><div className="l-icon">🚉</div> Station Commute Zone</div>
          <div className="legend-item"><div className="l-icon">🎓</div> Army School</div>
          <div className="legend-item"><div className="l-icon">🏥</div> Military Hospital</div>
        </div>

        {/* MAP CONTROLS */}
        <div className="map-ctrl">
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))} className="ctrl-btn">+</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))} className="ctrl-btn">−</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-recenter'))} className="ctrl-btn" title="Recenter Map">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
            </svg>
          </button>
          <button onClick={() => ctx.openPost?.()} className="ctrl-btn" title="Add Listing">➕</button>
        </div>

        {/* CHAT FAB */}
        <button className="chat-fab" onClick={() => ctx.openChat?.()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}
