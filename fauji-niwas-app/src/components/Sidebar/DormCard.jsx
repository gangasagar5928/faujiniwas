export default function DormCard({ dorm: d, onFoodClick }) {
  const thumb = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400';
  
  return (
    <div 
      className="group bg-[#0e1c18]/80 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-[#12241f]/90 p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-md select-none relative overflow-hidden active:scale-[0.98]"
      onClick={() => onFoodClick?.(d.city)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onFoodClick?.(d.city)}
    >
      {/* Card Thumbnail */}
      <div className="w-[100px] h-[75px] rounded-xl overflow-hidden relative bg-[#090d16] border border-white/10 shrink-0">
        <img
          src={thumb}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={d.name}
        />
        <div className="absolute top-1 left-1 bg-black/60 border border-white/15 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <span>🏨</span>
          <span>Dorm</span>
        </div>
      </div>

      {/* Card Content details */}
      <div className="flex-1 flex flex-col min-w-0 text-left gap-1">
        <div className="flex justify-between items-start gap-1">
          <h4 className="text-sm font-bold text-white leading-snug truncate group-hover:text-emerald-400 transition-colors">
            {d.name}
          </h4>
          <span className="shrink-0 text-[8px] font-extrabold uppercase text-[#fbbf24] px-1.5 py-0.25 bg-[#3b5323]/40 border border-[#fbbf24]/20 rounded-full font-mono">
            {d.type || 'Shared'}
          </span>
        </div>

        {/* Horizontal Details Row */}
        <div className="text-[10px] text-slate-300 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 opacity-90 font-medium">
          <span className="flex items-center gap-1">
            <span>🚶</span>
            <span>{d.distance} km from Cantt</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="truncate">{d.ssb}</span>
        </div>
      </div>

      {/* Price Column */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
        <div className="text-sm font-black text-white whitespace-nowrap">
          ₹{(Number(d.price) || 0).toLocaleString()}
          <span className="text-[9px] text-slate-400 font-normal">/night</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFoodClick?.(d.city);
          }}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all cursor-pointer"
        >
          🍽️ Food
        </button>
      </div>
    </div>
  );
}
