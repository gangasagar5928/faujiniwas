import React from 'react';
import { useUserStore } from '../../store/userStore';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
];

export default function ListingCard({ item, onClick }) {
  const r = item || {};
  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  const createdAtVal = Number(r.createdAt);
  const thumbIndex = Number.isNaN(createdAtVal) ? 0 : Math.abs(createdAtVal % PHOTO_POOL.length);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[thumbIndex];

  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  return (
    <div
      className="flex flex-col shrink-0 bg-[#0b1325]/40 backdrop-blur-xl border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 transition-all rounded-[16px] shadow-lg group relative"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* ══ PHOTO SECTION (TOP HALF) ══ */}
      <div className="w-full h-[180px] shrink-0 relative overflow-hidden bg-[#1e293b]">
        <img
          src={thumb}
          loading="lazy"
          alt={r.name || 'Listing'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />
        
        {/* Heart Icon - Top Right */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(r.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0b1325]/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-[15px] shadow-lg transition-all hover:scale-110 ${isSaved ? 'text-rose-500' : 'text-slate-200 hover:text-white'}`}
        >
          {isSaved ? '♥' : '♡'}
        </button>

        {/* Badges - Bottom of Image */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
          <div className="bg-[#0b1325]/80 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
            4.8 <span className="text-[10px]">★</span>
          </div>
          
          {r.verified && (
            <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1 border border-white/20">
              <span className="text-[8px]">✓</span> Verified
            </div>
          )}
        </div>
      </div>

      {/* ══ DETAILS SECTION (BOTTOM HALF) ══ */}
      <div className="p-4 flex flex-col gap-2">
        
        {/* Title & Location */}
        <div>
          <h4 className="text-[14px] font-bold text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
            {r.name || 'Premium Property'}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            {r.address || r.city || 'Cantonment Area'}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/5 my-1" />

        {/* Price & Specs */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Rent</span>
            <span className="text-[14px] font-black text-amber-400 whitespace-nowrap leading-tight">
              ₹{price > 0 ? price.toLocaleString() : '—'}
              <span className="text-[10px] text-slate-300 font-normal ml-0.5">/mo</span>
            </span>
          </div>
          
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Specs</span>
            <span className="text-[12px] font-bold text-slate-200">
              {r.bhk ? `${r.bhk} BHK` : 'Studio'} <span className="opacity-50 mx-1">•</span> 1400 sq.ft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
