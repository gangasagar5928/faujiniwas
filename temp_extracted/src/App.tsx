import React, { useState } from "react";
import { PROPERTIES, FACILITIES } from "./data";
import { Property, Facility } from "./types";
import Header from "./components/Header";
import Map from "./components/Map";
import PropertyCard from "./components/PropertyCard";
import PropertyDetailsModal from "./components/PropertyDetailsModal";
import Chatbot from "./components/Chatbot";
import HRACalculator from "./components/HRACalculator";
import AuthModal from "./components/AuthModal";
import { Home, TrendingUp, Filter, Eye, ChevronDown, ChevronUp, Star, HelpCircle, School, Cross, Train, SlidersHorizontal } from "lucide-react";

export default function App() {
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("All");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("All");

  // User Profile state (Simulating active military login)
  const [userProfile, setUserProfile] = useState<{
    name: string;
    rank: string;
    basicPay: number;
  } | null>({
    name: "Kumar",
    rank: "Major",
    basicPay: 69400,
  }); // Pre-filled with an active Major for outstanding first-time UX!

  // Active calculator state
  const [calcRank, setCalcRank] = useState("Major");
  const [calcBasicPay, setCalcBasicPay] = useState(69400);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Property list with favorite state toggled locally
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Facility map layer toggles (Station Commute Zone, Army School, Military Hospital)
  const [facilityLayers, setFacilityLayers] = useState({
    station: true,
    school: true,
    hospital: true,
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filter properties based on active controls
  const filteredProperties = properties.filter((prop) => {
    // Search filter
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.cantonment.toLowerCase().includes(searchQuery.toLowerCase());

    // BHK filter
    const matchesBhk = selectedBhk === "All" || prop.type === selectedBhk;

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
    const matchesRank =
      selectedRank === "All" || prop.suitableRanks.includes(selectedRank);

    return matchesSearch && matchesBhk && matchesBudget && matchesRank;
  });

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
    if (rank !== "All") {
      setCalcRank(rank);
    }
  };

  const handleAuthSuccess = (profile: { name: string; rank: string; basicPay: number }) => {
    setUserProfile(profile);
    setCalcRank(profile.rank);
    setCalcBasicPay(profile.basicPay);
    setSelectedRank(profile.rank); // auto filter properties by their rank
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setSelectedRank("All");
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-slate-900 text-slate-800 font-sans antialiased">
      {/* 1. Map is the full-screen absolute background! */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Map
          properties={filteredProperties}
          selectedProperty={selectedProperty}
          onSelectProperty={setSelectedProperty}
          facilities={FACILITIES}
          activeFacilityTypes={facilityLayers}
        />
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
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 3. Left Floating Sidebar Panel (Properties list & HRA computations) */}
      <div className="absolute top-24 left-4 bottom-4 w-[360px] max-h-[calc(100vh-7.5rem)] z-40 flex flex-col gap-3 pointer-events-none">
        {/* Mockup Stats Panel at top of list */}
        <div className="grid grid-cols-2 gap-2 w-full pointer-events-auto shrink-0 select-none">
          <div className="backdrop-blur-md bg-slate-950/75 text-white rounded-2xl p-2.5 flex items-center justify-center gap-2 border border-white/10 shadow-lg">
            <div className="p-1 rounded bg-emerald-800/60 text-emerald-300">
              <Home size={12} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total Listings</span>
              <span className="font-bold text-xs text-slate-100 leading-tight mt-0.5">1,706 units</span>
            </div>
          </div>
          <div className="backdrop-blur-md bg-slate-950/75 text-white rounded-2xl p-2.5 flex items-center justify-center gap-2 border border-white/10 shadow-lg">
            <div className="p-1 rounded bg-emerald-800/60 text-emerald-300">
              <TrendingUp size={12} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Average Rent</span>
              <span className="font-bold text-xs text-slate-100 leading-tight mt-0.5">₹12 K / mo</span>
            </div>
          </div>
        </div>

        {/* Collapsible HRA Calculator Tool inside sidebar */}
        <div className="w-full pointer-events-auto shrink-0">
          <button
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className="w-full py-2.5 px-4 bg-slate-950/90 text-slate-200 rounded-xl hover:bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-bold flex items-center justify-between shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-emerald-400" />
              <span>7th CPC HRA Calculator</span>
            </div>
            {isCalculatorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isCalculatorOpen && (
            <div className="mt-2.5 animate-slide-down">
              <HRACalculator
                selectedRank={calcRank}
                onRankSelect={(rank) => {
                  setCalcRank(rank);
                  setSelectedRank(rank); // auto filters list
                }}
                basicPay={calcBasicPay}
                onBasicPayChange={setCalcBasicPay}
              />
            </div>
          )}
        </div>

        {/* Listings count and reset */}
        <div className="flex items-center justify-between text-xs font-semibold px-3 py-2 bg-slate-950/85 backdrop-blur-md text-white rounded-xl border border-white/10 pointer-events-auto shrink-0 shadow-lg">
          <span className="text-slate-200">
            Matches ({filteredProperties.length})
          </span>
          {(selectedRank !== "All" || selectedBhk !== "All" || selectedBudgetRange !== "All" || searchQuery !== "") && (
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
          )}
        </div>

        {/* Properties Scroll List (Translucent cards matching mockup) */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 pointer-events-auto scrollbar-thin">
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
                Try clearing active filters or searching for other keywords in Patna Cantt.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Right Floating Overlay: Nearby Facilities (Toggles layers on Map!) */}
      <div className="absolute top-24 right-4 z-40 w-64 bg-slate-950/85 backdrop-blur-md text-white rounded-3xl p-5 border border-white/10 shadow-2xl text-left flex flex-col gap-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-white/5 pb-2">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span>Nearby Facilities</span>
        </h3>

        {/* Checkboxes matching mockup */}
        <div className="flex flex-col gap-3 text-xs font-medium text-slate-200">
          {/* Station Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group hover:text-white select-none">
            <input
              type="checkbox"
              checked={facilityLayers.station}
              onChange={(e) =>
                setFacilityLayers((prev) => ({ ...prev, station: e.target.checked }))
              }
              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500 cursor-pointer text-indigo-600"
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
              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer text-blue-600"
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
              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-red-500 focus:ring-red-500 cursor-pointer text-red-600"
            />
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-red-500 text-white shadow-md">
                <Cross size={11} className="text-white" fill="white" />
              </div>
              <span className="group-hover:translate-x-0.5 transition-transform text-[11px]">Military Hospital</span>
            </div>
          </label>
        </div>
      </div>

      {/* 5. Server-Side Gemini Chatbot Integration */}
      <Chatbot
        userProfile={userProfile}
        onFilterRank={handleRankFilterChange}
      />

      {/* 6. Auth Modal Dialog */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 7. Property Detail Slideover modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}
