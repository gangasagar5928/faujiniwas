import React from 'react';
import { useUserStore } from '../../store/userStore';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
];

/** Listing card — horizontal layout on desktop (matches reference screenshot),
 *  vertical stack on mobile (unchanged). */
export default function ListingCard({ listing, item, onClick }) {
  const r = listing || item || {};
  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  const createdAtVal = Number(r.createdAt);
  const thumbIndex = Number.isNaN(createdAtVal) ? 0 : Math.abs(createdAtVal % PHOTO_POOL.length);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[thumbIndex];

  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  return (
    <div
      className="group relative flex rounded-2xl overflow-hidden cursor-pointer mb-3 transition-all duration-200
        bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200
        dark:bg-[#131b2e] dark:border-white/10 dark:hover:border-white/20"
      style={{
        /* Desktop: horizontal — photo left, details right */
        display: 'flex',
        flexDirection: 'row',
        minHeight: '110px',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* ── Photo (left) ── */}
      <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ width: '130px', minHeight: '110px' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={r.name || 'Listing'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          style={{ position: 'absolute', inset: 0 }}
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />

        {/* Star rating — bottom left of photo */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black
          bg-black/60 backdrop-blur-sm text-amber-400 border border-white/10">
          4.8 <span className="text-[9px]">★</span>
        </div>

        {/* Verified badge — bottom right of photo */}
        {r.verified && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold
            bg-emerald-500/90 text-white border border-white/20 backdrop-blur-sm">
            Verified
          </div>
        )}

        {/* Bookmark icon — top right */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(r.id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-[13px]
            bg-white/80 backdrop-blur-sm border border-white/40 shadow transition-all hover:scale-110
            ${isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      {/* ── Details (right) ── */}
      <div className="flex flex-col justify-between flex-1 px-3 py-2.5 min-w-0">
        {/* Title + location */}
        <div>
          <h4 className="text-[13px] font-bold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors
            dark:text-white dark:group-hover:text-amber-400">
            {r.name || 'Premium Property'}
          </h4>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
            <span style={{ fontSize: '10px' }}>📍</span>
            {r.city || r.address || 'Cantonment Area'}
          </p>
        </div>

        {/* Price + specs */}
        <div className="flex items-end justify-between mt-2">
          <span className="text-[15px] font-black text-orange-500 leading-tight">
            ₹{price > 0 ? price.toLocaleString() : '—'}
            <span className="text-[10px] font-normal text-slate-400 ml-0.5">/mo</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {r.bhk ? `${r.bhk} BHK` : 'Studio'} · {r.sqft || '1600'} sq.ft
          </span>
        </div>
      </div>
    </div>
  );
}
