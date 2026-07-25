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
import { 
  Home, TrendingUp, ChevronDown, ChevronUp, Star, HelpCircle, School, Cross, Train, Building2, 
  ShoppingBag, ChevronLeft, ChevronRight, Search, MapPin, Target, Heart, User, Bot, Bell, 
  Menu, ArrowUpDown, X, SlidersHorizontal, Sliders, LogOut, PlusCircle, CheckCircle, Bed 
} from "lucide-react";

export default function App() {
  const { user, dbUser } = useAuth();
  
  // Real-time sync with database
  useListings();
  const listings = useFilterStore((s: any) => s.listings) || [];
  const propertiesToUse = listings.length > 0 ? listings : PROPERTIES;

  // Mobile navigation state
  const [mobileActiveTab, setMobileActiveTab] = useState<'home' | 'map' | 'saved' | 'ai_helper' | 'profile'>('home');
  const [mobileViewMode, setMobileViewMode] = useState<'feed' | 'homes_list' | 'homes_map'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'family' | 'boys' | 'girls' | 'pg' | 'ssb' | 'market'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSort, setMobileSort] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

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

  // Filter properties based on active controls and category selection
  const filteredProperties = properties.filter((prop) => {
    // Saved tab filter
    if (mobileActiveTab === 'saved' && !prop.isFavorite) {
      return false;
    }

    // Category filter
    let matchesCategory = true;
    if (selectedCategory === 'family') {
      matchesCategory = prop.type?.includes('2BHK') || prop.type?.includes('3BHK') || prop.title?.toLowerCase().includes('family');
    } else if (selectedCategory === 'boys') {
      matchesCategory = prop.title?.toLowerCase().includes('boys') || prop.title?.toLowerCase().includes('bachelor') || prop.description?.toLowerCase().includes('bachelor');
    } else if (selectedCategory === 'girls') {
      matchesCategory = prop.title?.toLowerCase().includes('girls') || prop.description?.toLowerCase().includes('girls');
    } else if (selectedCategory === 'pg') {
      matchesCategory = prop.type?.includes('PG') || prop.title?.toLowerCase().includes('pg') || prop.description?.toLowerCase().includes('pg');
    } else if (selectedCategory === 'ssb') {
      matchesCategory = prop.title?.toLowerCase().includes('ssb') || prop.description?.toLowerCase().includes('ssb');
    }

    // Search filter
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.cantonment.toLowerCase().includes(searchQuery.toLowerCase());

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
      } else if (rankLower === "officers" || rankLower === "officer") {
        const officerRanks = ["lieutenant", "captain", "major", "lieutenant colonel", "colonel", "brigadier", "major general", "lieutenant general", "general (coas)"];
        matchesRank = prop.suitableRanks.some(r => officerRanks.includes(r.toLowerCase()));
      } else {
        matchesRank = prop.suitableRanks.some(r => r.toLowerCase() === rankLower);
      }
    }

    // BHK match
    const normType = prop.type?.replace(' ', '').toLowerCase();
    const normBhk = selectedBhk?.replace(' ', '').toLowerCase();
    const matchesBhk = selectedBhk === "All" || normType === normBhk || prop.type === selectedBhk;
    return matchesCategory && matchesSearch && matchesBhk && matchesBudget && matchesRank;
  }).sort((a, b) => {
    if (mobileSort === 'price_low') return a.rent - b.rent;
    if (mobileSort === 'price_high') return b.rent - a.rent;
    if (mobileSort === 'rating') return b.rating - a.rating;
    return 0;
  });

  const visibleProperties = filteredProperties.filter((p) => visiblePropertyIds.includes(p.id));
  const displayPropertiesCount = visiblePropertyIds.length > 0 ? visibleProperties.length : filteredProperties.length;
  const activePropertiesList = visiblePropertyIds.length > 0 ? visibleProperties : filteredProperties;
  const displayAverageRent = displayPropertiesCount > 0
    ? Math.round(activePropertiesList.reduce((sum, p) => sum + p.rent, 0) / displayPropertiesCount)
    : 0;

  // Toggle favorite bookmark on card
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

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
      const prop = propertiesToUse.find((p: any) => p.id === id) || PROPERTIES.find((p: any) => p.id === id);
      if (prop) {
        setSelectedProperty(prop);
      } else {
        setSelectedProperty({ id, title: 'Listing Details', rent: 15000, type: '2BHK', area: 'Defence Area', city: 'Delhi', rating: 4.8 } as any);
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
      <div className="w-full h-screen relative overflow-hidden bg-slate-900 text-slate-800 font-sans antialiased text-sm select-none">
        
        {/* =========================================================================
            DESKTOP LAYOUT (>= 768px)
           ========================================================================= */}
        <div className="hidden md:block w-full h-full relative overflow-hidden">
          {/* Map Engine Background */}
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

          {/* Floating Header */}
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

          {/* Desktop Left Sidebar Panel */}
          <div className="absolute top-[82px] left-4 bottom-4 w-[395px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-7.5rem)] z-40 flex flex-col gap-3 pointer-events-none transition-transform duration-300">
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Nearby Facilities Overlay */}
          <div 
            className="absolute z-40 w-64 pointer-events-auto select-none"
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
                  <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none mt-2">
                    <input
                      type="checkbox"
                      checked={facilityLayers.station}
                      onChange={(e) => setFacilityLayers((prev) => ({ ...prev, station: e.target.checked }))}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-indigo-600 text-white shadow-md"><Train size={12} /></div>
                      <span className="text-[11px]">Station Commute Zone</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={facilityLayers.school}
                      onChange={(e) => setFacilityLayers((prev) => ({ ...prev, school: e.target.checked }))}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-blue-600 text-white shadow-md"><School size={12} /></div>
                      <span className="text-[11px]">Army School</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={facilityLayers.hospital}
                      onChange={(e) => setFacilityLayers((prev) => ({ ...prev, hospital: e.target.checked }))}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-red-500 text-white shadow-md"><Cross size={11} className="text-white" fill="white" /></div>
                      <span className="text-[11px]">Military Hospital</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* =========================================================================
            MOBILE APK LAYOUT (< 768px) - MATCHING MOCKUP IMAGE 1 & IMAGE 2
           ========================================================================= */}
        <div className="md:hidden flex flex-col w-full h-full bg-[#f8fafc] text-slate-800 relative overflow-hidden">

          {/* 1. Mobile Drawer Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 z-10 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xl text-[#047857]">FaujiNiwas</span>
                    <span className="text-[9px] font-bold tracking-[0.12em] text-[#065f46] uppercase">Defence Housing Portal</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                    <X size={20} />
                  </button>
                </div>

                {userProfile ? (
                  <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold text-sm">
                      {userProfile.name[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-slate-800 truncate">{userProfile.name}</span>
                      <span className="text-[11px] text-[#047857] font-semibold">{userProfile.rank}</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setIsProfileModalOpen(true); }}
                    className="my-4 w-full py-3 bg-[#047857] text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Sign In / Register
                  </button>
                )}

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto py-2">
                  <button onClick={() => { setMobileMenuOpen(false); setOpenModal('post'); }} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <PlusCircle size={18} className="text-[#047857]" /> Post Housing Rental
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setSidebarTab('ssb'); setMobileActiveTab('home'); setMobileViewMode('homes_list'); }} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Building2 size={18} className="text-[#047857]" /> SSB Candidate Dorms
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setSidebarTab('marketplace'); setMobileActiveTab('home'); }} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <ShoppingBag size={18} className="text-[#047857]" /> Defence Marketplace
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setOpenModal('relocation'); }} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <CheckCircle size={18} className="text-[#047857]" /> PC-to-PC Relocation Guide
                  </button>
                </div>

                {user && (
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 pt-4 border-t border-slate-100 text-red-600 font-bold text-xs">
                    <LogOut size={16} /> Logout
                  </button>
                )}
              </div>
            </div>
          )}


          {/* 2. Mobile Main Scroll Container */}
          <div className="flex-1 overflow-y-auto pb-24 scrollbar-none">
            
            {/* MAP VIEW TAB */}
            {(mobileActiveTab === 'map' || mobileViewMode === 'homes_map') ? (
              <div className="w-full h-full relative">
                <Suspense fallback={
                  <div className="w-full h-[80vh] flex items-center justify-center bg-slate-100">
                    <div className="w-8 h-8 border-4 border-[#047857] border-t-transparent rounded-full animate-spin" />
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
                {/* Floating controls in map mode */}
                <div className="absolute top-4 left-4 right-4 z-[1000]">
                  <div className="relative w-full shadow-lg">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search city, cantonment or academy"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                      className="w-full pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-md focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                </div>
              </div>
            ) : (

              /* HOME / LIST VIEW CONTENT */
              <div className="px-4 pt-3 flex flex-col gap-4">

                {/* HEADER ROW */}
                <div className="flex items-center justify-between py-1">
                  {mobileViewMode === 'homes_list' ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setMobileViewMode('feed')}
                        className="p-1 rounded-full text-[#047857] hover:bg-slate-200/60"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <h1 className="font-extrabold text-xl text-[#047857]">Homes</h1>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl text-[#047857] hover:bg-slate-200/50">
                        <Menu size={22} />
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="font-extrabold text-lg tracking-tight text-[#047857] leading-none">FaujiNiwas</span>
                        <span className="text-[9px] font-bold tracking-[0.14em] text-[#065f46] uppercase mt-0.5">DEFENCE HOUSING PORTAL</span>
                      </div>
                      <button onClick={() => ctxValue.showToast("No new notifications", "ok")} className="p-2 rounded-xl text-[#047857] hover:bg-slate-200/50">
                        <Bell size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* SEARCH INPUT BAR */}
                <div className="relative w-full">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search city, cantonment or academy"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    className="w-full pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-[#047857]"
                  />
                </div>

                {/* LOCATION SELECTOR BAR */}
                <div className="relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-medium text-slate-700 shadow-sm">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={16} className="text-[#047857] shrink-0" />
                    <span className="truncate font-semibold">{searchQuery || "Current Location"}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          if (typeof (window as any).flyToCoordinate === "function") {
                            (window as any).flyToCoordinate(pos.coords.latitude, pos.coords.longitude);
                          }
                          ctxValue.showToast("Centered on your current GPS location", "ok");
                        });
                      }
                    }}
                    className="p-1 rounded-full text-[#047857] hover:bg-slate-100 transition-colors"
                  >
                    <Target size={16} />
                  </button>
                </div>

                {/* FILTER DROPDOWN PILLS ROW */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <select
                    value={selectedRank}
                    onChange={(e) => setSelectedRank(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                  >
                    <option value="All">Rank v</option>
                    <option value="OR">OR</option>
                    <option value="JCO">JCO</option>
                    <option value="Officers">Officers</option>
                  </select>

                  <select
                    value={selectedBhk}
                    onChange={(e) => setSelectedBhk(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                  >
                    <option value="All">BHK v</option>
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                  </select>

                  <select
                    value={selectedBudgetRange}
                    onChange={(e) => setSelectedBudgetRange(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                  >
                    <option value="All">Budget v</option>
                    <option value="under-15k">Under ₹15K</option>
                    <option value="15k-20k">₹15K - ₹20K</option>
                    <option value="over-20k">Over ₹20K</option>
                  </select>

                  <button 
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="w-9 h-9 shrink-0 rounded-xl bg-[#047857] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    title="Open Filters"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                </div>

                {/* SEGMENTED TOGGLE FOR HOMES VIEW MODE (IMAGE 2) */}
                {mobileViewMode === 'homes_list' && (
                  <div className="w-full bg-slate-200/80 p-1 rounded-2xl flex border border-slate-300/50">
                    <button
                      onClick={() => setMobileViewMode('homes_list')}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        mobileViewMode === 'homes_list' ? 'bg-[#047857] text-white shadow-md' : 'text-slate-600'
                      }`}
                    >
                      List View
                    </button>
                    <button
                      onClick={() => setMobileViewMode('homes_map')}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        mobileViewMode === 'homes_map' ? 'bg-[#047857] text-white shadow-md' : 'text-slate-600'
                      }`}
                    >
                      Map View
                    </button>
                  </div>
                )}


                {/* CATEGORIES GRID (IMAGE 1 STYLE) */}
                {mobileViewMode === 'feed' && (
                  <div className="grid grid-cols-6 gap-2 py-1">
                    {[
                      { id: 'family', label: 'Family', icon: Home },
                      { id: 'boys', label: 'Boys', icon: User },
                      { id: 'girls', label: 'Girls', icon: Heart },
                      { id: 'pg', label: 'PG', icon: Bed },
                      { id: 'ssb', label: 'SSB Stay', icon: Building2 },
                      { id: 'market', label: 'Market', icon: ShoppingBag },
                    ].map((cat) => {
                      const IconComp = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            if (cat.id === 'ssb') {
                              setSidebarTab('ssb');
                              setMobileViewMode('homes_list');
                            } else if (cat.id === 'market') {
                              setSidebarTab('marketplace');
                            } else {
                              setSelectedCategory(isSelected ? 'all' : cat.id as any);
                            }
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                            isSelected 
                              ? 'bg-emerald-50 border-[#047857] text-[#047857] shadow-sm' 
                              : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-2 rounded-xl mb-1 ${isSelected ? 'bg-[#047857] text-white' : 'bg-slate-100 text-[#047857]'}`}>
                            <IconComp size={16} />
                          </div>
                          <span className="text-[10px] font-bold truncate max-w-full">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}


                {/* RESULTS HEADER ROW (IMAGE 2) */}
                {mobileViewMode === 'homes_list' && (
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1">
                    <span>{filteredProperties.length} Homes Found</span>
                    <select
                      value={mobileSort}
                      onChange={(e) => setMobileSort(e.target.value as any)}
                      className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="relevance">Sort: Relevance v</option>
                      <option value="price_low">Sort: Price Low to High</option>
                      <option value="price_high">Sort: Price High to Low</option>
                      <option value="rating">Sort: Top Rated</option>
                    </select>
                  </div>
                )}


                {/* SECTION TITLE: POPULAR HOMES NEAR YOU (IMAGE 1 FEED MODE) */}
                {mobileViewMode === 'feed' && (
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="font-extrabold text-base text-slate-900">Popular Homes Near You</h2>
                    <button 
                      onClick={() => setMobileViewMode('homes_list')}
                      className="text-xs font-extrabold text-[#047857] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                )}


                {/* LISTING CARDS LIST */}
                <div className="flex flex-col gap-3.5">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((prop, idx) => {

                      /* FULL WIDTH HERO CARD (IMAGE 2 STYLE FOR HOMES LIST VIEW) */
                      if (mobileViewMode === 'homes_list') {
                        return (
                          <div
                            key={prop.id}
                            onClick={() => setSelectedProperty(prop)}
                            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] p-3"
                          >
                            {/* Image container */}
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                              <img
                                src={prop.image}
                                alt={prop.title}
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80";
                                }}
                                className="w-full h-full object-cover"
                              />
                              {/* Badges */}
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className="bg-[#047857] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm">
                                  {idx % 3 === 0 ? "Verified" : idx % 2 === 0 ? "Owner" : "Defence Area"}
                                </span>
                              </div>

                              {/* Heart Bookmark */}
                              <button
                                onClick={(e) => handleToggleFavorite(prop.id, e)}
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
                              >
                                <Heart size={15} className={prop.isFavorite ? "fill-red-500 text-red-500" : "text-white"} />
                              </button>
                            </div>

                            {/* Info */}
                            <div className="flex flex-col gap-1 px-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-base text-slate-900 truncate">{prop.title}</h3>
                                <button onClick={(e) => handleToggleFavorite(prop.id, e)}>
                                  <Heart size={16} className={prop.isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"} />
                                </button>
                              </div>

                              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                <span className="text-slate-800">{prop.rating}</span>
                                <span className="text-slate-400">(128)</span>
                              </div>

                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-lg font-extrabold text-[#047857]">₹{prop.rent.toLocaleString()}</span>
                                <span className="text-xs text-slate-400 font-medium">/month</span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100 mt-1">
                                <span>🛏️ {prop.type}</span>
                                <span>•</span>
                                <span>🚿 1 Bath</span>
                                <span>•</span>
                                <span>📍 {prop.commute}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      /* HORIZONTAL COMPACT CARD (IMAGE 1 FEED STYLE) */
                      return (
                        <div
                          key={prop.id}
                          onClick={() => setSelectedProperty(prop)}
                          className="bg-white rounded-3xl border border-slate-200/90 p-3 flex items-center gap-3.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer overflow-hidden relative"
                        >
                          {/* Image */}
                          <div className="relative w-28 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                            <img
                              src={prop.image}
                              alt={prop.title}
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80";
                              }}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1.5 left-1.5 bg-[#047857] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow">
                              {idx % 2 === 0 ? "Verified" : "Owner"}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 pr-1">
                            <div className="flex items-start justify-between gap-2 pr-1">
                              <h3 className="font-extrabold text-sm text-slate-900 truncate leading-snug">{prop.title}</h3>
                              <button 
                                onClick={(e) => handleToggleFavorite(prop.id, e)} 
                                className="shrink-0 w-7 h-7 rounded-full bg-slate-100/90 hover:bg-slate-200 flex items-center justify-center transition-colors -mt-0.5 shadow-2xs"
                                title="Favorite"
                              >
                                <Heart size={14} className={prop.isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"} />
                              </button>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 my-0.5">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span className="text-slate-800">{prop.rating}</span>
                              <span className="text-slate-400">(128)</span>
                            </div>

                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-extrabold text-[#047857]">₹{prop.rent.toLocaleString()}</span>
                              <span className="text-xs text-slate-400 font-medium">/month</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold truncate">
                              <span>🛏️ {prop.type}</span>
                              <span>•</span>
                              <span>📍 {prop.commute}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-500">No properties found in this filter.</p>
                    </div>
                  )}
                </div>


                {/* PROMO BANNER: LOOKING FOR SSB STAY? (IMAGE 1) */}
                {mobileViewMode === 'feed' && (
                  <div className="my-2 bg-gradient-to-br from-slate-50 to-emerald-50/60 rounded-3xl border border-slate-200/90 p-4 flex items-center justify-between gap-3 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col items-start pr-2">
                      <h3 className="font-extrabold text-sm text-slate-900">Looking for SSB Stay?</h3>
                      <p className="text-[11px] text-slate-500 mb-3 leading-tight mt-0.5">Comfortable & Safe Stay Near SSB Centres</p>
                      <button
                        onClick={() => {
                          setSidebarTab('ssb');
                          setMobileViewMode('homes_list');
                        }}
                        className="bg-[#047857] hover:bg-[#065f46] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md active:scale-95 transition-all"
                      >
                        Explore SSB Stay
                      </button>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&q=80"
                      alt="SSB Stay Room"
                      className="w-24 h-20 rounded-2xl object-cover shrink-0 shadow-sm"
                    />
                  </div>
                )}

              </div>
            )}
          </div>


          {/* 3. Floating Actions Bar in Homes List or Map View (Image 2 style) */}
          {(mobileViewMode === 'homes_list' || mobileActiveTab === 'map') && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-full px-4 py-2 flex items-center gap-5 text-xs font-bold text-slate-700">
              <button 
                onClick={() => setIsMobileFilterOpen(true)} 
                className="flex items-center gap-1.5 hover:text-[#047857] active:scale-95 transition-transform"
              >
                <SlidersHorizontal size={14} className="text-[#047857]" />
                <span>Filters</span>
              </button>
              
              <button 
                onClick={() => ctxValue.openChat({ title: "Fauji AI Assistant" })}
                className="w-10 h-10 rounded-full bg-[#047857] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                title="AI Helper"
              >
                <Bot size={20} />
              </button>

              <button 
                onClick={() => setIsMobileSortOpen(true)} 
                className="flex items-center gap-1.5 hover:text-[#047857] active:scale-95 transition-transform"
              >
                <ArrowUpDown size={14} className="text-[#047857]" />
                <span>Sort</span>
              </button>
            </div>
          )}


          {/* 4. FIXED BOTTOM NAVIGATION BAR (MATCHING IMAGE 1 & IMAGE 2) */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 py-2 px-3 flex items-center justify-around shadow-2xl pwa-safe-bottom">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'map', label: 'Map', icon: MapPin },
              { id: 'saved', label: 'Saved', icon: Heart },
              { id: 'ai_helper', label: 'AI Helper', icon: Bot },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((nav) => {
              const IconComp = nav.icon;
              const isActive = mobileActiveTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => {
                    setMobileActiveTab(nav.id as any);
                    if (nav.id === 'home') setMobileViewMode('feed');
                    else if (nav.id === 'map') setMobileViewMode('homes_map');
                    else if (nav.id === 'ai_helper') ctxValue.openChat({ title: "Fauji AI Helper" });
                    else if (nav.id === 'profile') setIsProfileModalOpen(true);
                  }}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                    isActive ? 'text-[#047857]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <IconComp size={20} className={isActive ? 'fill-[#047857]/10 stroke-[#047857]' : ''} />
                  <span className={`text-[10px] ${isActive ? 'font-black text-[#047857]' : 'font-semibold'}`}>{nav.label}</span>
                </button>
              );
            })}
          </div>

        </div>


        {/* =========================================================================
            MOBILE FILTER BOTTOM SHEET DIALOG (PREMIUM z-[999999] OVERLAY)
           ========================================================================= */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[999999] flex items-end justify-center">
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-t-[32px] px-6 pt-3 pb-8 border-t border-slate-200 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] z-10 flex flex-col gap-5 max-h-[88vh] overflow-y-auto scrollbar-none animate-slide-up">
              
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto shrink-0 mb-1" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Filter Properties</h3>
                  <p className="text-[11px] font-semibold text-slate-500">{filteredProperties.length} homes available</p>
                </div>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)} 
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rank filter */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Rank Eligibility</span>
                  {selectedRank !== 'All' && <span className="text-[11px] font-extrabold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded-full">{selectedRank}</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["All", "OR", "JCO", "Officers"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRank(r)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                        selectedRank === r
                          ? "bg-[#047857] text-white border-[#047857] shadow-md shadow-emerald-800/20 active:scale-95"
                          : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK filter */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">BHK Configuration</span>
                  {selectedBhk !== 'All' && <span className="text-[11px] font-extrabold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded-full">{selectedBhk}</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["All", "1BHK", "2BHK", "3BHK"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBhk(b)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                        selectedBhk === b
                          ? "bg-[#047857] text-white border-[#047857] shadow-md shadow-emerald-800/20 active:scale-95"
                          : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {b === "All" ? "All" : b.replace("BHK", " BHK")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range filter */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Budget Range</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "All", label: "All Budgets" },
                    { id: "under-15k", label: "Under ₹15,000" },
                    { id: "15k-20k", label: "₹15,000 - ₹20,000" },
                    { id: "over-20k", label: "Above ₹20,000" },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBudgetRange(bg.id)}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border ${
                        selectedBudgetRange === bg.id
                          ? "bg-[#047857] text-white border-[#047857] shadow-md shadow-emerald-800/20 active:scale-95"
                          : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Property Category</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All Types" },
                    { id: "family", label: "Family Homes" },
                    { id: "boys", label: "Boys / Bachelors" },
                    { id: "girls", label: "Girls Only" },
                    { id: "pg", label: "PG / Single Room" },
                    { id: "ssb", label: "SSB Stay" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`py-2.5 px-2 rounded-2xl text-[11px] font-bold transition-all border truncate ${
                        selectedCategory === cat.id
                          ? "bg-[#047857] text-white border-[#047857] shadow-md shadow-emerald-800/20 active:scale-95"
                          : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Action Sticky Bar */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2 mb-2">
                <button
                  onClick={() => {
                    setSelectedRank("All");
                    setSelectedBhk("All");
                    setSelectedBudgetRange("All");
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setIsMobileFilterOpen(false);
                    ctxValue.showToast("Filters reset", "ok");
                  }}
                  className="w-1/3 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 active:scale-95 transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setIsMobileFilterOpen(false);
                    ctxValue.showToast(`${filteredProperties.length} properties found`, "ok");
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#047857] to-[#065f46] text-white font-extrabold text-xs shadow-lg shadow-emerald-900/20 hover:opacity-95 active:scale-95 transition-all"
                >
                  Apply Filters ({filteredProperties.length})
                </button>
              </div>

            </div>
          </div>
        )}


        {/* =========================================================================
            MOBILE SORT BOTTOM SHEET DIALOG (PREMIUM z-[999999] OVERLAY)
           ========================================================================= */}
        {isMobileSortOpen && (
          <div className="fixed inset-0 z-[999999] flex items-end justify-center">
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" onClick={() => setIsMobileSortOpen(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-t-[32px] px-6 pt-3 pb-8 border-t border-slate-200 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] z-10 flex flex-col gap-4 animate-slide-up">
              
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto shrink-0 mb-1" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Sort Properties</h3>
                  <p className="text-[11px] font-semibold text-slate-500">Order your results</p>
                </div>
                <button 
                  onClick={() => setIsMobileSortOpen(false)} 
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 my-1">
                {[
                  { id: "relevance", label: "Relevance (Default)", desc: "Best matches first" },
                  { id: "price_low", label: "Price: Low to High", desc: "Most affordable listings" },
                  { id: "price_high", label: "Price: High to Low", desc: "Premium properties" },
                  { id: "rating", label: "Top Rated First", desc: "Highest user ratings" },
                ].map((opt) => {
                  const isSelected = mobileSort === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMobileSort(opt.id as any);
                        setIsMobileSortOpen(false);
                        ctxValue.showToast(`Sorted by ${opt.label}`, "ok");
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                        isSelected
                          ? "bg-emerald-50/90 border-[#047857] shadow-sm text-slate-900"
                          : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 text-slate-700"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-xs ${isSelected ? 'font-extrabold text-[#047857]' : 'font-bold text-slate-800'}`}>{opt.label}</span>
                        <span className="text-[10px] font-medium text-slate-400 mt-0.5">{opt.desc}</span>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0">
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        )}


        {/* =========================================================================
            MODALS DIALOGS
           ========================================================================= */}
        <Suspense fallback={null}>
          {isProfileModalOpen && (
            <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
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
