import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, ArrowRight, ArrowUpRight, Check, FileText, Lock, Globe, Phone, Mail, Award, Navigation, Star, Menu, X, Sparkles, Building, ShoppingBag, MapPin, Calculator, ShieldCheck, Zap, CheckCircle2, XCircle } from 'lucide-react';
const LeaseGeneratorModal = React.lazy(() => import('../components/Modals/LeaseGeneratorModal'));
const WasmMaskingModal = React.lazy(() => import('../components/Modals/WasmMaskingModal'));
const CSDPulseTicker = React.lazy(() => import('../components/CSD/CSDPulseTicker'));
import HRACalculator from '../components/New/HRACalculator';
import AccessibilityModal from '../components/Modals/AccessibilityModal';

export default function LandingPage() {
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showWasmModal, setShowWasmModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('dark-theme');
  });

  useEffect(() => {
    const handleTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('dark-theme'));
    };
    window.addEventListener('theme-change', handleTheme);
    window.addEventListener('storage', handleTheme);
    return () => {
      window.removeEventListener('theme-change', handleTheme);
      window.removeEventListener('storage', handleTheme);
    };
  }, []);
  
  // HRA calculator states
  const [calcRank, setCalcRank] = useState('Major');
  const [calcBasicPay, setCalcBasicPay] = useState(69400);
  
  // High-tech secure redirection sequence states
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [showTicker, setShowTicker] = useState(false);
  const tickerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowTicker(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px' }
    );
    if (tickerRef.current) {
      observer.observe(tickerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('app-shell');
    document.body.classList.remove('app-shell');
    document.body.classList.add('landing-page');

    window.__APP_READY__ = true;
    window.dispatchEvent(new Event('app-ready'));
    const loader = document.getElementById('tactical-loader');
    if (loader) {
      loader.classList.add('opacity-0');
      loader.style.pointerEvents = 'none';
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
      }, 600);
    }

    return () => {
      document.body.classList.remove('landing-page');
    };
  }, []);

  const handleLaunchApp = (e) => {
    if (e) e.preventDefault();
    setIsRedirecting(true);

    // Single quick fade — no multi-step boot screens.
    // The app has its own single professional loader, so we navigate fast.
    try { sessionStorage.setItem('fn_redirect', 'true'); } catch { /* noop */ }

    // Darken page to match app theme (prevents white flash)
    document.documentElement.style.backgroundColor = '#030712';
    document.documentElement.style.colorScheme = 'dark';
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = '#030712';

    // Smoothly fade the body out, then go
    document.body.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.style.opacity = '0';

    setTimeout(() => {
      window.location.href = '/app';
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0b1325] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-amber-500/20 relative">

      {/* ColorOS Gloaming aurora backdrop — colour field behind every glass panel */}
      <div className="landing-aurora" aria-hidden="true" />

      {/* Grid Background Overlay */}
      <div className="grid-bg-overlay" aria-hidden="true" />

      {/* Navigation Header — floating liquid glass sheet */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] liquid-glass-morph lg-hairline border-0 transition-all duration-300">
        <div className="max-w-[1250px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="logo flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 font-heading min-h-[48px] px-2">
            <img 
              src={isDarkTheme ? '/logo-dark.jpg' : '/logo-light.jpg'} 
              alt="FaujiNiwas" 
              className="w-8 h-8 rounded-lg object-contain shadow-xs" 
            />
            <span><span className="text-amber-700">FAUJI</span> <span className="text-slate-950 dark:text-white font-normal">NIWAS</span></span>
          </a>

          {/* Center Links - text contrast upgrades */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <a href="#" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">Home</a>
            <button onClick={handleLaunchApp} className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors font-black uppercase cursor-pointer bg-transparent border-none min-h-[48px] px-3 flex items-center">Listings</button>
            <button onClick={handleLaunchApp} className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors font-black uppercase cursor-pointer bg-transparent border-none min-h-[48px] px-3 flex items-center">Post Room</button>
            <a href="/about.html" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">About</a>
            <a href="#comparison" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">Compare</a>
            <a href="#footer" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">Contact</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAccessibilityModal(true)}
              className="px-3.5 py-2 min-h-[40px] rounded-xl text-[11px] font-extrabold uppercase tracking-wider border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white shadow-xs hover:border-amber-600 transition-all cursor-pointer flex items-center gap-1.5"
              title="Accessibility, Contrast & Font"
            >
              <span>♿</span>
              <span className="hidden sm:inline">Contrast &amp; Font</span>
            </button>
            <button onClick={handleLaunchApp} className="text-slate-800 dark:text-slate-200 hover:text-amber-800 transition-colors cursor-pointer w-10 h-10 flex items-center justify-center" title="Search Listings" aria-label="Search">
              <Search size={18} />
            </button>
            <button 
              onClick={handleLaunchApp}
              className="px-5 py-2.5 min-h-[40px] rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-700/40 text-amber-900 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer flex items-center"
            >
              Sign In
            </button>
            {/* Hamburger Toggle (Mobile) */}
            <button 
              onClick={() => setMobMenuOpen(!mobMenuOpen)}
              className="md:hidden w-10 h-10 text-slate-800 dark:text-slate-200 hover:text-amber-800 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-[999] liquid-glass-morph rounded-b-3xl border-0 p-4 flex flex-col text-left shadow-2xl md:hidden">
          <a href="#" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 py-4 block">Home</a>
          <button onClick={(e) => { setMobMenuOpen(false); handleLaunchApp(e); }} className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 text-left cursor-pointer py-4 block w-full border-none bg-transparent">Listings</button>
          <button onClick={(e) => { setMobMenuOpen(false); handleLaunchApp(e); }} className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 text-left cursor-pointer py-4 block w-full border-none bg-transparent">Post Room</button>
          <a href="/about.html" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 py-4 block">About</a>
          <a href="#comparison" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 py-4 block">Compare</a>
          <a href="#footer" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 py-4 block">Contact</a>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 max-w-[1250px] mx-auto px-6 pt-28 pb-16 flex flex-col gap-10">
        
        {/* Title and Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4"
        >
          <div className="text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-slate-900 font-heading">
              FAUJI<br />NIWAS
            </h1>
          </div>

          {/* Stat metrics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-8 border-t border-slate-200 lg:border-t-0 pt-6 lg:pt-0">
            <div className="flex flex-col border-l-2 border-slate-900 pl-4 min-w-[100px]">
              <span className="text-3xl font-black text-slate-900 leading-none">300+</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mt-1">Listings</span>
            </div>
            <div className="flex flex-col border-l-2 border-slate-900 pl-4 min-w-[100px]">
              <span className="text-3xl font-black text-slate-900 leading-none">15+</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mt-1">Stations</span>
            </div>
            <div className="flex flex-col border-l-2 border-slate-900 pl-4 min-w-[100px]">
              <span className="text-3xl font-black text-slate-900 leading-none">0</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mt-1">Brokerage</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative rounded-[2rem] overflow-hidden w-full h-[450px] sm:h-[500px] md:h-[540px] liquid-glass-morph shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
        >
          <picture>
            <source media="(max-width: 640px)" srcSet="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=450&q=25&fm=webp" />
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=50&fm=webp" 
              alt="Premium Defence Housing Villa" 
              className="w-full h-full object-cover"
              fetchpriority="high"
              loading="eager"
              decoding="sync"
              width="1200"
              height="800"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          
          {/* Top Right Live Badge */}
          <div className="absolute top-6 right-6 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100 font-mono">Live Station Link Active</span>
          </div>

          {/* Bottom Left Info Overlay */}
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-2xl text-left flex flex-col gap-4">
            <div className="w-fit bg-[#0f172a]/60 backdrop-blur-md border border-amber-500/40 px-3.5 py-1.5 rounded-full text-amber-400 text-[9px] font-black uppercase tracking-widest shadow-lg">
              Premium Real Estate For Defence
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-500 leading-tight font-heading drop-shadow-xl hero-title">
              Relocate Safely, Trust Implicitly
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium hero-desc">
              The premier housing network connecting Indian Armed Forces personnel, JCOs, and Officers with secure residential outliving areas across military stations.
            </p>
            
            {/* Big Redirect CTA Button */}
            <button 
              onClick={handleLaunchApp}
              className="mt-2 w-fit bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-heading font-black text-[10px] sm:text-xs uppercase tracking-widest px-8 py-5 min-h-[48px] rounded-xl shadow-[0_4px_24px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_32px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀</span> Enter Secure Command Center
            </button>
          </div>
        </motion.div>

        {/* Bento Grid Header */}
        <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto mt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles size={13} className="text-amber-500" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
            Engineered For Military Life
          </h2>
          <p className="text-slate-650 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Every feature is designed specifically for the frequent posting cycles, allowances, and security requirements of defence families.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">

          {/* Feature 1: Cantonment Proximity */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Navigation size={13} /> Base Navigation
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">Cantonment Proximity</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2.5">Accurate driving distances and transit times to military cantonment gates, Kendriya Vidyalayas, and Military Hospitals.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Gate Distances</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">KV Schools</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Base Hospital</span>
            </div>
          </motion.div>

          {/* Feature 2: Defence Quarters Handover */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Building size={13} /> Peer-to-Peer
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">Defence Quarters Exchange</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2.5">Direct peer transfers between outgoing and incoming defence families. Move into verified quarters with zero brokerage.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Verified Personnel</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Direct Handover</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">₹0 Brokerage</span>
            </div>
          </motion.div>

          {/* Feature 3: Rank-Based HRA Matching */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Calculator size={13} /> Allowance Fit
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading">Rank-Based HRA Matching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2.5">Listings automatically calibrated to official 7th Pay Commission house rent allowances for Jawans, JCOs, and Officers.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">7th CPC Scales</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Class X, Y &amp; Z</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Budget Filter</span>
            </div>
          </motion.div>

          {/* Feature 4: SSB Candidate Stays */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Star size={13} /> Selection Boards
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-heading">SSB Candidate Stays</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2.5">Safe, budget-friendly transit stays and mess food recommendations located minutes from Selection Centres across India.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">11, 14, 21 &amp; 33 SSB</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Budget Stays</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Mess Guides</span>
            </div>
          </motion.div>

          {/* Feature 5: Digital Lease Generator */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={() => setShowLeaseModal(true)}
            className="feature-card glass-card glass-shine group relative p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <FileText size={13} /> Legal Safeguard
              </span>
              <button onClick={(e) => { e.stopPropagation(); setShowLeaseModal(true); }} aria-label="Open Lease Generator" className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300 shadow-xs cursor-pointer">
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">Military Lease Agreements</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2.5">Official rental agreements with an enforceable 15-day military posting break clause guaranteeing deposit refunds.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">15-Day Posting Clause</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Deposit Refund</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Instant PDF</span>
            </div>
          </motion.div>

          {/* Feature 6: Wasm ID Masking */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={() => setShowWasmModal(true)}
            className="feature-card glass-card glass-shine group relative p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={13} /> Data Privacy
              </span>
              <button onClick={(e) => { e.stopPropagation(); setShowWasmModal(true); }} aria-label="Open Wasm Masking" className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-400 transition-all duration-300 shadow-xs cursor-pointer">
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors font-heading">WASM Edge Document Masking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2.5">Offline client-side WebAssembly redaction ensuring zero personal or service ID data leaves your browser.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">100% Offline Wasm</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">DPDPA Compliant</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Zero Cloud Upload</span>
            </div>
          </motion.div>

        </div>

        {/* Why FaujiNiwas Section - Modern 3-Column Feature Showcase */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          id="why-us" 
          className="liquid-glass-morph rounded-[2.5rem] p-8 sm:p-12 md:p-14 mt-6 border border-white/50 dark:border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col gap-10"
        >
          {/* Centered Header */}
          <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-xs">
              <Shield size={13} className="text-amber-500" />
              <span>Verified Defence Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading leading-tight">
              Why Defence Families Choose <span className="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">Fauji Niwas</span>
            </h2>
            <p className="text-slate-650 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Designed entirely to eliminate the friction of sudden military posting cycles. Built securely for jawans, JCOs, and officers to share postings and rent homes without commercial brokerage noise.
            </p>
          </div>

          {/* 3 High-Impact Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="feature-card glass-card glass-shine p-7 rounded-3xl flex flex-col justify-between text-left gap-5 border border-slate-200/80 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Verified Community
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  100% Vetted Community
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2.5 font-normal">
                  No civilian brokers, commercial spammers, or fake landlord deposits. Direct peer-to-peer connection between serving defence personnel and veterans.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Service ID Verified</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Zero Brokerage</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Peer Handover</span>
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="feature-card glass-card glass-shine p-7 rounded-3xl flex flex-col justify-between text-left gap-5 border border-slate-200/80 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Posting Protection
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  15-Day Posting Clause
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2.5 font-normal">
                  Civilian 11-month lock-in contracts forfeit deposits on sudden transfers. Our agreements mandate full security deposit refund upon 15-day military posting notice.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Official Break Clause</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">15-Day Notice</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">DPDPA Aligned</span>
              </div>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="feature-card glass-card glass-shine p-7 rounded-3xl flex flex-col justify-between text-left gap-5 border border-slate-200/80 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 dark:bg-blue-500/25 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                  <Navigation size={24} />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  Cantonment Precision
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  Base Gate Routing
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2.5 font-normal">
                  Pinpoint listings by exact distance to military gates, Kendriya Vidyalayas, Military Hospitals, and live CSD canteen token queues.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Gate Proximity</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">KV Schools</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/10 px-2.5 py-1 rounded-lg">Live CSD Pulse</span>
              </div>
            </motion.div>
          </div>

          {/* Centered Modern Action Banner */}
          <div className="liquid-glass-morph rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-transparent to-emerald-500/[0.08]">
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
                Ready to find or post military quarters?
              </h4>
              <p className="text-slate-650 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Access over 300+ verified listings across 15+ cantonments with zero brokerage.
              </p>
            </div>
            <motion.button 
              onClick={handleLaunchApp} 
              whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 35px rgba(245, 158, 11, 0.45)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="cursor-pointer flex items-center gap-2 text-xs sm:text-sm font-bold py-3.5 px-7 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-lg whitespace-nowrap shrink-0"
            >
              <span>Explore Verified Homes</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.section>

        {/* Updated Military vs Civilian Comparison Table - Ultra Modern Matrix */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          id="comparison" 
          className="liquid-glass-morph rounded-[2.5rem] p-8 sm:p-12 md:p-14 mt-6 border border-white/50 dark:border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col gap-8"
        >
          {/* Centered Header */}
          <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
              <Zap size={13} className="text-emerald-500" />
              <span>Verified Standards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading leading-tight">
              Military Standard vs Civilian Portals
            </h2>
            <p className="text-slate-650 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              See why defence families across 30+ military stations prefer Fauji Niwas over general commercial rental portals like 99acres and NoBroker.
            </p>
          </div>

          {/* Elevated Modern Matrix Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl shadow-lg">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="p-5 font-black w-[32%]">Platform Capability</th>
                  <th className="p-5 w-[38%] bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border-x border-amber-500/20 text-amber-800 dark:text-amber-300 font-black">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-sm text-amber-900 dark:text-amber-300">
                        Fauji Niwas
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                        Defence Standard
                      </span>
                    </div>
                  </th>
                  <th className="p-5 w-[30%] text-slate-500 dark:text-slate-400 font-semibold text-xs">
                    Civilian Portals (99acres, NoBroker)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                
                {/* Row 1 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    Military ID Vetting &amp; Privacy
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        100% Client-Side Wasm Masking (Zero Data Leak)
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Civilian logins, high risk of commercial spam &amp; fraud
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    7th CPC HRA Rank Budgets
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Automatic allowance match (Officer / JCO / OR limits)
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Generic price sliders with no rank calibration
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    Cantonment &amp; Gate Distance
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Exact military gate &amp; unit proximity routing
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Civilian postal codes only, far away from cantt gates
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    SSB Candidate Dorms
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Dedicated Selection Centre stays + Mess food guide
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Expensive civilian hotels with no candidate facilities
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    Military Break Clause Leases
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Official 15-Day Posting Transfer Break Clause
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Rigid 11-month civilian lock-in contracts
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 6 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    Defence Peer Transfers
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Direct Peer-to-Peer relocation quarters handover
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Open classifieds saturated with commercial dealers
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 7 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    CSD Canteen &amp; Base Facilities
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Live CSD pulse, Army Schools &amp; Military Hospitals
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Zero military infrastructure or canteen data
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 8 */}
                <tr className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white">
                    Brokerage Commission
                  </td>
                  <td className="p-5 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-x border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        ₹0 Forever (Strict Zero-Brokerage Policy)
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2.5">
                      <XCircle size={18} className="text-rose-500/80 shrink-0 mt-0.5" />
                      <span className="text-slate-500 dark:text-slate-400">
                        1–2 Months rent commission + excessive hidden fees
                      </span>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Tactical Legal & Security Tools */}
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-xs">
              <FileText size={13} className="text-amber-500" />
              <span>Defence Utilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading leading-tight">
              Built-In Tools for Defence Protection
            </h2>
            <p className="text-slate-650 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Complimentary legal and privacy automation engineered specifically for military families.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Lease Generator */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => setShowLeaseModal(true)}
              className="feature-card glass-card glass-shine p-8 rounded-3xl flex flex-col justify-between cursor-pointer text-left gap-6 border border-slate-200/80 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Free Legal Tool
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  Military Lease Generator
                </h3>
                <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed font-normal mt-2.5">
                  Draft a legally binding rental agreement equipped with the Indian Armed Forces Posting Break Clause. Landlords must agree to refund security deposits within a 15-day notice upon official transfer orders.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  Generate Free Agreement <ArrowRight size={15} />
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">15-Day Posting Clause</span>
              </div>
            </motion.div>

            {/* Card 2: WASM Masking */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => setShowWasmModal(true)}
              className="feature-card glass-card glass-shine p-8 rounded-3xl flex flex-col justify-between cursor-pointer text-left gap-6 border border-slate-200/80 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Lock size={24} />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  Zero-Trust Privacy
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  WASM Edge Document Masking
                </h3>
                <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed font-normal mt-2.5">
                  Protect military ID privacy in line with DPDPA Act 2023. Our client-side WebAssembly engine runs directly in your browser with zero server uploads, redacting personal numbers before sharing with landlords.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  Launch Offline Masking <ArrowRight size={15} />
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">100% Offline Wasm</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* 7th CPC HRA Calculator Section */}
        <div className="flex flex-col gap-4 text-left mb-6">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider font-mono">Allowance Optimization</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-2 font-heading">7th CPC HRA Coverage Calculator</h2>
            <p className="text-slate-650 text-xs leading-relaxed font-light">
              Check your exact house rent allowance entitlements based on rank and basic pay under the 7th Pay Commission for Y-class cities.
            </p>
          </div>
          <div className="max-w-xl">
            <HRACalculator
              selectedRank={calcRank}
              onRankSelect={setCalcRank}
              basicPay={calcBasicPay}
              onBasicPayChange={setCalcBasicPay}
            />
          </div>
        </div>

        {/* Live CSD Pulse Section */}
        <div ref={tickerRef} className="min-h-[170px]">
          {showTicker && (
            <React.Suspense fallback={
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 flex flex-col justify-center items-center h-44 shadow-sm animate-pulse">
                <span className="text-xs text-slate-400 font-mono tracking-wider">Syncing Live URC Ledger...</span>
              </div>
            }>
              <CSDPulseTicker />
            </React.Suspense>
          )}
        </div>

      </main>

      {/* Founders Section for GEO & search engine grounding */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="max-w-[1250px] mx-auto px-6 mt-8 mb-4 relative z-10 text-left"
      >
        <div className="liquid-glass-morph rounded-3xl p-8">
          <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider font-mono">Founding Team</span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-6 font-heading">Meet the Minds Behind Fauji Niwas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Founder 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/30 shrink-0">
                <img 
                  src="/aman-kumar-singh-small.jpg" 
                  alt="Aman Kumar Singh" 
                  className="w-full h-full object-cover object-top"
                  width="64"
                  height="64"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Aman Kumar Singh</h3>
                <span className="text-[9px] font-bold text-amber-755 uppercase tracking-wide block mt-0.5">Founder & Developer</span>
                <p className="text-slate-650 text-[11px] leading-relaxed font-light mt-1.5">
                  B.Tech EEE Student at Galgotias College of Engineering and Technology (GCET, AKTU), Security Researcher, and NCC Air Wing 'A' Certificate holder. Aman built Fauji Niwas to solve verified relocation lodging for military families.
                </p>
                <div className="flex gap-3 mt-2.5 text-[10px] font-semibold text-slate-800">
                  <a href="https://linkedin.com/in/gangasagar5928" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800">LinkedIn</a>
                  <a href="https://github.com/gangasagar5928" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800">GitHub</a>
                </div>
              </div>
            </div>

            {/* Founder 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/30 shrink-0">
                <img 
                  src="/anurag.jpg" 
                  alt="Anurag Kumar Singh" 
                  className="w-full h-full object-cover object-top"
                  width="64"
                  height="64"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Anurag Kumar Singh</h3>
                <span className="text-[9px] font-bold text-indigo-755 uppercase tracking-wide block mt-0.5">Co-Founder</span>
                <p className="text-slate-650 text-[11px] leading-relaxed font-light mt-1.5">
                  JEE Aspirant, YouTuber, Content Creator, and passionate gamer. Co-founded the platform to design community engagement channels and streamline communication guides for serving families.
                </p>
                <div className="flex gap-3 mt-2.5 text-[10px] font-semibold text-slate-800">
                  <a href="https://www.linkedin.com/in/anurag-singh-a126843a3" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800">LinkedIn</a>
                  <a href="https://youtube.com/@aks_vlogs_edits" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800">YouTube</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer id="footer" className="bg-[#FAF9F6] border-t border-slate-200/60 py-12 mt-16 relative z-10 text-left">
        <div className="max-w-[1250px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-black tracking-tight text-slate-900 font-heading">
            <img src="/logo-light.jpg" alt="FaujiNiwas" className="w-6 h-6 rounded-md object-contain light-logo" />
            <img src="/logo-dark.jpg" alt="FaujiNiwas" className="w-6 h-6 rounded-md object-contain dark-logo" />
            <span><span className="text-amber-700">FAUJI</span> <span className="text-slate-950 font-normal">NIWAS</span></span>
            <span className="text-slate-400 text-[10px] ml-1 font-mono">© 2026</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-800">
            <a href="/about" className="hover:text-amber-800 transition-colors">About the Founders</a>
            <a href="/privacy" className="hover:text-amber-800 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-amber-800 transition-colors">Terms of Service</a>
            <a href="mailto:faujiniwashq@gmail.com" className="hover:text-amber-800 transition-colors">Contact Support</a>
          </div>
          
          <div className="text-[9px] text-slate-700 font-medium">
            Made with ❤️ for the Armed Forces
          </div>
        </div>

        {/* Popular Cities SEO Links */}
        <div className="max-w-[1250px] mx-auto px-6 mt-8 pt-6 border-t border-slate-200/40 text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            🎖️ Popular Relocation Cities / लोकप्रिय सैन्य स्टेशन:
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-slate-750">
            <a href="/pune" className="hover:text-amber-800 transition-colors">Pune Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/delhi" className="hover:text-amber-800 transition-colors">Delhi Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/ambala" className="hover:text-amber-800 transition-colors">Ambala Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/secunderabad" className="hover:text-amber-800 transition-colors">Secunderabad Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/bhopal" className="hover:text-amber-800 transition-colors">Bhopal Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/kapurthala" className="hover:text-amber-800 transition-colors">Kapurthala SSB</a>
            <span className="text-slate-300">•</span>
            <a href="/prayagraj" className="hover:text-amber-800 transition-colors">Prayagraj SSB</a>
            <span className="text-slate-300">•</span>
            <a href="/coimbatore" className="hover:text-amber-800 transition-colors">Coimbatore Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/bangalore" className="hover:text-amber-800 transition-colors">Bangalore Cantt</a>
          </div>
        </div>
      </footer>

      {/* Dynamic Modals */}
      {showLeaseModal && (
        <React.Suspense fallback={null}>
          <LeaseGeneratorModal onClose={() => setShowLeaseModal(false)} />
        </React.Suspense>
      )}
      {showWasmModal && (
        <React.Suspense fallback={null}>
          <WasmMaskingModal onClose={() => setShowWasmModal(false)} />
        </React.Suspense>
      )}

      {/* Launch transition — a single clean glass loader (no multi-step boot) */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[9999] bg-[#0b1120]/85 backdrop-blur-xl flex flex-col items-center justify-center select-none">
          <div className="liquid-glass-morph w-[280px] p-8 rounded-[28px] shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col items-center gap-5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#fbbf24]">FaujiNiwas</h3>
              <p className="text-[10px] text-slate-400 tracking-widest font-medium">SECURE HOUSING GATEWAY</p>
            </div>
            <div className="w-40 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 animate-[loaderSlide_1s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}

      {showAccessibilityModal && (
        <AccessibilityModal onClose={() => setShowAccessibilityModal(false)} />
      )}

    </div>
  );
}
