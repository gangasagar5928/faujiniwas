import { useUserStore } from '../../store/userStore';
import { useFilterStore } from '../../store/filterStore';

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
      className="group bg-[#131b2e] border border-[#1e293b] hover:border-[#fbbf24]/50 hover:bg-[#1b253b] rounded-2xl flex gap-3 transition-all duration-300 cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{ padding: '12px' }}
    >
      {/* Card Thumbnail */}
      <div className="w-[130px] h-[110px] rounded-xl overflow-hidden relative bg-[#090d16] border border-[#1e293b]/60 shrink-0">
        <img
          src={thumb}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={r.name}
          style={{ color: 'transparent' }}
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />
        {r.verified && (
          <span className="absolute bottom-1.5 left-1.5 bg-[#059669] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider font-sans shadow-md">
            VERIFIED
          </span>
        )}
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 text-left">
        <div className="flex flex-col gap-1">
          
          {/* Title */}
          <h4 className="text-[15px] font-black text-white leading-snug truncate font-heading group-hover:text-[#fbbf24] transition-colors">
            {r.name}
          </h4>

          {/* Distance / sqft */}
          <div className="text-[13px] font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="text-amber-500 text-sm">📍</span>
            <span>{r.distance || '2.9'} km</span>
          </div>

          {/* Area sqft */}
          <div className="text-[13px] font-semibold text-slate-400 flex items-center gap-1.5">
            <span className="text-sm">📐</span>
            <span>{r.sqft || '669'} sq ft</span>
          </div>

          {/* Parking */}
          <div className="text-[13px] font-semibold text-slate-400 flex items-center gap-1.5">
            <span className="text-sm">🚗</span>
            <span>{r.parking || '2'} Parking</span>
          </div>

        </div>

        {/* Price Row */}
        <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]/50 mt-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[18px] font-black text-[#fbbf24] font-heading">₹{price.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-mono">/mo</span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(r.id);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer text-xl ${
              isSaved 
                ? 'text-red-500 scale-110' 
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>

      </div>
    </div>
  );
}
