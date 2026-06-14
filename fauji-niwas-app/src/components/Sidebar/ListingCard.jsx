import styles from './ListingCard.module.css';
import { useUserStore } from '../../store/userStore';
import { useFilterStore } from '../../store/filterStore';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=75',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=400&q=75',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=75',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=75',
];

function getBahColor(price) {
  return price <= 15000 ? '#22c55e' : price <= 30000 ? '#f4c542' : '#f43f5e';
}
function getBahLabel(price) {
  return price <= 15000 ? '🟢 OR' : price <= 30000 ? '🟡 JCO' : '🔴 Offr';
}

export default function ListingCard({ listing: r, index, onClick }) {
  const price = r.price || 0;
  const bahColor = getBahColor(price);
  const bahLabel = getBahLabel(price);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[Math.abs((r.createdAt || 0)) % PHOTO_POOL.length];
  
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  const allListings = useFilterStore((s) => s.listings) || [];
  const cityListings = allListings.filter(l => l.city === r.city && l.price > 0 && l._collection === r._collection);
  const cityAvg = cityListings.length ? cityListings.reduce((sum, l) => sum + l.price, 0) / cityListings.length : 0;
  const isPriceOutlier = cityAvg && cityListings.length >= 3 && (price > cityAvg * 1.45 || price < cityAvg * 0.55);

  // Trust Graph 2.0 Reputation Score Calculation
  const hasVerifiedBadge = !!r.verified;
  const isDefenceOwner = r.ownerType === 'defence';
  const hasHighRating = (r.rating || 5) >= 4.5;
  const repScore = (hasVerifiedBadge ? 30 : 10) + (isDefenceOwner ? 30 : 15) + (hasHighRating ? 40 : 20);
  const isCommandRecommended = repScore >= 90;

  return (
    <div className={`${styles.card} listing-card`} onClick={onClick} role="button" tabIndex={0}
      style={{ '--delay': `${index * 0.05}s` }}
      onKeyDown={e => e.key === 'Enter' && onClick()}>

      {/* Thumbnail */}
      <div className={styles.thumb}>
        <img
          src={thumb}
          loading="lazy"
          decoding="async"
          alt={r.name}
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />
        {isCommandRecommended && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'linear-gradient(135deg, var(--gold), #ff9933)',
            color: '#000',
            fontSize: '9px',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '6px',
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
            border: '1px solid var(--gold)',
            zIndex: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            🎖️ Command Recommended
          </span>
        )}
        <span className={styles.bahBadge} style={{ color: bahColor }}>
          {bahLabel}
        </span>
        <span className={styles.availBadge} style={{ color: r.available ? '#60a5fa' : '#4ade80' }}>
          {r.available || '⚡ Now'}
        </span>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.name}>
          {r.name}
          {r.verified && (
            <span className={styles.verifiedBadge}>✅ Verified</span>
          )}
        </div>
        <div className={styles.loc}>📍 {r.area}, {r.city} &nbsp;·&nbsp; 🚶 {r.distance} km</div>
        <div className={styles.tags}>
          <span className="tag">{r.type?.toUpperCase() || 'FLAT'}</span>
          {r.ownerType === 'defence' && <span className="tag" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>🎖️ Fauji</span>}
          {r.term === 'short' && <span className="tag" style={{ color: '#60a5fa', borderColor: '#60a5fa' }}>🧳 Short-term</span>}
          {isPriceOutlier && <span className="tag" style={{ color: 'var(--red)', borderColor: 'var(--red)', background: 'rgba(244,63,94,0.08)' }}>⚠️ Price Outlier</span>}
        </div>
      </div>

      {/* Price row */}
      <div className={styles.bottom}>
        <div className={styles.price}>
          ₹{price.toLocaleString()}<span>/mo</span>
        </div>
        <span className={styles.cta}>View Details →</span>
      </div>

      {/* Quick actions */}
      <div className={styles.actions}>
        <button 
          className={styles.actBtn} 
          style={isSaved ? { color: '#f4c542', borderColor: '#f4c542', background: 'rgba(244,197,66,0.1)' } : {}}
          onClick={e => { e.stopPropagation(); toggleWishlist(r.id); }}
        >
          {isSaved ? '★ Saved' : '⭐ Save'}
        </button>
        <button 
          className={styles.actBtn} 
          onClick={e => { 
            e.stopPropagation(); 
            if(r.phone) window.open(`https://wa.me/91${r.phone}?text=${encodeURIComponent(`Hi, I'm interested in your property ${r.name} listed on FaujiNiwas`)}`, '_blank');
            else alert('No contact number available for this listing.');
          }}
        >
          💬 Chat
        </button>
        <button className={styles.actBtn} onClick={async e => {
          e.stopPropagation();
          const url = `${location.origin}/app?listing=${r.id}`;
          if (navigator.share) {
            try {
              await navigator.share({ title: 'Fauji Niwas', url });
            } catch (err) {
              navigator.clipboard?.writeText(url);
            }
          } else {
            navigator.clipboard?.writeText(url);
          }
        }}>↗ Share</button>
      </div>
    </div>
  );
}
