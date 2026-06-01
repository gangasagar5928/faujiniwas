import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      seen: [],
      contacted: [],
      rank: 'OR', // 'OR' | 'JCO' | 'Officer'
      setRank: (rank) => set({ rank }),
      toggleWishlist: (id) => {
        const { wishlist } = get();
        if (wishlist.includes(id)) {
          set({ wishlist: wishlist.filter(x => x !== id) });
        } else {
          set({ wishlist: [...wishlist, id] });
        }
      },
      addSeen: (id) => {
        const { seen } = get();
        if (!seen.includes(id)) {
          set({ seen: [id, ...seen].slice(0, 50) }); // Keep last 50
        }
      },
      addContacted: (id) => {
        const { contacted } = get();
        if (!contacted.includes(id)) {
          set({ contacted: [id, ...contacted] });
        }
      },
      comparison: [],
      toggleComparison: (id) => {
        const { comparison } = get();
        if (comparison.includes(id)) {
          set({ comparison: comparison.filter(x => x !== id) });
        } else {
          set({ comparison: [...comparison, id].slice(-2) }); // Keep last 2
        }
      }
    }),
    { name: 'faujiniwas-user-prefs' }
  )
);
