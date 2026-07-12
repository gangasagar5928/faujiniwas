import { useContext } from 'react';
import { ModalContext } from '../../App';

export default function MarketCard({ item, index, onClick }) {
  const ctx = useContext(ModalContext);
  const { name, area, city, price, category, condition, mediaUrls, negotiable } = item;
  const cleanPrice = Number(price) || 0;
  const thumb = mediaUrls?.[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400';

  const getIcon = (cat) => {
    const map = {
      'Furniture': '🪑',
      'Electronics': '💻',
      'Vehicles': '🚗',
      'Household': '🏠',
      'Kit/Gear': '🎖️',
      'Other': '📦'
    };
    return map[cat] || '🏷️';
  };

  return (
    <div 
      className="group bg-[#0e1c18]/80 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-[#12241f]/90 p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98]"
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
          alt={name}
        />
        <div className="absolute top-1 left-1 bg-black/60 border border-white/15 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <span>{getIcon(category)}</span>
          <span>{category}</span>
        </div>
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col min-w-0 text-left gap-1">
        <div className="flex justify-between items-start gap-1">
          <h4 className="text-sm font-bold text-white leading-snug truncate group-hover:text-emerald-400 transition-colors">
            {name}
          </h4>
          <span className="shrink-0 text-[8px] font-extrabold uppercase text-[#fbbf24] px-1.5 py-0.25 bg-[#3b5323]/40 border border-[#fbbf24]/20 rounded-full font-mono">
            {condition || 'Used'}
          </span>
        </div>

        {/* Horizontal Details Row */}
        <div className="text-[10px] text-slate-300 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 opacity-90 font-medium">
          <span className="flex items-center gap-1">
            <span>📍</span>
            <span>{area}</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="truncate">{city}</span>
        </div>
      </div>

      {/* Price and Chat Column */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
        <div className="text-sm font-black text-white whitespace-nowrap">
          ₹{cleanPrice.toLocaleString()}
          {negotiable && <span className="text-[8px] text-[#fbbf24] font-bold font-mono ml-1">NEG</span>}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            ctx.openChat({ listingId: item.id, recipientId: item.uid, name: item.name });
          }}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-2.5 py-1 rounded-md text-[8px] font-bold uppercase transition-all cursor-pointer"
        >
          💬 Chat
        </button>
      </div>
    </div>
  );
}
