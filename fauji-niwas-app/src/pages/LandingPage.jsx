import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, ShieldCheck, Users, Calendar, 
  CircleDollarSign, FileText, Navigation, Bell, 
  Headphones, Star, Smartphone, Search, Check, 
  Menu, X, Sparkles, Calculator, Zap, CheckCircle2, 
  XCircle, Megaphone, Bookmark, Shield, Award, ExternalLink
} from 'lucide-react';

const LeaseGeneratorModal = React.lazy(() => import('../components/Modals/LeaseGeneratorModal'));
const WasmMaskingModal = React.lazy(() => import('../components/Modals/WasmMaskingModal'));
import AccessibilityModal from '../components/Modals/AccessibilityModal';

export default function LandingPage() {
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showWasmModal, setShowWasmModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Hero Search input
  const [searchQuery, setSearchQuery] = useState('');

  // 7th CPC HRA Calculator State
  const [cityCategory, setCityCategory] = useState('Y'); // 'X' (30%), 'Y' (20%), 'Z' (10%)
  const [basicPay, setBasicPay] = useState(34800);
  const [calculatedHra, setCalculatedHra] = useState(6960);

  // Compute HRA
  useEffect(() => {
    const rate = cityCategory === 'X' ? 0.30 : cityCategory === 'Y' ? 0.20 : 0.10;
    const minHra = cityCategory === 'X' ? 5400 : cityCategory === 'Y' ? 3600 : 1800;
    const hra = Math.max(minHra, Math.round((Number(basicPay) || 0) * rate));
    setCalculatedHra(hra);
  }, [cityCategory, basicPay]);

  // Ensure body classes are clean
  useEffect(() => {
    document.documentElement.classList.remove('app-shell');
    document.body.classList.remove('app-shell');
    document.body.classList.add('landing-page');
    return () => {
      document.body.classList.remove('landing-page');
    };
  }, []);

  const handleLaunchApp = (e, customStation) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsRedirecting(true);

    const targetStation = customStation || searchQuery;
    if (targetStation && targetStation.trim()) {
      try { sessionStorage.setItem('fn_search_city', targetStation.trim()); } catch { /* noop */ }
    }

    try { sessionStorage.setItem('fn_redirect', 'true'); } catch { /* noop */ }

    document.documentElement.style.backgroundColor = '#0b0f17';
    document.documentElement.style.colorScheme = 'dark';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = '#0b0f17';

    document.body.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.style.opacity = '0';

    setTimeout(() => {
      window.location.href = '/app';
    }, 250);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleLaunchApp(e, searchQuery);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0a0d14] text-slate-100 font-sans antialiased selection:bg-amber-500/30 relative flex flex-col items-center">
      
      {/* Golden Ambient Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-1/3 left-0 w-[400px] h-[400px] bg-amber-600/5 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0d14]/90 backdrop-blur-md border-b border-amber-500/15 flex justify-center">
        <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo with Silhouette Crest */}
          <a href="#home" className="flex items-center gap-2 group cursor-pointer">
            <img 
              src="/brand/brand_logo.png" 
              alt="Fauji Niwas" 
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#home" className="hover:text-amber-400 transition-colors">Home</a>
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#calculator" className="hover:text-amber-400 transition-colors">Calculator</a>
            <a href="#pulses" className="hover:text-amber-400 transition-colors">URC Pulses</a>
            <a href="#about" className="hover:text-amber-400 transition-colors">About</a>
            <a href="/terms.html" className="hover:text-amber-400 transition-colors">Policy</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAccessibilityModal(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
              title="Accessibility & High Contrast"
            >
              <span>♿</span>
              <span className="hidden sm:inline">Access</span>
            </button>

            {/* Golden "Find a Stay" Pill Button */}
            <button 
              onClick={handleLaunchApp}
              className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Search size={14} className="text-amber-400" />
              <span>Find a Stay</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobMenuOpen(!mobMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#0a0d14]/98 backdrop-blur-2xl border-b border-amber-500/20 p-5 flex flex-col gap-3 text-left shadow-2xl">
            <a href="#home" onClick={() => setMobMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 py-2 border-b border-white/5">Home</a>
            <a href="#features" onClick={() => setMobMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 py-2 border-b border-white/5">Features</a>
            <a href="#calculator" onClick={() => setMobMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 py-2 border-b border-white/5">Calculator</a>
            <a href="#pulses" onClick={() => setMobMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 py-2 border-b border-white/5">URC Pulses</a>
            <a href="#about" onClick={() => setMobMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 py-2 border-b border-white/5">About</a>
            <a href="/terms.html" onClick={() => setMobMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 py-2 border-b border-white/5">Policy</a>
            <button onClick={handleLaunchApp} className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2">
              <Search size={16} /> Find a Stay
            </button>
          </div>
        )}
      </header>

      {/* ── Main Landing Canvas ── */}
      <main className="relative z-10 w-full max-w-[1250px] min-w-0 mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 flex flex-col gap-14">
        
        {/* ════════════════════════════════════════════════════════════
            1. HERO SECTION
            ════════════════════════════════════════════════════════════ */}
        <section id="home" className="pt-4 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col text-left">
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight leading-none mb-3">
                Fauji Niwas
              </h1>
              
              {/* Gold Subtitle */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 font-heading tracking-tight mb-4">
                Secure. Verified. For Our <span className="text-amber-400">Armed Forces.</span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mb-6">
                Find and book comfortable, verified transit accommodation near defence establishments across 62+ stations.
              </p>

              {/* Interactive Station Search Bar */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mb-6">
                <div className="bg-white rounded-full p-1.5 sm:p-2 flex items-center shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-amber-500/40">
                  <div className="pl-3 sm:pl-4 text-slate-400 shrink-0">
                    <MapPin size={20} className="text-amber-600" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Station (e.g. Delhi Cantt, Pune, Jaipur...)"
                    className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 bg-transparent outline-none font-medium"
                  />
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0 uppercase tracking-wider"
                  >
                    <Search size={14} className="stroke-[3]" />
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-[10px]">✔</span>
                  <span>Verified Properties</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">⭐</span>
                  <span>Trusted by Forces</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">📍</span>
                  <span>62+ Stations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">⚡</span>
                  <span>Instant Booking</span>
                </div>
              </div>

            </div>

            {/* Right Artwork Column: Soldier with Flag */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_15px_45px_rgba(0,0,0,0.7)] group max-w-md w-full">
                <img 
                  src="/brand/hero_soldier_flag.jpg" 
                  alt="Indian Armed Forces Soldier at Sunset" 
                  className="w-full h-[260px] sm:h-[300px] object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14]/70 via-transparent to-transparent opacity-60" />
                
                {/* Script Cursive Quote */}
                <div className="absolute bottom-4 right-4 max-w-[240px] text-right">
                  <p className="font-serif italic text-amber-300/90 text-sm sm:text-base leading-snug drop-shadow-md">
                    “Because every soldier deserves a home away from home.”
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. 12 KEY FEATURES GRID
            ════════════════════════════════════════════════════════════ */}
        <section id="features" className="pt-2">
          
          {/* Section Divider Header */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1 max-w-[180px]" />
            <h2 className="text-xl sm:text-2xl font-black font-heading text-amber-400 uppercase tracking-widest text-center">
              12 Key Features
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1 max-w-[180px]" />
          </div>

          {/* 4x3 Grid (12 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Building2 className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Verified &amp; Trusted Properties</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Physically vetted cantonment stays</p>
              </div>
            </div>

            {/* Card 2 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <MapPin className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">62+ Defence Stations</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">All Army, Navy &amp; Air Force bases</p>
              </div>
            </div>

            {/* Card 3 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <ShieldCheck className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Secure &amp; Safe Stays</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Gated zones with zero broker fraud</p>
              </div>
            </div>

            {/* Card 4 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Users className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Family Friendly Options</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">BHK flats &amp; family transit homes</p>
              </div>
            </div>

            {/* Card 5 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Calendar className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Flexible Booking</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Short (TD) &amp; Long Term Postings</p>
              </div>
            </div>

            {/* Card 6 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <CircleDollarSign className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Transparent Pricing</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">No Hidden Charges · ₹0 Brokerage</p>
              </div>
            </div>

            {/* Card 7 */}
            <div onClick={() => setShowLeaseModal(true)} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <FileText className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">HRA &amp; TA/DA Guidance</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">7th CPC Allowance &amp; Break Clause</p>
              </div>
            </div>

            {/* Card 8 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Navigation className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Real-Time Location on Map</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Gate distance &amp; Army School GIS</p>
              </div>
            </div>

            {/* Card 9 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Bell className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Instant Notifications</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">URC &amp; live canteen updates</p>
              </div>
            </div>

            {/* Card 10 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Headphones className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Dedicated Support</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">24×7 Defence Community Help</p>
              </div>
            </div>

            {/* Card 11 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Star className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Ratings &amp; Reviews</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">from Defence Community Only</p>
              </div>
            </div>

            {/* Card 12 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/80 hover:bg-[#161c2b] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer group text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Smartphone className="text-amber-400" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white font-heading">Mobile Friendly</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Fast PWA for Any Device</p>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. EXISTING VS FAUJI NIWAS (COMPARISON MATRIX)
            ════════════════════════════════════════════════════════════ */}
        <section id="comparison" className="pt-2">
          
          {/* Section Divider Header */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1 max-w-[180px]" />
            <h2 className="text-xl sm:text-2xl font-black font-heading text-amber-400 uppercase tracking-widest text-center">
              Existing vs Fauji Niwas
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1 max-w-[180px]" />
          </div>

          {/* Elevated Matrix Table with Gold Highlights */}
          <div className="overflow-x-auto w-full rounded-2xl border border-amber-500/30 bg-[#0e121c]/90 backdrop-blur-md shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-amber-500/20 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/5">
                  <th className="py-4 pl-6 sm:pl-8 pr-4 w-[28%]">
                    Feature
                  </th>
                  <th className="py-4 px-6 w-[34%] text-slate-400 font-bold">
                    What's Existing?
                  </th>
                  <th className="py-4 px-6 pr-8 w-[38%] text-amber-300 font-black bg-amber-500/10 border-l border-amber-500/20">
                    What's Different with Fauji Niwas?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                
                {/* Row 1: Accommodation */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <Building2 size={16} className="text-amber-400 shrink-0" />
                      <span>Accommodation</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Unorganised / Limited Options
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    Verified, Safe &amp; Comfortable Stays
                  </td>
                </tr>

                {/* Row 2: Location Coverage */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={16} className="text-amber-400 shrink-0" />
                      <span>Location Coverage</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Few Stations
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    62+ Stations Across India
                  </td>
                </tr>

                {/* Row 3: Booking Process */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={16} className="text-amber-400 shrink-0" />
                      <span>Booking Process</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Manual / Direct Contact
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    Instant Online Booking
                  </td>
                </tr>

                {/* Row 4: HRA Guidance */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-amber-400 shrink-0" />
                      <span>HRA Guidance</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Confusing Rules
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    Easy 7th CPC HRA Support
                  </td>
                </tr>

                {/* Row 5: Support */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <Headphones size={16} className="text-amber-400 shrink-0" />
                      <span>Support</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Limited
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    24×7 Dedicated Support
                  </td>
                </tr>

                {/* Row 6: ID Vetting & Privacy */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                      <span>ID Vetting &amp; Privacy</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Civilian logins, high spam &amp; fraud risk
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    100% Client-Side Wasm Masking (Zero Data Leak)
                  </td>
                </tr>

                {/* Row 7: Military Break Clause Leases */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-amber-400 shrink-0" />
                      <span>Posting Transfer Break Clause</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Rigid 11-month civilian lock-in contracts
                  </td>
                  <td className="py-4 px-6 pr-8 text-amber-200 font-bold bg-amber-500/[0.04] border-l border-amber-500/20">
                    Official 15-Day Posting Transfer Refund Clause
                  </td>
                </tr>

                {/* Row 8: Brokerage Commission */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 pl-6 sm:pl-8 pr-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <CircleDollarSign size={16} className="text-amber-400 shrink-0" />
                      <span>Brokerage Commission</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-slate-400">
                    1–2 Months rent commission + hidden dealer fees
                  </td>
                  <td className="py-5 px-6 pr-8 text-emerald-400 font-extrabold bg-amber-500/[0.04] border-l border-amber-500/20">
                    ₹0 Forever (Strict Zero-Brokerage Policy)
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. 7TH CPC HRA COVERAGE CALCULATOR
            ════════════════════════════════════════════════════════════ */}
        <section id="calculator" className="pt-2">
          <div className="w-full rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#121622] via-[#0d1017] to-[#0a0d14] p-6 sm:p-9 shadow-2xl relative overflow-hidden">
            
            {/* Subtle background quarter photo on the right */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
              <img 
                src="/brand/hra_quarters.jpg" 
                alt="Military Quarters" 
                className="w-full h-full object-cover object-center" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121622] via-transparent to-transparent" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Form Controls */}
              <div className="md:col-span-7 flex flex-col text-left">
                
                {/* Title */}
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Calculator size={18} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-heading">
                    7th CPC HRA Coverage Calculator
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-6 font-normal">
                  Check your HRA coverage as per 7th CPC norms
                </p>

                {/* City Category Selector Buttons */}
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    City Category:
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-w-sm">
                    {['X', 'Y', 'Z'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCityCategory(cat)}
                        className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          cityCategory === cat 
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]' 
                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-amber-500/40 hover:text-white'
                        }`}
                      >
                        {cat} ({cat === 'X' ? '30%' : cat === 'Y' ? '20%' : '10%'})
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {cityCategory === 'X' && 'Class X: Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad'}
                    {cityCategory === 'Y' && 'Class Y: Ambala, Jaipur, Lucknow, Bhopal, Prayagraj, Jalandhar, etc. (Default)'}
                    {cityCategory === 'Z' && 'Class Z: All other small military stations and cantonments'}
                  </span>
                </div>

                {/* Basic Pay Numeric Input */}
                <div className="flex flex-col gap-2 mb-5 max-w-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Basic Pay (₹):
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={basicPay}
                      onChange={(e) => setBasicPay(e.target.value)}
                      placeholder="Enter Basic Pay"
                      className="w-full bg-[#171c29] border border-white/10 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const rate = cityCategory === 'X' ? 0.30 : cityCategory === 'Y' ? 0.20 : 0.10;
                        const minHra = cityCategory === 'X' ? 5400 : cityCategory === 'Y' ? 3600 : 1800;
                        setCalculatedHra(Math.max(minHra, Math.round((Number(basicPay) || 0) * rate)));
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                    >
                      <span>Calculate</span>
                    </button>
                  </div>
                </div>

                {/* Quick Rank Presets */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="text-slate-400 mr-1 self-center">Presets:</span>
                  {[
                    { label: 'Jawan', pay: 21700 },
                    { label: 'Havildar', pay: 29200 },
                    { label: 'Subedar', pay: 44900 },
                    { label: 'Captain', pay: 61300 },
                    { label: 'Major', pay: 69400 },
                    { label: 'Col', pay: 130600 },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setBasicPay(p.pay)}
                      className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Right Output Display */}
              <div className="md:col-span-5 flex flex-col items-center md:items-end justify-center text-center md:text-right">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Your HRA Coverage
                </span>
                <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight drop-shadow-lg">
                  ₹ {calculatedHra.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-slate-400 mt-1 font-medium">
                  (as per 7th CPC, {cityCategory === 'X' ? '30%' : cityCategory === 'Y' ? '20%' : '10%'})
                </span>
                <button
                  onClick={handleLaunchApp}
                  className="mt-4 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Filter Stays Within HRA</span>
                  <ExternalLink size={12} />
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5. LIVE URC PULSES
            ════════════════════════════════════════════════════════════ */}
        <section id="pulses" className="pt-2">
          
          {/* Header with Pulse Waveform */}
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              {/* Left Pulse SVG */}
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="text-amber-500 opacity-80">
                <path d="M0 10 H12 L16 3 L22 17 L26 10 H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-amber-400 uppercase tracking-widest">
                Live URC Pulses
              </h2>
              {/* Right Pulse SVG */}
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="text-amber-500 opacity-80">
                <path d="M0 10 H12 L16 3 L22 17 L26 10 H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="text-slate-400">Real-time updates on URC announcements, circulars and policies.</span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live · Last Updated: 06 Nov 2026, 20:45 IST
              </span>
            </div>
          </div>

          {/* 4 Pulse Cards in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/90 hover:bg-[#161c2a] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">URC Circular</h4>
                  <p className="text-[11px] text-slate-400">No. 45/2026 (Policy Update)</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>2h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Card 2 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/90 hover:bg-[#161c2a] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">HRA Revision</h4>
                  <p className="text-[11px] text-slate-400">Clarifications &amp; Rates</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>3h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Card 3 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/90 hover:bg-[#161c2a] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Bookmark size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Station List</h4>
                  <p className="text-[11px] text-slate-400">(Updated 62+ Cantts)</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>5h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Card 4 */}
            <div onClick={handleLaunchApp} className="bg-[#10141f]/90 hover:bg-[#161c2a] border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">General Instructions</h4>
                  <p className="text-[11px] text-slate-400">for Veterans &amp; ESM Stays</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>6h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            6. ABOUT THE FOUNDERS
            ════════════════════════════════════════════════════════════ */}
        <section id="about" className="pt-2">
          
          {/* Header */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1 max-w-[180px]" />
            <h2 className="text-xl sm:text-2xl font-black font-heading text-amber-400 uppercase tracking-widest text-center">
              About the Founders
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1 max-w-[180px]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Statement */}
            <div className="lg:col-span-4 flex flex-col text-left">
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-4">
                Fauji Niwas is proudly built by a team of passionate innovators — committed to serve the Armed Forces community with technology, trust and care.
              </p>
              <p className="font-serif italic text-amber-300 text-sm font-semibold">
                Built with respect. For those who serve. 🇮🇳
              </p>
            </div>

            {/* Right: 3 Founder Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Founder 1: Aman Kumar Singh */}
              <div className="bg-[#10141f] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col items-center text-center transition-all group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/40 p-0.5 mb-3 group-hover:border-amber-400 transition-colors">
                  <img 
                    src="/brand/avatar_aman.png" 
                    alt="Aman Kumar Singh" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <h3 className="font-black text-sm text-white font-heading">Aman Kumar Singh</h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 mb-3">Co-Founder &amp; Developer</span>
                <a 
                  href="https://www.linkedin.com/in/aman-kumar-singh-46b2b4255/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                  title="LinkedIn Profile"
                >
                  in
                </a>
              </div>

              {/* Founder 2: Pari Rastogi */}
              <div className="bg-[#10141f] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col items-center text-center transition-all group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/40 p-0.5 mb-3 group-hover:border-amber-400 transition-colors">
                  <img 
                    src="/brand/avatar_pari.png" 
                    alt="Pari Rastogi" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <h3 className="font-black text-sm text-white font-heading">Pari Rastogi</h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 mb-3">Co-Founder &amp; Designer</span>
                <a 
                  href="https://www.linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                  title="LinkedIn Profile"
                >
                  in
                </a>
              </div>

              {/* Founder 3: Ayush Gautam */}
              <div className="bg-[#10141f] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col items-center text-center transition-all group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/40 p-0.5 mb-3 group-hover:border-amber-400 transition-colors">
                  <img 
                    src="/brand/avatar_ayush.png" 
                    alt="Ayush Gautam" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <h3 className="font-black text-sm text-white font-heading">Ayush Gautam</h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 mb-3">Co-Founder &amp; Engineer</span>
                <a 
                  href="https://www.linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                  title="LinkedIn Profile"
                >
                  in
                </a>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════════════════════════
          7. FOOTER
          ════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#07090e] border-t border-amber-500/20 pt-12 pb-8 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 flex flex-col gap-8">
          
          {/* Top Row: Brand, Nav Links & Social */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            
            {/* Logo + Tagline */}
            <div className="flex items-center gap-3">
              <img 
                src="/brand/brand_logo.png" 
                alt="Fauji Niwas" 
                className="h-10 w-auto object-contain" 
              />
            </div>

            {/* Navigation links */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
              <a href="/privacy.html" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="/terms.html" className="hover:text-amber-400 transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="mailto:faujiniwashq@gmail.com" className="hover:text-amber-400 transition-colors">Contact Us</a>
              <span>|</span>
              <a href="/faq.html" className="hover:text-amber-400 transition-colors">FAQ</a>
              <span>|</span>
              <a href="https://github.com/gangasagar5928/faujiniwas" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>GitHub</span>
              </a>
            </div>

            {/* Social Icons & Silhouette */}
            <div className="flex items-center gap-4">
              {/* Silhouette artwork */}
              <img 
                src="/brand/footer_silhouette.png" 
                alt="Soldiers & Families Silhouette" 
                className="h-7 w-auto opacity-60 hidden sm:block" 
              />
              
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/aman-kumar-singh-46b2b4255/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              {/* X / Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" title="X (Twitter)">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" title="YouTube">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* Mail */}
              <a href="mailto:faujiniwashq@gmail.com" className="text-slate-400 hover:text-amber-400 transition-colors" title="Email Support">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l9.518 7.713 9.518-7.713v11.817h-19.036z"/></svg>
              </a>
            </div>

          </div>

          {/* Popular Relocation Cities for SEO */}
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
              🎖️ Popular Military Relocation Stations / लोकप्रिय सैन्य स्टेशन:
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
              <a href="/pune.html" className="hover:text-amber-400 transition-colors">Pune Cantt</a>
              <a href="/delhi.html" className="hover:text-amber-400 transition-colors">Delhi Cantt</a>
              <a href="/ambala.html" className="hover:text-amber-400 transition-colors">Ambala Cantt</a>
              <a href="/secunderabad.html" className="hover:text-amber-400 transition-colors">Secunderabad</a>
              <a href="/bhopal.html" className="hover:text-amber-400 transition-colors">Bhopal</a>
              <a href="/prayagraj.html" className="hover:text-amber-400 transition-colors">Prayagraj (SCE)</a>
              <a href="/kapurthala.html" className="hover:text-amber-400 transition-colors">Kapurthala</a>
              <a href="/bangalore.html" className="hover:text-amber-400 transition-colors">Bengaluru</a>
              <a href="/mhow.html" className="hover:text-amber-400 transition-colors">Mhow</a>
              <a href="/jabalpur.html" className="hover:text-amber-400 transition-colors">Jabalpur</a>
              <a href="/jodhpur.html" className="hover:text-amber-400 transition-colors">Jodhpur</a>
              <a href="/jaipur.html" className="hover:text-amber-400 transition-colors">Jaipur</a>
              <a href="/lucknow.html" className="hover:text-amber-400 transition-colors">Lucknow</a>
              <a href="/jalandhar.html" className="hover:text-amber-400 transition-colors">Jalandhar</a>
              <a href="/pathankot.html" className="hover:text-amber-400 transition-colors">Pathankot</a>
              <a href="/dehradun.html" className="hover:text-amber-400 transition-colors">Dehradun</a>
              <a href="/udhampur.html" className="hover:text-amber-400 transition-colors">Udhampur</a>
              <a href="/chennai.html" className="hover:text-amber-400 transition-colors">Chennai</a>
              <a href="/kolkata.html" className="hover:text-amber-400 transition-colors">Kolkata</a>
            </div>
          </div>

          {/* Copyright Notice */}
          <div className="text-center pt-4 border-t border-white/5 text-[11px] text-slate-500 font-medium">
            © 2026 Fauji Niwas. All rights reserved. &nbsp;|&nbsp; Made with 🇮🇳 for our Armed Forces.
          </div>

        </div>
      </footer>

      {/* ── Modals & Transitions ── */}
      {showLeaseModal && (
        <React.Suspense fallback={null}>
          <LeaseGeneratorModal isOpen={showLeaseModal} onClose={() => setShowLeaseModal(false)} />
        </React.Suspense>
      )}

      {showWasmModal && (
        <React.Suspense fallback={null}>
          <WasmMaskingModal isOpen={showWasmModal} onClose={() => setShowWasmModal(false)} />
        </React.Suspense>
      )}

      {showAccessibilityModal && (
        <AccessibilityModal 
          isOpen={showAccessibilityModal} 
          onClose={() => setShowAccessibilityModal(false)} 
        />
      )}

      {/* Fast Dark Glass Loader Transition Screen */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[9999] bg-[#07090e]/90 backdrop-blur-xl flex flex-col items-center justify-center select-none">
          <div className="bg-[#10141f] border border-amber-500/30 w-[280px] p-8 rounded-[28px] shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center gap-5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-400">FaujiNiwas</h3>
              <p className="text-[10px] text-slate-400 tracking-widest font-medium">SECURE COMMAND CENTER</p>
            </div>
            <div className="w-40 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 animate-[loaderSlide_1s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
