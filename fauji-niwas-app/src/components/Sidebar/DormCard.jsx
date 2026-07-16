export default function DormCard({ dorm, onFoodClick }) {
  return (
    <div className="flex bg-[#0b1325]/40 backdrop-blur-xl border border-white/5 overflow-hidden hover:bg-white/5 transition-all rounded-[12px] group">
      
      {/* Icon / Image block */}
      <div className="w-[88px] h-[76px] shrink-0 bg-[#1e293b] flex flex-col items-center justify-center m-1.5 rounded-[8px]">
        <span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">🏨</span>
        <span className="text-[8px] font-black text-amber-400 mt-1 uppercase tracking-wider">{dorm.budget}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-2 py-2 flex flex-col justify-between pr-3 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-[11px] font-extrabold text-white leading-tight truncate">
            {dorm.name}
          </h4>
          <span className="text-[11px] font-black text-white shrink-0 ml-1">
            ₹{dorm.price}/nt
          </span>
        </div>
        
        <p className="text-[9px] text-slate-400 mt-0.5 truncate">
          {dorm.area}, {dorm.city}
        </p>

        <div className="flex items-center justify-between mt-1 pb-0.5 gap-2">
          <div className="flex flex-col text-[8px] text-slate-400 leading-normal min-w-0">
            <span className="truncate font-bold text-amber-500/90">{dorm.ssb}</span>
            <span className="truncate">🚶 {dorm.distance} km to gate</span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onFoodClick(dorm.city); }}
            className="shrink-0 flex items-center gap-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors border border-amber-500/30 cursor-pointer"
          >
            🍽️ Food
          </button>
        </div>
      </div>
    </div>
  );
}
