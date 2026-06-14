import { useContext, useState, useMemo } from 'react';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS } from '../../data';
import { ModalContext } from '../../App';
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
  
  const { 
    showSchools, setShowSchools, 
    showHospitals, setShowHospitals 
  } = useFilterStore();

  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const items = useMemo(() => activeView === 'dorms' ? SSB_DORMS : listings, [activeView, listings]);
  const count = items.length;
  
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
      blurb: 'Verified signals, direct-owner bias, and price awareness stay visible while you move between pins.',
      chips: [
        `${count || 0} live rentals`,
        count ? `${verifiedPct}% verified` : 'Verification layer primed',
        avgPrice ? `Avg ₹${avgPrice.toLocaleString()}/mo` : 'Price watch active',
      ],
    },
    market: {
      eyebrow: 'Posting-Out Pulse',
      title: 'Relocate with peer-to-peer handoffs.',
      blurb: 'Fresh civilian-noise-free listings surface from people actually moving stations.',
      chips: [
        `${count || 0} active items`,
        'Peer-to-peer handoff',
        'Direct Handover',
      ],
    },
    dorms: {
      eyebrow: 'SSB Scout Mode',
      title: 'Board-adjacent dorm hunting.',
      blurb: 'Oriented around exam movement, nearby food, and quick elimination of weak options.',
      chips: [
        `${count || 0} dorm options`,
        'Food + stay context',
        'Board-day ready',
      ],
    },
    saved: {
      eyebrow: 'Shortlist Locker',
      title: 'Saved options sitting inside a decision zone.',
      blurb: 'Keep the shortlist compact, compare calmly, and reopen the strongest candidates.',
      chips: [
        `${count || 0} shortlisted`,
        'Check alerts',
        'Ready to compare',
      ],
    },
  }[activeView];

  return (
    <aside className={`${styles.sidebar} sidebar ${minimized ? styles.minimized : ''} ${fullscreen ? styles.fullscreen : ''}`}>
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
               if (minimized) {
                 setMinimized(false);
               } else if (!fullscreen) {
                 setFullscreen(true);
               }
             } else if (diff < -40) {
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

      {/* Tagline Header (Fixed wrapping and 13px size) */}
      <div style={{ padding: '16px 16px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '13px', lineHeight: '1.4', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
          {intel.title}
        </h2>
      </div>

      {/* Search + filters */}
      <div className={styles.sTop}>
        <SearchBar />
        <FilterBar />
        
        {/* Map Layers POI Toggles inside Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            🛰️ Quick POI Layer Toggles
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button 
              className={`fb ${showSchools ? 'active' : ''}`}
              onClick={() => setShowSchools(!showSchools)}
              style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', width: '100%' }}
            >
              🏫 Army Schools
            </button>
            <button 
              className={`fb ${showHospitals ? 'active' : ''}`}
              onClick={() => setShowHospitals(!showHospitals)}
              style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', width: '100%' }}
            >
              🏥 Mil Hospitals
            </button>
          </div>
        </div>

        <StationPulse items={items} />

        <div className={styles.intelPanel}>
          <div className={styles.intelCopy}>
            <div className={styles.intelEyebrow}>{intel.eyebrow}</div>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.4' }}>{intel.blurb}</p>
            <div className={styles.intelChips}>
              {intel.chips.map((chip, idx) => (
                <span key={chip} className={styles.intelChip} style={{ '--chip-delay': `${idx * 0.08}s` }}>
                  {chip}
                </span>
              ))}
            </div>
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

      {/* Footer */}
      <div className={styles.footer} style={{ marginTop: 'auto' }}>
        <span>FaujiNiwas — Defence Housing</span>
        <a href="/about.html" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 11 }}>About</a>
      </div>
    </aside>
  );
}
