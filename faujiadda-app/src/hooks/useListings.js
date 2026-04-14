import { useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../firebase';
import { useFilterStore } from '../store/filterStore';

import { PITCH_LISTINGS } from '../pitch_data';

// Stable random distance fallback per listing (avoids re-shuffling on re-render)
const _distCache = new Map();

export function useListings() {
  const setListings = useFilterStore((s) => s.setListings);

  useEffect(() => {
    let merged = [];
    let rentalDone = false;
    let marketDone = false;

    const flush = () => {
      // Merge firebase data with the 1200+ offline demo listings
      if (rentalDone && marketDone) {
        // Find IDs that came from Firebase to avoid duplicates if pitch_data matches
        const fireIds = new Set(merged.map(m => m.id));
        const pitchDataLoaded = PITCH_LISTINGS.filter(p => !fireIds.has(p.id));
        setListings([...merged, ...pitchDataLoaded]);
      }
    };

    const normalize = (doc, col) => {
      const d = { id: doc.id, ...doc.data(), _collection: col };
      if (!d.lat || !d.lng) return null; // skip listings without coordinates
      if (!_distCache.has(d.id)) {
        _distCache.set(d.id, (Math.random() * 3 + 0.5).toFixed(1));
      }
      d.distance = _distCache.get(d.id);
      return d;
    };

    // Subscribe to rentals
    const unsubRentals = onSnapshot(
      query(collection(db, 'rentals'), orderBy('createdAt', 'desc')),
      (snap) => {
        const rentals = snap.docs
          .map((d) => normalize(d, 'rentals'))
          .filter(Boolean);
        merged = [...rentals, ...merged.filter((l) => l._collection !== 'rentals')];
        rentalDone = true;
        flush();
      },
      (err) => {
        console.error('[useListings] rentals error:', err);
        rentalDone = true;
        flush();
      }
    );

    // Subscribe to marketplace
    const unsubMarket = onSnapshot(
      query(collection(db, 'marketplace'), orderBy('createdAt', 'desc')),
      (snap) => {
        const market = snap.docs
          .map((d) => normalize(d, 'market'))
          .filter(Boolean);
        merged = [...merged.filter((l) => l._collection !== 'market'), ...market];
        marketDone = true;
        flush();
      },
      (err) => {
        console.error('[useListings] market error:', err);
        marketDone = true;
        flush();
      }
    );

    return () => {
      unsubRentals();
      unsubMarket();
    };
  }, [setListings]);
}
