import React, { memo } from "react";
import { Property } from "../../typesNew";
import { Heart, Star } from "lucide-react";


interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  userRank?: string;
  userBasicPay?: number;
  key?: string;
}

function PropertyCard({
  property,
  isSelected,
  onSelect,
  onToggleFavorite,
}: PropertyCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-row items-center p-4 pl-4 pr-6 gap-5 cursor-pointer transition-all duration-300 select-none ${
        isSelected
          ? "bg-[#202c2c] text-white ring-2 ring-emerald-500/80 shadow-2xl scale-[1.01]"
          : "bg-[#2d3a3a]/90 text-white hover:bg-[#344444] shadow-lg border border-white/15 hover:border-emerald-500/30"
      } rounded-[2rem]`}
    >
      {/* Left Column: Image with high roundness */}
      <div className="relative w-32 h-20 shrink-0 rounded-[1.5rem] overflow-hidden bg-slate-800 shadow-inner">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Soft Dark Overlay */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        {/* Micro Rating Indicator */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-black text-amber-400">
          <Star size={9} className="fill-amber-400" />
          <span>{property.rating}</span>
        </div>
      </div>

      {/* Middle Column: Sleek Title */}
      <div className="flex-1 flex flex-col justify-center min-w-0 text-left">
        <h3 className="font-bold text-[16px] text-white leading-tight truncate group-hover:text-amber-300 transition-colors duration-200">
          {property.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-[13px] text-slate-300/90 font-medium">
          <span className="font-extrabold text-emerald-400 text-[15px]">₹{property.rent.toLocaleString()}</span>
          <span>•</span>
          <span className="truncate">{property.commute}</span>
        </div>
      </div>

      {/* Right Column: Clean circular hollow button matching mockup */}
      <button
        onClick={(e) => onToggleFavorite(property.id, e)}
        className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
          property.isFavorite
            ? "bg-red-500/90 border-red-400 text-white scale-105 shadow-md"
            : "border-white/20 text-white/40 hover:border-white/40 hover:text-white hover:bg-white/5"
        }`}
      >
        <Heart size={14} className={property.isFavorite ? "fill-current" : ""} />
      </button>
    </div>
  );
}

export default memo(PropertyCard);
