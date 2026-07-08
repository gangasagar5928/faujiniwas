import { useContext } from 'react';
import { ModalContext } from '../../App';

export default function MarketCard({ item, index, onClick }) {
  const ctx = useContext(ModalContext);
  const { name, area, city, price, category, condition, mediaUrls, negotiable } = item;
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
      className="group bg-[#131b2e] border border-[#1f2b42] hover:border-amber-500/50 p-3 rounded-2xl flex gap-3 transition-all cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Card Thumbnail */}
      <div className="w-[90px] h-[90px] rounded-xl overflow-hidden relative bg-slate-800 shrink-0">
        <img
          src={thumb}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={name}
          style={{ color: 'transparent' }}
        />
        <div className="absolute top-1 left-1 bg-[#1b253b]/85 border border-[#1f2b42] text-slate-300 text-[8px] font-black uppercase px-1 py-0.5 rounded z-10 flex items-center gap-0.5">
          <span>{getIcon(category)}</span>
          <span>{category}</span>
        </div>
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Header Row */}
          <div className="flex justify-between items-start gap-1">
            <h4 className="text-xs font-bold text-white leading-snug truncate max-w-[140px] font-heading">
              {name}
            </h4>
            <span className="shrink-0 text-[8px] font-extrabold uppercase text-[#fbbf24] px-1.5 py-0.25 bg-[#3b5323]/40 border border-[#fbbf24]/20 rounded-full font-mono">
              {condition || 'Used'}
            </span>
          </div>

          {/* Location details */}
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>📍 {area}</span>
            <span>·</span>
            <span className="truncate max-w-[80px]">{city}</span>
          </div>
        </div>

        {/* Key stat row: Price, Chat action, Negotiable */}
        <div className="flex justify-between items-center border-t border-[#1f2b42] pt-2 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-[#f59e0b] font-heading">₹{price.toLocaleString()}</span>
            {negotiable && <span className="text-[8px] text-[#fbbf24] font-bold font-mono ml-1">NEG</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Action Trigger: Chat */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                ctx.openChat({ listingId: item.id, recipientId: item.uid, name: item.name });
              }}
              className="bg-[#1b253b] border border-[#1f2b42] text-slate-400 hover:text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all cursor-pointer"
            >
              💬 Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
