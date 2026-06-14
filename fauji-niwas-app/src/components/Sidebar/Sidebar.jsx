import { useContext, useState, useMemo } from 'react';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import { ModalContext } from '../../App';
import ListingCard from './ListingCard';
import MarketCard from './MarketCard';
import DormCard from './DormCard';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import StationPulse from './StationPulse';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const ctx = useContext(ModalContext);
  const activeView = useFilterStore((s) => s.activeView);
  const allState = useFilterStore((s) => s);
  const listings = getFilteredListings(allState);
  const isLoaded = allState.listings.length > 0;
  
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  const items = useMemo(() => activeView === 'dorms' ? SSB_DORMS : listings, [activeView, listings]);
  const count = items.length;
  
  const isMarketEntry = (item) => item._collection === 'market' || item._collection === 'marketplace';
  
  // Lightweight Virtualization (Slicing)
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = count > visibleCount;

  const verifiedCount = items.filter((item) => item.verified).length;
  const pricedItems = items.filter((item) => Number.isFinite(item.price) && item.price > 0);
  const avgPrice = pricedItems.length
    ? Math.round(pricedItems.reduce((sum, item) => sum + item.price, 0) / pricedItems.length)
    : 0;
  const verifiedPct = count ? Math.round((verifiedCount / count) * 100) : 0;

  const intel = {
    rentals: {
      eyebrow: 'Live Housing Intel',
      title: 'Scan the current defence housing picture, not a flat list of cards.',
      blurb: 'Verified signals, direct-owner bias, and price awareness stay visible while you move between pins and listings.',
      chips: [
        `${count || 0} live rentals`,
        count ? `${verifiedPct}% verified` : 'Verification layer primed',
        avgPrice ? `Avg ₹${avgPrice.toLocaleString()}/mo` : 'Price watch active',
      ],
    },
    market: {
      eyebrow: 'Posting-Out Pulse',
      title: 'The marketplace feels more like a live relocation feed now.',
      blurb: 'Fresh civilian-noise-free listings surface from people actually moving stations, not random local classifieds.',
      chips: [
        `${count || 0} active items`,
        'Peer-to-peer handoff',
        'Direct Handover',
      ],
    },
    dorms: {
      eyebrow: 'SSB Scout Mode',
      title: 'Board-adjacent dorm hunting should feel fast, calm, and tactical.',
      blurb: 'This view stays oriented around exam movement, nearby food, and quick elimination of weak options.',
      chips: [
        `${count || 0} dorm options`,
        'Food + stay context',
        'Board-day ready',
      ],
    },
    saved: {
      eyebrow: 'Shortlist Locker',
      title: 'Saved options now sit inside a cleaner decision zone.',
      blurb: 'Keep the shortlist compact, compare calmly, and reopen the strongest candidates without re-running the whole search.',
      chips: [
        `${count || 0} shortlisted`,
        'Check alerts',
        'Ready to compare',
      ],
    },
  }[activeView];

  return (
    <aside className={`${styles.sidebar} ${minimized ? styles.minimized : ''} ${fullscreen ? styles.fullscreen : ''}`}>
      {/* Drag handle (mobile) */}
      <div 
        className={styles.dragHandle} 
        onClick={() => {
          if (minimized) {
            setMinimized(false);
            setFullscreen(false);
          } else if (fullscreen) {
            setFullscreen(false);
            setMinimized(false);
          } else {
            setMinimized(true);
            setFullscreen(false);
          }
        }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const onTouchEnd = (e2) => {
             const endY = e2.changedTouches[0].clientY;
             const diff = startY - endY; // positive = swipe up, negative = swipe down
             if (diff > 40) {
               // Swipe UP
               if (minimized) {
                 setMinimized(false);
               } else if (!fullscreen) {
                 setFullscreen(true);
               }
             } else if (diff < -40) {
               // Swipe DOWN
               if (fullscreen) {
                 setFullscreen(false);
               } else if (!minimized) {
                 setMinimized(true);
               }
             }
             document.removeEventListener('touchend', onTouchEnd);
          };
          document.addEventListener('touchend', onTouchEnd);
        }}
      >
        <div className={styles.dragBar} />
      </div>

      {/* Search + filters */}
      <div className={styles.sTop}>
        <SearchBar />
        <FilterBar />
        
        <StationPulse items={items} />

        <div className={styles.intelPanel}>
          <div className={styles.intelCopy}>
            <div className={styles.intelEyebrow}>{intel.eyebrow}</div>
            <h2>{intel.title}</h2>
            <p>{intel.blurb}</p>
            <div className={styles.intelChips}>
              {intel.chips.map((chip, idx) => (
                <span key={chip} className={styles.intelChip} style={{ '--chip-delay': `${idx * 0.08}s` }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.intelModel} aria-hidden="true">
            <span className={`${styles.intelPlane} ${styles.intelPlaneLow}`} />
            <span className={`${styles.intelPlane} ${styles.intelPlaneMid}`} />
            <span className={`${styles.intelPlane} ${styles.intelPlaneTop}`} />
            <span className={styles.intelHalo} />
            <span className={styles.intelBeacon} />
          </div>
        </div>
        <div className={styles.cnt}>
          <div className="live-dot" />
          {isLoaded
            ? (activeView === 'dorms' 
                ? `${count} dorms found` 
                : (count === allState.listings.filter(r => r._collection !== 'market' && r._collection !== 'marketplace').length 
                    ? '1,250+ properties nationwide' 
                    : `${count} listing${count !== 1 ? 's' : ''} found`))
            : 'Loading listings…'}
        </div>
      </div>

      {/* Listings */}
      <div className={styles.listings}>
        {!isLoaded ? (
          // Skeleton
          Array(4).fill(0).map((_, i) => (
            <div key={i} className={styles.skelCard}>
              <div className={`skel-img ${styles.skelImg}`} />
              <div className={styles.skelLines}>
                <div className="skel-line" style={{ width: '75%', height: 13 }} />
                <div className="skel-line" style={{ width: '50%', height: 11 }} />
              </div>
            </div>
          ))
        ) : !count ? (
          <div className={styles.empty}>
            <div className={styles.emptyIco}>{activeView === 'saved' ? '⭐' : '🔍'}</div>
            <h3>{activeView === 'saved' ? 'No saved properties' : 'No results found'}</h3>
            <p>{activeView === 'saved' ? 'Click the ⭐ Save button on any listing to bookmark it here.' : 'Try adjusting filters or searching a different area.'}</p>
          </div>
        ) : activeView === 'dorms' ? (
          visibleItems.map(d => <DormCard key={d.id} dorm={d} onFoodClick={ctx.openFood} />)
        ) : (
          visibleItems.map((r, i) => isMarketEntry(r)
            ? <MarketCard key={r.id} item={r} index={i} onClick={() => ctx.openDetail(r.id)} />
            : <ListingCard key={r.id} listing={r} index={i} onClick={() => ctx.openDetail(r.id)} />
          )
        )}

        {hasMore && (
           <div style={{padding: '20px', textAlign: 'center'}}>
             <button className="fb glass-tactical" 
                     onClick={() => setVisibleCount(p => p + 50)}
                     style={{width: '100%', padding: '12px', border: '1px solid var(--accent)'}}>
               Show More Signals ({count - visibleCount} remaining)
             </button>
           </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span>FaujiNiwas — Defence Housing</span>
        <a href="/about.html" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 11 }}>About Us</a>
        <a href="/privacy.html" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 11 }}>Privacy</a>
        <a href="/terms.html" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 11 }}>Terms</a>
      </div>
    </aside>
  );
}
