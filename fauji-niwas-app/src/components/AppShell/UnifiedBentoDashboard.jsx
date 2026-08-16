import React, { useContext, useMemo } from 'react';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import MapView from '../Map/MapView';
import ListingCard from '../Sidebar/ListingCard';
import MarketCard from '../Sidebar/MarketCard';
import DormCard from '../Sidebar/DormCard';
import MobileDashboard from './MobileDashboard';

export default function UnifiedBentoDashboard() {
  const ctx = useContext(ModalContext);
  const { user } = useAuth();
  const allState = useFilterStore((s) => s);
  const { 
    activeView, 
    setActiveView, 
    smartSearchQ, 
    setSmartSearchQ,
    bhkFilter,
    setBhkFilter,
    maxPrice,
    setMaxPrice
  } = allState;
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

  const handleBhkToggle = () => {
    if (bhkFilter === 'all') setBhkFilter('2');
    else if (bhkFilter === '2') setBhkFilter('3');
    else if (bhkFilter === '3') setBhkFilter('1');
    else setBhkFilter('all');
  };

  const handleBudgetToggle = () => {
    if (maxPrice >= 100000) setMaxPrice(15000);
    else if (maxPrice <= 15000) setMaxPrice(30000);
    else if (maxPrice <= 30000) setMaxPrice(50000);
    else setMaxPrice(100000);
  };

  return (
    <>
      {/* ══ MOBILE UI (< 768px) ══ */}
      <div className="block md:hidden w-full h-[100dvh] overflow-hidden">
        <MobileDashboard items={items} />
      </div>

      {/* ══ DESKTOP / LAPTOP UI (>= 768px) ══ */}
      <div className="bento-desktop hidden md:block relative w-full h-[100dvh] overflow-hidden select-none">

        {/* ══ MAP BACKGROUND ══ */}
        <div id="map" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <MapView />
        </div>

        {/* ══ NAVBAR ══ */}
        <nav className="navbar">
          <a className="logo flex items-center gap-2.5" href="#" onClick={(e) => e.preventDefault()}>
            <img src="/logo-light.jpg" alt="FaujiNiwas" className="w-8 h-8 rounded-lg object-contain block dark:hidden shadow-xs" />
            <img src="/logo-dark.jpg" alt="FaujiNiwas" className="w-8 h-8 rounded-lg object-contain hidden dark:block shadow-xs" />
            <span className="font-extrabold tracking-tight text-slate-800 dark:text-white text-base">FaujiNiwas</span>
          </a>
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="Search cantonment, area or city…"
              value={smartSearchQ}
              onChange={e => setSmartSearchQ(e.target.value)}
            />
            <svg className="s-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          <button 
            className={`filter-btn ${bhkFilter !== 'all' ? 'active' : ''}`} 
            onClick={handleBhkToggle}
            title="Toggle BHK filter"
          >
            {bhkFilter === 'all' ? 'Filter by BHK' : `BHK: ${bhkFilter}BHK`}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <button 
            className={`filter-btn ${maxPrice < 100000 ? 'active' : ''}`} 
            onClick={handleBudgetToggle}
            title="Toggle Budget limit"
          >
            {maxPrice >= 100000 ? 'Filter by Budget' : `Budget: ≤₹${maxPrice/1000}k`}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <button 
            className="filter-btn" 
            onClick={() => ctx.openAccessibility?.()}
            title="Accessibility & Theme settings"
          >
            <span>♿ Contrast & Font</span>
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
            Total listings <strong style={{marginLeft:'4px'}}>{items.length}</strong>
          </div>
          <div className="stat-pill">
            <span className="live-dot" style={{background:'#f59e0b',boxShadow:'0 0 8px #f59e0b'}}></span>
            Average rent <strong style={{marginLeft:'4px'}}>₹18K</strong>
          </div>
        </div>

        {/* ══ PANEL ══ */}
        <div className="panel" id="panel">
          
          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-4 pb-2 border-b border-black/5 bg-[#0b1325]/5 dark:bg-white/5 p-1.5 rounded-xl">
            {[
              { id: 'rentals', label: 'Rent Cantt HRA', icon: '🏠' },
              { id: 'dorms', label: 'SSB Dorms', icon: '🏨' },
              { id: 'market', label: 'Marketplace', icon: '🏷️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border ${
                  activeView === tab.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-black/5 hover:bg-white dark:hover:bg-slate-700'
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
              items.slice(0, 20).map(item => {
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
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <span className="text-4xl mb-2 opacity-60">🗺️</span>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No matches found.<br/>Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ MAP CONTROLS (Top Right) ══ */}
        <div className="map-ctrl">
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))} className="ctrl-btn" title="Zoom In">+</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))} className="ctrl-btn" title="Zoom Out">−</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-recenter'))} className="ctrl-btn" title="Recenter Map">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
            </svg>
          </button>
          <button onClick={() => ctx.openPost?.()} className="ctrl-btn" title="Add Listing">➕</button>
        </div>

        {/* ══ LEGEND (Bottom Right) ══ */}
        <div className="legend">
          <div className="legend-title font-bold">Nearby Facilities</div>
          <div className="legend-item"><div className="l-icon">🚉</div> Station Commute Zone</div>
          <div className="legend-item"><div className="l-icon">🎓</div> Army School</div>
          <div className="legend-item"><div className="l-icon">🏥</div> Military Hospital</div>
        </div>

        {/* ══ CHAT FAB (Desktop Bottom Anchor) ══ */}
        <button 
          className="chat-fab" 
          onClick={() => {
            if (window.openFaujiChatbot) {
              window.openFaujiChatbot();
            } else if (ctx.openChat) {
              ctx.openChat();
            }
          }} 
          title="Open Military AI Assistant"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

      </div>
    </>
  );
}
