import { useContext, useState } from 'react';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import { ModalContext } from '../../App';
import ListingCard from './ListingCard';
import DormCard from './DormCard';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const ctx = useContext(ModalContext);
  const activeView = useFilterStore((s) => s.activeView);
  const allState = useFilterStore((s) => s);
  const listings = getFilteredListings(allState);
  const isLoaded = allState.listings.length > 0;
  
  const [minimized, setMinimized] = useState(false);

  const items = activeView === 'dorms' ? SSB_DORMS : listings;
  const count = items.length;

  return (
    <aside className={`${styles.sidebar} ${minimized ? styles.minimized : ''}`}>
      {/* Drag handle (mobile) */}
      <div 
        className={styles.dragHandle} 
        onClick={() => setMinimized(m => !m)}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const onTouchEnd = (e2) => {
             const endY = e2.changedTouches[0].clientY;
             if (endY - startY > 30) setMinimized(true);
             else if (startY - endY > 30) setMinimized(false);
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
        <div className={styles.cnt}>
          <div className="live-dot" />
          {isLoaded
            ? (activeView === 'dorms' 
                ? `${count} dorms found` 
                : (count === allState.listings.filter(r => r._collection !== 'market').length 
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
            <h3>{activeView === 'saved' ? 'No saved properties' : 'No homes found'}</h3>
            <p>{activeView === 'saved' ? 'Click the ⭐ Save button on any listing to bookmark it here.' : 'Try adjusting filters or searching a different cantt.'}</p>
          </div>
        ) : activeView === 'dorms' ? (
          items.map(d => <DormCard key={d.id} dorm={d} onFoodClick={ctx.openFood} />)
        ) : (
          items.map(r => <ListingCard key={r.id} listing={r} onClick={() => ctx.openDetail(r.id)} />)
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span>FaujiNiwas — Defence Housing</span>
        <a href="/privacy.html" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 11 }}>Privacy</a>
        <a href="/terms.html" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 11 }}>Terms</a>
      </div>
    </aside>
  );
}
