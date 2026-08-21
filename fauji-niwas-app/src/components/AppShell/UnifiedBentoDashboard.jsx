import React, { useContext, useMemo, useState, useCallback } from 'react';
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
    setMaxPrice,
    showCommuteZones,
    setShowCommuteZones,
    showSchools,
    setShowSchools,
    showHospitals,
    setShowHospitals
  } = allState;
  
  const listings = getFilteredListings(allState);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(true);
  const [visibleIds, setVisibleIds] = useState(null);

  // Expose listings globally for chatbot
  if (typeof window !== 'undefined') {
    window.__fauji_listings = listings;
  }

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

  // Live viewport calculations
  const handleBoundsChange = useCallback((ids) => {
    setVisibleIds(ids);
  }, []);

  const visibleItems = useMemo(() => {
    if (!visibleIds || !visibleIds.length) return items;
    const set = new Set(visibleIds);
    const inView = items.filter(item => set.has(item.id));
    return inView.length > 0 ? inView : items;
  }, [items, visibleIds]);

  const inViewCount = visibleItems.length;
  const inViewAvgPrice = useMemo(() => {
    const priced = visibleItems.filter(l => Number(l.price) > 0);
    if (!priced.length) return 0;
    return Math.round(priced.reduce((sum, l) => sum + (Number(l.price) || 0), 0) / priced.length);
  }, [visibleItems]);

  const formatK = (n) => n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`;

  const [bhkDropdownOpen, setBhkDropdownOpen] = useState(false);
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);

  // Close dropdowns on window click
  useEffect(() => {
    const handleClose = () => {
      setBhkDropdownOpen(false);
      setBudgetDropdownOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      ctx?.showToast('Geolocation not supported on this device', 'error');
      window.dispatchEvent(new CustomEvent('map-recenter'));
      return;
    }
    ctx?.showToast('Locating your position...', 'ok');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.dispatchEvent(new CustomEvent('map-recenter', { detail: { lat: coords.latitude, lng: coords.longitude } }));
        ctx?.showToast('Found your location!', 'ok');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        ctx?.showToast('Please enable location access in browser', 'error');
        window.dispatchEvent(new CustomEvent('map-recenter'));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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
          <MapView properties={items} onBoundsChange={handleBoundsChange} />
        </div>

        {/* ══ NAVBAR ══ */}
        <nav className="navbar">
          <a className="logo flex items-center gap-2.5" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>
            <img src="/logo-light.jpg" alt="FaujiNiwas" className="w-8 h-8 rounded-lg object-contain light-logo shadow-xs" />
            <img src="/logo-dark.jpg" alt="FaujiNiwas" className="w-8 h-8 rounded-lg object-contain dark-logo shadow-xs" />
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

          {/* BHK Filter with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className={`filter-btn ${bhkFilter !== 'all' ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                setBhkDropdownOpen(!bhkDropdownOpen);
                setBudgetDropdownOpen(false);
              }}
              title="Select BHK filter"
            >
              {bhkFilter === 'all' ? 'All BHK' : `${bhkFilter} BHK`}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {bhkDropdownOpen && (
              <div 
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  padding: '6px',
                  minWidth: '130px',
                  zIndex: 1200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {[
                  { value: 'all', label: 'All BHK' },
                  { value: '1', label: '1 BHK' },
                  { value: '2', label: '2 BHK' },
                  { value: '3', label: '3 BHK' },
                  { value: '4', label: '4+ BHK' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setBhkFilter(opt.value);
                      setBhkDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: bhkFilter === opt.value ? '#f59e0b' : 'transparent',
                      color: bhkFilter === opt.value ? '#ffffff' : '#334155',
                      fontWeight: bhkFilter === opt.value ? 800 : 600,
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Budget Filter with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className={`filter-btn ${maxPrice < 100000 ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                setBudgetDropdownOpen(!budgetDropdownOpen);
                setBhkDropdownOpen(false);
              }}
              title="Select Budget limit"
            >
              {maxPrice >= 100000 ? 'All Budgets' : `≤ ₹${maxPrice.toLocaleString()}`}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {budgetDropdownOpen && (
              <div 
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  padding: '6px',
                  minWidth: '160px',
                  zIndex: 1200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {[
                  { value: 100000, label: 'All Budgets' },
                  { value: 15000, label: 'Under ₹15,000 / mo' },
                  { value: 25000, label: 'Under ₹25,000 / mo' },
                  { value: 35000, label: 'Under ₹35,000 / mo' },
                  { value: 50000, label: 'Under ₹50,000 / mo' },
                  { value: 75000, label: 'Under ₹75,000 / mo' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMaxPrice(opt.value);
                      setBudgetDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: maxPrice === opt.value ? '#f59e0b' : 'transparent',
                      color: maxPrice === opt.value ? '#ffffff' : '#334155',
                      fontWeight: maxPrice === opt.value ? 800 : 600,
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            id="btn-accessibility"
            className="filter-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (ctx?.openAccessibility) {
                ctx.openAccessibility();
              } else if (window.openAccessibilityModal) {
                window.openAccessibilityModal();
              }
            }}
            title="Accessibility & Theme settings"
          >
            <span>♿ Contrast &amp; Font</span>
          </button>

          <div className="nav-gap"></div>

          {/* Top Nav Post Button */}
          <button 
            onClick={() => ctx.openPost?.()} 
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              background: '#16a34a',
              color: '#ffffff',
              border: '1px solid #15803d',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
              marginRight: '6px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; }}
            title="Post a New Property or Marketplace Listing"
          >
            <span>✚</span>
            <span>Post</span>
          </button>

          {user ? (
            <button onClick={() => ctx.openProfile?.()} className="sign-btn">
              Profile
            </button>
          ) : (
            <button onClick={() => ctx.openProfile?.()} className="sign-btn">
              Sign In / Sign Up
            </button>
          )}
        </nav>

        {/* ══ STATS (Live Viewport Area Stats) ══ */}
        <div className="stats-bar" style={{
          left: isPanelOpen ? '376px' : '20px',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div className="stat-pill">
            <span className="live-dot"></span>
            Listings in view <strong style={{marginLeft:'4px'}}>{inViewCount}</strong>
          </div>
          <div className="stat-pill">
            <span className="live-dot" style={{background:'#f59e0b',boxShadow:'0 0 8px #f59e0b'}}></span>
            Average price <strong style={{marginLeft:'4px'}}>{inViewAvgPrice > 0 ? formatK(inViewAvgPrice) : '—'}</strong>
          </div>
        </div>

        {/* ══ PANEL (Sidebar with smooth collapse) ══ */}
        <div 
          className="panel" 
          id="panel"
          style={{
            transform: isPanelOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Tabs Navigation (Homes | SSB Dorms | Marketplace) */}
          <div className="flex gap-2 mb-4 pb-2 border-b border-black/5 bg-[#0b1325]/5 dark:bg-white/5 p-1.5 rounded-xl">
            {[
              { id: 'rentals', label: 'Homes', icon: '🏠' },
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
              items.slice(0, 25).map(item => {
                if (activeView === 'dorms') {
                  return (
                    <DormCard
                      key={item.id}
                      dorm={item}
                      onFoodClick={(city) => ctx.openFood(item.city)}
                      onClick={() => ctx.openDetail?.(item.id)}
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
                      listing={item}
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

        {/* ══ PANEL COLLAPSE TOGGLE BUTTON ══ */}
        <button
          onClick={() => setIsPanelOpen(v => !v)}
          style={{
            position: 'fixed',
            top: '50%',
            left: isPanelOpen ? '362px' : '0px',
            transform: 'translateY(-50%)',
            zIndex: 950,
            width: '24px',
            height: '48px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderLeft: isPanelOpen ? 'none' : '1px solid #cbd5e1',
            borderRadius: '0 10px 10px 0',
            boxShadow: '3px 0 12px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 900,
            color: '#475569',
            cursor: 'pointer',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s, color 0.15s'
          }}
          title={isPanelOpen ? 'Collapse listings' : 'Expand listings'}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#475569'; }}
        >
          {isPanelOpen ? '‹' : '›'}
        </button>

        {/* ══ MAP CONTROLS (Top Right) ══ */}
        <div className="map-ctrl">
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))} className="ctrl-btn" title="Zoom In">+</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))} className="ctrl-btn" title="Zoom Out">−</button>
          <button onClick={handleLocateMe} className="ctrl-btn" title="My Current Location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
            </svg>
          </button>
        </div>

        {/* ══ NEARBY FACILITIES (Collapsible & Interactive) ══ */}
        <div className="legend" style={{ zIndex: 850 }}>
          {!isFacilitiesOpen ? (
            <button 
              onClick={() => setIsFacilitiesOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 800,
                color: 'inherit',
                padding: '2px 0'
              }}
              title="Expand Nearby Facilities"
            >
              <span>📍 Nearby Facilities</span>
              <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div className="legend-title font-bold" style={{ margin: 0, fontSize: '13px' }}>
                  Nearby Facilities
                </div>
                <button 
                  onClick={() => setIsFacilitiesOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    lineHeight: 1
                  }}
                  title="Collapse Facilities"
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setShowCommuteZones(!showCommuteZones)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '6px 8px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: showCommuteZones ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.06)',
                    background: showCommuteZones ? 'rgba(34,197,94,0.12)' : 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: showCommuteZones ? 700 : 500,
                    color: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🚆</span>
                    <span>Station Commute Zone</span>
                  </div>
                  <span style={{ fontSize: '11px', color: showCommuteZones ? '#16a34a' : '#94a3b8' }}>
                    {showCommuteZones ? '✓' : '○'}
                  </span>
                </button>

                <button
                  onClick={() => setShowSchools(!showSchools)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '6px 8px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: showSchools ? 'rgba(59,130,246,0.4)' : 'rgba(0,0,0,0.06)',
                    background: showSchools ? 'rgba(59,130,246,0.12)' : 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: showSchools ? 700 : 500,
                    color: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🏫</span>
                    <span>Army School</span>
                  </div>
                  <span style={{ fontSize: '11px', color: showSchools ? '#2563eb' : '#94a3b8' }}>
                    {showSchools ? '✓' : '○'}
                  </span>
                </button>

                <button
                  onClick={() => setShowHospitals(!showHospitals)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '6px 8px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: showHospitals ? 'rgba(239,68,68,0.4)' : 'rgba(0,0,0,0.06)',
                    background: showHospitals ? 'rgba(239,68,68,0.12)' : 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: showHospitals ? 700 : 500,
                    color: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🏥</span>
                    <span>Military Hospital</span>
                  </div>
                  <span style={{ fontSize: '11px', color: showHospitals ? '#dc2626' : '#94a3b8' }}>
                    {showHospitals ? '✓' : '○'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ══ CHAT FAB (Desktop Bottom Anchor - Toggle open/collapse) ══ */}
        <button 
          className="chat-fab" 
          onClick={() => {
            if (typeof window.toggleChatbot === 'function') {
              window.toggleChatbot();
            } else if (typeof window.openFaujiChatbot === 'function') {
              window.openFaujiChatbot();
            } else if (ctx.openChat) {
              ctx.openChat();
            }
          }} 
          title="Military AI Assistant"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

      </div>
    </>
  );
}
