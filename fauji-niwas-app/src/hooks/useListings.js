import { useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../firebase';
import { useFilterStore } from '../store/filterStore';

import { PITCH_LISTINGS } from '../pitch_data';

// Stable random distance fallback per listing (avoids re-shuffling on re-render)
const _distCache = new Map();

function normalize(doc, collectionName) {
  if (!doc.exists()) return null;
  const data = doc.data();
  
  // Calculate a stable fallback distance based on the document ID hash if not provided
  const fallbackDistance = (() => {
    const hash = doc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash % 30) / 10 + 0.5).toFixed(1);
  })();

  return {
    id: doc.id,
    ...data,
    lat: data.lat !== undefined && data.lat !== null && !isNaN(Number(data.lat)) ? Number(data.lat) : 22.5,
    lng: data.lng !== undefined && data.lng !== null && !isNaN(Number(data.lng)) ? Number(data.lng) : 82.0,
    price: data.price !== undefined && data.price !== null && !isNaN(Number(data.price)) ? Number(data.price) : 0,
    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (Number(data.createdAt) || Date.now()),
    distance: data.distance || fallbackDistance,
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
