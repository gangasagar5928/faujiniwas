export default function DormCard({ dorm: d, onFoodClick }) {
  const thumb = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400';
  
  return (
    <div 
      className="group bg-[#131b2e] border border-[#1f2b42] hover:border-amber-500/50 p-3 rounded-2xl flex gap-3 transition-all cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98]"
      onClick={() => onFoodClick?.(d.city)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onFoodClick?.(d.city)}
    >
      {/* Card Thumbnail */}
      <div className="w-[90px] h-[90px] rounded-xl overflow-hidden relative bg-slate-800 shrink-0">
        <img
          src={thumb}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={d.name}
          style={{ color: 'transparent' }}
        />
        <div className="absolute top-1 left-1 bg-[#1b253b]/85 border border-[#1f2b42] text-slate-300 text-[8px] font-black uppercase px-1 py-0.5 rounded z-10 flex items-center gap-0.5">
          <span>🏨</span>
          <span>Dorm</span>
        </div>
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Header Row */}
          <div className="flex justify-between items-start gap-1">
            <h4 className="text-xs font-bold text-white leading-snug truncate max-w-[140px] font-heading">
              {d.name}
            </h4>
            <span className="shrink-0 text-[8px] font-extrabold uppercase text-[#fbbf24] px-1.5 py-0.25 bg-[#3b5323]/40 border border-[#fbbf24]/20 rounded-full font-mono">
              {d.type || 'Shared'}
            </span>
          </div>

          {/* Location / SSB Board details */}
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>🚶 {d.distance} km from Cantt</span>
            <span>·</span>
            <span className="truncate max-w-[80px]">{d.ssb}</span>
          </div>
        </div>

        {/* Key stat row: Price, Food action button */}
        <div className="flex justify-between items-center border-t border-[#1f2b42] pt-2 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-[#f59e0b] font-heading">₹{d.price.toLocaleString()}</span>
            <span className="text-[8px] text-slate-500 font-mono">/night</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Action Trigger: Food Panel */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFoodClick?.(d.city);
              }}
              className="bg-[#1b253b] border border-[#1f2b42] text-slate-400 hover:text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all cursor-pointer"
            >
              🍽️ Food
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
