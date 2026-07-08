import React, { useState, useEffect } from 'react';
import { Shield, Search, ArrowUpRight, Check, FileText, Lock, Globe, Phone, Mail, Award, Navigation, Star, Menu, X } from 'lucide-react';
import LeaseGeneratorModal from '../components/Modals/LeaseGeneratorModal';
import WasmMaskingModal from '../components/Modals/WasmMaskingModal';
import CSDPulseTicker from '../components/CSD/CSDPulseTicker';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showWasmModal, setShowWasmModal] = useState(false);
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  
  // High-tech secure redirection sequence states
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectStep, setRedirectStep] = useState(0);

  useEffect(() => {
    setMounted(true);
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
      window.location.href = '/app';
    }, 2650);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-amber-500/20 relative">
      
      {/* Background HUD Video Watermark */}
      <video 
        id="bg-video" 
        loop 
        muted 
        playsInline 
        autoPlay
        aria-hidden="true"
        style={{ opacity: 0.02, transition: 'opacity 0.4s ease' }}
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-hud-elements-42289-large.mp4" type="video/mp4" />
        <track kind="captions" src="" label="Decorative HUD background" default />
      </video>

      {/* Grid Background Overlay */}
      <div className="grid-bg-overlay" aria-hidden="true" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] border-b border-slate-200/60 bg-[#FAF9F6]/80 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-[1250px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="logo flex items-center gap-1.5 text-lg font-black tracking-tight text-slate-900 font-heading">
            <span className="text-amber-700">FAUJI</span> <span className="text-slate-950 font-normal">NIWAS</span>
          </a>

          {/* Center Links - text contrast upgrades */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-wider text-slate-800">
            <a href="#" className="hover:text-amber-800 transition-colors">Home</a>
            <button onClick={handleLaunchApp} className="hover:text-amber-800 transition-colors font-black uppercase cursor-pointer bg-transparent border-none">Listings</button>
            <button onClick={handleLaunchApp} className="hover:text-amber-800 transition-colors font-black uppercase cursor-pointer bg-transparent border-none">Post Room</button>
            <a href="/about.html" className="hover:text-amber-800 transition-colors">About</a>
            <a href="#comparison" className="hover:text-amber-800 transition-colors">Compare</a>
            <a href="#footer" className="hover:text-amber-800 transition-colors">Contact</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button onClick={handleLaunchApp} className="text-slate-800 hover:text-amber-800 transition-colors cursor-pointer" title="Search Listings">
              <Search size={18} />
            </button>
            <button 
              onClick={handleLaunchApp}
              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-700/40 text-amber-900 bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer"
            >
              Sign In
            </button>
            {/* Hamburger Toggle (Mobile) */}
            <button 
              onClick={() => setMobMenuOpen(!mobMenuOpen)}
              className="md:hidden p-1.5 text-slate-800 hover:text-amber-800 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-[999] bg-[#FAF9F6]/95 backdrop-blur-2xl border-b border-slate-200/80 p-6 flex flex-col gap-4 text-left shadow-lg md:hidden">
          <a href="#" onClick={() => setMobMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-800 hover:text-amber-700">Home</a>
          <button onClick={(e) => { setMobMenuOpen(false); handleLaunchApp(e); }} className="text-xs font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 text-left cursor-pointer">Listings</button>
          <button onClick={(e) => { setMobMenuOpen(false); handleLaunchApp(e); }} className="text-xs font-black uppercase tracking-widest text-slate-800 hover:text-amber-700 text-left cursor-pointer">Post Room</button>
          <a href="/about.html" onClick={() => setMobMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-800 hover:text-amber-700">About</a>
          <a href="#comparison" onClick={() => setMobMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-800 hover:text-amber-700">Compare</a>
          <a href="#footer" onClick={() => setMobMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-800 hover:text-amber-700">Contact</a>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 max-w-[1250px] mx-auto px-6 pt-28 pb-16 flex flex-col gap-10">
        
        {/* Title and Metrics Grid */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4">
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
        </div>

        {/* Hero Image Section */}
        <div className="relative rounded-[2rem] overflow-hidden w-full h-[450px] sm:h-[500px] md:h-[540px] shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/50">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" 
            alt="Premium Defence Housing Villa" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          
          {/* Top Right Live Badge */}
          <div className="absolute top-6 right-6 bg-white/95 border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-900 font-mono">Live Station Link Active</span>
          </div>

          {/* Bottom Left Info Overlay */}
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-2xl text-left flex flex-col gap-4">
            <div className="w-fit bg-[#263617] border border-[#fbbf24]/30 px-3 py-1 rounded-full text-[#fbbf24] text-[8px] font-extrabold uppercase tracking-widest">
              Premium Real Estate For Defence
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight font-heading">
              Relocate Safely, Trust Implicitly
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
              The premier housing network connecting Indian Armed Forces personnel, JCOs, and Officers with secure residential outliving areas across military stations.
            </p>
            
            {/* Big Redirect CTA Button */}
            <button 
              onClick={handleLaunchApp}
              className="mt-2 w-fit bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-heading font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_4px_24px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_32px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span>🚀</span> Enter Secure Command Center
            </button>
          </div>
        </div>

        {/* Features 2x3 Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">

          {/* Card 1: Station Search */}
          <div
            onClick={handleLaunchApp}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&q=75)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] border border-slate-200/40 shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="absolute inset-0 bg-black/82 group-hover:bg-black/75 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span style={{ color: '#fbbf24' }} className="text-xs font-extrabold uppercase tracking-widest font-mono">Feature #01</span>
              <button onClick={handleLaunchApp} aria-label="Open Station Search feature" className="w-9 h-9 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center group-hover:bg-[#fbbf24]/35 transition-all">
                <ArrowUpRight size={18} className="text-[#fbbf24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 style={{ color: '#fbbf24' }} className="text-base font-black tracking-wider font-heading mb-2 uppercase">Instant Station Search</h3>
              <p style={{ color: '#e2e8f0' }} className="text-sm leading-relaxed font-light">Proximity routing mapping exact distances to cantonment gates and base sectors.</p>
            </div>
          </div>

          {/* Card 2: Verified Listings */}
          <div
            onClick={handleLaunchApp}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=75)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] border border-slate-200/40 shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="absolute inset-0 bg-black/82 group-hover:bg-black/75 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span style={{ color: '#fbbf24' }} className="text-xs font-extrabold uppercase tracking-widest font-mono">Feature #02</span>
              <button onClick={handleLaunchApp} aria-label="Open Verified Listings feature" className="w-9 h-9 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center group-hover:bg-[#fbbf24]/35 transition-all">
                <ArrowUpRight size={18} className="text-[#fbbf24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 style={{ color: '#fbbf24' }} className="text-base font-black tracking-wider font-heading mb-2 uppercase">Verified Defence Listings</h3>
              <p style={{ color: '#e2e8f0' }} className="text-sm leading-relaxed font-light">Direct peer-to-peer listings posted exclusively by relocating personnel or verified base families.</p>
            </div>
          </div>

          {/* Card 3: HRA Rank Matching */}
          <div
            onClick={handleLaunchApp}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=500&q=75)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] border border-slate-200/40 shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="absolute inset-0 bg-black/82 group-hover:bg-black/75 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span style={{ color: '#fbbf24' }} className="text-xs font-extrabold uppercase tracking-widest font-mono">Feature #03</span>
              <button onClick={handleLaunchApp} aria-label="Open HRA Rank Matching feature" className="w-9 h-9 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center group-hover:bg-[#fbbf24]/35 transition-all">
                <ArrowUpRight size={18} className="text-[#fbbf24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 style={{ color: '#fbbf24' }} className="text-base font-black tracking-wider font-heading mb-2 uppercase">HRA Rank Matching</h3>
              <p style={{ color: '#e2e8f0' }} className="text-sm leading-relaxed font-light">Entitlement filter matching budgets automatically with 7th Pay Commission allowances.</p>
            </div>
          </div>

          {/* Card 4: Real-time sync */}
          <div
            onClick={handleLaunchApp}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1508962914676-134849a727f0?w=500&q=75)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] border border-slate-200/40 shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="absolute inset-0 bg-black/82 group-hover:bg-black/75 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span style={{ color: '#fbbf24' }} className="text-xs font-extrabold uppercase tracking-widest font-mono">Feature #04</span>
              <button onClick={handleLaunchApp} aria-label="Open Real Time Availability feature" className="w-9 h-9 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center group-hover:bg-[#fbbf24]/35 transition-all">
                <ArrowUpRight size={18} className="text-[#fbbf24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 style={{ color: '#fbbf24' }} className="text-base font-black tracking-wider font-heading mb-2 uppercase">Real Time Availability</h3>
              <p style={{ color: '#e2e8f0' }} className="text-sm leading-relaxed font-light">Sync moving schedules with vacancy calendars of incoming and outgoing service staff.</p>
            </div>
          </div>

          {/* Card 5: Secure chat */}
          <div
            onClick={handleLaunchApp}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=75)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] border border-slate-200/40 shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="absolute inset-0 bg-black/82 group-hover:bg-black/75 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span style={{ color: '#fbbf24' }} className="text-xs font-extrabold uppercase tracking-widest font-mono">Feature #05</span>
              <button onClick={handleLaunchApp} aria-label="Open Secure In-App Chat feature" className="w-9 h-9 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center group-hover:bg-[#fbbf24]/35 transition-all">
                <ArrowUpRight size={18} className="text-[#fbbf24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 style={{ color: '#fbbf24' }} className="text-base font-black tracking-wider font-heading mb-2 uppercase">Secure In-App Chat</h3>
              <p style={{ color: '#e2e8f0' }} className="text-sm leading-relaxed font-light">Encrypted chat tunnel protecting mobile numbers until mutual handshakes are signed.</p>
            </div>
          </div>

          {/* Card 6: Lease Break */}
          <div
            onClick={() => setShowLeaseModal(true)}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&q=75)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative p-8 rounded-[2rem] flex flex-col justify-between h-[280px] border border-slate-200/40 shadow-lg group hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer text-left"
          >
            <div className="absolute inset-0 bg-black/82 group-hover:bg-black/75 transition-all z-0" />
            <div className="flex justify-between items-start relative z-10">
              <span style={{ color: '#fbbf24' }} className="text-xs font-extrabold uppercase tracking-widest font-mono">Feature #06</span>
              <button onClick={(e) => { e.stopPropagation(); setShowLeaseModal(true); }} aria-label="Open Lease Generator" className="w-9 h-9 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center group-hover:bg-[#fbbf24]/35 transition-all">
                <ArrowUpRight size={18} className="text-[#fbbf24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 style={{ color: '#fbbf24' }} className="text-base font-black tracking-wider font-heading mb-2 uppercase">Lease Generator</h3>
              <p style={{ color: '#e2e8f0' }} className="text-sm leading-relaxed font-light">Draft legal agreements automatically fitted with the standard Indian Military Break Clause.</p>
            </div>
          </div>

        </div>



        {/* Why FaujiNiwas Section */}
        <section id="why-us" className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 mt-4 text-left flex flex-col md:flex-row gap-8 items-start justify-between shadow-md">
          <div className="max-w-xl flex flex-col gap-3">
            <span className="text-[9px] font-extrabold text-[#f59e0b] uppercase tracking-widest font-mono">Exclusive Platform Overview</span>
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
        </section>

        {/* Indian Market Comparison Table Section */}
        <section id="comparison" className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 mt-4 text-left shadow-md">
          <div className="flex flex-col gap-3 mb-8">
            <span className="text-[9px] font-extrabold text-[#f59e0b] uppercase tracking-widest font-mono">Compare The Tactical Edge</span>
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
        </section>

        {/* Tactical Tools list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          {/* Card 1: Lease Generator */}
          <div 
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
          </div>

          {/* Card 2: WASM Masking */}
          <div 
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
          </div>

        </div>

        {/* Live CSD Pulse Section */}
        <CSDPulseTicker />

      </main>

      {/* Footer */}
      <footer id="footer" className="bg-[#FAF9F6] border-t border-slate-200/60 py-12 mt-16 relative z-10 text-left">
        <div className="max-w-[1250px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs font-black tracking-tight text-slate-900 font-heading">
            <span className="text-amber-700">FAUJI</span> <span className="text-slate-950 font-normal">NIWAS</span>
            <span className="text-slate-400 text-[10px] ml-1 font-mono">© 2026</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-800">
            <a href="/privacy.html" className="hover:text-amber-800 transition-colors">Privacy Policy</a>
            <a href="/terms.html" className="hover:text-amber-800 transition-colors">Terms of Service</a>
            <a href="mailto:support@faujiniwas.web.app" className="hover:text-amber-800 transition-colors">Contact Defence Admin</a>
          </div>
          
          <div className="text-[9px] text-slate-500 font-medium">
            Made with ❤️ for the Armed Forces
          </div>
        </div>
      </footer>

      {/* Dynamic Modals */}
      {showLeaseModal && <LeaseGeneratorModal onClose={() => setShowLeaseModal(false)} />}
      {showWasmModal && <WasmMaskingModal onClose={() => setShowWasmModal(false)} />}

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
