import React from 'react';
import { useUserStore } from '../../store/userStore';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
];

export default function ListingCard({ listing, item, onClick }) {
  const r = listing || item || {};
  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  const createdAtVal = Number(r.createdAt);
  const thumbIndex = Number.isNaN(createdAtVal) ? 0 : Math.abs(createdAtVal % PHOTO_POOL.length);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[thumbIndex];

  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  const handleClick = () => {
    if (window.fn_tts_active || localStorage.getItem('fn_tts') === 'true') {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const speechText = `${r.name || 'Property'}. Rent is ${price ? price.toLocaleString() : ''} rupees per month. Located at ${r.city || r.address || 'Cantonment Area'}. ${r.bhk ? r.bhk + ' BHK.' : ''}`;
          const msg = new SpeechSynthesisUtterance(speechText);
          msg.lang = 'en-IN';
          msg.rate = 1.0;
          const voices = window.speechSynthesis.getVoices();
          const indVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
          if (indVoice) msg.voice = indVoice;
          window.speechSynthesis.speak(msg);
        } catch (e) {
          console.warn('TTS speak error:', e);
        }
      }
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
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
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        minHeight: '120px',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#94a3b8'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* ── Photo ── */}
      <div style={{ position: 'relative', width: '120px', minHeight: '120px', flexShrink: 0, background: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={r.name || 'Listing'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PHOTO_POOL[0];
          }}
        />
        {/* Star */}
        <div style={{ position: 'absolute', bottom: 6, left: 6, display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 7px', borderRadius: 7, background: 'rgba(0,0,0,0.65)', color: '#fbbf24',
          fontSize: 11, fontWeight: 900, backdropFilter: 'blur(4px)' }}>
          4.8 <span>★</span>
        </div>
        {/* Verified */}
        {r.verified && (
          <div style={{ position: 'absolute', bottom: 6, right: 4, padding: '3px 6px', borderRadius: 6,
            background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700 }}>
            Verified
          </div>
        )}
        {/* Bookmark */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(r.id); }}
          style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'transform 0.15s',
            color: isSaved ? '#f43f5e' : '#94a3b8' }}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      {/* ── Details ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 12px 10px', minWidth: 0, gap: 4 }}>
        {/* Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {r.name || 'Premium Property'}
        </div>

        {/* Location */}
        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <span style={{ fontSize: 11 }}>📍</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.city || r.address || 'Cantonment Area'}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#f97316' }}>
              ₹{price > 0 ? price.toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>/mo</div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', lineHeight: 1.4, flexShrink: 0 }}>
            {r.bhk ? `${r.bhk} BHK` : 'Studio'}<br />
            {r.sqft || '1,400'} sq.ft
          </div>
        </div>
      </div>
    </div>
  );
}
