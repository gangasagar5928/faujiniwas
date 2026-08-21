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
        bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300
        dark:bg-[#131b2e] dark:border-white/10 dark:hover:border-white/20"
      style={{ display: 'flex', flexDirection: 'row', minHeight: '140px' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* ── Photo (left) ── */}
      <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ width: '120px', minHeight: '140px' }}>
        <img
          src={thumb}
          loading="lazy"
          alt={r.name || 'Listing'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          style={{ position: 'absolute', inset: 0 }}
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />

        {/* Star rating — bottom left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black
          bg-black/65 backdrop-blur-sm text-amber-400">
          4.8 <span>★</span>
        </div>

        {/* Verified — bottom right */}
        {r.verified && (
          <div className="absolute bottom-2 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold
            bg-emerald-500 text-white">
            Verified
          </div>
        )}

        {/* Bookmark — top right */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(r.id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-[14px]
            bg-white/85 border border-white/50 shadow transition-all hover:scale-110
            ${isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-slate-700'}`}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      {/* ── Details (right) ── */}
      <div className="flex flex-col justify-between flex-1 px-3 py-3 min-w-0 overflow-hidden">

        {/* Title */}
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold leading-snug text-slate-800 group-hover:text-blue-600 transition-colors
            dark:text-white dark:group-hover:text-amber-400"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {r.name || 'Premium Property'}
          </h4>
          <p className="text-[12px] text-slate-500 mt-1 truncate flex items-center gap-1 dark:text-slate-400">
            <span>📍</span>
            {r.city || r.address || 'Cantonment Area'}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-2" />

        {/* Price + specs */}
        <div className="flex items-end justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <span className="text-[18px] font-black text-orange-500 leading-none block">
              ₹{price > 0 ? price.toLocaleString() : '—'}
            </span>
            <span className="text-[11px] text-slate-400">/mo</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium text-right shrink-0">
            {r.bhk ? `${r.bhk} BHK` : 'Studio'}<br />
            {r.sqft || '1,400'} sq.ft
          </span>
        </div>
      </div>
    </div>
  );

}
