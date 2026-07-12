import { useContext, useState, useMemo, useEffect } from 'react';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import { ModalContext } from '../../App';
import ListingCard from './ListingCard';
import MarketCard from './MarketCard';
import DormCard from './DormCard';

export default function Sidebar({ activeMobileView }) {
  const ctx = useContext(ModalContext);

  // Zustand store bindings
  const {
    activeView, setActiveView,
    smartSearchQ, setSmartSearchQ,
    maxPrice, setMaxPrice,
    bhkFilter, setBhkFilter,
    setSidebarOpen,
    sortPref, setSortPref,
    furnishFilter, setFurnishFilter,
    availFilter, setAvailFilter,
    sqftFilter, setSqftFilter,
    ownerFilter, setOwnerFilter,
    petFilter, setPetFilter,
    categoryFilter, setCategoryFilter,
    resetAdvancedFilters,
    isPending
  } = useFilterStore();

  const allState = useFilterStore((s) => s);
  const listings = getFilteredListings(allState);

  // Local state for category filters and advanced search tab
  const [activeChip, setActiveChip] = useState('all');
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [savedTab, setSavedTab] = useState('wishlist'); // wishlist, searches

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fn_saved_searches') || '[]');
      setSavedSearches(saved);
    } catch (e) {
      setSavedSearches([]);
    }
  }, [activeChip, activeView]);

  const items = useMemo(() => activeView === 'dorms' ? SSB_DORMS : listings, [activeView, listings]);

  // Apply category chip filtering dynamically
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeChip === 'cantt') {
      result = result.filter(i => i.name?.toLowerCase().includes('cantt') || i.area?.toLowerCase().includes('cantt'));
    } else if (activeChip === 'near_base') {
      result = result.filter(i => (i.distance || 0) <= 2.0);
    } else if (activeChip === 'family') {
      result = result.filter(i => i.type === 'flat' || i.type === 'villa');
    } else if (activeChip === 'room') {
      result = result.filter(i => i.type === 'room');
    } else if (activeChip === 'verified') {
      result = result.filter(i => i.verified);
    } else if (activeChip === 'ai_matches') {
      // AI recommendations based on rank and HRA limits
      const safeLimit = Number(maxPrice) || 30000;
      const limit = safeLimit < 100000 ? safeLimit : 30000;
      result = result.filter(i => i.price <= limit && i.price >= limit * 0.55 && i.verified);
    }
    return result;
  }, [items, activeChip, maxPrice]);

  // Featured listings section (top verified picks)
  const featuredItems = useMemo(() => {
    if (activeView !== 'rentals') return [];
    return listings.filter(i => i.verified && i.price >= 12000).slice(0, 3);
  }, [listings, activeView]);

  const count = filteredItems.length;

  const handleHraChange = (e) => {
    const val = e.target.value;
    if (val === 'OR') {
      setMaxPrice(15000);
    } else if (val === 'JCO') {
      setMaxPrice(30000);
    } else if (val === 'Officer') {
      setMaxPrice(100000);
    } else {
      setMaxPrice(100000);
    }
  };

  const getHraValue = () => {
    if (maxPrice <= 15000) return 'OR';
    if (maxPrice <= 30000) return 'JCO';
    return 'Officer';
  };

  const handleResetFilters = () => {
    setMaxPrice(100000);
    setBhkFilter('all');
    setActiveChip('all');
    setSmartSearchQ('');
    resetAdvancedFilters();
  };

  const saveSearchQuery = () => {
    try {
      if (!smartSearchQ && bhkFilter === 'all' && maxPrice >= 100000 && furnishFilter === 'all') {
        ctx.showToast('Please select some filters or search query first! ⚠️', 'err');
        return;
      }
      const label = smartSearchQ
        ? `Search: "${smartSearchQ}" (${bhkFilter !== 'all' ? bhkFilter + 'BHK' : 'Any BHK'})`
        : `Filters: ${bhkFilter !== 'all' ? bhkFilter + 'BHK' : 'BHK'} Under ₹${(maxPrice / 1000).toFixed(0)}k`;

      const current = {
        id: Date.now(),
        label,
        q: smartSearchQ,
        bhk: bhkFilter,
        price: maxPrice,
        furnish: furnishFilter
      };

      const saved = JSON.parse(localStorage.getItem('fn_saved_searches') || '[]');
      saved.push(current);
      localStorage.setItem('fn_saved_searches', JSON.stringify(saved));
      setSavedSearches(saved);
      ctx.showToast('Search filters saved successfully! 💾', 'ok');
    } catch (e) {
      ctx.showToast('Could not save search.', 'err');
    }
  };

  const applySavedSearch = (search) => {
    setSmartSearchQ(search.q || '');
    setBhkFilter(search.bhk || 'all');
    setMaxPrice(search.price || 100000);
    setFurnishFilter(search.furnish || 'all');
    ctx.showToast('Saved filters applied! ⚡', 'ok');
  };

  const deleteSavedSearch = (id, e) => {
    e.stopPropagation();
    try {
      const updated = savedSearches.filter(s => s.id !== id);
      localStorage.setItem('fn_saved_searches', JSON.stringify(updated));
      setSavedSearches(updated);
      ctx.showToast('Saved search removed.', 'info');
    } catch {
      ctx.showToast('Failed to delete.', 'err');
    }
  };

  return (
    <aside className={`sidebar ${activeMobileView ? 'active-mobile-view' : ''} flex flex-col h-full bg-[#070b13] text-left border-r border-[#1e293b]`}>

      {/* Top Fixed Control Panel */}
      <div className="p-5 border-b border-[#1e293b] flex flex-col gap-4 shrink-0 relative">

        {/* Sidebar Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3.5 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer text-xs font-bold z-20"
          title="Close Sidebar"
        >
          ✕
        </button>

        {/* Find Accommodation / Advanced Search Tabs */}
        <div className="flex border-b border-[#1e293b] select-none text-[10px] font-black uppercase tracking-wider -mx-5 -mt-5 pr-10">
          <button
            onClick={() => setIsAdvanced(false)}
            className={`flex-1 py-3 cursor-pointer text-center transition-all ${!isAdvanced
                ? 'text-white border-b-2 border-[#fbbf24] font-black'
                : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Find Accommodation
          </button>
          <button
            onClick={() => setIsAdvanced(true)}
            className={`flex-1 py-3 cursor-pointer text-center transition-all ${isAdvanced
                ? 'text-white border-b-2 border-[#fbbf24] font-black'
                : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Advanced Search
          </button>
        </div>

        {/* Tactical Search & Filters */}
        <div className="flex flex-col gap-3">
          {isAdvanced ? (
            <div className="flex flex-col gap-3.5 animation-fade-in">
              {/* Row 1: Furnishing & Availability */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 font-mono">Furnishing</label>
                  <select
                    value={furnishFilter}
                    onChange={(e) => setFurnishFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2 py-2 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                  >
                    <option value="all">Any Furnishing</option>
                    <option value="furnished">Fully Furnished</option>
                    <option value="semi">Semi Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 font-mono">Availability</label>
                  <select
                    value={availFilter}
                    onChange={(e) => setAvailFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2 py-2 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                  >
                    <option value="all">Any Date</option>
                    <option value="now">Available Now</option>
                    <option value="3mo">Next 3 Months</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Property Size (Sqft) & Listing Owner */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 font-mono">Size (Sq.Ft)</label>
                  <select
                    value={sqftFilter}
                    onChange={(e) => setSqftFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2 py-2 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                  >
                    <option value="all">Any Size</option>
                    <option value="lt500">Under 500</option>
                    <option value="500to1000">500 - 1000</option>
                    <option value="gt1000">1000+</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 font-mono">Verified Owner</label>
                  <select
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2 py-2 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                  >
                    <option value="all">Any Owner</option>
                    <option value="defence">Defence Personnel</option>
                    <option value="nobroker">No Broker (Direct)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Pet Friendly & Category */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 font-mono">Pet Policy</label>
                  <select
                    value={petFilter}
                    onChange={(e) => setPetFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2 py-2 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                  >
                    <option value="all">Any Policy</option>
                    <option value="yes">Pet Friendly Only</option>
                    <option value="no">No Pets Allowed</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 font-mono">Fauji Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2 py-2 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                  >
                    <option value="all">Any Category</option>
                    <option value="officer">Officer Quotas</option>
                    <option value="jco">JCO Quotas</option>
                    <option value="or">OR Quotas</option>
                  </select>
                </div>
              </div>

              {/* Reset / Apply Actions */}
              <div className="flex gap-2 mt-1 select-none">
                <button
                  onClick={resetAdvancedFilters}
                  className="flex-1 py-2 bg-[#10192e] border border-[#1e293b] hover:border-red-500/40 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Clear Advanced
                </button>
                <button
                  onClick={() => setIsAdvanced(false)}
                  className="flex-1 py-2 bg-[#fbbf24] text-black text-[10px] font-extrabold rounded-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Apply & View
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search bar input */}
              <div className="flex items-center bg-[#090d16] border border-[#1e293b] px-3.5 py-2.5 rounded-xl hover:border-amber-500/30 focus-within:border-amber-500/50 transition-colors duration-200">
                <span className="text-slate-500 mr-2.5 text-xs select-none">🔍</span>
                <input
                  type="text"
                  placeholder="Search cantonment, area or city..."
                  value={smartSearchQ}
                  onChange={(e) => setSmartSearchQ(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-500 font-medium"
                />
                <button className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs select-none mr-2" title="Locate Cantonment Base" onClick={() => alert("Locating nearest cantonment boundaries...")}>
                  🎯
                </button>
                <button
                  className="text-[#fbbf24] hover:text-white transition-colors cursor-pointer text-[10px] font-black uppercase shrink-0"
                  title="Save Search Filters"
                  onClick={saveSearchQuery}
                >
                  💾 Save
                </button>
              </div>

              {/* Budget Tier and BHK Size dropdowns */}
              <div className="flex items-center gap-2">

                {/* Rank/Allowance Selection */}
                <div className="relative flex-1">
                  <select
                    value={getHraValue()}
                    onChange={handleHraChange}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2.5 py-2.5 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-[#fbbf24]/30 transition-colors"
                  >
                    <option value="Officer">Officer</option>
                    <option value="JCO">JCO</option>
                    <option value="OR">OR</option>
                  </select>
                </div>

                {/* BHK Selection */}
                <div className="relative flex-1">
                  <select
                    value={bhkFilter}
                    onChange={(e) => setBhkFilter(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2.5 py-2.5 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-[#fbbf24]/30 transition-colors"
                  >
                    <option value="all">ALL BHK</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3+">3+ BHK</option>
                  </select>
                </div>

                {/* Reset Filters Icon */}
                <button
                  onClick={handleResetFilters}
                  className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#090d16] border border-[#1e293b] rounded-xl hover:border-[#fbbf24] hover:bg-[#18233c] text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Reset Filters"
                >
                  ⚙️
                </button>

              </div>
            </>
          )}
        </div>

        {/* Active Filters row */}
        <div className="flex items-center justify-between text-[9px] font-mono select-none mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-extrabold uppercase">Active Filters:</span>
            {maxPrice < 100000 && (
              <span className="px-2 py-0.5 bg-[#10192e] border border-[#1e293b] text-slate-300 rounded flex items-center gap-1 font-bold">
                {getHraValue()} <span className="cursor-pointer text-slate-500 hover:text-red-400" onClick={() => setMaxPrice(100000)}>✕</span>
              </span>
            )}
            {bhkFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-[#10192e] border border-[#1e293b] text-slate-300 rounded flex items-center gap-1 font-bold">
                {bhkFilter} BHK <span className="cursor-pointer text-slate-500 hover:text-red-400" onClick={() => setBhkFilter('all')}>✕</span>
              </span>
            )}
            {furnishFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-[#10192e] border border-[#1e293b] text-slate-300 rounded flex items-center gap-1 font-bold capitalize">
                {furnishFilter} <span className="cursor-pointer text-slate-500 hover:text-red-400" onClick={() => setFurnishFilter('all')}>✕</span>
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[#fbbf24] hover:text-white font-black uppercase hover:underline transition-colors shrink-0 cursor-pointer"
          >
            Clear All
          </button>
        </div>

      </div>

      {/* View Switcher Chips (rentals/market) */}
      <div className="px-4 py-2 flex gap-1.5 overflow-x-auto shrink-0 select-none bg-[#0a0f1d] border-b border-[#1e293b] custom-scrollbar">
        {[
          { id: 'all', label: 'All Listings' },
          { id: 'ai_matches', label: '🤖 AI Matches' },
          { id: 'verified', label: '🎖️ Verified' },
          { id: 'near_base', label: '🚶 Near Base' },
          { id: 'cantt', label: '🪖 Cantt Area' },
          { id: 'family', label: '🏡 Family Flats' }
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setActiveChip(chip.id)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${activeChip === chip.id
                ? 'bg-[#fbbf24] text-black font-extrabold shadow-md'
                : 'bg-[#10192e] text-slate-400 border border-[#1e293b] hover:text-white'
              }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Results details row */}
      <div className="px-5 py-3 border-b border-[#1e293b] flex items-center justify-between text-[9px] font-mono select-none bg-[#090d16]/30">
        <span className="text-slate-400 font-black uppercase">{count.toLocaleString()} Results</span>
        <div className="flex items-center gap-1">
          <span className="text-slate-500 uppercase font-extrabold">Sort By:</span>
          <select
            value={sortPref}
            onChange={(e) => setSortPref(e.target.value)}
            className="bg-transparent text-slate-300 outline-none font-bold uppercase cursor-pointer border-none py-0.5"
          >
            <option value="new">Relevance</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Wishlist vs Saved Searches Tabs if activeView is 'saved' */}
      {activeView === 'saved' && (
        <div className="flex border-b border-[#1e293b] shrink-0 text-[10px] font-bold select-none bg-[#0a0f1d]">
          <button
            className={`flex-1 py-2 text-center cursor-pointer transition-all ${savedTab === 'wishlist' ? 'text-white border-b border-[#fbbf24]' : 'text-slate-500'}`}
            onClick={() => setSavedTab('wishlist')}
          >
            Shortlist ({count})
          </button>
          <button
            className={`flex-1 py-2 text-center cursor-pointer transition-all ${savedTab === 'searches' ? 'text-white border-b border-[#fbbf24]' : 'text-slate-500'}`}
            onClick={() => setSavedTab('searches')}
          >
            Saved Searches ({savedSearches.length})
          </button>
        </div>
      )}

      {/* Scrollable Listings Viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#070b13]/40">

        {isPending ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-[#10192e]/40 border border-[#1e293b] rounded-2xl animate-pulse flex flex-col gap-3">
                <div className="h-28 w-full bg-[#1e293b]/40 rounded-xl" />
                <div className="h-4 w-2/3 bg-[#1e293b]/40 rounded" />
                <div className="h-3 w-1/3 bg-[#1e293b]/40 rounded" />
                <div className="flex gap-2">
                  <div className="h-3 w-12 bg-[#1e293b]/40 rounded" />
                  <div className="h-3 w-12 bg-[#1e293b]/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activeView === 'saved' && savedTab === 'searches' ? (
          <div className="space-y-3">
            {savedSearches.map(s => (
              <div
                key={s.id}
                onClick={() => applySavedSearch(s)}
                className="p-3 bg-[#10192e] border border-[#1e293b] rounded-xl cursor-pointer hover:border-[#fbbf24]/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-white font-bold">📂 {s.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    BHK: {s.bhk} · Price: {s.price >= 100000 ? 'Any' : `₹${s.price.toLocaleString()}`} · Furnish: {s.furnish}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteSavedSearch(s.id, e)}
                  className="text-slate-500 hover:text-red-400 p-1 text-xs"
                  title="Remove Saved Search"
                >
                  ✕
                </button>
              </div>
            ))}
            {savedSearches.length === 0 && (
              <div className="text-slate-500 text-center py-8 text-xs italic">
                No saved searches yet. Click "💾 Save" in search bar to save search configurations.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* AI Matches Banner */}
            {activeChip === 'ai_matches' && (
              <div className="p-3 bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-xl mb-4 text-left">
                <div className="text-xs font-bold text-[#fbbf24] flex items-center gap-1.5">
                  🤖 AI Matchmaker Active
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Filtering high-trust, verified listings matching HRA limits for <b>{getHraValue()}</b> rank budget curves.
                </p>
              </div>
            )}

            {/* Featured Listings Scrollable Slider */}
            {featuredItems.length > 0 && activeChip === 'all' && (
              <div className="mb-6">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2 font-mono flex items-center gap-1.5">
                  ⭐ Featured Verified Listings
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 custom-scrollbar snap-x">
                  {featuredItems.map(item => (
                    <div
                      key={`featured-${item.id}`}
                      onClick={() => ctx.openDetail && ctx.openDetail(item)}
                      className="w-64 shrink-0 snap-start bg-[#10192e]/80 border border-[#fbbf24]/30 hover:border-[#fbbf24]/60 p-3 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-md backdrop-blur-md"
                    >
                      <div className="h-28 w-full rounded-xl overflow-hidden relative mb-2.5">
                        <img
                          src={item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=75'}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#fbbf24] text-black text-[8px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                          Featured
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur">
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-1">📍 {item.area}, {item.city}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Listings loop */}
            {filteredItems.map(r => {
              if (activeView === 'dorms') {
                return (
                  <DormCard
                    key={r.id}
                    dorm={r}
                    onFoodClick={(city) => ctx.openFood(city)}
                  />
                );
              } else if (activeView === 'market') {
                return (
                  <MarketCard
                    key={r.id}
                    item={r}
                    onClick={() => ctx.openDetail && ctx.openDetail(r)}
                  />
                );
              } else {
                return (
                  <ListingCard
                    key={r.id}
                    listing={r}
                    onClick={() => ctx.openDetail && ctx.openDetail(r)}
                  />
                );
              }
            })}

            {filteredItems.length === 0 && (
              <div className="text-slate-500 text-center py-12 text-xs italic">
                No matching accommodations found. Adjust filters or search phrase.
              </div>
            )}

            {/* Load More listings button */}
            {filteredItems.length > 0 && (
              <div className="pt-2 pb-6 flex justify-center">
                <button
                  onClick={() => alert("Loading more secure military listings...")}
                  className="flex items-center gap-1.5 px-6 py-3 border border-[#1e293b] hover:border-[#fbbf24]/50 hover:bg-[#18233c] text-slate-300 hover:text-white transition-all cursor-pointer rounded-xl font-bold uppercase tracking-wider text-[9px] font-mono shadow-sm"
                >
                  🔄 Load More Listings
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </aside>
  );
}
