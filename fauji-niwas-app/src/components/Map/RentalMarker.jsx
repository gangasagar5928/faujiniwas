import { useContext } from 'react';
import { Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ModalContext } from '../../App';
import { SafeMarker, safeLatLng } from './SafeMarker';

export default function RentalMarker({ listing: r }) {
  const map = useMap();
  const ctx = useContext(ModalContext);

  if (!r || !r.lat || !r.lng || Number.isNaN(parseFloat(r.lat)) || Number.isNaN(parseFloat(r.lng))) {
    return null;
  }

  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  const isMarket = r._collection === 'market' || r._collection === 'marketplace';
  
  // Create a custom glassmorphic pin html
  const label = isMarket ? `₹${(price / 1000).toFixed(0)}K` : `₹${(price / 1000).toFixed(0)}K`;
  const iconEmoji = isMarket ? '🛒' : '🏠';
  
  // Using tailwind utility classes stringified
  const htmlContent = `
    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0f1d]/90 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:scale-110 hover:border-amber-400">
      <span class="text-xs">${iconEmoji}</span>
      <span class="text-xs font-black text-white tracking-wide">${label}</span>
    </div>
  `;

  const icon = L.divIcon({
    className: 'bg-transparent border-none', // Leaflet injects a div, we clear its default styling
    html: htmlContent,
    iconAnchor: [40, 20],
    popupAnchor: [0, -25],
    iconSize: [80, 40],
  });

  const safePos = safeLatLng(r.lat, r.lng);
  if (!safePos) return null;

  const handleClick = () => {
    map.flyTo(safePos, 15, { duration: 0.5 });
    ctx.openDetail(r.id);
  };

  return (
    <SafeMarker position={safePos} icon={icon} eventHandlers={{ click: handleClick }}>
      <Popup>
        <div style={{ fontFamily: "'Outfit',sans-serif", minWidth: 190 }} className="p-1">
          <div className="text-sm font-black mb-1 text-slate-800">{r.name || r.title}</div>
          <div className="text-[11px] text-slate-500 mb-2">📍 {r.area}, {r.city}</div>
          <div className="mb-3">
            <span className="font-black text-base text-slate-800">₹{price.toLocaleString()}{isMarket ? '' : '/mo'}</span>
            {r.verified && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 ml-2">✅ Verified</span>
            )}
          </div>
          <button
            onClick={handleClick}
            className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg text-xs hover:bg-slate-800 transition-colors"
          >
            View Full Details →
          </button>
        </div>
      </Popup>
    </SafeMarker>
  );
}
