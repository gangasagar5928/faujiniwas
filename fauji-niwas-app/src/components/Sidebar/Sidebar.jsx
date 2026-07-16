import { useContext, useMemo } from 'react';
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
          <div key={i} className="h-24 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-slate-400 text-center py-12 text-xs">
        No matching listings. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(r => {
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
    </div>
  );
}
