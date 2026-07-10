import React, { useState, useEffect, useRef } from 'react';
import { Shield, Search, ArrowUpRight, Check, FileText, Lock, Globe, Phone, Mail, Award, Navigation, Star, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
const LeaseGeneratorModal = React.lazy(() => import('../components/Modals/LeaseGeneratorModal'));
const WasmMaskingModal = React.lazy(() => import('../components/Modals/WasmMaskingModal'));
const CSDPulseTicker = React.lazy(() => import('../components/CSD/CSDPulseTicker'));

export default function LandingPage() {
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showWasmModal, setShowWasmModal] = useState(false);
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  
  // High-tech secure redirection sequence states
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectStep, setRedirectStep] = useState(0);

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
    document.body.classList.add('landing-page');
    return () => {
      document.body.classList.remove('landing-page');
    };
  }, []);

  const handleLaunchApp = (e) => {
    if (e) e.preventDefault();
    setIsRedirecting(true);
    setRedirectStep(0);
    
    // Simulate step progress intervals
    setTimeout(() => {
      setRedirectStep(1);
    }, 850);

    setTimeout(() => {
      setRedirectStep(2);
    }, 1750);

    setTimeout(() => {
      setRedirectStep(3);
      // Trigger a smooth 60FPS fade out of the entire page before the hard redirect
      document.body.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      document.body.style.opacity = '0';
      document.body.style.transform = 'scale(1.02)';
      
      setTimeout(() => {
        window.location.href = '/app';
      }, 400);
    }, 2650);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-amber-500/20 relative">
      

      {/* Grid Background Overlay */}
      <div className="grid-bg-overlay" aria-hidden="true" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] border-b border-slate-200/60 bg-[#FAF9F6]/80 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-[1250px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="logo flex items-center gap-1.5 text-lg font-black tracking-tight text-slate-900 font-heading min-h-[48px] px-2">
            <span className="text-amber-700">FAUJI</span> <span className="text-slate-950 font-normal">NIWAS</span>
          </a>

          {/* Center Links - text contrast upgrades */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-800">
            <a href="#" className="hover:text-amber-800 transition-colors min-h-[48px] px-3 flex items-center">Home</a>
            <button onClick={handleLaunchApp} className="hover:text-amber-800 transition-colors font-black uppercase cursor-pointer bg-transparent border-none min-h-[48px] px-3 flex items-center">Listings</button>
            <button onClick={handleLaunchApp} className="hover:text-amber-800 transition-colors font-black uppercase cursor-pointer bg-transparent border-none min-h-[48px] px-3 flex items-center">Post Room</button>
            <a href="/about.html" className="hover:text-amber-800 transition-colors min-h-[48px] px-3 flex items-center">About</a>
            <a href="#comparison" className="hover:text-amber-800 transition-colors min-h-[48px] px-3 flex items-center">Compare</a>
            <a href="#footer" className="hover:text-amber-800 transition-colors min-h-[48px] px-3 flex items-center">Contact</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button onClick={handleLaunchApp} className="text-slate-800 hover:text-amber-800 transition-colors cursor-pointer w-12 h-12 flex items-center justify-center" title="Search Listings" aria-label="Search">
              <Search size={20} />
            </button>
            <button 
              onClick={handleLaunchApp}
              className="px-5 py-3 min-h-[48px] rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-700/40 text-amber-900 bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer flex items-center"
            >
              Sign In
            </button>
            {/* Hamburger Toggle (Mobile) */}
            <button 
              onClick={() => setMobMenuOpen(!mobMenuOpen)}
              className="md:hidden w-12 h-12 text-slate-800 hover:text-amber-800 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-[999] bg-[#FAF9F6]/95 backdrop-blur-2xl border-b border-slate-200/80 p-4 flex flex-col text-left shadow-lg md:hidden">
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
          className="relative rounded-[2rem] overflow-hidden w-full h-[450px] sm:h-[500px] md:h-[540px] shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/50"
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

        {/* Features 2x3 Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">

          {/* Card 1: Station Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={handleLaunchApp}
            className="feature-card relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="feature-card-overlay absolute inset-0 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span className="feature-card-badge text-xs font-extrabold uppercase tracking-widest font-mono">Feature #01</span>
              <button onClick={handleLaunchApp} aria-label="Open Station Search feature" className="feature-card-btn w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <ArrowUpRight size={18} className="feature-card-arrow transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="feature-card-title text-base font-black tracking-wider font-heading mb-2 uppercase">Instant Station Search</h3>
              <p className="feature-card-desc text-sm leading-relaxed font-light">Proximity routing mapping exact distances to cantonment gates and base sectors.</p>
            </div>
          </motion.div>

          {/* Card 2: Verified Listings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={handleLaunchApp}
            className="feature-card relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="feature-card-overlay absolute inset-0 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span className="feature-card-badge text-xs font-extrabold uppercase tracking-widest font-mono">Feature #02</span>
              <button onClick={handleLaunchApp} aria-label="Open Verified Listings feature" className="feature-card-btn w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <ArrowUpRight size={18} className="feature-card-arrow transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="feature-card-title text-base font-black tracking-wider font-heading mb-2 uppercase">Verified Defence Listings</h3>
              <p className="feature-card-desc text-sm leading-relaxed font-light">Direct peer-to-peer listings posted exclusively by relocating personnel or verified base families.</p>
            </div>
          </motion.div>

          {/* Card 3: HRA Rank Matching */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={handleLaunchApp}
            className="feature-card relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="feature-card-overlay absolute inset-0 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span className="feature-card-badge text-xs font-extrabold uppercase tracking-widest font-mono">Feature #03</span>
              <button onClick={handleLaunchApp} aria-label="Open HRA Rank Matching feature" className="feature-card-btn w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <ArrowUpRight size={18} className="feature-card-arrow transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="feature-card-title text-base font-black tracking-wider font-heading mb-2 uppercase">HRA Rank Matching</h3>
              <p className="feature-card-desc text-sm leading-relaxed font-light">Entitlement filter matching budgets automatically with 7th Pay Commission allowances.</p>
            </div>
          </motion.div>

          {/* Card 4: Real-time sync */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={handleLaunchApp}
            className="feature-card relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="feature-card-overlay absolute inset-0 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span className="feature-card-badge text-xs font-extrabold uppercase tracking-widest font-mono">Feature #04</span>
              <button onClick={handleLaunchApp} aria-label="Open Real Time Availability feature" className="feature-card-btn w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <ArrowUpRight size={18} className="feature-card-arrow transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="feature-card-title text-base font-black tracking-wider font-heading mb-2 uppercase">Real Time Availability</h3>
              <p className="feature-card-desc text-sm leading-relaxed font-light">Sync moving schedules with vacancy calendars of incoming and outgoing service staff.</p>
            </div>
          </motion.div>

          {/* Card 5: Secure chat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={handleLaunchApp}
            className="feature-card relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="feature-card-overlay absolute inset-0 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span className="feature-card-badge text-xs font-extrabold uppercase tracking-widest font-mono">Feature #05</span>
              <button onClick={handleLaunchApp} aria-label="Open Secure In-App Chat feature" className="feature-card-btn w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <ArrowUpRight size={18} className="feature-card-arrow transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="feature-card-title text-base font-black tracking-wider font-heading mb-2 uppercase">Secure In-App Chat</h3>
              <p className="feature-card-desc text-sm leading-relaxed font-light">Encrypted chat tunnel protecting mobile numbers until mutual handshakes are signed.</p>
            </div>
          </motion.div>

          {/* Card 6: Lease Break */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => setShowLeaseModal(true)}
            className="feature-card relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="feature-card-overlay absolute inset-0 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span className="feature-card-badge text-xs font-extrabold uppercase tracking-widest font-mono">Feature #06</span>
              <button onClick={(e) => { e.stopPropagation(); setShowLeaseModal(true); }} aria-label="Open Lease Generator" className="feature-card-btn w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <ArrowUpRight size={18} className="feature-card-arrow transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="feature-card-title text-base font-black tracking-wider font-heading mb-2 uppercase">Lease Generator</h3>
              <p className="feature-card-desc text-sm leading-relaxed font-light">Draft legal agreements automatically fitted with the standard Indian Military Break Clause.</p>
            </div>
          </motion.div>

        </div>



        {/* Why FaujiNiwas Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          id="why-us" 
          className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 mt-4 text-left flex flex-col md:flex-row gap-8 items-start justify-between shadow-md"
        >
          <div className="max-w-xl flex flex-col gap-3">
            <span className="text-[9px] font-extrabold text-[#b45309] uppercase tracking-widest font-mono">Exclusive Platform Overview</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight font-heading">
              WHY FAUJI NIWAS?
            </h2>
            <p className="text-slate-650 text-xs sm:text-sm leading-relaxed mt-2">
              Designed entirely to remove the friction of sudden military posting cycles. Built securely for jawans, JCOs, and officers to share postings and rent homes without civilian classified noise.
            </p>
          </div>
          <button 
            onClick={handleLaunchApp} 
            className="self-start md:self-center bg-white border border-slate-300 hover:border-slate-800 text-slate-900 font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer hover:bg-slate-50 flex items-center gap-2"
          >
            Launch Relocation OS <span>↗</span>
          </button>
        </motion.section>

        {/* Indian Market Comparison Table Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          id="comparison" 
          className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 mt-4 text-left shadow-md"
        >
          <div className="flex flex-col gap-3 mb-8">
            <span className="text-[9px] font-extrabold text-[#b45309] uppercase tracking-widest font-mono">Compare The Tactical Edge</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight font-heading">
              MILITARY VS CIVILIAN DIRECTORIES
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-light">
              See how FaujiNiwas protects your identity, limits financial brokerage, and matches official 7th Pay Commission allowance structures compared to general civilian real-estate applications in India.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[10px] font-bold text-slate-650 uppercase tracking-widest">
                  <th className="pb-4 font-black">Platform Capability</th>
                  <th className="pb-4 text-amber-900 font-black">FaujiNiwas</th>
                  <th className="pb-4 text-slate-500 font-normal">Civ Directories (e.g. NoBroker, MagicBricks)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                <tr>
                  <td className="py-4 font-bold">Military ID Vetting</td>
                  <td className="py-4 text-emerald-800 font-bold flex items-center gap-1">🟢 100% Secure (Armed Forces ID Check)</td>
                  <td className="py-4 text-rose-700">🔴 None (Civilian logins, high scam risk)</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">HRA Rank Budgets</td>
                  <td className="py-4 text-emerald-800 font-bold">🟢 Entitled HRA (Officer / JCO / OR limits)</td>
                  <td className="py-4 text-rose-700">🔴 None (Generic sliders, no rank context)</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">Cantonment Proximity</td>
                  <td className="py-4 text-emerald-800 font-bold">🟢 Active (Calculates exact distance to Base gates)</td>
                  <td className="py-4 text-rose-700">🔴 None (Generic postal codes/city areas)</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">Privacy Encrypted Chat</td>
                  <td className="py-4 text-emerald-800 font-bold">🟢 Included (Hide phone info till handshake)</td>
                  <td className="py-4 text-rose-700">🔴 None (Exposed phone numbers to spam brokers)</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">Military Break Clause</td>
                  <td className="py-4 text-emerald-800 font-bold">🟢 Automated (Includes official 15-day refund clause)</td>
                  <td className="py-4 text-rose-700">🔴 None (Civilian standard 11-month leases only)</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">URC CSD Pulse Ticker</td>
                  <td className="py-4 text-emerald-800 font-bold">🟢 Live (Crowdsourced wait times & liquor stock)</td>
                  <td className="py-4 text-rose-700">🔴 None (No canteen synchronizations)</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">Brokerage Fee</td>
                  <td className="py-4 text-emerald-800 font-bold">🟢 ₹0 (Strictly P2P Defence Network)</td>
                  <td className="py-4 text-rose-700">🔴 Variable (Hidden broker charges/commissions)</td>
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
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => setShowLeaseModal(true)}
            className="bg-white border border-slate-200/60 p-6 rounded-2xl flex gap-4 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left shadow-sm items-start"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-800 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-amber-700 tracking-wider font-mono">Free Legal Tool</span>
              <h3 className="text-xs font-bold text-slate-900 mt-0.5 mb-1 font-heading">Military Lease Generator</h3>
              <p className="text-slate-650 text-[10px] leading-relaxed font-light">
                Draft a rental agreement equipped with the Indian Military Break Clause. Landlords must agree to refund deposits within a 15-day notice upon official posting orders.
              </p>
            </div>
          </motion.div>

          {/* Card 2: WASM Masking */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => setShowWasmModal(true)}
            className="bg-white border border-slate-200/60 p-6 rounded-2xl flex gap-4 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left shadow-sm items-start"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-amber-700 tracking-wider font-mono">Zero-Trust Security</span>
              <h3 className="text-xs font-bold text-slate-900 mt-0.5 mb-1 font-heading">WASM Edge Document Masking</h3>
              <p className="text-slate-650 text-[10px] leading-relaxed font-light">
                Protect your privacy in line with DPDPA Act 2023. Our client-side WebAssembly script processes documents directly on your browser, automatically redacting personal identification cards and numbers before upload.
              </p>
            </div>
          </motion.div>

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
        <div className="bg-white/45 border border-slate-200/60 rounded-3xl p-8 backdrop-blur-md shadow-sm">
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
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-700 text-lg font-bold shrink-0 border-2 border-indigo-500/20">
                AK
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
          <div className="flex items-center gap-1.5 text-xs font-black tracking-tight text-slate-900 font-heading">
            <span className="text-amber-700">FAUJI</span> <span className="text-slate-950 font-normal">NIWAS</span>
            <span className="text-slate-400 text-[10px] ml-1 font-mono">© 2026</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-800">
            <a href="/about.html" className="hover:text-amber-800 transition-colors">About the Founders</a>
            <a href="/privacy.html" className="hover:text-amber-800 transition-colors">Privacy Policy</a>
            <a href="/terms.html" className="hover:text-amber-800 transition-colors">Terms of Service</a>
            <a href="mailto:support@faujiniwas.web.app" className="hover:text-amber-800 transition-colors">Contact Defence Admin</a>
          </div>
          
          <div className="text-[9px] text-slate-700 font-medium">
            Made with ❤️ for the Armed Forces
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

      {/* 🚀 Futuristic Glassmorphic Boot/Routing Transition Screen Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[9999] bg-[#0b1120]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-left p-6 select-none font-mono">
          <div className="w-full max-w-md bg-[#10192e] border border-[#1e293b] p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col gap-6">
            
            {/* Pulsing Tactical radar animation */}
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#fbbf24]">System Boot & Routing</h3>
            </div>

            {/* Steps List */}
            <div className="flex flex-col gap-4 text-[10px] text-slate-450 font-medium">
              
              {/* Step 1 */}
              <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                redirectStep >= 0 ? 'bg-[#18233c]/40 border-amber-500/20 text-slate-200' : 'bg-transparent border-transparent opacity-40'
              }`}>
                <span>📡 CONNECTING: Establishing secure E2EE tunnel...</span>
                {redirectStep === 0 ? (
                  <span className="text-amber-500 animate-spin">🌀</span>
                ) : redirectStep > 0 ? (
                  <span className="text-emerald-500 font-bold">✓ DONE</span>
                ) : null}
              </div>

              {/* Step 2 */}
              <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                redirectStep >= 1 ? 'bg-[#18233c]/40 border-amber-500/20 text-slate-200' : 'bg-transparent border-transparent opacity-40'
              }`}>
                <span>🔑 AUTHENTICATING: Verifying military credentials...</span>
                {redirectStep === 1 ? (
                  <span className="text-amber-500 animate-spin">🌀</span>
                ) : redirectStep > 1 ? (
                  <span className="text-emerald-500 font-bold">✓ DONE</span>
                ) : null}
              </div>

              {/* Step 3 */}
              <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                redirectStep >= 2 ? 'bg-[#18233c]/40 border-amber-500/20 text-slate-200' : 'bg-transparent border-transparent opacity-40'
              }`}>
                <span>🗺️ SYNCHRONIZING: Fetching local station beacons...</span>
                {redirectStep === 2 ? (
                  <span className="text-amber-500 animate-spin">🌀</span>
                ) : redirectStep > 2 ? (
                  <span className="text-emerald-500 font-bold">✓ DONE</span>
                ) : null}
              </div>

            </div>

            {/* Loading progress bar */}
            <div className="w-full bg-[#090d16] h-1.5 rounded-full overflow-hidden border border-[#1e293b]">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(redirectStep + 1) * 33.3}%` }}
              />
            </div>

            <span className="text-[8px] text-slate-500 uppercase tracking-widest text-center mt-2">
              SECURE GATEWAY · NO BROKERAGE NETWORK
            </span>

          </div>
        </div>
      )}

    </div>
  );
}
