import { useUserStore } from '../../store/userStore';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=75',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=400&q=75',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=75',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=75',
];

export default function ListingCard({ listing, r: propR, index, onClick }) {
  const r = listing || propR || {};
  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  const createdAtVal = Number(r.createdAt);
  const thumbIndex = Number.isNaN(createdAtVal) ? 0 : Math.abs(createdAtVal);
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[thumbIndex % PHOTO_POOL.length];
  
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  return (
    <div 
      className="group bg-[#0e1c18]/80 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-[#12241f]/90 rounded-2xl flex items-center gap-3 transition-all duration-300 cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98] p-3"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Card Thumbnail */}
      <div className="w-[100px] h-[75px] rounded-xl overflow-hidden relative bg-[#090d16] border border-white/10 shrink-0">
        <img
          src={thumb}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={r.name}
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />
        {r.verified && (
          <span className="absolute bottom-1 left-1 bg-[#059669] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow-md">
            VERIFIED
          </span>
        )}
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col min-w-0 text-left gap-1">
        {/* Title */}
        <h4 className="text-sm font-bold text-white leading-snug truncate group-hover:text-emerald-400 transition-colors">
          {r.name}
        </h4>

        {/* Horizontal Details Row */}
        <div className="text-[10px] text-slate-300 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 opacity-90 font-medium">
          <span className="flex items-center gap-1">
            <span>📍</span>
            <span>{r.distance || '2.9'} km</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1">
            <span>📐</span>
            <span>{r.sqft || '669'} sq ft</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1">
            <span>🚗</span>
            <span>{r.parking || 'Yes'}</span>
          </span>
        </div>
      </div>

      {/* Price and Heart Column */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
        <div className="text-sm font-black text-white whitespace-nowrap">
          ₹{price.toLocaleString()}
          <span className="text-[9px] text-slate-400 font-normal">/mo</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(r.id);
          }}
          className={`w-6 h-6 flex items-center justify-center rounded-full transition-all cursor-pointer text-base bg-white/5 border border-white/10 hover:bg-white/10 ${
            isSaved ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

    </div>
  );
}
