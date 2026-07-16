import React, { useState, useEffect, useRef, Suspense } from "react";
import { PROPERTIES, FACILITIES, getSuitableRanks } from "./dataNew";
import { Property, Facility } from "./typesNew";
import Header from "./components/New/Header";
import PropertyCard from "./components/New/PropertyCard";

const Map = React.lazy(() => import("./components/New/Map"));

const DetailModal    = React.lazy(() => import("./components/Modals/DetailModal"));
const PostModal      = React.lazy(() => import("./components/Modals/PostModal"));
const ProfileModal   = React.lazy(() => import("./components/Modals/ProfileModal"));
const ReportModal    = React.lazy(() => import("./components/Modals/ReportModal"));
const TransfersModal = React.lazy(() => import("./components/Modals/TransfersModal"));
const CompareModal   = React.lazy(() => import("./components/Modals/CompareModal"));
const FoodPanel      = React.lazy(() => import("./components/Food/FoodPanel"));
const LegalModal     = React.lazy(() => import("./components/Modals/LegalModal"));
const ChatModal      = React.lazy(() => import("./components/Modals/ChatModal"));
const AdminModal     = React.lazy(() => import("./components/Modals/AdminModal"));
const RelocationModal = React.lazy(() => import("./components/Modals/RelocationModal"));
import { useAuth } from "./hooks/useAuth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { ModalContext } from "./App";
import Toast from "./components/UI/Toast";
// @ts-ignore
import { useFilterStore } from "./store/filterStore";
// @ts-ignore
import { useListings } from "./hooks/useListings";
import { Home, TrendingUp, ChevronDown, ChevronUp, Star, HelpCircle, School, Cross, Train, Building2, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

export default function App() {
  const { user, dbUser } = useAuth();
  
  // Real-time sync with database
  useListings();
  const listings = useFilterStore((s: any) => s.listings) || [];
  const propertiesToUse = listings.length > 0 ? listings : PROPERTIES;

  // Expose global variables and API for external chatbot.js
  useEffect(() => {
    (window as any).state = {
      listings: propertiesToUse,
    };
    (window as any).openDetailModal = (id: string) => {
      const prop = propertiesToUse.find((p: any) => p.id === id);
      if (prop) {
        setSelectedProperty(prop);
      }
    };
    (window as any).geocodeSearch = async (query: string) => {
      if (!query || query.trim().length < 3) return;
      try {
        const searchQueryStr = query.toLowerCase().includes("india") ? query : `${query}, India`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQueryStr)}&format=json&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          (window as any).geolocated = true;
          if ((window as any).flyToCoordinate) {
            (window as any).flyToCoordinate(lat, lon);
          }
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }
    };
    return () => {
      delete (window as any).state;
      delete (window as any).openDetailModal;
      delete (window as any).geocodeSearch;
    };
  }, [propertiesToUse]);
  
  // Create userProfile object matching what Header expects
  const userProfile = user ? {
    name: dbUser?.name || user.displayName || user.phoneNumber || "Lt. Col. Sandeep Mehta (Retd.)",
    rank: dbUser?.rank || "Major",
    basicPay: dbUser?.basicPay || 69400,
  } : null;

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("All");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("All");

  // activeCity drives map centering - only changes when search query changes (not on filter changes)
  const activeCity = searchQuery;

  // Property list with favorite state toggled locally
  const [properties, setProperties] = useState<Property[]>(propertiesToUse);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [visiblePropertyIds, setVisiblePropertyIds] = useState<string[]>([]);

  // Update properties state when store listings change
  useEffect(() => {
    if (listings.length > 0) {
      const mapped: Property[] = listings.map((l: any) => {
        const rentPrice = Number(String(l.price || l.rent).replace(/[^0-9.]/g, '')) || 12000;
        return {
          id: l.id,
          title: l.title || l.name || "Untitled Listing",
          rent: rentPrice,
          type: l.type || (l.bhk ? `${l.bhk}BHK` : "2BHK"),
          commute: l.commute || (l.distance ? `${l.distance} km` : "1.5 km"),
          rating: l.rating || 4.8,
          image: l.image || (l.mediaUrls?.[0]) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
          suitableRanks: l.suitableRanks || getSuitableRanks(rentPrice),
          lat: l.lat || 25.61,
          lng: l.lng || 85.12,
          cantonment: l.cantonment || "Patna Cantt",
          description: l.description || "Defense verified family home",
          isFavorite: l.isFavorite || false
        };
      });
      setProperties(mapped);
    }
  }, [listings]);

  // Facility map layer toggles (Station Commute Zone, Army School, Military Hospital)
  const [facilityLayers, setFacilityLayers] = useState({
    station: true,
    school: true,
    hospital: true,
  });
  const [facilitiesOpen, setFacilitiesOpen] = useState(true);

  // Sidebar tab: 'properties' | 'ssb' | 'marketplace'
  const [sidebarTab, setSidebarTab] = useState<'properties' | 'ssb' | 'marketplace'>('properties');
  const [sidebarOpen, setSidebarOpen] = useState(true); // mobile sidebar open toggle

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [chatConfig, setChatConfig] = useState<any>(null);
  const [foodCity, setFoodCity] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Sync sidebarTab with useFilterStore activeView
  const setActiveView = useFilterStore((s: any) => s.setActiveView);
  useEffect(() => {
    if (sidebarTab === 'properties') setActiveView('rentals');
    else if (sidebarTab === 'ssb') setActiveView('dorms');
    else if (sidebarTab === 'marketplace') setActiveView('market');
  }, [sidebarTab, setActiveView]);

  // Draggable position state for facilities panel
  const [facPosition, setFacPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('label') || target.closest('a')) {
      return;
    }
    setIsDragging(true);
    dragStart.current = { x: e.clientX - facPosition.x, y: e.clientY - facPosition.y };
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('label') || target.closest('a')) {
      return;
    }
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - facPosition.x, y: touch.clientY - facPosition.y };
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleHeaderClick = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      const touch = e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }
    const dx = Math.abs(clientX - dragStartPos.current.x);
    const dy = Math.abs(clientY - dragStartPos.current.y);
    if (dx < 6 && dy < 6) {
      setFacilitiesOpen(o => !o);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setFacPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setFacPosition({
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Filter properties based on active controls
  const filteredProperties = properties.filter((prop) => {
    // Search filter
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.cantonment.toLowerCase().includes(searchQuery.toLowerCase());

    // BHK filter (normalized below with rank check)

    // Budget range filter
    let matchesBudget = true;
    if (selectedBudgetRange === "under-15k") {
      matchesBudget = prop.rent < 15000;
    } else if (selectedBudgetRange === "15k-20k") {
      matchesBudget = prop.rent >= 15000 && prop.rent <= 20000;
    } else if (selectedBudgetRange === "over-20k") {
      matchesBudget = prop.rent > 20000;
    }

    // Rank eligibility filter
    let matchesRank = true;
    if (selectedRank.toLowerCase() !== "all") {
      const rankLower = selectedRank.toLowerCase();
      if (rankLower === "or") {
        const orRanks = ["sepoy", "lance naik", "naik", "havildar"];
        matchesRank = prop.suitableRanks.some(r => orRanks.includes(r.toLowerCase()));
      } else if (rankLower === "jco") {
        const jcoRanks = ["naib subedar", "subedar", "subedar major"];
        matchesRank = prop.suitableRanks.some(r => jcoRanks.includes(r.toLowerCase()));
      } else if (rankLower === "officers" || rankLower === "officer" || rankLower === "officers" || rankLower === "officers" || rankLower === "officers") {
        const officerRanks = ["lieutenant", "captain", "major", "lieutenant colonel", "colonel", "brigadier", "major general", "lieutenant general", "general (coas)"];
        matchesRank = prop.suitableRanks.some(r => officerRanks.includes(r.toLowerCase()));
      } else {
        matchesRank = prop.suitableRanks.some(r => r.toLowerCase() === rankLower);
      }
    }
    // BHK match: handle both "2BHK" and "2 BHK" formats
    const normType = prop.type?.replace(' ', '').toLowerCase();
    const normBhk = selectedBhk?.replace(' ', '').toLowerCase();
    const matchesBhk = selectedBhk === "All" || normType === normBhk || prop.type === selectedBhk;
    return matchesSearch && matchesBhk && matchesBudget && matchesRank;
  });

  const visibleProperties = filteredProperties.filter((p) => visiblePropertyIds.includes(p.id));
  const displayPropertiesCount = visiblePropertyIds.length > 0 ? visibleProperties.length : filteredProperties.length;
  const activePropertiesList = visiblePropertyIds.length > 0 ? visibleProperties : filteredProperties;
  const displayAverageRent = displayPropertiesCount > 0
    ? Math.round(activePropertiesList.reduce((sum, p) => sum + p.rent, 0) / displayPropertiesCount)
    : 0;

  // Toggle favorite bookmark on card
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection click trigger
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Synchronize rank filter when user profile or HRA calculator shifts
  const handleRankFilterChange = (rank: string) => {
    setSelectedRank(rank);
  };

  const handleLogout = () => {
    localStorage.removeItem("fn_mock_user");
    signOut(auth);
    setSelectedRank("All");
  };

  const ctxValue = {
    showToast: (msg: string, type: string = 'ok') => {
      setToast({ msg, type });
    },
    openDetail: (id: string) => {
      const prop = properties.find((p) => p.id === id);
      if (prop) {
        setSelectedProperty(prop);
      }
    },
    openPost: () => setOpenModal('post'),
    openProfile: () => setIsProfileModalOpen(true),
    openReport: (id: string) => { setReportId(id); setOpenModal('report'); },
    openTransfers: () => setOpenModal('transfers'),
    openCompare: () => setOpenModal('compare'),
    openFood: (city: string) => { setFoodCity(city); setOpenModal('food'); },
    openLegal: () => setOpenModal('legal'),
    openChat: (config: any) => { setChatConfig(config); setOpenModal('chat'); },
    openAdmin: () => setOpenModal('admin'),
    openRelocation: () => setOpenModal('relocation'),
    closeFood: () => { setFoodCity(null); setOpenModal(null); },
    closeAll: () => {
      setOpenModal(null);
      setSelectedProperty(null);
      setReportId(null);
      setChatConfig(null);
      setIsProfileModalOpen(false);
    }
  };

  return (
    <ModalContext.Provider value={ctxValue as any}>
      <div className="w-full h-screen relative overflow-hidden bg-slate-900 text-slate-800 font-sans antialiased text-sm">
        {/* 1. Map is the full-screen absolute background! */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Suspense fallback={
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold tracking-wider text-slate-300">Loading Map Engine…</span>
            </div>
          }>
            <Map
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedProperty}
              facilities={FACILITIES}
              activeFacilityTypes={facilityLayers}
              onBoundsChange={setVisiblePropertyIds}
              activeCity={activeCity}
            />
          </Suspense>
        </div>

        {/* 2. Floating Header Navigation Bar */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRank={selectedRank}
          onRankChange={handleRankFilterChange}
          selectedBhk={selectedBhk}
          onBhkChange={setSelectedBhk}
          selectedBudgetRange={selectedBudgetRange}
          onBudgetChange={setSelectedBudgetRange}
          userProfile={userProfile}
          onOpenAuthModal={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* 3. Left Floating Sidebar Panel — hidden on mobile unless toggled */}
        {/* Mobile toggle button */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="md:hidden absolute top-[82px] left-3 z-50 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg pointer-events-auto border-2 border-white/20"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className={`absolute top-[82px] left-4 bottom-4 w-[395px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-7.5rem)] z-40 flex flex-col gap-3 pointer-events-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'
        }`}>
          {/* Tab bar */}
          <div className="flex gap-1.5 pointer-events-auto shrink-0">
            {(['properties', 'ssb', 'marketplace'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-3 text-[12px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                  sidebarTab === tab
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950/70 text-slate-300 hover:bg-slate-950/85 hover:text-white'
                } backdrop-blur-md border border-white/10`}
              >
                {tab === 'properties' && <Home size={13} />}
                {tab === 'ssb' && <Building2 size={13} />}
                {tab === 'marketplace' && <ShoppingBag size={13} />}
                {tab === 'properties' ? 'Listings' : tab === 'ssb' ? 'SSB Dorm' : 'Market'}
              </button>
            ))}
          </div>

          {/* Mockup Stats Panel */}
          {sidebarTab === 'properties' && (
          <div className="grid grid-cols-2 gap-2 w-full pointer-events-auto shrink-0 select-none">
            <div className="backdrop-blur-md bg-slate-950/75 text-white rounded-2xl p-3 flex items-center justify-center gap-2.5 border border-white/10 shadow-lg">
              <div className="p-1.5 rounded bg-emerald-800/60 text-emerald-300">
                <Home size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total Listings</span>
                <span className="font-bold text-sm text-slate-100 leading-tight mt-1">{displayPropertiesCount.toLocaleString()} units</span>
              </div>
            </div>
            <div className="backdrop-blur-md bg-slate-950/75 text-white rounded-2xl p-3 flex items-center justify-center gap-2.5 border border-white/10 shadow-lg">
              <div className="p-1.5 rounded bg-emerald-800/60 text-emerald-300">
                <TrendingUp size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Average Rent</span>
                <span className="font-bold text-sm text-slate-100 leading-tight mt-1">₹{Math.round(displayAverageRent / 1000)} K / mo</span>
              </div>
            </div>
          </div>
          )}

          {/* Listings count and reset */}
          {sidebarTab === 'properties' && (selectedRank !== "All" || selectedBhk !== "All" || selectedBudgetRange !== "All" || searchQuery !== "") && (
            <div className="flex items-center justify-between text-xs font-semibold px-4 py-2.5 bg-slate-950/85 backdrop-blur-md text-white rounded-xl border border-white/10 pointer-events-auto shrink-0 shadow-lg">
              <span className="text-slate-200">Filters Active</span>
              <button
                onClick={() => {
                  setSelectedRank("All");
                  setSelectedBhk("All");
                  setSelectedBudgetRange("All");
                  setSearchQuery("");
                }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Properties Scroll List */}
          {sidebarTab === 'properties' && (
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 pointer-events-auto scrollbar-none">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSelected={selectedProperty?.id === prop.id}
                  onSelect={() => setSelectedProperty(prop)}
                  onToggleFavorite={handleToggleFavorite}
                  userRank={userProfile?.rank}
                  userBasicPay={userProfile?.basicPay}
                />
              ))
            ) : (
              <div className="py-8 px-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-center flex flex-col items-center justify-center gap-2 text-white">
                <HelpCircle size={24} className="text-slate-400" />
                <p className="text-xs font-bold">No properties matched</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Try clearing active filters or searching for other keywords.
                </p>
              </div>
            )}
          </div>
          )}

          {/* SSB Dorm Tab */}
          {sidebarTab === 'ssb' && (
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 pointer-events-auto scrollbar-none">
              <div className="backdrop-blur-md bg-slate-950/85 rounded-2xl p-4 border border-white/10 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={14} className="text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">SSB Dorm Availability</span>
                </div>
                {[
                  { ssb: 'Allahabad SSB', city: 'Prayagraj', dorms: 24, available: 6, open: true },
                  { ssb: 'Bhopal SSB', city: 'Bhopal', dorms: 18, available: 2, open: true },
                  { ssb: 'Bangalore SSB', city: 'Bengaluru', dorms: 30, available: 0, open: false },
                  { ssb: 'Dehradun SSB', city: 'Dehradun', dorms: 20, available: 8, open: true },
                  { ssb: 'Kapurthala SSB', city: 'Punjab', dorms: 16, available: 4, open: true },
                  { ssb: 'Mysore SSB', city: 'Mysuru', dorms: 22, available: 11, open: true },
                  { ssb: 'Coimbatore SSB', city: 'Coimbatore', dorms: 14, available: 0, open: false },
                ].map((s) => (
                  <div key={s.ssb} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-slate-100">{s.ssb}</p>
                      <p className="text-[10px] text-slate-400">{s.city}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.available > 0 ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-600/30 text-red-300'
                      }`}>
                        {s.available > 0 ? `${s.available} beds free` : 'Full'}
                      </span>
                      <p className="text-[9px] text-slate-500 mt-0.5">{s.dorms} total dorms</p>
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-slate-500 mt-3">⚠️ Availability is indicative. Contact SSB admin to confirm.</p>
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {sidebarTab === 'marketplace' && (
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 pointer-events-auto scrollbar-none">
              <div className="backdrop-blur-md bg-slate-950/85 rounded-2xl p-4 border border-white/10 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag size={14} className="text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Fauji Marketplace</span>
                </div>
                {[
                  { item: 'Godrej Almirah (3-door)', price: '₹3,500', seller: 'Ex-Naik, Pune', tag: 'Furniture' },
                  { item: 'Split AC (1.5T Voltas)', price: '₹12,000', seller: 'Maj. Sharma, Delhi Cantt', tag: 'Electronics' },
                  { item: 'Military-grade Raincoat', price: '₹800', seller: 'Hav. Singh, Ambala', tag: 'Clothing' },
                  { item: 'Generator (5kVA)', price: '₹28,000', seller: 'JCO Rathore, Jodhpur', tag: 'Equipment' },
                  { item: 'Study Table + Chair Set', price: '₹2,200', seller: 'Capt. Verma, Secbad', tag: 'Furniture' },
                ].map((m) => (
                  <div key={m.item} className="py-2.5 border-b border-white/5 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider">{m.tag}</span>
                        <p className="text-xs font-bold text-slate-100 mt-1">{m.item}</p>
                        <p className="text-[10px] text-slate-400">{m.seller}</p>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-400">{m.price}</span>
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-slate-500 mt-3">🛡️ Verified defence community only. Sign in to post.</p>
              </div>
            </div>
          )}
        </div>


        {/* 4. Right Floating Overlay: Nearby Facilities - hidden on mobile */}
        <div 
          className="hidden md:block absolute z-40 w-64 pointer-events-auto select-none"
          style={{
            top: '96px',
            right: '16px',
            transform: `translate(${facPosition.x}px, ${facPosition.y}px)`,
          }}
        >
          <div className="bg-slate-950/85 backdrop-blur-md text-white rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onClick={handleHeaderClick}
              className="w-full flex items-center justify-between pl-6 pr-4 py-3.5 hover:bg-white/5 transition-colors"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2 pointer-events-none">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span>Nearby Facilities</span>
              </h3>
              {facilitiesOpen ? <ChevronUp size={13} className="text-slate-400 pointer-events-none" /> : <ChevronDown size={13} className="text-slate-400 pointer-events-none" />}
            </div>

            {facilitiesOpen && (
              <div className="pl-6 pr-4 pb-4 flex flex-col gap-3 text-xs font-medium text-slate-200 border-t border-white/5">
                {/* Station Toggle */}
                <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none mt-2">
                  <input
                    type="checkbox"
                    checked={facilityLayers.station}
                    onChange={(e) =>
                      setFacilityLayers((prev) => ({ ...prev, station: e.target.checked }))
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-indigo-600 text-white shadow-md">
                      <Train size={12} />
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform text-[11px]">Station Commute Zone</span>
                  </div>
                </label>

                {/* School Toggle */}
                <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={facilityLayers.school}
                    onChange={(e) =>
                      setFacilityLayers((prev) => ({ ...prev, school: e.target.checked }))
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-600 text-white shadow-md">
                      <School size={12} />
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform text-[11px]">Army School</span>
                  </div>
                </label>

                {/* Hospital Toggle */}
                <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={facilityLayers.hospital}
                    onChange={(e) =>
                      setFacilityLayers((prev) => ({ ...prev, hospital: e.target.checked }))
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-red-500 text-white shadow-md">
                      <Cross size={11} className="text-white" fill="white" />
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform text-[11px]">Military Hospital</span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>


        {/* 6. Modals Dialogs wrapped in separate Suspense boundaries to optimize performance */}
        <Suspense fallback={null}>
          {isProfileModalOpen && (
            <ProfileModal
              onClose={() => setIsProfileModalOpen(false)}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {selectedProperty && (
            <DetailModal
              id={selectedProperty.id}
              onClose={() => setSelectedProperty(null)}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'post' && (
            <PostModal onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'report' && (
            <ReportModal listingId={reportId} onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'transfers' && (
            <TransfersModal onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'compare' && (
            <CompareModal onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'food' && (
            <FoodPanel city={foodCity} onClose={ctxValue.closeFood} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'legal' && (
            <LegalModal onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'chat' && (
            <ChatModal config={chatConfig} onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'admin' && (
            <AdminModal onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {openModal === 'relocation' && (
            <RelocationModal onClose={ctxValue.closeAll} />
          )}
        </Suspense>

        {/* Toast notifications */}
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type as any}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ModalContext.Provider>
  );
}
