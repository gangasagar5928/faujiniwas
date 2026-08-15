import React, { useState, useContext, useMemo } from 'react';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import MapView from '../Map/MapView';

const DEFAULT_SAMPLE_HOMES = [
  {
    id: 'sample-1',
    name: 'Spacious 2BHK Near Gate 3',
    city: 'Delhi Cantt',
    price: 14000,
    bhk: '2BHK',
    distance: '2.7 km',
    verified: true,
    badge: 'Verified',
    rating: '4.8 (128)',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  },
  {
    id: 'sample-2',
    name: 'Cozy 1BHK Officers Lane',
    city: 'Pune Cantt',
    price: 9500,
    bhk: '1BHK',
    distance: '1.8 km',
    verified: false,
    badge: 'Owner',
    rating: '4.8 (128)',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  },
  {
    id: 'sample-3',
    name: '3BHK Family Flat AFDCC Road',
    city: 'Ambala Cantt',
    price: 22000,
    bhk: '3BHK',
    distance: '1.0 km',
    verified: true,
    badge: 'Verified',
    rating: '4.8 (128)',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
  },
  {
    id: 'sample-4',
    name: 'PG for SSB Candidates',
    city: 'Chandigarh',
    price: 6000,
    bhk: 'PG/Room',
    distance: '0.8 km',
    verified: false,
    badge: 'Owner',
    rating: '4.8 (128)',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  },
  {
    id: 'sample-5',
    name: '3BHK Ground Floor Delhi Cantt',
    city: 'Delhi Cantt',
    price: 28000,
    bhk: '3BHK',
    distance: '2.0 km',
    verified: true,
    badge: 'Verified',
    rating: '4.8 (128)',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
  },
];

