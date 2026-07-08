import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './userStore';

export const useFilterStore = create(
  persist(
    (set) => ({
      // Listings
      listings: [],
      isPending: false,
      setIsPending: (v) => set({ isPending: v }),
      setListings: (listings) => {
        set({ listings });
        if (typeof window !== 'undefined') {
          window.state = window.state || {};
          window.state.listings = listings;
        }
      },

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
      categoryFilter: 'all',
      showCommuteZones: true,
      showHospitals: true,
      showSchools: true,
      showCanteens: true,
      sidebarOpen: true,

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
      setCategoryFilter: (v) => set({ categoryFilter: v }),
      setShowCommuteZones: (v) => set({ showCommuteZones: v }),
      setShowHospitals: (v) => set({ showHospitals: v }),
      setShowSchools: (v) => set({ showSchools: v }),
      setShowCanteens: (v) => set({ showCanteens: v }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),

      resetAdvancedFilters: () => set({
        furnishFilter: 'all', availFilter: 'all', sqftFilter: 'all',
        ownerFilter: 'all', termFilter: 'all', bhkFilter: 'all', petFilter: 'all',
        categoryFilter: 'all'
      }),

      // State
      draftCoords: { lat: 22.5, lng: 82.0 },
      setDraftCoords: (coords) => set({ draftCoords: coords }),

      currentReportId: null,
      setCurrentReportId: (id) => set({ currentReportId: id }),
    }),
    {
      name: 'fauji_filters_v2',
      partialize: (state) => ({
        activeView: state.activeView,
        typeFilter: state.typeFilter,
        smartSearchQ: state.smartSearchQ,
        sortPref: state.sortPref,
        maxPrice: state.maxPrice,
        furnishFilter: state.furnishFilter,
        availFilter: state.availFilter,
        sqftFilter: state.sqftFilter,
        ownerFilter: state.ownerFilter,
        termFilter: state.termFilter,
        bhkFilter: state.bhkFilter,
        petFilter: state.petFilter,
        categoryFilter: state.categoryFilter,
        draftCoords: state.draftCoords,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Derived: filtered + sorted listings
export function getFilteredListings(state) {
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  const isMarket = state.activeView === 'market';
  const isSaved = state.activeView === 'saved';
  const savedIds = isSaved ? useUserStore.getState().wishlist : [];
  const isMarketListing = (r) => r._collection === 'market' || r._collection === 'marketplace';

  let filtered = state.listings.filter((r) => {
    if (isSaved && !savedIds.includes(r.id)) return false;
    if (isMarket && !isMarketListing(r)) return false;
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
    const categoryOk = state.categoryFilter === 'all' || r.category === state.categoryFilter;

    return typeOk && searchOk && furnishOk && availOk && sqftOk && ownerOk && termOk && bhkOk && petOk && categoryOk;
  });

  filtered.sort((a, b) => {
    if (state.sortPref === 'priceAsc') return a.price - b.price;
    if (state.sortPref === 'priceDesc') return b.price - a.price;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return filtered;
}
