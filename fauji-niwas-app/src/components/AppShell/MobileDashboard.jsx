import React, { useState, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
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

// SVG category icons
const CategoryIcons = {
  all: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  bhk: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  rank: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  budget: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  near_academy: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

// SVG bottom nav icons
const NavIcons = {
  home: (color) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={color === '#15803d' || color === '#10b981' ? color : 'none'} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  map: (color) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
    </svg>
  ),
  saved: (color, filled) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  ai: (color) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  profile: (color) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

// Per-category brand accents → feed the ColorOS glossy tile glows.
const CAT_ACCENT = {
  all:          ['#f59e0b', '#fcd34d'], // amber
  bhk:          ['#0284c7', '#38bdf8'], // sky
  rank:         ['#7c3aed', '#a78bfa'], // violet
  budget:       ['#059669', '#34d399'], // emerald
  near_academy: ['#e11d48', '#fb7185'], // rose
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedLocation('Current Location');
          setSmartSearchQ('');
          ctx.showToast?.('Location updated to Current Location');
        },
        () => {
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
    <div className="w-full h-[100dvh] relative flex flex-col font-sans overflow-hidden transition-colors duration-200" style={{color:'var(--text)'}}>
      {/* Colorful aurora backdrop — the blur source behind every glass panel */}
      <div className="aurora-bg" aria-hidden="true" />

      {/* ══ TOP HEADER — floating Liquid Glass sheet (iOS 26) ══ */}
      <header className="mob-header liquid-glass-morph shrink-0 relative px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2.5 z-[900] rounded-b-[28px]">

        {/* Row 1: Brand & Notification */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Glossy official logo tile (ColorOS themed-icon ) */}
            <div
              className="glossy-tile w-11 h-11 rounded-[14px] overflow-hidden flex items-center justify-center shrink-0"
              style={{ '--tile-glow': 'rgba(16,185,129,.6)' }}
            >
              <img
                src="/logo-light.jpg"
                alt="FaujiNiwas"
                className="w-full h-full object-contain light-logo"
              />
              <img
                src="/logo-dark.jpg"
                alt="FaujiNiwas"
                className="w-full h-full object-contain dark-logo"
              />
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[22px] font-black text-[#1b4332] dark:text-[#52b788] tracking-tight leading-none truncate">FaujiNiwas</span>
              <span className="text-[10.5px] font-extrabold text-[#b45309] dark:text-[#fbbf24] uppercase tracking-wider mt-[3px]">DEFENCE HOUSING PORTAL</span>
            </div>
          </div>

          {/* Bell Notification */}
          <button
            onClick={() => ctx.openTransfers?.()}
            className="glossy-tile w-10 h-10 rounded-full flex items-center justify-center cursor-pointer relative"
            style={{ '--tile-glow': 'rgba(251,191,36,.55)' }}
            aria-label="Notifications"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#1b4332] dark:text-[#52b788]" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#15803d] dark:bg-emerald-400 border-2 border-white dark:border-[#0b1325]" />
          </button>
        </div>

        {/* Row 2: Search + Accessibility Trigger */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'var(--muted)'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search city, cantt or academy"
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              style={{ paddingLeft: '40px', color: 'var(--text)' }}
              className="w-full bg-white/40 dark:bg-white/10 border border-slate-200/50 dark:border-white/15 rounded-full py-2.5 pr-3 text-[14px] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,.15)] transition-all font-medium backdrop-blur-xl"
            />
          </div>
          <button
            onClick={() => ctx.openAccessibility?.()}
            className="glossy-tile w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-transform text-[#d97706] dark:text-amber-400"
            style={{ '--tile-glow': 'rgba(251,191,36,.5)' }}
            aria-label="Accessibility and Filters"
            title="Accessibility & Filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Row 3: Soft Location Bar */}
        <div className="flex items-center justify-between rounded-[16px] px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.15)' }}>
          <div className="flex items-center gap-2 text-[14.5px] font-semibold min-w-0 truncate" style={{color:'var(--text)'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#15803d" className="dark:stroke-emerald-400 shrink-0" strokeWidth="2.5">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
            </svg>
            <span className="truncate">{selectedLocation}</span>
          </div>
          <button
            onClick={handleLocationChange}
            className="flex items-center gap-1.5 text-[13.5px] font-bold hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer shrink-0 ml-2" style={{color:'var(--muted)'}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
        <main className="flex-1 overflow-y-auto min-h-0 pb-36">

          {/* ══ CATEGORY ICONS — Glossy ColorOS tiles ══ */}
          <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const [cA, cB] = CAT_ACCENT[cat.id] || CAT_ACCENT.all;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'bhk') setBhkFilter('2');
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 min-w-[60px]"
                >
                  <div
                    className={`glossy-tile w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'breathe' : ''
                    }`}
                    style={
                      isActive
                        ? { background: `linear-gradient(150deg, ${cA}, ${cB})`, color: '#ffffff', borderColor: 'rgba(255,255,255,.55)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 12px 28px rgba(2,6,16,.4)' }
                        : { '--tile-glow': cB, color: 'var(--muted)' }
                    }
                  >
                    {React.cloneElement(CategoryIcons[cat.id], {
                      stroke: isActive ? '#ffffff' : 'currentColor',
                      width: 21,
                      height: 21,
                    })}
                  </div>
                  <span
                    className={`text-[12.5px] text-center leading-tight whitespace-nowrap ${
                      isActive ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'font-semibold'
                    }`}
                    style={!isActive ? { color: 'var(--muted)' } : undefined}
                  >
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* ══ GREETING HERO STRIP (ColorOS "breathe" glass) ══ */}
          <section className="fluid-enter mx-4 mt-3 liquid-glass-morph rounded-[22px] px-4 py-3.5 relative overflow-hidden">
            <span className="sheen-sweep" />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.14em] font-extrabold" style={{ color: 'var(--muted)' }}>FaujiNiwas · Defence Housing</p>
                <h1 className="text-[21px] font-black leading-tight mt-1 truncate" style={{ color: 'var(--text)' }}>
                  {selectedLocation === 'Current Location' ? 'Homes near you' : `Cantonment: ${selectedLocation}`}
                </h1>
                <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--muted)' }}>
                  {displayHomes.length} verified listings · zero brokerage
                </p>
              </div>
              <div className="glossy-tile w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ '--tile-glow': 'rgba(251,191,36,.6)' }}>
                <span className="text-[26px] leading-none">🛡️</span>
              </div>
            </div>
          </section>

          {/* ══ SECTION HEADER ══ */}
          <div className="flex items-center justify-between mb-3 px-4 mt-3">
            <h2 className="text-[19px] font-black tracking-tight" style={{color:'var(--text)'}}>Popular Homes Near You</h2>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[14.5px] font-bold text-[#b45309] dark:text-amber-400 cursor-pointer hover:underline"
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
                <motion.div
                  key={home.id}
                  onClick={() => handleCardClick(home)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="liquid-glass-morph rounded-[22px] p-3 flex gap-3.5 relative cursor-pointer fluid-lift"
                  style={{ minHeight: '104px' }}
                >
                  {/* Thumbnail — glass-framed */}
                  <div className="w-28 rounded-[16px] overflow-hidden shrink-0 relative bg-white/40 dark:bg-white/[0.06] backdrop-blur-xl border border-white/25 dark:border-white/10" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={home.image || home.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'}
                      alt={home.name || 'Property'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span
                      className="absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs"
                      style={{
                        background: isVerifiedBadge ? '#15803d' : '#92400e',
                        color: 'white',
                      }}
                    >
                      {displayBadge}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 pr-10">
                    <div>
                      <h3 className="text-[16px] font-bold leading-snug pr-1" style={{color:'var(--text)'}}>
                        {home.name || 'Property'}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-[13.5px] font-semibold" style={{color:'var(--muted)'}}>
                        <span className="text-amber-500">★</span>
                        <span>{home.rating || '4.8 (128)'}</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-[18.5px] font-black text-[#15803d] dark:text-emerald-300 drop-shadow-[0_0_14px_rgba(16,185,129,.35)]">
                        ₹{priceVal.toLocaleString()}
                      </span>
                      <span className="text-[13px] ml-1 font-normal" style={{color:'var(--muted)'}}>/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] mt-1.5 font-semibold" style={{color:'var(--muted)'}}>
                      <span>🛏 {home.bhk || '2BHK'}</span>
                      <span className="opacity-40">•</span>
                      <span>📍 {home.distance || '2.7 km'}</span>
                    </div>
                  </div>

                  {/* Heart Wishlist */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(home.id);
                    }}
                    whileTap={{ scale: 1.25 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center cursor-pointer z-10"
                    style={{
                      background: isSaved ? 'rgba(225,29,72,.16)' : 'rgba(255,255,255,.5)',
                      border: '1px solid ' + (isSaved ? 'rgba(225,29,72,.35)' : 'rgba(255,255,255,.6)'),
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(0,0,0,.10)',
                    }}
                    aria-label="Save"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill={isSaved ? '#e11d48' : 'none'} stroke={isSaved ? '#e11d48' : '#64748b'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* ══ PROMO BANNER — breathing glass ══ */}
          <div className="mt-5 mb-2 mx-4 relative overflow-hidden liquid-glass-morph rounded-[22px] p-4 flex items-center justify-between shadow-lg breathe"
            style={{ borderColor: 'rgba(251,191,36,.3)' }}>
            <span className="sheen-sweep" />
            <div className="flex flex-col pr-2">
              <div className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-[#065f46] dark:text-emerald-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Verified Defence Listings</span>
              </div>
              <p className="text-[12px] mt-1 opacity-80" style={{ color: 'var(--muted)' }}>
                Direct from defence personnel & verified owners
              </p>
            </div>
            <button
              onClick={() => ctx.openPost?.()}
              className="flex items-center gap-1.5 bg-gradient-to-br from-[#fbbf24] to-[#d97706] text-[#1c1917] text-[12.5px] font-black px-4 py-2.5 rounded-[14px] cursor-pointer shrink-0 whitespace-nowrap active:scale-95 transition-all shadow-[0_8px_24px_rgba(251,191,36,.4)]"
            >
              <span>+</span> List Property
            </button>
          </div>

        </main>
      )}

      {/* ══ iOS FLOATING GLASS DOCK ══ */}
      <nav
        className="lg-dock fixed z-[1000] px-2 h-[66px] flex items-center justify-around rounded-[26px]"
        style={{ left: '12px', right: '12px', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
      >
        {navTabs.map((tab) => {
          const isActive = mobileTab === tab.id;
          const color = isActive ? '#059669' : '#94a3b8';
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                setMobileTab(tab.id);
                if (tab.id === 'ai') {
                  if (window.openFaujiChatbot) window.openFaujiChatbot();
                  else if (ctx.openAiHelper) ctx.openAiHelper();
                  else if (ctx.openChat) ctx.openChat();
                }
                else if (tab.id === 'profile') ctx.openProfile?.();
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer rounded-2xl"
            >
              {isActive && (
                <motion.div
                  layoutId="mob-tab-pill"
                  className="absolute top-1 bottom-1 left-1 right-1 rounded-[18px] bg-emerald-500/15 dark:bg-emerald-400/15 ring-1 ring-emerald-500/40 dark:ring-emerald-300/30"
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 34, mass: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {NavIcons[tab.id](color, wishlist.length > 0 && tab.id === 'saved')}
              </span>
              <span
                className={`relative z-10 text-[12px] font-bold leading-none mt-1 whitespace-nowrap ${
                  isActive ? 'text-emerald-700 dark:text-emerald-400' : ''
                }`}
                style={!isActive ? { color: 'var(--muted)' } : undefined}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

    </div>
  );
}
