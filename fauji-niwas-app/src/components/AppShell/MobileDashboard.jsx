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
    <div className="w-full h-[100dvh] flex flex-col bg-[#FAF9F6] dark:bg-[#0b1325] text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">

      {/* ══ TOP HEADER (Unified & Smooth, No Blunt Edges) ══ */}
      <header className="shrink-0 liquid-glass-nav relative px-4 pt-3.5 pb-2.5 z-[900] rounded-b-2xl">

        {/* Row 1: Brand & Notification */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* New Official 2nd June Logo */}
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
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
            <div className="flex flex-col leading-none">
              <span className="text-[23px] font-black text-[#1b4332] dark:text-[#52b788] tracking-tight leading-none">FaujiNiwas</span>
              <span className="text-[9.5px] font-extrabold text-[#b45309] dark:text-[#fbbf24] uppercase tracking-wider mt-[3px]">DEFENCE HOUSING PORTAL</span>
            </div>
          </div>

          {/* Bell Notification */}
          <button
            onClick={() => ctx.openTransfers?.()}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer relative hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            aria-label="Notifications"
          >
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#1b4332] dark:text-[#52b788]" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#15803d] dark:bg-emerald-400 border-2 border-white dark:border-[#0b1325]" />
          </button>
        </div>

        {/* Row 2: Search + Amber/Bronze Filter Accessibility Trigger */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search city, cantt or academy"
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              style={{ paddingLeft: '40px' }}
              className="w-full bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-full py-2.5 pr-3 text-[14px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#d97706] dark:focus:border-amber-500 transition-all font-medium backdrop-blur-md"
            />
          </div>
          <button
            onClick={() => ctx.openAccessibility?.()}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white flex items-center justify-center shadow-md shadow-amber-950/20 cursor-pointer shrink-0 transition-transform active:scale-95 border border-amber-500/30"
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
        <div className="flex items-center justify-between liquid-glass-chip rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-800 dark:text-slate-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" className="dark:stroke-emerald-400" strokeWidth="2.5">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
            </svg>
            <span>{selectedLocation}</span>
          </div>
          <button
            onClick={handleLocationChange}
            className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
        <main className="flex-1 overflow-y-auto min-h-0 pb-28">

          {/* ══ CATEGORY ICONS (Smooth, Seamless, No Harsh Double Lines) ══ */}
          <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'bhk') setBhkFilter('2');
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 min-w-[58px]"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#1b4332] dark:bg-emerald-600 text-white shadow-md shadow-[#1b4332]/30 dark:shadow-emerald-950/40 border border-transparent'
                        : 'bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 shadow-xs'
                    }`}
                  >
                    {React.cloneElement(CategoryIcons[cat.id], {
                      stroke: isActive ? 'white' : 'currentColor',
                      width: 20,
                      height: 20,
                    })}
                  </div>
                  <span
                    className={`text-[11.5px] text-center leading-tight whitespace-nowrap ${
                      isActive ? 'text-[#1b4332] dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* ══ SECTION HEADER ══ */}
          <div className="flex items-center justify-between mb-3 px-4 mt-2">
            <h2 className="text-[18px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Popular Homes Near You</h2>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[14px] font-bold text-[#b45309] dark:text-amber-400 cursor-pointer hover:underline"
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
                  className="liquid-glass-chip rounded-2xl p-3 flex gap-3.5 relative cursor-pointer"
                  style={{ minHeight: '100px' }}
                >
                  {/* Thumbnail */}
                  <div className="w-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800" style={{ aspectRatio: '4/3' }}>
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
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 pr-6">
                    <div>
                      <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {home.name || 'Property'}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                        <span className="text-amber-500">★</span>
                        <span>{home.rating || '4.8 (128)'}</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-[17.5px] font-black text-[#15803d] dark:text-emerald-400">
                        ₹{priceVal.toLocaleString()}
                      </span>
                      <span className="text-[12px] text-slate-500 dark:text-slate-400 ml-1 font-normal">/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12.5px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      <span>🛏 {home.bhk || '2BHK'}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>📍 {home.distance || '2.7 km'}</span>
                    </div>
                  </div>

                  {/* Heart Wishlist */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(home.id);
                    }}
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center cursor-pointer"
                    aria-label="Save"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#e11d48' : 'none'} stroke={isSaved ? '#e11d48' : '#cbd5e1'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* ══ PROMO BANNER ══ */}
          <div className="mt-5 mb-2 mx-4 relative overflow-hidden bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] dark:from-[#0d281e] dark:to-[#1b4332] rounded-2xl p-4 flex items-center justify-between shadow-md">
            <span className="sheen-sweep" />
            <div className="flex flex-col pr-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-300">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Verified Defence Listings</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-1">Direct from defence personnel & verified owners</p>
            </div>
            <button
              onClick={() => ctx.openPost?.()}
              className="bg-[#b45309] hover:bg-[#92400e] text-white text-[12px] font-bold px-3.5 py-2.5 rounded-xl cursor-pointer shrink-0 whitespace-nowrap active:scale-95 transition-all shadow-sm"
            >
              List Property
            </button>
          </div>

        </main>
      )}

      {/* ══ TRANSLUCENT BOTTOM NAVIGATION BAR ══ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[1000] px-2 py-1.5 flex items-center justify-around liquid-glass-nav border-t-0 h-[64px]"
      >
        {navTabs.map((tab) => {
          const isActive = mobileTab === tab.id;
          const color = isActive ? '#15803d' : '#94a3b8';
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                setMobileTab(tab.id);
                if (tab.id === 'ai') {
                  if (window.openFaujiChatbot) window.openFaujiChatbot();
                  else if (ctx.openChat) ctx.openChat();
                }
                else if (tab.id === 'profile') ctx.openProfile?.();
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="mob-tab-pill"
                  className="absolute top-1 bottom-2 left-1/2 -translate-x-1/2 w-14 rounded-2xl bg-emerald-100/70 dark:bg-emerald-500/15 border border-emerald-200/60 dark:border-emerald-400/20"
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 34, mass: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {NavIcons[tab.id](isActive ? '#15803d' : '#94a3b8', wishlist.length > 0 && tab.id === 'saved')}
              </span>
              <span
                className={`relative z-10 text-[11.5px] font-bold leading-none mt-1 ${
                  isActive ? 'text-[#15803d] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
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
