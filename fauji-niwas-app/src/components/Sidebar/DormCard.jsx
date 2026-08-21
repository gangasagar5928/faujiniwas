import React from 'react';
import { useUserStore } from '../../store/userStore';

const DORM_PHOTOS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
];

export default function DormCard({ dorm, onFoodClick, onClick }) {
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(dorm?.id);
  
  // Pick deterministic photo
  const photoIndex = Math.abs((dorm?.id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0) % DORM_PHOTOS.length);
  const thumb = dorm?.mediaUrls?.[0] || DORM_PHOTOS[photoIndex];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{
        display: 'flex',
        flexDirection: 'row',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: '10px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        minHeight: '120px',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#94a3b8'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* ── Photo / Thumbnail (Left) ── */}
      <div style={{ position: 'relative', width: '120px', minHeight: '120px', flexShrink: 0, background: '#1e293b', overflow: 'hidden' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={dorm.name || 'SSB Dorm'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DORM_PHOTOS[photoIndex];
          }}
        />
        {/* Star Rating Badge */}
        <div style={{ position: 'absolute', bottom: 6, left: 6, display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 7px', borderRadius: 7, background: 'rgba(0,0,0,0.65)', color: '#fbbf24',
          fontSize: 11, fontWeight: 900, backdropFilter: 'blur(4px)' }}>
          4.8 <span>★</span>
        </div>
        {/* SSB Center Tag */}
        <div style={{ position: 'absolute', top: 6, left: 6, padding: '2px 6px', borderRadius: 6,
          background: '#2563eb', color: '#fff', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>
          SSB
        </div>
        {/* Bookmark button */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(dorm.id); }}
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
            background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)', cursor: 'pointer',
            color: isSaved ? '#f43f5e' : '#94a3b8' }}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      {/* ── Details (Right) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 12px 10px', minWidth: 0, gap: 4 }}>
        {/* Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {dorm.name || 'SSB Candidate Dorm'}
        </div>

        {/* Location & SSB Board */}
        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <span style={{ fontSize: 11 }}>📍</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dorm.area}, {dorm.city}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🎖️</span> {dorm.ssb} · 🚶 {dorm.distance} km
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />

        {/* Price & Food Guide Action */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#f97316' }}>
              ₹{dorm.price || 350}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>/night</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onFoodClick?.(dorm.city); }}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 800,
              borderRadius: '8px',
              border: '1px solid #fde68a',
              background: '#fef3c7',
              color: '#b45309',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fde68a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fef3c7'; }}
          >
            🍜 Food Guide
          </button>
        </div>
      </div>
    </div>
  );
}
