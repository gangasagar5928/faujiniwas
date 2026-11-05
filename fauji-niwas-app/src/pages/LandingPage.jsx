import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, ShieldCheck, Users, Calendar, 
  CircleDollarSign, FileText, Navigation, Bell, 
  Headphones, Star, Smartphone, Search, Calculator, 
  Menu, X, ExternalLink, Megaphone, Bookmark, Shield
} from 'lucide-react';

const LeaseGeneratorModal = React.lazy(() => import('../components/Modals/LeaseGeneratorModal'));

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 7th CPC Calculator state
  const [cityCategory, setCityCategory] = useState('X');
  const [basicPay, setBasicPay] = useState(34800);
  const [calculatedHra, setCalculatedHra] = useState(10440);

  // Dynamic 7th CPC Calculation
  useEffect(() => {
    const rate = cityCategory === 'X' ? 0.30 : cityCategory === 'Y' ? 0.20 : 0.10;
    const minHra = cityCategory === 'X' ? 5400 : cityCategory === 'Y' ? 3600 : 1800;
    const hra = Math.max(minHra, Math.round(Number(basicPay || 0) * rate));
    setCalculatedHra(hra);
  }, [cityCategory, basicPay]);

  // Clean app-shell styles on mount
  useEffect(() => {
    document.documentElement.classList.remove('app-shell');
    document.body.classList.remove('app-shell');
    window.__APP_READY__ = true;
    window.dispatchEvent(new Event('app-ready'));
  }, []);

  // Smooth entrance to app
  const handleLaunchApp = (e, station = '') => {
    if (e && e.preventDefault) e.preventDefault();
    setIsRedirecting(true);

    const targetUrl = station && typeof station === 'string' && station.trim().length > 0 
      ? `/app?search=${encodeURIComponent(station.trim())}` 
      : '/app';

    try { sessionStorage.setItem('fn_redirect', 'true'); } catch { /* noop */ }

    document.documentElement.style.backgroundColor = '#0c0d10';
    document.documentElement.style.colorScheme = 'dark';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = '#0c0d10';

    document.body.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.style.opacity = '0';

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 280);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleLaunchApp(e, searchQuery);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0c0d10] text-slate-100 font-sans antialiased selection:bg-[#d4a046]/30 relative flex flex-col items-center">
      
      {/* ── Top Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#1b1c22] flex justify-center">
        <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo with Silhouette Crest */}
          <a href="#home" className="flex items-center gap-2 group cursor-pointer">
            <img 
              src="/brand/brand_logo.png" 
              alt="Fauji Niwas — Stay. Serve. Belong." 
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102" 
            />
          </a>

          {/* Center Navigation Links (Exact 6 Links from Template) */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide text-slate-300">
            <a href="#home" className="text-white hover:text-[#d4a046] transition-colors relative pb-1">
              Home
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4a046] rounded-full" />
            </a>
            <a href="#features" className="hover:text-[#d4a046] transition-colors">Features</a>
            <a href="#calculator" className="hover:text-[#d4a046] transition-colors">Calculator</a>
            <a href="#pulses" className="hover:text-[#d4a046] transition-colors">URC Pulses</a>
            <a href="#about" className="hover:text-[#d4a046] transition-colors">About</a>
            <a href="/terms.html" className="hover:text-[#d4a046] transition-colors">Policy</a>
          </nav>

          {/* Right Action: Golden "Find a Stay" Pill Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLaunchApp}
              className="px-5 py-2 rounded-full text-xs font-bold tracking-wider border border-[#d4a046]/70 text-[#d4a046] hover:bg-[#d4a046]/10 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(212,160,70,0.15)]"
            >
              <Search size={14} className="text-[#d4a046]" />
              <span>Find a Stay</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobMenuOpen(!mobMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:text-[#d4a046] cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#0c0d10]/98 backdrop-blur-2xl border-b border-[#22242e] p-5 flex flex-col gap-3 text-left shadow-2xl">
            <a href="#home" onClick={() => setMobMenuOpen(false)} className="text-sm font-semibold tracking-wide text-white hover:text-[#d4a046] py-2 border-b border-white/5">Home</a>
            <a href="#features" onClick={() => setMobMenuOpen(false)} className="text-sm font-semibold tracking-wide text-slate-200 hover:text-[#d4a046] py-2 border-b border-white/5">Features</a>
            <a href="#calculator" onClick={() => setMobMenuOpen(false)} className="text-sm font-semibold tracking-wide text-slate-200 hover:text-[#d4a046] py-2 border-b border-white/5">Calculator</a>
            <a href="#pulses" onClick={() => setMobMenuOpen(false)} className="text-sm font-semibold tracking-wide text-slate-200 hover:text-[#d4a046] py-2 border-b border-white/5">URC Pulses</a>
            <a href="#about" onClick={() => setMobMenuOpen(false)} className="text-sm font-semibold tracking-wide text-slate-200 hover:text-[#d4a046] py-2 border-b border-white/5">About the Founders</a>
            <a href="/terms.html" onClick={() => setMobMenuOpen(false)} className="text-sm font-semibold tracking-wide text-slate-200 hover:text-[#d4a046] py-2 border-b border-white/5">Policy</a>
            <button onClick={handleLaunchApp} className="w-full mt-2 py-3 rounded-xl bg-[#d4a046] text-black font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2">
              <Search size={16} /> Find a Stay
            </button>
          </div>
        )}
      </header>

      {/* ── Main Landing Canvas ── */}
      <main className="relative z-10 w-full max-w-[1250px] min-w-0 mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 flex flex-col gap-12 sm:gap-14">
        
        {/* ════════════════════════════════════════════════════════════
            1. HERO SECTION (Exact Mockup Layout with Blended Soldier)
            ════════════════════════════════════════════════════════════ */}
        <section id="home" className="relative w-full rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[420px] flex items-center pt-8 pb-10">
          
          {/* Background: Soldier & Flag Artwork seamlessly blended on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden flex justify-end">
            <img 
              src="/brand/hero_soldier_blended.png" 
              alt="Indian Armed Forces Soldier with Tricolour" 
              className="h-full w-auto object-cover object-right opacity-95"
            />
          </div>

          {/* Left Hero Content */}
          <div className="relative z-10 w-full max-w-xl text-left flex flex-col">
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight leading-none mb-2">
              Fauji Niwas
            </h1>
            
            {/* Subheadline with Golden Accent */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 font-heading tracking-tight mb-3">
              Secure. Verified. For Our <span className="text-[#d4a046]">Armed Forces.</span>
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6 max-w-lg">
              Find and book comfortable, verified transit accommodation near defence establishments across 62+ stations.
            </p>

            {/* Rounded Full White Search Bar with Pin and Gold Search Button */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mb-6">
              <div className="bg-white rounded-full p-1.5 sm:p-2 flex items-center shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-slate-200">
                <div className="pl-3 sm:pl-4 text-slate-400 shrink-0">
                  <MapPin size={18} className="text-[#d4a046]" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Station (e.g. Delhi Cantt, Pune, Jaipur...)"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 bg-transparent outline-none font-medium"
                />
                <button 
                  type="submit"
                  className="bg-[#d4a046] hover:bg-[#c2903a] text-black font-bold text-xs uppercase tracking-wider px-5 sm:px-6 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                >
                  <Search size={14} className="stroke-[3]" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* 4 Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#d4a046]/20 border border-[#d4a046]/50 flex items-center justify-center text-[#d4a046] text-[10px]">✔</span>
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#d4a046]">★</span>
                <span>Trusted by Forces</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#d4a046]">📍</span>
                <span>62+ Stations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#d4a046]">⚡</span>
                <span>Instant Booking</span>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. 12 KEY FEATURES (Exact Cards from Template)
            ════════════════════════════════════════════════════════════ */}
        <section id="features">
          
          {/* Section Divider Header */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4a046]/50 to-transparent flex-1 max-w-[200px]" />
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#d4a046] tracking-wider text-center">
              12 Key Features
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4a046]/50 to-transparent flex-1 max-w-[200px]" />
          </div>

          {/* 4x3 Grid (12 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* Card 1 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Verified &amp; Trusted Properties</h3>
              </div>
            </div>

            {/* Card 2 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">62+ Defence Stations</h3>
              </div>
            </div>

            {/* Card 3 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Secure &amp; Safe Stays</h3>
              </div>
            </div>

            {/* Card 4 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Family Friendly Options</h3>
              </div>
            </div>

            {/* Card 5 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Flexible Booking</h3>
                <p className="text-[11px] text-slate-400 font-medium">(Short &amp; Long Term)</p>
              </div>
            </div>

            {/* Card 6 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <CircleDollarSign size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Transparent Pricing</h3>
                <p className="text-[11px] text-slate-400 font-medium">(No Hidden Charges)</p>
              </div>
            </div>

            {/* Card 7 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">HRA &amp; TA/DA</h3>
                <p className="text-[11px] text-slate-400 font-medium">Guidance</p>
              </div>
            </div>

            {/* Card 8 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Navigation size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Real-Time Location</h3>
                <p className="text-[11px] text-slate-400 font-medium">on Map</p>
              </div>
            </div>

            {/* Card 9 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Instant Notifications</h3>
                <p className="text-[11px] text-slate-400 font-medium">(URC &amp; Updates)</p>
              </div>
            </div>

            {/* Card 10 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Dedicated Support</h3>
                <p className="text-[11px] text-slate-400 font-medium">(24×7)</p>
              </div>
            </div>

            {/* Card 11 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Star size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Ratings &amp; Reviews</h3>
                <p className="text-[11px] text-slate-400 font-medium">(from Defence Community)</p>
              </div>
            </div>

            {/* Card 12 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-3.5 sm:p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center shrink-0 text-[#d4a046] group-hover:bg-[#d4a046]/10 transition-colors">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-[13px] text-white font-heading">Mobile Friendly</h3>
                <p className="text-[11px] text-slate-400 font-medium">(Any Device)</p>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. EXISTING VS FAUJI NIWAS (Exact 5-Row Clean Table)
            ════════════════════════════════════════════════════════════ */}
        <section id="comparison">
          
          {/* Header */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4a046]/50 to-transparent flex-1 max-w-[200px]" />
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#d4a046] tracking-wider text-center">
              Existing vs Fauji Niwas
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4a046]/50 to-transparent flex-1 max-w-[200px]" />
          </div>

          {/* Clean Dark Matrix Table with Subtle Gold Headers */}
          <div className="overflow-x-auto w-full rounded-2xl border border-[#242630] bg-[#121317] shadow-xl">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#242630] text-xs font-bold text-[#d4a046]">
                  <th className="py-4 pl-6 sm:pl-8 pr-4 w-[28%] font-semibold tracking-wide">
                    Feature
                  </th>
                  <th className="py-4 px-6 w-[36%] font-semibold tracking-wide">
                    What's Existing?
                  </th>
                  <th className="py-4 px-6 pr-6 w-[36%] font-semibold tracking-wide">
                    What's Different with Fauji Niwas?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1c24] text-xs sm:text-[13px]">
                
                {/* Row 1: Accommodation */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <Building2 size={16} className="text-[#d4a046] shrink-0" />
                      <span>Accommodation</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Unorganised / Limited Options
                  </td>
                  <td className="py-4 px-6 pr-6 text-white font-medium">
                    Verified, Safe &amp; Comfortable Stays
                  </td>
                </tr>

                {/* Row 2: Location Coverage */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={16} className="text-[#d4a046] shrink-0" />
                      <span>Location Coverage</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Few Stations
                  </td>
                  <td className="py-4 px-6 pr-6 text-white font-medium">
                    62+ Stations Across India
                  </td>
                </tr>

                {/* Row 3: Booking Process */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={16} className="text-[#d4a046] shrink-0" />
                      <span>Booking Process</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Manual / Direct Contact
                  </td>
                  <td className="py-4 px-6 pr-6 text-white font-medium">
                    Instant Online Booking
                  </td>
                </tr>

                {/* Row 4: HRA Guidance */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-[#d4a046] shrink-0" />
                      <span>HRA Guidance</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Confusing Rules
                  </td>
                  <td className="py-4 px-6 pr-6 text-white font-medium">
                    Easy 7th CPC HRA Support
                  </td>
                </tr>

                {/* Row 5: Support */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 sm:pl-8 pr-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <Headphones size={16} className="text-[#d4a046] shrink-0" />
                      <span>Support</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Limited
                  </td>
                  <td className="py-4 px-6 pr-6 text-white font-medium">
                    24×7 Dedicated Support
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. 7TH CPC HRA COVERAGE CALCULATOR
            ════════════════════════════════════════════════════════════ */}
        <section id="calculator">
          <div className="relative w-full rounded-2xl border border-[#2d2920] bg-gradient-to-r from-[#121317] via-[#15161c] to-[#121317] p-6 sm:p-8 overflow-hidden shadow-2xl">
            
            {/* Background Cantonment Quarters Art (faded on the right) */}
            <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none opacity-20 overflow-hidden hidden md:block">
              <img 
                src="/brand/hra_quarters.jpg" 
                alt="Cantonment Quarters" 
                className="w-full h-full object-cover object-center filter grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121317] via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              
              {/* Left Column: Controls */}
              <div className="w-full lg:max-w-xl flex flex-col gap-5">
                
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#221f18] border border-[#44381f] flex items-center justify-center text-[#d4a046] shrink-0">
                    <Calculator size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                      7th CPC HRA Coverage Calculator
                    </h3>
                    <p className="text-xs text-slate-400">
                      Check your HRA coverage as per 7th CPC norms
                    </p>
                  </div>
                </div>

                {/* City Category Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300 min-w-[100px]">City Category:</span>
                  <div className="flex items-center gap-2">
                    {['X', 'Y', 'Z'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCityCategory(cat)}
                        className={`w-11 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          cityCategory === cat
                            ? 'bg-[#d4a046] text-black shadow-md'
                            : 'bg-[#1b1c24] border border-[#292b36] text-slate-300 hover:text-white hover:border-[#d4a046]/40'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 sm:ml-2">
                    {cityCategory === 'X' ? '(30% • Delhi, Mumbai, Pune, Kolkata...)' : cityCategory === 'Y' ? '(20% • Jaipur, Lucknow, Patna...)' : '(10% • Field & Small Stations)'}
                  </span>
                </div>

                {/* Basic Pay Input & Calculate Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300 min-w-[100px]">Basic Pay (₹):</span>
                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <input 
                      type="number" 
                      value={basicPay}
                      onChange={(e) => setBasicPay(Number(e.target.value))}
                      placeholder="Enter Basic Pay"
                      className="w-full bg-[#1b1c24] border border-[#292b36] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#d4a046] font-mono"
                    />
                    <button 
                      onClick={() => {
                        const rate = cityCategory === 'X' ? 0.30 : cityCategory === 'Y' ? 0.20 : 0.10;
                        const minHra = cityCategory === 'X' ? 5400 : cityCategory === 'Y' ? 3600 : 1800;
                        setCalculatedHra(Math.max(minHra, Math.round(Number(basicPay || 0) * rate)));
                      }}
                      className="bg-[#d4a046] hover:bg-[#c2903a] text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                    >
                      <span>🧮</span>
                      <span>Calculate</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="text-slate-500">Presets:</span>
                  <button onClick={() => setBasicPay(21700)} className="hover:text-[#d4a046] underline cursor-pointer">₹21,700 (OR)</button>
                  <span>•</span>
                  <button onClick={() => setBasicPay(35400)} className="hover:text-[#d4a046] underline cursor-pointer">₹35,400 (JCO)</button>
                  <span>•</span>
                  <button onClick={() => setBasicPay(56100)} className="hover:text-[#d4a046] underline cursor-pointer">₹56,100 (Officer)</button>
                </div>

              </div>

              {/* Right Column: Dynamic Coverage Output */}
              <div className="w-full lg:w-auto flex flex-col items-start lg:items-end justify-center pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#272935] lg:pl-10">
                <span className="text-xs font-semibold text-slate-400 mb-1">Your HRA Coverage</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#d4a046] font-mono tracking-tight drop-shadow-sm">
                  ₹ {calculatedHra.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1">(as per 7th CPC)</span>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5. LIVE URC PULSES (Golden Waveform Headers & Pulse Cards)
            ════════════════════════════════════════════════════════════ */}
        <section id="pulses">
          
          {/* Header with Golden ECG Waveform lines */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-4 text-[#d4a046] hidden sm:block" viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 8h8l3-6 4 12 4-8 3 2h18" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide">
                Live URC Pulses
              </h2>
              <svg className="w-8 h-4 text-[#d4a046] hidden sm:block" viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 8h8l3-6 4 12 4-8 3 2h18" />
              </svg>
            </div>
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">Live</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Last Updated: 06 Nov 2026, 20:45 IST</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-left -mt-3 mb-5">
            Real-time updates on URC announcements, circulars and policies.
          </p>

          {/* 4 Pulse Cards in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Pulse 1 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center text-[#d4a046] shrink-0">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">URC Circular</h4>
                  <p className="text-[11px] text-slate-400">No. 45/2026 (Policy Update)</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>2h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Pulse 2 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center text-[#d4a046] shrink-0">
                  <Bookmark size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">HRA Revision</h4>
                  <p className="text-[11px] text-slate-400">Clarifications</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>3h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Pulse 3 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center text-[#d4a046] shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Station List</h4>
                  <p className="text-[11px] text-slate-400">(Updated)</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <span>5h ago</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Pulse 4 */}
            <div onClick={handleLaunchApp} className="bg-[#131418] hover:bg-[#181a20] border border-[#21232c] hover:border-[#d4a046]/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1a1c23] border border-[#282a35] flex items-center justify-center text-[#d4a046] shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">General Instructions</h4>
                  <p className="text-[11px] text-slate-400">for Veterans</p>
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
            6. ABOUT THE FOUNDERS (REAL FOUNDERS ONLY)
            ════════════════════════════════════════════════════════════ */}
        <section id="about">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-7">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wider shrink-0">
              About the Founders
            </h2>
            <div className="h-px bg-gradient-to-r from-[#d4a046]/50 via-[#d4a046]/20 to-transparent flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left Statement */}
            <div className="lg:col-span-5 flex flex-col text-left">
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-4">
                Fauji Niwas is proudly built by a team of passionate innovators — committed to serve the Armed Forces community with technology, trust and care.
              </p>
              <p className="font-serif italic text-[#dfaa4e] text-sm sm:text-base font-semibold">
                Built with respect. For those who serve. 🇮🇳
              </p>
            </div>

            {/* Right: Real Founders Cards (Aman & Anurag) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Founder 1: Aman Kumar Singh */}
              <div className="bg-[#131418] border border-[#21232c] hover:border-[#d4a046]/50 rounded-2xl p-5 flex flex-col items-center text-center transition-all group shadow-sm">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4a046]/60 p-0.5 mb-3 group-hover:border-[#d4a046] transition-colors">
                  <img 
                    src="/aman.png" 
                    alt="Aman Kumar Singh" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <h3 className="font-bold text-sm text-white font-heading">Aman Kumar Singh</h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 mb-1">Founder &amp; Lead Developer</span>
                <span className="text-[10px] text-slate-500 mb-3">GCET AKTU · B.Tech EEE</span>
                <div className="flex items-center gap-2">
                  <a 
                    href="https://www.linkedin.com/in/gangasagar5928" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-6 h-6 rounded bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                    title="Aman Kumar Singh LinkedIn"
                  >
                    in
                  </a>
                  <a 
                    href="https://github.com/gangasagar5928" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-6 h-6 rounded bg-[#24292e] text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform border border-white/10"
                    title="Aman Kumar Singh GitHub"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                </div>
              </div>

              {/* Founder 2: Anurag Kumar Singh */}
              <div className="bg-[#131418] border border-[#21232c] hover:border-[#d4a046]/50 rounded-2xl p-5 flex flex-col items-center text-center transition-all group shadow-sm">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4a046]/60 p-0.5 mb-3 group-hover:border-[#d4a046] transition-colors">
                  <img 
                    src="/anurag.png" 
                    alt="Anurag Kumar Singh" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <h3 className="font-bold text-sm text-white font-heading">Anurag Kumar Singh</h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 mb-1">Co-Founder &amp; Operations</span>
                <span className="text-[10px] text-slate-500 mb-3">Armed Forces Liaison &amp; Community</span>
                <div className="flex items-center gap-2">
                  <a 
                    href="https://www.linkedin.com/in/anurag-singh-a126843a3" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-6 h-6 rounded bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                    title="Anurag Kumar Singh LinkedIn"
                  >
                    in
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════════════════════════
          7. FOOTER
          ════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#08090b] border-t border-[#1b1c22] pt-8 pb-6 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 flex flex-col gap-6">
          
          {/* Top Row: Brand, Nav Links & Social */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 pb-5 border-b border-white/5">
            
            {/* Logo + Tagline */}
            <div className="flex items-center gap-3">
              <img 
                src="/brand/brand_logo.png" 
                alt="Fauji Niwas — Stay. Serve. Belong." 
                className="h-9 w-auto object-contain" 
              />
            </div>

            {/* Navigation links */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-400 font-medium">
              <a href="/privacy.html" className="hover:text-[#d4a046] transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="/terms.html" className="hover:text-[#d4a046] transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="mailto:faujiniwashq@gmail.com" className="hover:text-[#d4a046] transition-colors">Contact Us</a>
              <span>|</span>
              <a href="/faq.html" className="hover:text-[#d4a046] transition-colors">FAQ</a>
              <span>|</span>
              <a href="https://github.com/gangasagar5928/faujiniwas" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4a046] transition-colors flex items-center gap-1">
                <span>GitHub</span>
              </a>
            </div>

            {/* Silhouette Artwork & Social Icons */}
            <div className="flex items-center gap-4">
              <img 
                src="/brand/footer_silhouette.png" 
                alt="Soldiers & Families Silhouette" 
                className="h-6 w-auto opacity-70 hidden sm:block" 
              />
              
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/gangasagar5928" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#d4a046] transition-colors" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              {/* X / Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#d4a046] transition-colors" title="X (Twitter)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#d4a046] transition-colors" title="YouTube">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* Email */}
              <a href="mailto:faujiniwashq@gmail.com" className="text-slate-400 hover:text-[#d4a046] transition-colors" title="Email Us">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
            </div>

          </div>

          {/* Copyright Notice */}
          <div className="text-center pt-2 text-[11px] text-slate-500 font-medium">
            © 2026 Fauji Niwas. All rights reserved. &nbsp;|&nbsp; Made with 🇮🇳 for our Armed Forces.
          </div>

        </div>
      </footer>

      {/* Fast Dark Glass Loader Transition Screen */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[9999] bg-[#0c0d10]/95 backdrop-blur-xl flex flex-col items-center justify-center select-none">
          <div className="bg-[#121317] border border-[#d4a046]/40 w-[280px] p-8 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center gap-5">
            <span className="w-3 h-3 rounded-full bg-[#d4a046] animate-ping" />
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#d4a046]">FaujiNiwas</h3>
              <p className="text-[10px] text-slate-400 tracking-widest font-medium">COMMAND CENTER</p>
            </div>
            <div className="w-40 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#d4a046] to-amber-600 animate-[loaderSlide_1s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
