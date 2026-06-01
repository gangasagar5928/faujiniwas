import { useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../firebase';
import { useFilterStore } from '../store/filterStore';

import { PITCH_LISTINGS } from '../pitch_data';

// Stable random distance fallback per listing (avoids re-shuffling on re-render)
const _distCache = new Map();

function normalize(doc, collectionName) {
  if (!doc.exists()) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    lat: Number(data.lat),
    lng: Number(data.lng),
    price: Number(data.price),
    _collection: collectionName
  };
}

export function useListings() {
  const setListings = useFilterStore((s) => s.setListings);

  useEffect(() => {
    let merged = [];
    let rentalDone = false;
    let marketDone = false;

    const flush = () => {
      // Merge firebase data with the 1200+ offline demo listings
      const fireIds = new Set(merged.map(m => m.id));
      
      // Ensure pitch data items are healthy and don't duplicate firebase items
      const healthyPitch = PITCH_LISTINGS.filter(p => {
        return p && p.id && p.lat && p.lng && !fireIds.has(p.id);
      }).map(p => {
        if (!_distCache.has(p.id)) {
          _distCache.set(p.id, (Math.random() * 3 + 0.5).toFixed(1));
        }
        return { ...p, distance: _distCache.get(p.id) };
      });

      setListings([...merged, ...healthyPitch]);
    };

    // Safety: Flush pitch data immediately so the app isn't empty while waiting for Firebase
    flush();

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
          .map((d) => normalize(d, 'marketplace'))
          .filter(Boolean);
        merged = [...merged.filter((l) => l._collection !== 'market' && l._collection !== 'marketplace'), ...market];
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
