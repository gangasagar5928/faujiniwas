import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
  'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'
];

export default function ListingCard({ listing, item, onClick }) {
  const r = listing || item || {};
  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  
  // Calculate deterministic index based on ID string
  const idHash = (String(r.id || '') + String(r.name || ''))
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const thumbIndex = Math.abs(idHash % PHOTO_POOL.length);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[thumbIndex];

  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  const [activeDot] = useState(0);

  const bhkText = r.bhk 
    ? `${r.bhk} BHK` 
    : (r.name && r.name.match(/\b([1-4])\s*BHK\b/i) ? `${r.name.match(/\b([1-4])\s*BHK\b/i)[1]} BHK` : (r.type === 'PG/Room' ? 'PG/Room' : '2 BHK'));

  const sqftText = r.sqft 
    ? `${r.sqft} sq.ft` 
    : (r.type === 'PG/Room' ? '150 sq.ft' : (bhkText.includes('3') ? '669 sq.ft' : (bhkText.includes('1') ? '821 sq.ft' : '747 sq.ft')));

  const locationText = r.city 
    ? (r.city.toLowerCase().includes('cantt') ? r.city : `${r.city} Cantt`) 
    : (r.area ? `${r.area} Cantt` : 'Pune Cantt');

  const titleText = r.name || `${bhkText} ${locationText}`;

  const handleClick = () => {
    if (window.fn_tts_active || localStorage.getItem('fn_tts') === 'true') {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const speechText = `${titleText}. Rent is ${price ? price.toLocaleString() : ''} rupees per month. Located at ${locationText}.`;
          const msg = new SpeechSynthesisUtterance(speechText);
          msg.lang = 'en-IN';
          msg.rate = 1.0;
          window.speechSynthesis.speak(msg);
        } catch (e) {
          console.warn('TTS speak error:', e);
        }
      }
    }
    onClick?.();
  };

  return (
    <motion.div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className="group liquid-glass-chip fluid-press"
      style={{
        display: 'flex',
        flexDirection: 'row',
        borderRadius: '16px',
        padding: '10px',
        gap: '14px',
        position: 'relative',
        minHeight: '124px',
        height: '124px',
        flexShrink: 0,
        boxSizing: 'border-box',
        cursor: 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* ── Photo Thumbnail with Rating & Dots ── */}
      <div style={{ position: 'relative', width: '135px', height: '102px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={titleText}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          className="group-hover:scale-105"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PHOTO_POOL[0];
          }}
        />

        {/* Rating Badge (4.8 ★) */}
        <div style={{
          position: 'absolute',
          top: 6,
          left: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 6px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.65)',
          color: '#fbbf24',
          fontSize: 10,
          fontWeight: 800,
          backdropFilter: 'blur(4px)'
        }}>
          <span>4.8</span>
          <span style={{ fontSize: 9 }}>★</span>
        </div>

        {/* Carousel Dots */}
        <div style={{
          position: 'absolute',
          bottom: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          alignItems: 'center'
        }}>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              style={{
                width: dot === activeDot ? 12 : 5,
                height: 5,
                borderRadius: 99,
                background: dot === activeDot ? '#ffffff' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Details Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
        
        {/* Row 1: Title & Wishlist */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {titleText}
          </div>
          
          <button
            onClick={e => { e.stopPropagation(); toggleWishlist(r.id); }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 17,
              color: isSaved ? '#ef4444' : 'var(--muted)',
              padding: '0 2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              flexShrink: 0
            }}
            title={isSaved ? 'Remove from saved' : 'Save property'}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>

        {/* Row 2: Location */}
        <div style={{
          fontSize: 12,
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}>
          <span style={{ fontSize: 11 }}>📍</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {locationText}
          </span>
        </div>

        {/* Row 3: Specs Tag Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text2)',
            background: 'var(--card2)',
            border: '1px solid var(--border2)',
            borderRadius: 6,
            padding: '2px 8px'
          }}>
            {bhkText}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text2)',
            background: 'var(--card2)',
            border: '1px solid var(--border2)',
            borderRadius: 6,
            padding: '2px 8px'
          }}>
            {sqftText}
          </span>
        </div>

        {/* Row 4: Price & Verified Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#ea580c', letterSpacing: '-0.2px' }}>
              ₹{price > 0 ? price.toLocaleString('en-IN') : '14,000'}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>/mo</span>
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 10.5,
            fontWeight: 800,
            color: '#059669',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 6,
            padding: '2px 8px',
            lineHeight: 1
          }}>
            <span>✓</span>
            <span>Verified</span>
          </span>
        </div>

      </div>
    </motion.div>
  );
}
