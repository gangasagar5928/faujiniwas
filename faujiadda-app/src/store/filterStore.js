import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useFilterStore = create((set) => ({
  // Listings
  listings: [],
  setListings: (listings) => set({ listings }),

  // View
  activeView: 'rentals', // 'rentals' | 'market' | 'dorms' | 'saved'
  setActiveView: (v) => set({ activeView: v }),

  // Filters
  typeFilter: 'all',
  smartSearchQ: '',
  sortPref: 'new',
  maxPrice: 100000,
  furnishFilter: 'all',
  availFilter: 'all',
  sqftFilter: 'all',
  ownerFilter: 'all',
  termFilter: 'all',
  bhkFilter: 'all',
  petFilter: 'all',
  showCommuteZones: false,
  showHospitals: false,
  showSchools: false,

  setTypeFilter: (v) => set({ typeFilter: v }),
  setSmartSearchQ: (v) => set({ smartSearchQ: v.toLowerCase().trim() }),
  setSortPref: (v) => set({ sortPref: v }),
  setMaxPrice: (v) => set({ maxPrice: Number(v) }),
  setFurnishFilter: (v) => set({ furnishFilter: v }),
  setAvailFilter: (v) => set({ availFilter: v }),
  setSqftFilter: (v) => set({ sqftFilter: v }),
  setOwnerFilter: (v) => set({ ownerFilter: v }),
  setTermFilter: (v) => set({ termFilter: v }),
  setBhkFilter: (v) => set({ bhkFilter: v }),
  setPetFilter: (v) => set({ petFilter: v }),
  setShowCommuteZones: (v) => set({ showCommuteZones: v }),
  setShowHospitals: (v) => set({ showHospitals: v }),
  setShowSchools: (v) => set({ showSchools: v }),

  resetAdvancedFilters: () => set({
    furnishFilter: 'all', availFilter: 'all', sqftFilter: 'all',
    ownerFilter: 'all', termFilter: 'all', bhkFilter: 'all', petFilter: 'all'
  }),

  // State
  draftCoords: { lat: 22.5, lng: 82.0 },
  setDraftCoords: (coords) => set({ draftCoords: coords }),

  currentReportId: null,
  setCurrentReportId: (id) => set({ currentReportId: id }),
}));

// Derived: filtered + sorted listings
export function getFilteredListings(state) {
  const now = Date.now();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  const isMarket = state.activeView === 'market';
  const isSaved = state.activeView === 'saved';
  const savedIds = isSaved ? useUserStore.getState().wishlist : [];

  let filtered = state.listings.filter((r) => {
    if (isSaved && !savedIds.includes(r.id)) return false;
    if (isMarket && r._collection !== 'market') return false;
    if (!isMarket && !isSaved && r._collection !== 'rentals') return false;
    if ((r.reportCount || 0) >= 3) return false;
    if (state.maxPrice < 100000 && r.price > state.maxPrice) return false;

    const typeOk = state.typeFilter === 'all' || r.type === state.typeFilter;
    const searchOk =
      !state.smartSearchQ ||
      r.name?.toLowerCase().includes(state.smartSearchQ) ||
      r.area?.toLowerCase().includes(state.smartSearchQ) ||
      r.city?.toLowerCase().includes(state.smartSearchQ);

    const furnishOk =
      state.furnishFilter === 'all' ||
      (r.furnishing || r.furnish || '').toLowerCase() === state.furnishFilter.toLowerCase();

    let availOk = true;
    if (state.availFilter === 'now') {
      availOk = !r.available || r.available === '' || new Date(r.available) <= new Date();
    } else if (state.availFilter === '3mo') {
      availOk =
        !r.available ||
        r.available === '' ||
        new Date(r.available) - new Date() <= threeMonths;
    }

    const sqft = parseInt(r.sqft) || 0;
    let sqftOk = true;
    if (state.sqftFilter === 'lt500') sqftOk = sqft > 0 && sqft < 500;
    else if (state.sqftFilter === '500to1000') sqftOk = sqft >= 500 && sqft <= 1000;
    else if (state.sqftFilter === 'gt1000') sqftOk = sqft > 1000;

    const ownerOk =
      state.ownerFilter === 'all' ||
      (state.ownerFilter === 'defence' && r.ownerType === 'defence') ||
      (state.ownerFilter === 'nobroker' && r.ownerType !== 'broker');

    const termOk = state.termFilter === 'all' || r.term === state.termFilter;
    
    const bhkOk = state.bhkFilter === 'all' || r.bhk === state.bhkFilter;
    const petOk = state.petFilter === 'all' || (state.petFilter === 'yes' ? r.petFriendly : !r.petFriendly);

    return typeOk && searchOk && furnishOk && availOk && sqftOk && ownerOk && termOk && bhkOk && petOk;
  });

  filtered.sort((a, b) => {
    if (state.sortPref === 'priceAsc') return a.price - b.price;
    if (state.sortPref === 'priceDesc') return b.price - a.price;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return filtered;
}
