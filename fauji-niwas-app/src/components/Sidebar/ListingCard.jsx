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
  const price = r.price || 0;
  const thumb = r.mediaUrls?.[0] || PHOTO_POOL[Math.abs((r.createdAt || 0)) % PHOTO_POOL.length];
  
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(r.id);

  // Time text placeholder
  const timeText = r.time || (index === 0 ? '2h ago' : index === 1 ? '28m ago' : index === 2 ? '1h ago' : '18h ago');

  return (
    <div 
      className="group bg-[#10192e] border border-[#1e293b] hover:border-[#fbbf24]/50 hover:bg-[#18233c] p-3 rounded-2xl flex gap-3.5 transition-all duration-300 cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Card Thumbnail */}
      <div className="w-[100px] h-[78px] rounded-xl overflow-hidden relative bg-[#090d16] border border-[#1e293b]/60 shrink-0">
        <img
          src={thumb}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={r.name}
          style={{ color: 'transparent' }}
          onError={e => { e.target.src = PHOTO_POOL[0]; }}
        />
        {r.verified && (
          <span className="absolute bottom-1.5 left-1.5 bg-[#121c17]/90 border border-emerald-500/30 text-emerald-400 text-[6.5px] font-black uppercase px-1 py-0.5 rounded tracking-wider font-mono">
            VERIFIED
          </span>
        )}
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 text-left">
        <div className="flex flex-col gap-1">
          
          {/* Header Row */}
          <div className="flex justify-between items-start gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 text-[8px] font-black uppercase text-[#fbbf24] px-1.5 py-0.5 bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded font-mono">
                {r.bhk || 3} BHK
              </span>
              <h4 className="text-[11px] font-bold text-white leading-snug truncate max-w-[130px] font-heading group-hover:text-[#fbbf24] transition-colors">
                {r.name}
              </h4>
            </div>
            <span className="shrink-0 text-[8px] font-medium text-slate-500 font-mono">
              {timeText}
            </span>
          </div>

          {/* Location / Cantonment Distance */}
          <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
            <span>🚶 {r.distance || 0.9} km from Cantt</span>
            <span>·</span>
            <span className="truncate max-w-[90px]">{r.area || 'Cantt Area'}</span>
          </div>

          {/* Specs metrics row */}
          <div className="text-[8px] text-slate-500 flex items-center gap-1.5 font-mono mt-0.5">
            <span>📐 {r.sqft || 1850} sq.ft</span>
            <span>·</span>
            <span>🛋️ {r.furnishing || 'Semi'}</span>
            <span>·</span>
            <span>🚗 {r.parking || 2} Parking</span>
          </div>

        </div>

        {/* Key stat row: Price, Verification, HRA */}
        <div className="flex justify-between items-center border-t border-[#1e293b] pt-2 mt-1.5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-slate-500 font-mono">₹</span>
            <span className="text-sm font-extrabold text-[#fbbf24] font-heading">{price.toLocaleString()}</span>
            <span className="text-[8px] text-slate-500 font-mono">/mo</span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(r.id);
            }}
            className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all cursor-pointer text-xs ${
              isSaved 
                ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                : 'bg-[#10192e] border-[#1e293b] text-slate-500 hover:text-white hover:border-slate-400'
            }`}
          >
            {isSaved ? '★' : '♡'}
          </button>
        </div>

      </div>
    </div>
  );
}