// SVG category icons - exact match to reference image
const CategoryIcons = {
  all: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  bhk: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  rank: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  budget: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  near_academy: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

// SVG bottom nav icons - exact match to reference image
const NavIcons = {
  home: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color === '#15803d' ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  map: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
    </svg>
  ),
  saved: (color, filled) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  ai: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  profile: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

export default function MobileDashboard({ items = [] }) {
  const ctx = useContext(ModalContext);
  const [mobileTab, setMobileTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Current Location');

  const smartSearchQ = useFilterStore((s) => s.smartSearchQ);
  const setSmartSearchQ = useFilterStore((s) => s.setSmartSearchQ);
  const setBhkFilter = useFilterStore((s) => s.setBhkFilter);

  const wishlist = useUserStore((s) => s.wishlist) || [];
  const toggleWishlist = useUserStore((s) => s.toggleWishlist);

  const displayHomes = useMemo(() => {
    let sourceList = items.length > 0 ? items : DEFAULT_SAMPLE_HOMES;

    if (mobileTab === 'saved') {
      sourceList = sourceList.filter(h => wishlist.includes(h.id));
    }

    if (smartSearchQ) {
      const q = smartSearchQ.toLowerCase();
      sourceList = sourceList.filter(h =>
        (h.name && h.name.toLowerCase().includes(q)) ||
        (h.city && h.city.toLowerCase().includes(q)) ||
        (h.address && h.address.toLowerCase().includes(q))
      );
    }

    if (activeCategory === 'bhk') {
      sourceList = sourceList.filter(h => (h.bhk || '').includes('BHK'));
    } else if (activeCategory === 'near_academy') {
      sourceList = sourceList.filter(h => h.verified || (h.distance && parseFloat(h.distance) < 2.0));
    } else if (activeCategory === 'budget') {
      sourceList = [...sourceList].sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return sourceList.length > 0 ? sourceList : DEFAULT_SAMPLE_HOMES;
  }, [items, mobileTab, wishlist, smartSearchQ, activeCategory]);

  const handleCardClick = (home) => {
    if (window.fn_tts_active || localStorage.getItem('fn_tts') === 'true') {
      if ('speechSynthesis' in window) {
        const text = `${home.name || 'Property'}. Rent is ${home.price ? home.price.toLocaleString() : ''} rupees per month. Located at ${home.city || 'Cantonment'}.`;
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-IN';
        window.speechSynthesis.speak(msg);
      }
    }
    if (home.id && !home.id.startsWith('sample-')) {
      ctx.openDetail?.(home.id);
    } else {
      ctx.showToast?.(`Viewing ${home.name}`);
    }
  };

  const handleLocationChange = () => {
    // Try real geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedLocation('Current Location');
          setSmartSearchQ('');
          ctx.showToast?.('Location updated to Current Location');
        },
        () => {
          // Fallback cycle through cities
          const cities = ['Current Location', 'Delhi Cantt', 'Pune Cantt', 'Ambala Cantt', 'Chandigarh', 'Jaipur Cantt', 'Secunderabad'];
          const nextIdx = (cities.indexOf(selectedLocation) + 1) % cities.length;
          const nextLoc = cities[nextIdx];
          setSelectedLocation(nextLoc);
          if (nextLoc !== 'Current Location') setSmartSearchQ(nextLoc);
          else setSmartSearchQ('');
          ctx.showToast?.(`Location set to ${nextLoc}`);
        }
      );
    } else {
      const cities = ['Current Location', 'Delhi Cantt', 'Pune Cantt', 'Ambala Cantt', 'Chandigarh', 'Jaipur Cantt', 'Secunderabad'];
      const nextIdx = (cities.indexOf(selectedLocation) + 1) % cities.length;
      const nextLoc = cities[nextIdx];
      setSelectedLocation(nextLoc);
      if (nextLoc !== 'Current Location') setSmartSearchQ(nextLoc);
      else setSmartSearchQ('');
      ctx.showToast?.(`Location set to ${nextLoc}`);
    }
  };

  const categories = [
    { id: 'all', label: 'All Homes' },
    { id: 'bhk', label: 'BHK' },
    { id: 'rank', label: 'Rank' },
    { id: 'budget', label: 'Budget' },
    { id: 'near_academy', label: 'Near Academy' },
  ];

  const navTabs = [
    { id: 'home', label: 'Home' },
    { id: 'map', label: 'Map' },
    { id: 'saved', label: 'Saved' },
    { id: 'ai', label: 'AI Helper' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-white text-slate-900 font-sans overflow-hidden">

      {/* ══ TOP HEADER ══ */}
      <header className="shrink-0 bg-white px-4 pt-4 pb-3 z-[900]" style={{ borderBottom: '1px solid #f1f5f9' }}>

        {/* Row 1: Logo + Bell */}
        <div className="flex items-center justify-between mb-3">
          {/* Shield Logo + Text */}
          <div className="flex items-center gap-2.5">
            {/* Shield SVG icon — exact match reference */}
            <div className="w-10 h-10 rounded-xl bg-[#1b4332] flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[22px] font-black text-[#1b4332] tracking-tight leading-none">FaujiNiwas</span>
              <span className="text-[9px] font-bold text-[#92400e] uppercase tracking-widest mt-[3px]">DEFENCE HOUSING PORTAL</span>
            </div>
          </div>

          {/* Bell Notification */}
          <button
            onClick={() => ctx.openTransfers?.()}
            className="w-9 h-9 flex items-center justify-center cursor-pointer relative"
            aria-label="Notifications"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#15803d] border border-white" />
          </button>
        </div>

        {/* Row 2: Search + Filter button */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search city, cantonment or academy"
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              style={{ paddingLeft: '38px' }}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-full py-2.5 pr-4 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#1b4332] transition-all"
            />
          </div>
          {/* Dark green filter/tune button */}
          <button
            onClick={() => ctx.openAccessibility?.()}
            className="w-10 h-10 rounded-full bg-[#1b4332] flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-transform active:scale-95"
            aria-label="Filter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
          </button>
        </div>

        {/* Row 3: Location bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
            </svg>
            <span>{selectedLocation}</span>
          </div>
          <button
            onClick={handleLocationChange}
            className="flex items-center gap-1 text-[12px] font-semibold text-slate-600 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
            </svg>
            <span>Change</span>
          </button>
        </div>
      </header>

      {/* ══ MAIN CONTENT ══ */}
      {mobileTab === 'map' ? (
        <div className="w-full flex-1 relative min-h-0">
          <MapView />
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto min-h-0 pb-24">

          {/* ══ CATEGORY ICONS — sticky translucent bar ══ */}
          <div
            className="sticky top-0 z-10 px-4 py-3 flex items-start justify-between gap-2 overflow-x-auto no-scrollbar"
            style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(241,245,249,0.8)' }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'bhk') setBhkFilter('2');
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
                  style={{ minWidth: '56px' }}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#1b4332] text-white shadow-md shadow-[#1b4332]/30'
                        : 'bg-white border border-slate-200 text-slate-500'
                    }`}
                  >
                    {React.cloneElement(CategoryIcons[cat.id], {
                      stroke: isActive ? 'white' : '#475569',
                      width: 19,
                      height: 19,
                    })}
                  </div>
                  <span
                    className={`text-[10px] text-center leading-tight whitespace-nowrap ${
                      isActive ? 'text-[#1b4332] font-bold' : 'text-slate-500 font-medium'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ══ SECTION HEADER ══ */}
          <div className="flex items-center justify-between mb-3 px-4 mt-3">
            <h2 className="text-[16px] font-black text-slate-900">Popular Homes Near You</h2>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[13px] font-bold text-[#854d0e] cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* ══ PROPERTY CARDS ══ */}
          <div className="flex flex-col gap-3 px-4">
            {displayHomes.map((home) => {
              const isSaved = wishlist.includes(home.id);
              const priceVal = Number(home.price) || 14000;
              const displayBadge = home.badge || (home.verified ? 'Verified' : 'Owner');
              const isVerifiedBadge = displayBadge === 'Verified';

              return (
                <div
                  key={home.id}
                  onClick={() => handleCardClick(home)}
                  className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3 relative shadow-sm hover:shadow-md transition-all cursor-pointer"
                  style={{ minHeight: '96px' }}
                >
                  {/* Thumbnail */}
                  <div className="w-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={home.image || home.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'}
                      alt={home.name || 'Property'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span
                      className="absolute top-1.5 left-1.5 text-[9px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: isVerifiedBadge ? '#15803d' : '#92400e',
                        color: 'white',
                      }}
                    >
                      {displayBadge}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 pr-6">
                    <div>
                      <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug">
                        {home.name || 'Property'}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5 text-[12px] text-slate-600">
                        <span className="text-amber-400">★</span>
                        <span>{home.rating || '4.8 (128)'}</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-[15px] font-black text-[#15803d]">
                        ₹{priceVal.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>🛏 {home.bhk || '2BHK'}</span>
                      <span className="text-slate-300">|</span>
                      <span>📍 {home.distance || '2.7 km'}</span>
                    </div>
                  </div>

                  {/* Heart */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(home.id);
                    }}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center cursor-pointer"
                    aria-label="Save"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#e11d48' : 'none'} stroke={isSaved ? '#e11d48' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ══ PROMO BANNER ══ */}
          <div className="mt-5 mb-2 mx-4 bg-[#1b4332] rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div className="flex flex-col pr-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Verified Listings • Trusted Owners • Secure Renting</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">Find your perfect home in defence communities</p>
            </div>
            <button
              onClick={() => ctx.openPost?.()}
              className="bg-[#92400e] hover:bg-[#78350f] text-white text-[11px] font-bold px-3 py-2 rounded-xl cursor-pointer shrink-0 whitespace-nowrap active:scale-95 transition-all"
            >
              List Your Property
            </button>
          </div>

        </main>
      )}

      {/* ══ BOTTOM NAVIGATION BAR ══ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[1000] bg-white px-2 py-1 flex items-center justify-around"
        style={{ borderTop: '1px solid #f1f5f9', height: '60px' }}
      >
        {navTabs.map((tab) => {
          const isActive = mobileTab === tab.id;
          const color = isActive ? '#15803d' : '#94a3b8';
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMobileTab(tab.id);
                if (tab.id === 'ai') ctx.openChat?.();
                else if (tab.id === 'profile') ctx.openProfile?.();
              }}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer transition-all"
            >
              {NavIcons[tab.id](color, wishlist.length > 0 && tab.id === 'saved')}
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
