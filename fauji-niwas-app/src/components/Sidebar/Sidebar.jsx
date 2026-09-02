import { useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import { ModalContext } from '../../App';
import ListingCard from './ListingCard';
import MarketCard from './MarketCard';
import DormCard from './DormCard';

/**
 * Sidebar — pure listing cards, no chrome.
 * All search/filter/header UI lives in UnifiedBentoDashboard.
 */
export default function Sidebar() {
  const ctx = useContext(ModalContext);
  const allState = useFilterStore((s) => s);
  const { activeView, isPending } = allState;
  const listings = getFilteredListings(allState);

  const items = useMemo(
    () => (activeView === 'dorms' ? SSB_DORMS : listings),
    [activeView, listings]
  );

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="liquid-glass animate-pulse" style={{ height: 96, borderRadius: 18 }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '48px 16px', fontSize: 12 }}>
        No matching listings. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map(r => {
          if (activeView === 'dorms') {
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <DormCard
                  dorm={r}
                  onFoodClick={(city) => ctx.openFood(city)}
                />
              </motion.div>
            );
          } else if (activeView === 'market') {
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <MarketCard
                  item={r}
                  onClick={() => ctx.openDetail && ctx.openDetail(r)}
                />
              </motion.div>
            );
          } else {
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <ListingCard
                  listing={r}
                  onClick={() => ctx.openDetail && ctx.openDetail(r)}
                />
              </motion.div>
            );
          }
        })}
      </AnimatePresence>
    </div>
  );
}
