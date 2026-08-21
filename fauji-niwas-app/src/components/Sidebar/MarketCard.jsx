import React from 'react';
import { useUserStore } from '../../store/userStore';

const MARKET_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=400&q=80',
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80',
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
];

export default function MarketCard({ item, onClick }) {
  const price = Number(item?.price) || 0;
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(item?.id);

  const photoIndex = Math.abs((item?.id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0) % MARKET_SAMPLE_PHOTOS.length);
  const rawThumb = item?.mediaUrls?.[0];
  const thumb = (rawThumb && typeof rawThumb === 'string' && rawThumb.trim().length > 5 && rawThumb.startsWith('http')) 
    ? rawThumb 
    : MARKET_SAMPLE_PHOTOS[photoIndex];

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
      {/* ── Photo (Left) ── */}
      <div style={{ position: 'relative', width: '120px', minHeight: '120px', flexShrink: 0, background: '#1e293b', overflow: 'hidden' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={item?.name || 'Market Item'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = MARKET_SAMPLE_PHOTOS[photoIndex];
          }}
        />
        {/* Condition Tag */}
        <div style={{ position: 'absolute', top: 6, left: 6, padding: '2px 6px', borderRadius: 6,
          background: '#0284c7', color: '#fff', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>
          {item?.condition || 'Used'}
        </div>
        {/* Verified Badge */}
        <div style={{ position: 'absolute', bottom: 6, left: 6, padding: '3px 6px', borderRadius: 6,
          background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700 }}>
          Defence Item
        </div>
        {/* Bookmark */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(item?.id); }}
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
          {item?.name || item?.title || item?.itemName || item?.productName || (item?.type && item?.type !== 'market' ? `${item.type} · ${item.city || 'Defence Post'}` : (item?.category ? `${item.category} · ${item.city || 'Cantt'}` : 'Defence Post Item'))}
        </div>

        {/* Category & Location */}
        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <span style={{ fontSize: 11 }}>🏷️</span>
          <span>{item?.category || 'General'}</span>
          <span>·</span>
          <span>📍 {item?.city || 'Cantonment'}</span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />

        {/* Price & Contact tag */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#f97316' }}>
              ₹{price > 0 ? price.toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, marginTop: 2 }}>Direct Seller</div>
          </div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
            {item?.area || 'Cantt'}<br />
            {item?.rank ? `Rank: ${item.rank}` : 'Verified Post'}
          </span>
        </div>
      </div>
    </div>
  );
}
