import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, ArrowUpRight, X, FileText, ShieldCheck, Heart } from 'lucide-react';
import LeaseGeneratorModal from '../components/Modals/LeaseGeneratorModal';
import WasmMaskingModal from '../components/Modals/WasmMaskingModal';
import CSDPulseTicker from '../components/CSD/CSDPulseTicker';

const easeHeavy = [0.16, 1, 0.3, 1];

const FEATURE_EXPLANATIONS = {
  search: {
    title: "INSTANT STATION SEARCH",
    subtitle: "Proximity routing for military bases",
    description: "Instantly pinpoint quarters, outliving accommodations, and SSB transit options centered around any Cantonment, Air Force Station, or Naval Base in India. Seamlessly overlays transport networks, cantonment entry gates, and neighborhood safety indices."
  },
  listings: {
    title: "VERIFIED DEFENCE LISTINGS",
    subtitle: "Exclusively by and for military personnel",
    description: "Sourced directly from transitioning defence personnel or verified local landlords. Every single listing undergoes multi-factor validation to filter out civilian noise and ensure maximum locational safety for military families."
  },
  bah: {
    title: "BAH RANK MATCHING",
    subtitle: "Budget mapping by entitlement rank",
    description: "Match your HRA allowances exactly to Officer, JCO, or OR grade parameters. Instantly filter listings matching your basic allowances to prevent out-of-pocket expenses and ensure correct entitlement utilization."
  },
  availability: {
    title: "REAL TIME AVAILABILITY",
    subtitle: "Live relocation timeline synchronization",
    description: "Track vacancy states synced with active military posting-out dates. Securely coordinate directly with outgoing officers or jawans for direct handovers before the property goes on the general market."
  }
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showWasmModal, setShowWasmModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#111111] font-sans antialiased selection:bg-[#c9a84c]/30 p-4 sm:p-8">
      
      {/* 1. Minimal Top Nav */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easeHeavy }}
        className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-4 border-b border-[#111111]/10 mb-8 sm:mb-12"
      >
        <div className="flex items-center gap-2 font-bold tracking-tight text-lg">
          <Shield size={20} className="text-[#c9a84c]" />
          <span className="font-heading uppercase font-bold text-xl">FAUJI NIWAS</span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-xs tracking-wider uppercase text-[#555555]">
          <a href="#" className="hover:text-[#111111] hover:underline transition-all">Home</a>
          <a href="/app.html" className="hover:text-[#111111] hover:underline transition-all">Listings</a>
          <a href="/app.html?view=market" className="hover:text-[#111111] hover:underline transition-all">Post Room</a>
          <a href="#why-section" className="hover:text-[#111111] hover:underline transition-all">About</a>
          <a href="#why-section" className="hover:text-[#111111] hover:underline transition-all">Contact</a>
        </div>

        {/* Action Button & Search Icon */}
        <div className="flex items-center gap-4">
          <a href="/app.html" className="text-[#111111]/80 hover:text-[#111111] transition-colors" title="Search">
            <Search size={18} />
          </a>
          <a 
            href="/app.html" 
            className="border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#f5f4f0] px-5 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300"
          >
            Sign In
          </a>
        </div>
      </motion.nav>

      {/* 2. Hero Section */}
      <section className="w-full max-w-[1400px] mx-auto mb-12 sm:mb-16">
        
        {/* Newspaper Masthead Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#111111] pb-4 mb-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeHeavy }}
            className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none"
          >
            FAUJI NIWAS
          </motion.h1>
          
          {/* Top Stats Row (Right side of hero) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: easeHeavy }}
            className="flex gap-8 mt-4 md:mt-0 font-heading text-[#111111] text-right justify-start md:justify-end border-t border-[#111111]/10 pt-4 md:border-t-0 md:pt-0"
          >
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold">300+</span>
              <span className="text-[10px] uppercase tracking-wider text-[#555555]">Listings</span>
            </div>
            <div className="w-px h-10 bg-[#111111]/15 self-end"></div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold">15+</span>
              <span className="text-[10px] uppercase tracking-wider text-[#555555]">Stations</span>
            </div>
            <div className="w-px h-10 bg-[#111111]/15 self-end"></div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold">0</span>
              <span className="text-[10px] uppercase tracking-wider text-[#555555]">Brokerage</span>
            </div>
          </motion.div>
        </div>

        {/* Full-bleed Hero Image Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: easeHeavy }}
          className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] overflow-hidden rounded-[2rem] border border-[#111111]/10 shadow-lg cursor-pointer"
          onClick={() => window.location.href = '/app.html'}
        >
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover brightness-[0.9] hover:scale-105 transition-transform duration-[2s] ease-out"
            alt="Cantonment residential house"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8 sm:p-12">
            <div className="max-w-2xl text-white">
              <span className="text-xs uppercase tracking-widest text-[#c9a84c] font-bold mb-2 block">Premium Real Estate for Defence</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-2">Relocate Safely, Trust Implicitly</h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                The premier housing network connecting Indian Armed Forces personnel, JCOs, and Officers with secure residential outliving areas across military stations.
              </p>
            </div>
          </div>
          <div className="absolute top-6 right-6 bg-[#f5f4f0]/95 backdrop-blur px-4 py-2 rounded-full border border-[#111111]/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm text-[#111111]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Station Link Active
          </div>
        </motion.div>
      </section>

      {/* 3. Features Bento Grid */}
      <section className="w-full max-w-[1400px] mx-auto mb-16 sm:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 (Black) */}
          <motion.div 
            whileHover={{ y: -6 }}
            onClick={() => setActiveFeature(FEATURE_EXPLANATIONS.search)}
            className="bg-[#111111] text-[#f5f4f0] p-8 rounded-[2rem] flex flex-col justify-between h-[240px] cursor-pointer group transition-all shadow-sm border border-[#111111]"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-wider uppercase text-[#c9a84c] font-black">Feature 01</span>
              <ArrowUpRight size={24} className="text-[#c9a84c] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-1 tracking-tight">INSTANT STATION SEARCH</h3>
              <p className="text-[#f5f4f0]/60 text-xs font-medium">Proximity routing for military bases</p>
            </div>
          </motion.div>

          {/* Card 2 (White) */}
          <motion.div 
            whileHover={{ y: -6 }}
            onClick={() => setActiveFeature(FEATURE_EXPLANATIONS.listings)}
            className="bg-white text-[#111111] p-8 rounded-[2rem] flex flex-col justify-between h-[240px] cursor-pointer group transition-all shadow-sm border border-[#111111]/10"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-wider uppercase text-[#c9a84c] font-black">Feature 02</span>
              <ArrowUpRight size={24} className="text-[#111111] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-1 tracking-tight">VERIFIED DEFENCE LISTINGS</h3>
              <p className="text-[#111111]/60 text-xs font-medium">Verified military families only</p>
            </div>
          </motion.div>

          {/* Card 3 (Black) */}
          <motion.div 
            whileHover={{ y: -6 }}
            onClick={() => setActiveFeature(FEATURE_EXPLANATIONS.bah)}
            className="bg-[#111111] text-[#f5f4f0] p-8 rounded-[2rem] flex flex-col justify-between h-[240px] cursor-pointer group transition-all shadow-sm border border-[#111111]"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-wider uppercase text-[#c9a84c] font-black">Feature 03</span>
              <ArrowUpRight size={24} className="text-[#c9a84c] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-1 tracking-tight">BAH RANK MATCHING</h3>
              <p className="text-[#f5f4f0]/60 text-xs font-medium">Budget mapping by entitlement rank</p>
            </div>
          </motion.div>

          {/* Card 4 (White) */}
          <motion.div 
            whileHover={{ y: -6 }}
            onClick={() => setActiveFeature(FEATURE_EXPLANATIONS.availability)}
            className="bg-white text-[#111111] p-8 rounded-[2rem] flex flex-col justify-between h-[240px] cursor-pointer group transition-all shadow-sm border border-[#111111]/10"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-wider uppercase text-[#c9a84c] font-black">Feature 04</span>
              <ArrowUpRight size={24} className="text-[#111111] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-1 tracking-tight">REAL TIME AVAILABILITY</h3>
              <p className="text-[#111111]/60 text-xs font-medium">Live relocation timeline sync</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. Why FaujiNiwas Section */}
      <section id="why-section" className="w-full max-w-[1400px] mx-auto border-t-2 border-[#111111] pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Section Heading Left */}
          <div className="lg:col-span-5">
            <span className="text-[#c9a84c] font-bold text-xs uppercase tracking-widest block mb-2">Exclusive Platform Overview</span>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl leading-tight">WHY FAUJINIWAS?</h2>
            <p className="mt-4 text-[#555555] text-sm sm:text-base leading-relaxed max-w-lg">
              Designed entirely to remove the friction of sudden military posting cycles. Built securely for jawans, JCOs, and officers to share postings and rent homes without civilian classified noise.
            </p>
            <div className="mt-8">
              <a 
                href="/app.html" 
                className="inline-flex items-center gap-2 border border-[#111111] hover:bg-[#111111] hover:text-[#f5f4f0] text-[#111111] px-6 py-3 rounded-full font-bold text-sm tracking-wider uppercase transition-all duration-300"
              >
                Launch Relocation OS <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {/* Section Columns Right (Utilities) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Lease generator card */}
            <div 
              onClick={() => setShowLeaseModal(true)}
              className="bg-white border border-[#111111]/10 rounded-[2rem] p-8 flex flex-col sm:flex-row gap-6 cursor-pointer hover:border-[#c9a84c] transition-all shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center flex-shrink-0">
                <FileText size={32} />
              </div>
              <div>
                <span className="text-[10px] text-[#c9a84c] font-black tracking-wider uppercase block mb-1">Free Legal Tool</span>
                <h4 className="font-heading text-lg font-bold text-[#111111] mb-1">Military Lease Generator</h4>
                <p className="text-[#555555] text-xs leading-relaxed">
                  Draft a rental agreement equipped with the Indian Military Break Clause. Landlords must agree to refund deposits within a 15-day notice upon official posting orders.
                </p>
              </div>
            </div>

            {/* WASM Document Masking */}
            <div 
              onClick={() => setShowWasmModal(true)}
              className="bg-white border border-[#111111]/10 rounded-[2rem] p-8 flex flex-col sm:flex-row gap-6 cursor-pointer hover:border-[#c9a84c] transition-all shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="text-[10px] text-[#c9a84c] font-black tracking-wider uppercase block mb-1">Zero-Trust Security</span>
                <h4 className="font-heading text-lg font-bold text-[#111111] mb-1">WASM Edge Document Masking</h4>
                <p className="text-[#555555] text-xs leading-relaxed">
                  Protect your privacy in line with DPDP Act 2023. Our client-side WebAssembly script processes documents directly on your browser, automatically redacting personal identification cards and numbers before upload.
                </p>
              </div>
            </div>

            {/* CSD Ticker adaptively styled */}
            <div className="custom-ticker-wrap">
              <CSDPulseTicker />
            </div>

          </div>
        </div>
      </section>

      {/* 5. Editorial Footer */}
      <footer className="w-full max-w-[1400px] mx-auto border-t border-[#111111]/10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#777777]">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#c9a84c]" />
          <span className="font-heading font-black text-[#111111] tracking-wider">FAUJI NIWAS</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6 font-semibold uppercase text-[10px] tracking-wider">
          <a href="#" className="hover:text-[#111111] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#111111] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#111111] transition-colors">Contact Defence Admin</a>
        </div>
        <div className="flex items-center gap-1.5">
          Made with <Heart size={10} className="fill-red-500 text-red-500" /> for the Armed Forces
        </div>
      </footer>

      {/* Feature Explanation Modal Overlay */}
      <AnimatePresence>
        {activeFeature && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#f5f4f0]/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setActiveFeature(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ duration: 0.5, ease: easeHeavy }}
              className="bg-[#111111] text-[#f5f4f0] border border-[#c9a84c]/20 max-w-lg w-full rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative cursor-default"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveFeature(null)}
                className="absolute top-6 right-6 text-[#f5f4f0]/60 hover:text-[#f5f4f0] transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
              
              <span className="text-[10px] text-[#c9a84c] font-black tracking-widest uppercase block mb-1">Feature Breakdown</span>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight mb-2 uppercase">{activeFeature.title}</h3>
              <div className="w-12 h-0.5 bg-[#c9a84c] mb-6"></div>
              
              <h4 className="text-sm font-semibold text-[#c9a84c]/90 mb-3">{activeFeature.subtitle}</h4>
              <p className="text-[#f5f4f0]/80 text-sm leading-relaxed font-normal">
                {activeFeature.description}
              </p>
              
              <button 
                onClick={() => { setActiveFeature(null); window.location.href = '/app.html'; }}
                className="mt-8 w-full bg-[#f5f4f0] hover:bg-[#c9a84c] hover:text-[#111111] text-[#111111] font-bold text-xs uppercase tracking-wider py-4 rounded-full transition-all duration-300"
              >
                Explore on Map ↗
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing functionality modals */}
      {showLeaseModal && <LeaseGeneratorModal onClose={() => setShowLeaseModal(false)} />}
      {showWasmModal && <WasmMaskingModal onClose={() => setShowWasmModal(false)} />}
    </div>
  );
}
