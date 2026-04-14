import styles from './ListingCard.module.css';
import { useUserStore } from '../../store/userStore';

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

export default function ListingCard({ listing: r, onClick }) {
  const price = r.price || 0;
  const bahColor = getBahColor(price);
  const bahLabel = getBahLabel(price);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[Math.abs((r.createdAt || 0)) % PHOTO_POOL.length];
  
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}
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
