import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { SSB_DORMS } from '../../data';
import MapView from '../Map/MapView';
import ListingCard from '../Sidebar/ListingCard';
import MarketCard from '../Sidebar/MarketCard';
import DormCard from '../Sidebar/DormCard';
import MobileDashboard from './MobileDashboard';
import {
  Home,
  Building2,
  ShoppingBag,
  Heart,
  MessageSquare,
  FileText,
  Bell,
  Search,
  SlidersHorizontal,
  Plus,
  User,
  Sun,
  Moon,
  MapPin,
  RotateCcw,
  Map as MapIcon,
  List,
  ShieldCheck,
  Users,
  Tag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Crosshair,
  ArrowUpRight
} from 'lucide-react';

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
    sortPref,
    setSortPref,
    showCommuteZones,
    setShowCommuteZones,
    showSchools,
    setShowSchools,
    showHospitals,
    setShowHospitals
  } = allState;

  const wishlist = useUserStore(s => s.wishlist) || [];
  
  const listings = getFilteredListings(allState);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(true);
  const [visibleIds, setVisibleIds] = useState(null);
  const [activeTab, setActiveTab] = useState('homes');
  const [mapMode, setMapMode] = useState('map');
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [bhkDropdownOpen, setBhkDropdownOpen] = useState(false);
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isListCollapsed, setIsListCollapsed] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('fn_theme') === 'dark';
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const mode = nextDark ? 'dark' : 'light';
    localStorage.setItem('fn_theme', mode);
    if (nextDark) {
      document.documentElement.classList.add('dark', 'dark-theme');
      document.body.classList.add('dark', 'dark-theme');
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.documentElement.classList.remove('dark', 'dark-theme');
      document.body.classList.remove('dark', 'dark-theme');
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    }
    window.dispatchEvent(new CustomEvent('theme-change', { detail: mode }));
  };

  // Sync activeView with activeTab
  useEffect(() => {
    if (activeView === 'dorms') setActiveTab('dorms');
    else if (activeView === 'market') setActiveTab('market');
    else if (activeView === 'saved') setActiveTab('saved');
    else setActiveTab('homes');
  }, [activeView]);

  // Expose listings globally for chatbot
  if (typeof window !== 'undefined') {
    window.__fauji_listings = listings;
  }

  // Filter items based on active tab and search query
  const items = useMemo(() => {
    if (activeTab === 'dorms') {
      if (!smartSearchQ) return SSB_DORMS;
      const q = smartSearchQ.toLowerCase();
      return SSB_DORMS.filter(
        d => d.name.toLowerCase().includes(q) || 
             d.ssb.toLowerCase().includes(q) || 
             d.city.toLowerCase().includes(q) || 
             d.area.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'saved') {
      return listings.filter(l => wishlist.includes(l.id));
    }
    return listings;
  }, [activeTab, listings, smartSearchQ, wishlist]);

  // Live viewport calculations
  const handleBoundsChange = useCallback((ids) => {
    if (searchAsMove) {
      setVisibleIds(ids);
    }
  }, [searchAsMove]);

  const visibleItems = useMemo(() => {
    if (!searchAsMove || !visibleIds || !visibleIds.length) return items;
    const set = new Set(visibleIds);
    const inView = items.filter(item => set.has(item.id));
    return inView.length > 0 ? inView : items;
  }, [items, visibleIds, searchAsMove]);

  // Close dropdowns on window click
  useEffect(() => {
    const handleClose = () => {
      setBhkDropdownOpen(false);
      setBudgetDropdownOpen(false);
      setSortDropdownOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

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

  const handleResetMap = () => {
    window.dispatchEvent(new CustomEvent('map-recenter', { detail: { lat: 18.5204, lng: 73.8567 } }));
    setVisibleIds(null);
    ctx?.showToast('Map position reset', 'ok');
  };

  const navMenuItems = [
    { id: 'homes', label: 'Homes', icon: Home, action: () => { setActiveView('rentals'); setActiveTab('homes'); } },
    { id: 'dorms', label: 'SSB Dorms', icon: Building2, action: () => { setActiveView('dorms'); setActiveTab('dorms'); } },
    { id: 'market', label: 'Marketplace', icon: ShoppingBag, action: () => { setActiveView('market'); setActiveTab('market'); } },
    { id: 'saved', label: 'Saved', icon: Heart, count: wishlist.length, action: () => { setActiveTab('saved'); } },
    { id: 'messages', label: 'Messages', icon: MessageSquare, action: () => { ctx.openChat?.(); } },
    { id: 'myposts', label: 'My Posts', icon: FileText, action: () => { ctx.openPost?.(); } },
    { id: 'alerts', label: 'Alerts', icon: Bell, action: () => { ctx.openTransfers?.(); } },
  ];

  return (
    <>
      {/* ══ MOBILE UI (< 768px) ══ */}
      <div className="block md:hidden w-full h-[100dvh] overflow-hidden">
        <MobileDashboard items={items} />
      </div>

      {/* ══ DESKTOP / LAPTOP UI (>= 768px) ══ */}
      <div className="hidden md:flex flex-col relative w-full h-[100dvh] overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]" style={{color:'var(--text)'}}>
        {/* Colorful aurora backdrop — the blur source behind every glass panel */}
        <div className="aurora-bg" aria-hidden="true" />

        {/* ══════════════════════════════════════════
            1. TOP NAVBAR HEADER
            ══════════════════════════════════════════ */}
        <header className="h-[64px] min-h-[64px] px-5 lg:px-6 gap-2 liquid-glass-nav relative flex items-center justify-between z-50 flex-shrink-0">
          
          {/* Left: Brand Logo & Subtitle */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
            className="flex items-center gap-3 no-underline group cursor-pointer flex-shrink-0"
          >
            <img 
              src="/logo-light.jpg" 
              alt="FaujiNiwas" 
              className="w-10 h-10 rounded-full object-contain border border-white/30 dark:border-white/20 block dark:hidden" 
            />
            <img 
              src="/logo-dark.jpg" 
              alt="FaujiNiwas" 
              className="w-10 h-10 rounded-full object-contain border border-white/30 dark:border-white/20 hidden dark:block" 
            />
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold tracking-tight leading-tight" style={{color:'var(--text)'}}>
                FaujiNiwas
              </span>
              <span className="text-[11.5px] font-semibold leading-tight" style={{color:'var(--muted)'}}>
                Defence Housing Rentals
              </span>
            </div>
          </a>

          {/* Center: Search & Filter Controls */}
          <div className="flex items-center gap-2 flex-1 mx-3 min-w-0">

            {/* Search Pill Input */}
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="Search cantonment, area or city..."
                value={smartSearchQ}
                onChange={e => setSmartSearchQ(e.target.value)}
                className="w-full h-[38px] pl-4 pr-10 text-[13px] font-medium bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-slate-200/70 dark:border-white/20 rounded-full focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all placeholder:text-slate-400" style={{color:'var(--text)'}}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--muted)' }} />
              {smartSearchQ && (
                <button
                  onClick={() => setSmartSearchQ('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-xs cursor-pointer" style={{ color: 'var(--muted)' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* BHK Filter Pill */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setBhkDropdownOpen(!bhkDropdownOpen);
                  setBudgetDropdownOpen(false);
                }}
                className={`h-[38px] px-3.5 rounded-full text-[12.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap fluid-press ${
                  bhkFilter !== 'all'
                    ? 'liquid-glass-chip border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'liquid-glass-chip'
                }`}
                style={bhkFilter !== 'all' ? undefined : { color: 'var(--text)' }}
              >
                <span>{bhkFilter === 'all' ? 'All BHK' : `${bhkFilter} BHK`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {bhkDropdownOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute top-[calc(100%+6px)] left-0 w-36 liquid-glass rounded-xl p-1.5 z-50 flex flex-col gap-1"
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        bhkFilter === opt.value
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                      style={bhkFilter === opt.value ? undefined : { color: 'var(--text)' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Filter Pill */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setBudgetDropdownOpen(!budgetDropdownOpen);
                  setBhkDropdownOpen(false);
                }}
                className={`h-[38px] px-3.5 rounded-full text-[12.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap fluid-press ${
                  maxPrice < 100000
                    ? 'liquid-glass-chip border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'liquid-glass-chip'
                }`}
                style={maxPrice < 100000 ? undefined : { color: 'var(--text)' }}
              >
                <span>{maxPrice >= 100000 ? 'All Budgets' : `≤ ₹${(maxPrice / 1000).toFixed(0)}K`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {budgetDropdownOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute top-[calc(100%+6px)] left-0 w-44 liquid-glass rounded-xl p-1.5 z-50 flex flex-col gap-1"
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        maxPrice === opt.value
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                      style={maxPrice === opt.value ? undefined : { color: 'var(--text)' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* More Filters Pill */}
            <button 
              onClick={() => ctx?.openAccessibility?.()}
              className="h-[38px] px-3.5 rounded-full border border-slate-200/70 dark:border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur-xl text-[12.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap hover:bg-white/60 dark:hover:bg-white/20" style={{ color: 'var(--text)' }}
              title="Accessibility, Font and Contrast Settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
            </button>

          </div>

          {/* Right Actions: Post Property, Sign In, Theme Switcher */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* + Post Property Button */}
            <button 
              onClick={() => ctx.openPost?.()}
              className="h-[38px] px-4 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-none hover:opacity-90"
              style={{ backgroundColor: '#00875a', color: '#ffffff' }}
            >
              <Plus className="w-4 h-4 stroke-[3]" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff', fontWeight: 800 }}>Post Property</span>
            </button>

            {/* Sign In / Sign Up or Profile */}
            <button 
              onClick={() => ctx.openProfile?.()}
              className="h-[38px] px-3.5 border border-slate-200/70 dark:border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur-xl rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-none hover:bg-white/60 dark:hover:bg-white/20" style={{ color: 'var(--text)' }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              <span>{user ? 'Profile' : 'Sign In / Sign Up'}</span>
            </button>

            {/* Dark / Light Mode Pill Toggle */}
            <button
              onClick={toggleTheme}
              className="w-[38px] h-[38px] rounded-full border border-slate-200/70 dark:border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors hover:bg-white/60 dark:hover:bg-white/20" style={{ color: 'var(--text)' }}
              title="Toggle Light / Dark mode"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              )}
            </button>

          </div>

        </header>

        {/* ══════════════════════════════════════════
            2. MAIN 3-COLUMN BODY CONTAINER
            ══════════════════════════════════════════ */}
        <div className="flex-1 flex overflow-hidden relative min-h-0">

          {/* ── COLUMN 1: LEFT NAVIGATION SIDEBAR ── */}
          <aside className="w-[230px] liquid-glass-deep flex flex-col justify-between p-3 flex-shrink-0 z-20 min-h-0 overflow-hidden">

            {/* Nav Menu */}
            <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar-panel pr-0.5">
              {navMenuItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`relative w-full h-[42px] flex items-center justify-between px-3.5 rounded-2xl text-[14px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'text-[#00875a] dark:text-[#34d399]'
                        : 'text-transparent hover:bg-white/[0.06]'
                    }`}
                    style={isActive ? undefined : { color: 'var(--text)' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-2xl border border-[#86efac]/60 dark:border-[#059669]/60 bg-[#ebfbee] dark:bg-[#064e3b]/40 backdrop-blur-md"
                        transition={{ type: 'spring', stiffness: 480, damping: 36, mass: 0.5 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2.5">
                      <IconComponent className={`w-[18px] h-[18px] ${isActive ? 'text-[#00875a] dark:text-[#34d399]' : ''}`} style={isActive ? undefined : { color: 'var(--muted)' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="relative z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 backdrop-blur-sm">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Download & Copyright Section */}
            <div className="flex flex-col gap-2 pt-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[12px] font-extrabold uppercase tracking-wider px-0.5" style={{ color: 'var(--text)' }}>
                DOWNLOAD APP
              </span>
              
              {/* Google Play Button */}
              <a 
                href="/manifest.json" 
                download
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1px solid #1f2937',
                  cursor: 'pointer',
                  height: '42px'
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.986 1.986 0 01-.61-1.465V3.279c0-.573.23-1.096.609-1.465z" fill="#00D3FF"/>
                  <path d="M17.202 8.59L13.792 12l3.41 3.41 3.864-2.195c1.102-.626 1.102-1.799 0-2.425L17.202 8.59z" fill="#FFCE00"/>
                  <path d="M3.609 1.814L13.792 12l3.41-3.41-11.83-6.721c-.493-.28-1.002-.204-1.372.124z" fill="#00F076"/>
                  <path d="M13.792 12L3.609 22.186c.37.328.879.404 1.372.124l11.83-6.72-3.02-3.59z" fill="#FF3A44"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#ffffff', fontWeight: 700 }}>GET IT ON</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>Google Play</span>
                </div>
              </a>

              {/* App Store Button */}
              <a 
                href="/manifest.json" 
                download
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1px solid #1f2937',
                  cursor: 'pointer',
                  height: '42px'
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff" style={{ flexShrink: 0 }}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.91.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.81 1.02.08 2.05-.49 2.68-1.26z"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#ffffff', fontWeight: 700 }}>DOWNLOAD ON THE</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>App Store</span>
                </div>
              </a>

              {/* Copyright */}
              <div className="text-[11.5px] font-bold px-0.5 pt-0.5 pb-1 leading-tight" style={{ color: 'var(--muted)' }}>
                <div>© 2025 FaujiNiwas</div>
                <div className="font-semibold text-[10.5px]">All rights reserved.</div>
              </div>
            </div>

          </aside>

          {/* ── COLUMN 2: MIDDLE PROPERTY LISTINGS PANEL ── */}
          <section
            className={`liquid-glass border-r-0 relative flex flex-col flex-shrink-0 z-10 overflow-hidden h-full min-h-0 transition-all duration-[300ms] ease-[cubic-bezier(0.34,1.15,0.64,1)] ${
              isListCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[430px] opacity-100'
            }`}
          >

            {/* Header: Properties Found & Sort Selector */}
            <div className="p-3.5 pb-2.5 flex items-center justify-between flex-shrink-0 liquid-glass-chip border-x-0 border-t-0">
              <span className="text-[14.5px] font-extrabold" style={{ color: 'var(--text)' }}>
                {visibleItems.length} Properties Found
              </span>

              <div className="flex items-center gap-2">
                {/* Sort By Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortDropdownOpen(!sortDropdownOpen);
                    }}
                    className="text-[12px] font-semibold flex items-center gap-1 cursor-pointer" style={{ color: 'var(--muted)' }}
                  >
                    <span>Sorted by: <strong style={{ color: 'var(--text)' }}>{sortPref === 'priceAsc' ? 'Price: Low to High' : (sortPref === 'priceDesc' ? 'Price: High to Low' : 'Relevance')}</strong></span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {sortDropdownOpen && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="absolute top-[calc(100%+6px)] right-0 w-44 liquid-glass rounded-xl p-1.5 z-50 flex flex-col gap-1"
                    >
                      {[
                        { value: 'new', label: 'Relevance' },
                        { value: 'priceAsc', label: 'Price: Low to High' },
                        { value: 'priceDesc', label: 'Price: High to Low' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortPref(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            sortPref === opt.value
                              ? 'bg-emerald-600 text-white'
                              : 'hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                          style={sortPref === opt.value ? undefined : { color: 'var(--text)' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collapse Button */}
                <button
                  onClick={() => setIsListCollapsed(true)}
                  className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors border border-transparent hover:border-white/30 dark:hover:border-white/20" style={{ color: 'var(--muted)' }}
                  title="Collapse Properties List"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Listings Feed */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar min-h-0">
              {visibleItems.length > 0 ? (
                visibleItems.map(item => {
                  if (activeTab === 'dorms') {
                    return (
                      <DormCard
                        key={item.id}
                        dorm={item}
                        onFoodClick={(city) => ctx.openFood(item.city)}
                        onClick={() => ctx.openDetail?.(item.id)}
                      />
                    );
                  } else if (activeTab === 'market') {
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
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <span className="text-3xl mb-2 opacity-50">📍</span>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    No properties match your filters.<br/>Try broadening your search.
                  </p>
                </div>
              )}
            </div>

          </section>

          {/* ── COLUMN 3: RIGHT TACTICAL INTERACTIVE MAP & OVERLAYS ── */}
          <main className="flex-1 relative overflow-hidden flex flex-col min-h-0 h-full">
            
            {/* Interactive Leaflet Map */}
            <div className="w-full h-full relative z-0">
              <MapView properties={items} onBoundsChange={handleBoundsChange} />
            </div>

            {/* Prominent Expand Tab when List is Collapsed */}
            {isListCollapsed && (
              <button
                onClick={() => setIsListCollapsed(false)}
                className="absolute top-1/2 -translate-y-1/2 left-0 z-[1000] bg-white/85 dark:bg-[#0d1321]/85 backdrop-blur-md border-l-0 border-[#00875a] shadow-2xl py-6 px-2.5 rounded-r-2xl flex flex-col items-center justify-center text-[#00875a] hover:bg-[#ebfbee] dark:hover:bg-[#064e3b]/30 cursor-pointer transition-all gap-1.5 font-extrabold fluid-press"
                title="Expand Properties List"
              >
                <ChevronRight className="w-5 h-5 stroke-[3]" />
                <span className="text-[10px] font-extrabold [writing-mode:vertical-lr] tracking-wider uppercase" style={{ color: 'var(--text)' }}>
                  List
                </span>
              </button>
            )}

            {/* Floating Top Map Controls Toolbar */}
            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 liquid-glass-float p-1.5 rounded-xl">
              <span className="sheen-sweep" />
              
              {/* Expand List Button when collapsed */}
              {isListCollapsed && (
                <>
                  <button
                    onClick={() => setIsListCollapsed(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-extrabold bg-[#ebfbee] dark:bg-emerald-950 text-[#00875a] dark:text-emerald-400 border border-[#86efac] dark:border-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
                    title="Expand Properties List"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Show Properties ({visibleItems.length})</span>
                  </button>
                  <div className="w-[1px] h-5 bg-white/40 dark:bg-white/20 mx-0.5" />
                </>
              )}

              {/* Segmented View Toggle: Map View | List View */}
              <div className="flex items-center gap-0.5 bg-white/40 dark:bg-white/10 backdrop-blur-md p-0.5 rounded-lg">
                <button
                  onClick={() => setMapMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer ${
                    mapMode === 'map'
                      ? 'bg-[#00875a] text-white shadow-xs'
                      : 'hover:text-white/80 dark:hover:text-white'
                  }`}
                  style={mapMode === 'map' ? undefined : { color: 'var(--muted)' }}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
                <button
                  onClick={() => {
                    setMapMode('list');
                    setIsListCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer ${
                    mapMode === 'list'
                      ? 'bg-[#00875a] text-white shadow-xs'
                      : 'hover:text-white/80 dark:hover:text-white'
                  }`}
                  style={mapMode === 'list' ? undefined : { color: 'var(--muted)' }}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>

              {/* Divider */}
              <div className="w-[1px] h-5 bg-white/40 dark:bg-white/20 mx-0.5" />

              {/* Search as I move the map Checkbox Pill */}
              <button
                onClick={() => setSearchAsMove(!searchAsMove)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-bold hover:bg-white/10 dark:hover:bg-white/10 transition-colors cursor-pointer" style={{ color: 'var(--text)' }}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                  searchAsMove
                    ? 'bg-[#00875a] border-[#00875a] text-white'
                    : 'border-white/40 dark:border-white/30 bg-white/40 dark:bg-white/10'
                }`}>
                  {searchAsMove && '✓'}
                </div>
                <span className="whitespace-nowrap">Search as I move the map</span>
              </button>

              {/* Divider */}
              <div className="w-[1px] h-5 bg-white/40 dark:bg-white/20 mx-0.5" />

              {/* Reset Map Button */}
              <button
                onClick={handleResetMap}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-bold hover:bg-white/10 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap" style={{ color: 'var(--text)' }}
                title="Recenter map"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Map</span>
              </button>

            </div>

            {/* Floating Top Right Zoom & Recenter Controls */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))}
                className="w-8 h-8 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-md rounded-lg shadow-xs flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 text-base font-bold transition-all cursor-pointer fluid-press" style={{ color: 'var(--text)' }}
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))}
                className="w-8 h-8 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-md rounded-lg shadow-xs flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 text-base font-bold transition-all cursor-pointer fluid-press" style={{ color: 'var(--text)' }}
                title="Zoom Out"
              >
                −
              </button>
              <button
                onClick={handleLocateMe}
                className="w-8 h-8 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-md rounded-lg shadow-xs flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 transition-all cursor-pointer fluid-press" style={{ color: 'var(--text)' }}
                title="Locate Me"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Bottom Right "Nearby Facilities" Card */}
            <div className="absolute bottom-4 right-4 z-20 w-[240px]">
              {!isFacilitiesOpen ? (
                <button
                  onClick={() => setIsFacilitiesOpen(true)}
                  className="liquid-glass-float rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold cursor-pointer fluid-press" style={{ color: 'var(--text)' }}
                >
                  <span>📍 Nearby Facilities</span>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>▲</span>
                </button>
              ) : (
                <div className="liquid-glass-float rounded-2xl p-3 flex flex-col gap-2">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--text)' }}>
                      Nearby Facilities
                    </span>
                    <button
                      onClick={() => setIsFacilitiesOpen(false)}
                      className="text-xs p-1 cursor-pointer" style={{ color: 'var(--muted)' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Facility 1: Station Commute Zone */}
                  <button
                    onClick={() => setShowCommuteZones(!showCommuteZones)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      showCommuteZones
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/20'
                    }`}
                    style={showCommuteZones ? undefined : { color: 'var(--text)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-xs">
                        🚆
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11.5px] leading-tight">Station Commute Zone</span>
                        <span className="text-[9.5px] opacity-70">5 - 15 min</span>
                      </div>
                    </div>
                    <ArrowUpRight className={`w-3.5 h-3.5 ${showCommuteZones ? 'text-emerald-600' : ''}`} style={showCommuteZones ? undefined : { color: 'var(--muted)' }} />
                  </button>

                  {/* Facility 2: Army School */}
                  <button
                    onClick={() => setShowSchools(!showSchools)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      showSchools
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold'
                        : 'bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/20'
                    }`}
                    style={showSchools ? undefined : { color: 'var(--text)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-xs">
                        🏫
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11.5px] leading-tight">Army School</span>
                        <span className="text-[9.5px] opacity-70">5 - 10 min</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold ${showSchools ? 'text-blue-600' : ''}`} style={showSchools ? undefined : { color: 'var(--muted)' }}>
                      {showSchools ? '✓' : '○'}
                    </span>
                  </button>

                  {/* Facility 3: Military Hospital */}
                  <button
                    onClick={() => setShowHospitals(!showHospitals)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      showHospitals
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-bold'
                        : 'bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/20'
                    }`}
                    style={showHospitals ? undefined : { color: 'var(--text)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-xs">
                        🏥
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11.5px] leading-tight">Military Hospital</span>
                        <span className="text-[9.5px] opacity-70">5 - 15 min</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold ${showHospitals ? 'text-rose-600' : ''}`} style={showHospitals ? undefined : { color: 'var(--muted)' }}>
                      {showHospitals ? '✓' : '○'}
                    </span>
                  </button>

                  {/* Footer Link */}
                  <button 
                    onClick={() => ctx?.openAccessibility?.()}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline pt-1 text-center cursor-pointer"
                  >
                    View more facilities →
                  </button>

                </div>
              )}
            </div>

          </main>

        </div>

        {/* ══════════════════════════════════════════
            3. BOTTOM STRIP: LEGEND TAGS & VALUE PROPS
            ══════════════════════════════════════════ */}
        <footer className="h-[44px] px-6 liquid-glass-nav relative flex items-center justify-between z-30 flex-shrink-0 font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Left Legend Tags */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold whitespace-nowrap">
              <span className="text-base leading-none">🛡️</span>
              <span>Verified Property</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold whitespace-nowrap">
              <span className="text-base leading-none">🏢</span>
              <span>BHK Options</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold whitespace-nowrap">
              <span className="text-base leading-none">🛏️</span>
              <span>PG / Rooms</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold whitespace-nowrap">
              <span className="text-base leading-none">🏥</span>
              <span>Nearby Facilities</span>
            </span>
          </div>

          {/* Right Value Propositions */}
          <div className="flex items-center gap-5 overflow-hidden flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-[12px] font-extrabold whitespace-nowrap">Secure & Verified</span>
              <span className="text-[11px] font-semibold hidden xl:inline whitespace-nowrap" style={{ color: 'var(--muted)' }}>— 100% Defence Auth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[12px] font-extrabold whitespace-nowrap">For Defence Community</span>
              <span className="text-[11px] font-semibold hidden xl:inline whitespace-nowrap" style={{ color: 'var(--muted)' }}>— Jawans, JCOs & Officers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-[12px] font-extrabold whitespace-nowrap">Best Prices</span>
              <span className="text-[11px] font-semibold hidden xl:inline whitespace-nowrap" style={{ color: 'var(--muted)' }}>— Zero Brokerage</span>
            </div>
          </div>

        </footer>

      </div>
    </>
  );
}
