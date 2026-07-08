import { useContext, useState, useMemo } from 'react';
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
    setSidebarOpen
  } = useFilterStore();

  const allState = useFilterStore((s) => s);
  const listings = getFilteredListings(allState);

  // Local state for category filters
  const [activeChip, setActiveChip] = useState('all');

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
    }
    return result;
  }, [items, activeChip]);

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
  };

  return (
    <aside className={`sidebar ${activeMobileView ? 'active-mobile-view' : ''} flex flex-col h-full bg-transparent text-left border-none`}>
      
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
          <button className="flex-1 py-3 text-white border-b-2 border-[#22c55e] cursor-pointer">
            Find Accommodation
          </button>
          <button className="flex-1 py-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" onClick={() => alert("Advanced search panel is restricted to commander access.")}>
            Advanced Search
          </button>
        </div>

        {/* Tactical Search & Filters */}
        <div className="flex flex-col gap-3">
          {/* Search bar input with magnifier on the left and crosshairs on the right */}
          <div className="flex items-center bg-[#090d16] border border-[#1e293b] px-3.5 py-2.5 rounded-xl hover:border-amber-500/30 focus-within:border-amber-500/50 transition-colors duration-200">
            <span className="text-slate-500 mr-2.5 text-xs select-none">🔍</span>
            <input 
              type="text" 
              placeholder="Search cantonment, area or city..." 
              value={smartSearchQ}
              onChange={(e) => setSmartSearchQ(e.target.value)}
              className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-500 font-medium"
            />
            <button className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs select-none" title="Locate Cantonment Base" onClick={() => alert("Locating nearest cantonment boundaries...")}>
              🎯
            </button>
          </div>

          {/* Budget Tier, BHK Size and Budget Type dropdowns */}
          <div className="flex items-center gap-2">
            
            {/* Rank/Allowance Selection */}
            <div className="relative flex-1">
              <select 
                value={getHraValue()}
                onChange={handleHraChange}
                className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2.5 py-2.5 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
              >
                <option value="Officer">👤 Officer</option>
                <option value="JCO">👤 JCO</option>
                <option value="OR">👤 OR</option>
              </select>
            </div>

            {/* BHK Selection */}
            <div className="relative flex-1">
              <select 
                value={bhkFilter}
                onChange={(e) => setBhkFilter(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2.5 py-2.5 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
              >
                <option value="all">All BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3+">3+ BHK</option>
              </select>
            </div>

            {/* Budget range selection placeholder */}
            <div className="relative flex-1">
              <select 
                className="w-full bg-[#090d16] border border-[#1e293b] text-slate-300 text-[10px] px-2.5 py-2.5 rounded-xl outline-none cursor-pointer font-bold uppercase hover:border-amber-500/30 transition-colors"
                defaultValue="budget"
              >
                <option value="budget">Budget</option>
                <option value="low">Low &lt;15k</option>
                <option value="mid">Mid 15-30k</option>
                <option value="high">High 30k+</option>
              </select>
            </div>

            {/* Filters Slider button toggle */}
            <button 
              onClick={handleResetFilters}
              className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#090d16] border border-[#1e293b] rounded-xl hover:border-[#fbbf24] hover:bg-[#18233c] text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Reset Filters"
            >
              ⚙️
            </button>

          </div>
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
            <span className="px-2 py-0.5 bg-[#10192e] border border-[#1e293b] text-slate-300 rounded flex items-center gap-1 font-bold">
              Family <span className="cursor-pointer text-slate-500 hover:text-red-400">✕</span>
            </span>
            <span className="px-2 py-0.5 bg-[#10192e] border border-[#1e293b] text-slate-300 rounded flex items-center gap-1 font-bold">
              Verified <span className="cursor-pointer text-slate-500 hover:text-red-400">✕</span>
            </span>
          </div>
          <button 
            onClick={handleResetFilters}
            className="text-[#22c55e] hover:text-[#fbbf24] font-black uppercase hover:underline transition-colors shrink-0 cursor-pointer"
          >
            Clear All
          </button>
        </div>

      </div>

      {/* Results details row */}
      <div className="px-5 py-3 border-b border-[#1e293b] flex items-center justify-between text-[9px] font-mono select-none bg-[#090d16]/30">
        <span className="text-slate-400 font-black uppercase">{count.toLocaleString()} Results</span>
        <div className="flex items-center gap-1">
          <span className="text-slate-500 uppercase font-extrabold">Sort By:</span>
          <select className="bg-transparent text-slate-300 outline-none font-bold uppercase cursor-pointer border-none py-0.5">
            <option value="rel">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Scrollable Listings Viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {filteredItems.map(r => (
          <ListingCard 
            key={r.id}
            r={r}
            onClick={() => ctx.openDetail && ctx.openDetail(r)}
          />
        ))}

        {/* Load More listings button */}
        <div className="pt-2 pb-6 flex justify-center">
          <button 
            onClick={() => alert("Loading more secure military listings...")}
            className="flex items-center gap-1.5 px-6 py-3 border border-[#1e293b] hover:border-[#fbbf24]/50 hover:bg-[#18233c] text-slate-300 hover:text-white transition-all cursor-pointer rounded-xl font-bold uppercase tracking-wider text-[9px] font-mono shadow-sm"
          >
            🔄 Load More Listings
          </button>
        </div>
      </div>

    </aside>
  );
}
