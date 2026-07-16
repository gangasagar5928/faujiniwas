import { useUserStore } from '../../store/userStore';

export default function MarketCard({ item, onClick }) {
  const price = Number(item.price) || 0;
  
  const wishlist = useUserStore(s => s.wishlist) || [];
  const toggleWishlist = useUserStore(s => s.toggleWishlist);
  const isSaved = wishlist.includes(item.id);

  return (
    <div
      className="flex bg-transparent border-b border-white/5 overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group"
      onClick={onClick}
    >
      <div className="w-[88px] h-[76px] shrink-0 relative overflow-hidden bg-[#1e293b] m-1.5 rounded-[8px]">
        <img
          src={item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=300'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute top-1 left-1 bg-blue-500/90 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm shadow">
          {item.condition || 'Used'}
        </div>
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(item.id); }}
          className={`absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[10px] shadow-sm transition-all hover:scale-110 ${isSaved ? 'text-red-400' : 'text-slate-300 hover:text-white'}`}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      <div className="flex-1 px-2 py-2 flex flex-col justify-between min-w-0 pr-3">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-[11px] font-extrabold text-white truncate group-hover:text-amber-400 transition-colors">
            {item.name}
          </h4>
          <span className="text-[11px] font-black text-white shrink-0 ml-1">
            ₹{price.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium mt-auto pb-1">
          <span>{item.category || 'Market'}</span>
          <span className="text-slate-600">·</span>
          <span className="truncate">{item.city || 'Location'}</span>
        </div>
      </div>
    </div>
  );
}
