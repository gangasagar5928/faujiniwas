import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ 
        y: -4, 
        scale: 1.012,
        transition: { type: 'spring', stiffness: 450, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className="group liquid-glass-chip fluid-press transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] hover:border-amber-500/40"
      style={{
        display: 'flex',
        flexDirection: 'row',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: '10px',
        minHeight: '120px',
      }}
    >
      {/* ── Photo / Thumbnail (Left) ── */}
      <div style={{ position: 'relative', width: '120px', minHeight: '120px', flexShrink: 0, background: '#1e293b', overflow: 'hidden' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={dorm.name || 'SSB Dorm'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
          className="group-hover:scale-108"
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
        <motion.button
          onClick={e => { e.stopPropagation(); toggleWishlist(dorm.id); }}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
            background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)', cursor: 'pointer',
            color: isSaved ? '#f43f5e' : '#94a3b8' }}
        >
          {isSaved ? '♥' : '♡'}
        </motion.button>
      </div>

      {/* ── Details (Right) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 12px 10px', minWidth: 0, gap: 4 }}>
        {/* Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {dorm.name || 'SSB Candidate Dorm'}
        </div>

        {/* Location & SSB Board */}
        <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <span style={{ fontSize: 11 }}>📍</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dorm.area}, {dorm.city}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🎖️</span> {dorm.ssb} · 🚶 {dorm.distance} km
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />

        {/* Price & Food Guide Action */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#f97316' }}>
              ₹{dorm.price || 350}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>/night</div>
          </div>
          <motion.button
            onClick={e => { e.stopPropagation(); onFoodClick?.(dorm.city); }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
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
              transition: 'background 0.15s, box-shadow 0.15s'
            }}
            className="hover:shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
          >
            🍜 Food Guide
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
