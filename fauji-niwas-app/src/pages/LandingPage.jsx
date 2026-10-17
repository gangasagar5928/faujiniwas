import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, ArrowUpRight, Check, FileText, Lock, Globe, Phone, Mail, Award, Navigation, Star, Menu, X, Sparkles, Building, ShoppingBag, MapPin, Calculator, ShieldCheck, Zap } from 'lucide-react';
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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress((window.scrollY / total) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // Explicitly unblock scrolling: purge any leftover app-shell fixed locking
    document.documentElement.classList.remove('app-shell');
    document.body.classList.remove('app-shell');
    document.documentElement.classList.add('landing-page-active');
    document.body.classList.add('landing-page');

    document.documentElement.style.position = 'static';
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.height = 'auto';

    document.body.style.position = 'static';
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';

    window.__APP_READY__ = true;
    window.dispatchEvent(new Event('app-ready'));
    const loader = document.getElementById('tactical-loader');
    if (loader) {
      loader.classList.add('opacity-0');
      loader.style.pointerEvents = 'none';
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
      }, 700);
    }
    return () => {
      document.body.classList.remove('landing-page');
      document.documentElement.classList.remove('landing-page-active');
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

      {/* Live Interactive Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3.5px] z-[10001] bg-slate-200/20 dark:bg-slate-800/20 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 transition-[width] duration-75 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ColorOS Gloaming aurora backdrop — colour field behind every glass panel */}
      <div className="landing-aurora" aria-hidden="true" />

      {/* Grid Background Overlay */}
      <div className="grid-bg-overlay" aria-hidden="true" />

      {/* Navigation Header — floating liquid glass sheet */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] liquid-glass-morph lg-hairline border-0 transition-all duration-300">
        <div className="max-w-[1250px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="logo flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white font-heading min-h-[48px] px-2">
            <img 
              src={isDarkTheme ? '/logo-dark.jpg' : '/logo-light.jpg'} 
              alt="FaujiNiwas" 
              className="w-8 h-8 rounded-lg object-contain shadow-xs" 
            />
            <span><span className="text-amber-600 dark:text-amber-400">FAUJI</span> <span className="text-slate-950 dark:text-white font-normal">NIWAS</span></span>
          </a>

          {/* Center Links - text contrast upgrades */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <motion.a whileHover={{ y: -1, scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} href="#" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">Home</motion.a>
            <motion.button whileHover={{ y: -1, scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} onClick={handleLaunchApp} className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors font-black uppercase cursor-pointer bg-transparent border-none min-h-[48px] px-3 flex items-center">Listings</motion.button>
            <motion.button whileHover={{ y: -1, scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} onClick={handleLaunchApp} className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors font-black uppercase cursor-pointer bg-transparent border-none min-h-[48px] px-3 flex items-center">Post Room</motion.button>
            <motion.a whileHover={{ y: -1, scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} href="/about.html" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">About</motion.a>
            <motion.a whileHover={{ y: -1, scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} href="#comparison" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">Compare</motion.a>
            <motion.a whileHover={{ y: -1, scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} href="#footer" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors min-h-[48px] px-3 flex items-center">Contact</motion.a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAccessibilityModal(true)}
              className="px-3.5 py-2 min-h-[40px] rounded-xl text-[11px] font-extrabold uppercase tracking-wider border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white shadow-xs hover:border-amber-600 transition-all cursor-pointer flex items-center gap-1.5"
              title="Accessibility, Contrast & Font"
            >
              <span>♿</span>
              <span className="hidden sm:inline">Contrast &amp; Font</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLaunchApp} 
              className="text-slate-800 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer w-10 h-10 flex items-center justify-center" 
              title="Search Listings" 
              aria-label="Search"
            >
              <Search size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -1, boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLaunchApp}
              className="px-5 py-2.5 min-h-[40px] rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-600/40 text-amber-900 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center shadow-xs"
            >
              Sign In
            </motion.button>
            {/* Hamburger Toggle (Mobile) */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobMenuOpen(!mobMenuOpen)}
              className="md:hidden w-10 h-10 text-slate-800 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-[999] liquid-glass-morph rounded-b-3xl border-0 p-6 flex flex-col text-left shadow-2xl md:hidden backdrop-blur-2xl bg-white/95 dark:bg-[#070b15]/95 divide-y divide-slate-100 dark:divide-white/5">
          <a href="#" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 py-3.5 block">Home</a>
          <button onClick={(e) => { setMobMenuOpen(false); handleLaunchApp(e); }} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 text-left cursor-pointer py-3.5 block w-full border-none bg-transparent">Listings</button>
          <button onClick={(e) => { setMobMenuOpen(false); handleLaunchApp(e); }} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 text-left cursor-pointer py-3.5 block w-full border-none bg-transparent">Post Room</button>
          <a href="/about.html" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 py-3.5 block">About</a>
          <a href="#comparison" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 py-3.5 block">Compare</a>
          <a href="#footer" onClick={() => setMobMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 py-3.5 block">Contact</a>
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
          <div className="text-left flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Live Defence Housing Protocol
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-slate-900 dark:text-white font-heading">
              FAUJI<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">NIWAS</span>
            </h1>
          </div>

          {/* Stat metrics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3.5 pt-4 lg:pt-0">
            <motion.div 
              whileHover={{ scale: 1.05, y: -3 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="feature-card glass-card px-5 py-3.5 rounded-2xl flex flex-col border-l-4 border-l-amber-500 min-w-[110px] cursor-pointer shadow-sm text-left"
            >
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none font-heading">300+</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold mt-1 font-mono">Listings</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -3 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="feature-card glass-card px-5 py-3.5 rounded-2xl flex flex-col border-l-4 border-l-emerald-500 min-w-[110px] cursor-pointer shadow-sm text-left"
            >
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none font-heading">15+</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold mt-1 font-mono">Stations</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -3 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="feature-card glass-card px-5 py-3.5 rounded-2xl flex flex-col border-l-4 border-l-amber-500 min-w-[110px] cursor-pointer shadow-sm text-left"
            >
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none font-heading">0</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold mt-1 font-mono">Brokerage</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Hero Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.008, transition: { duration: 0.3 } }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative rounded-[2rem] overflow-hidden w-full h-[450px] sm:h-[500px] md:h-[540px] liquid-glass-morph shadow-[0_24px_70px_rgba(15,23,42,0.18)] group"
        >
          <picture>
            <source media="(max-width: 640px)" srcSet="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=450&q=25&fm=webp" />
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=50&fm=webp" 
              alt="Premium Defence Housing Villa" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
            <motion.button 
              onClick={handleLaunchApp}
              whileHover={{ scale: 1.04, y: -2, boxShadow: '0 8px 36px rgba(245,158,11,0.6)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="mt-2 w-fit bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-heading font-black text-[10px] sm:text-xs uppercase tracking-widest px-8 py-5 min-h-[48px] rounded-xl shadow-[0_4px_24px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀</span> Enter Secure Command Center
            </motion.button>
          </div>
        </motion.div>

        {/* Features 2x3 Bento Grid */}
        {/* Compact 4-col / 2-col Feature Cards Grid with fluid glassmorphic design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">

          {/* Feature 1: Cantonment Map */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <Navigation size={13} /> #01 Map Search
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">Cantonment Proximity</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Exact gate distance routing, Army Schools, and Military Hospitals mapped in real-time.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              📍 Gate Routing · 🏫 KV Schools · 🏥 Base Hosp
            </div>
          </motion.div>

          {/* Feature 2: Verified Listings & Marketplace */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <ShoppingBag size={13} /> #02 Defence Market
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">Defence Marketplace</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Direct peer-to-peer household transfers & verified postings without middleman brokers.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              🎖️ Verified Defence · 🚫 Zero Brokerage · 🛋️ Items
            </div>
          </motion.div>

          {/* Feature 3: HRA Rank Matching */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <Award size={13} /> #03 7th CPC HRA
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">Rank-Based HRA Matching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Automatic allowance filters calibrated for Jawans, JCOs, and Commissioned Officers.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              💰 7th CPC Bands · 🛡️ OR / JCO / Officers · 📋 Budgets
            </div>
          </motion.div>

          {/* Feature 4: SSB Candidate Dorms */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <Star size={13} /> #04 SSB Dorms
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading">SSB Candidate Stays</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Affordable budget stays and mess food guides minutes away from Selection Centres.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              🪖 11 &amp; 33 SSB · 🛏️ From ₹200/night · 🍛 Food Guides
            </div>
          </motion.div>

          {/* Feature 5: Military AI Transfer Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <Sparkles size={13} /> #05 AI Assistant
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">Military AI Assistant</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Instant station relocation advisory, HRA calculations, and automatic housing matches.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              🤖 Route Planner · 🗺️ Station Intel · ⚡ Instant Match
            </div>
          </motion.div>

          {/* Feature 6: Digital Lease Generator */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={() => setShowLeaseModal(true)}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <FileText size={13} /> #06 Lease Generator
              </span>
              <button onClick={(e) => { e.stopPropagation(); setShowLeaseModal(true); }} aria-label="Open Lease Generator" className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300 shadow-xs cursor-pointer">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">Military Lease Agreements</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Official rent agreements embedded with standard 15-day military posting break clause.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              📄 15-Day Break Clause · ⚖️ Standardized · 🖋️ Instant PDF
            </div>
          </motion.div>

          {/* Feature 7: Live CSD Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={handleLaunchApp}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <Zap size={13} /> #07 CSD Pulse
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-400 transition-all duration-300 shadow-xs">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-heading">Live CSD &amp; URC Pulse</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Real-time canteen token queues, grocery stock updates, and AFD tracking.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              🛒 Token Queues · 🍾 Liquor Stock · 🚗 AFD CSD Portal
            </div>
          </motion.div>

          {/* Feature 8: Wasm ID Masking */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            onClick={() => setShowWasmModal(true)}
            className="feature-card glass-card glass-shine group relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer text-left gap-5"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={13} /> #08 Client Privacy
              </span>
              <button onClick={(e) => { e.stopPropagation(); setShowWasmModal(true); }} aria-label="Open Wasm Masking" className="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-400 transition-all duration-300 shadow-xs cursor-pointer">
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors font-heading">Wasm ID Masking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">Offline client-side redaction ensuring zero personal military data leaves your browser.</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
              🔒 100% Offline Wasm · 🛡️ Zero Data Leak · 🆔 Redaction
            </div>
          </motion.div>

        </div>

        {/* Why FaujiNiwas Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          id="why-us" 
          className="liquid-glass-morph rounded-3xl p-7 md:p-10 mt-4 text-left flex flex-col md:flex-row gap-8 items-start justify-between border border-white/40 dark:border-white/10 shadow-xl backdrop-blur-2xl"
        >
          <div className="max-w-xl flex flex-col gap-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl w-fit">
              Exclusive Platform Overview
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight font-heading">
              WHY FAUJI NIWAS?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Designed entirely to remove the friction of sudden military posting cycles. Built securely for jawans, JCOs, and officers to share postings and rent homes without civilian classified noise.
            </p>
          </div>
          <motion.button 
            onClick={handleLaunchApp} 
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 12px 30px rgba(245, 158, 11, 0.4)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            className="cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider font-black py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-lg whitespace-nowrap"
          >
            <span>Launch Relocation OS</span>
            <span className="text-base font-bold">↗</span>
          </motion.button>
        </motion.section>

        {/* Updated Military vs Civilian Comparison Table */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          id="comparison" 
          className="liquid-glass-morph rounded-3xl p-7 md:p-10 mt-4 text-left border border-white/40 dark:border-white/10 shadow-xl backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-2.5 mb-8">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl w-fit">
              Compare The Tactical Edge
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight font-heading">
              MILITARY VS CIVILIAN PLATFORMS
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl font-light">
              See why defence families across 30+ military stations prefer Fauji Niwas over general civilian rental portals.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md p-2">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <th className="p-4 font-black">Platform Capability</th>
                  <th className="p-4 text-emerald-700 dark:text-emerald-400 font-black">FaujiNiwas 🎖️</th>
                  <th className="p-4 text-slate-500 dark:text-slate-400 font-normal">Civilian Portals (99acres, NoBroker)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200 font-medium">
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">Military ID Vetting &amp; Privacy</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 100% Client-Side Wasm Masking (Zero Data Leak)</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 None (Civilian logins, high risk of spam &amp; fraud)</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">7th CPC HRA Rank Budgets</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 Automatic (Officer / JCO / OR limits matched)</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 None (Generic price sliders with no rank context)</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">Cantonment &amp; Gate Distance</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 Exact Gate &amp; Military Unit Proximity Routing</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 None (Civilian postal codes only)</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">SSB Candidate Dorms</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 Dedicated SSB Selection Centre Stays + Food Guide</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 None (Expensive civilian hotels only)</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">Military Break Clause Leases</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 Official 15-Day Posting Transfer Break Clause</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 None (Rigid 11-month civilian lock-in contracts)</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">Defence Marketplace</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 Direct Peer-to-Peer Relocation Transfers</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 Open classifieds filled with commercial dealers</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">CSD Canteen &amp; Base Facilities</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 Live CSD Pulse, Army Schools &amp; Military Hospitals</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 None (Zero military infrastructure data)</td>
                </tr>
                <tr className="hover:bg-amber-500/10 transition-colors duration-150 cursor-default">
                  <td className="p-4 font-bold">Brokerage Commission</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">🟢 ₹0 (Strict Zero-Brokerage Policy)</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400">🔴 High (1–2 Months Rent Commission + Hidden Fees)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Tactical Tools list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          {/* Card 1: Lease Generator */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => setShowLeaseModal(true)}
            className="feature-card glass-card glass-shine p-7 rounded-3xl flex gap-5 cursor-pointer text-left items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">Free Legal Tool</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-1.5 font-heading">Military Lease Generator</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                Draft a rental agreement equipped with the Indian Military Break Clause. Landlords must agree to refund deposits within a 15-day notice upon official posting orders.
              </p>
            </div>
          </motion.div>

          {/* Card 2: WASM Masking */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => setShowWasmModal(true)}
            className="feature-card glass-card glass-shine p-7 rounded-3xl flex gap-5 cursor-pointer text-left items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
              <Lock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">Zero-Trust Security</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-1.5 font-heading">WASM Edge Document Masking</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                Protect your privacy in line with DPDPA Act 2023. Our client-side WebAssembly script processes documents directly on your browser, automatically redacting personal identification cards and numbers before upload.
              </p>
            </div>
          </motion.div>

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
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1250px] mx-auto px-6 mt-10 mb-6 relative z-10 text-left"
      >
        <div className="liquid-glass-morph rounded-3xl p-7 md:p-10 border border-white/40 dark:border-white/10 shadow-xl backdrop-blur-2xl">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-xl w-fit">
            Founding Team
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 mb-8 font-heading">Meet the Minds Behind Fauji Niwas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Founder 1 */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="feature-card glass-card glass-shine flex gap-5 items-start p-6 rounded-3xl group"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/40 shrink-0 group-hover:border-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300">
                <img 
                  src="/aman-kumar-singh-small.jpg" 
                  alt="Aman Kumar Singh" 
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                  width="64"
                  height="64"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Aman Kumar Singh</h3>
                <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide block mt-0.5">Founder &amp; Developer</span>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-light mt-2">
                  B.Tech EEE Student at Galgotias College of Engineering and Technology (GCET, AKTU), Security Researcher, and NCC Air Wing 'A' Certificate holder. Aman built Fauji Niwas to solve verified relocation lodging for military families.
                </p>
                <div className="flex gap-4 mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <a href="https://linkedin.com/in/gangasagar5928" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline">LinkedIn ↗</a>
                  <a href="https://github.com/gangasagar5928" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:underline">GitHub ↗</a>
                </div>
              </div>
            </motion.div>

            {/* Founder 2 */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="feature-card glass-card glass-shine flex gap-5 items-start p-6 rounded-3xl group"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shrink-0 group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
                <img 
                  src="/anurag.jpg" 
                  alt="Anurag Kumar Singh" 
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                  width="64"
                  height="64"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Anurag Kumar Singh</h3>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide block mt-0.5">Co-Founder</span>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-light mt-2">
                  JEE Aspirant, YouTuber, Content Creator, and passionate gamer. Co-founded the platform to design community engagement channels and streamline communication guides for serving families.
                </p>
                <div className="flex gap-4 mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <a href="https://www.linkedin.com/in/anurag-singh-a126843a3" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">LinkedIn ↗</a>
                  <a href="https://youtube.com/@aks_vlogs_edits" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 hover:underline">YouTube ↗</a>
                </div>
              </div>
            </motion.div>
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
            <a href="/about" className="hover:text-amber-800 hover:underline transition-colors">About the Founders</a>
            <a href="/privacy" className="hover:text-amber-800 hover:underline transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-amber-800 hover:underline transition-colors">Terms of Service</a>
            <a href="mailto:faujiniwashq@gmail.com" className="hover:text-amber-800 hover:underline transition-colors">Contact Support</a>
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
            <a href="/pune" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Pune Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/delhi" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Delhi Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/ambala" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Ambala Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/secunderabad" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Secunderabad Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/bhopal" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Bhopal Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/kapurthala" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Kapurthala SSB</a>
            <span className="text-slate-300">•</span>
            <a href="/prayagraj" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Prayagraj SSB</a>
            <span className="text-slate-300">•</span>
            <a href="/coimbatore" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Coimbatore Cantt</a>
            <span className="text-slate-300">•</span>
            <a href="/bangalore" className="hover:text-amber-800 hover:scale-105 inline-block transition-transform duration-150">Bangalore Cantt</a>
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
