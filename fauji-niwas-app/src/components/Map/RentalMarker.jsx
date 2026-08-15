import { useContext } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ModalContext } from '../../App';

export default function RentalMarker({ listing: r }) {
  const map = useMap();
  const ctx = useContext(ModalContext);

  if (!r) return null;
  const lat = Number(r.lat);
  const lng = Number(r.lng);
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) {
    return null;
  }

  const rawPrice = Number(r.price) || Number(String(r.price).replace(/[^0-9.]/g, '')) || 14000;
  const isMarket = r._collection === 'market' || r._collection === 'marketplace';
  
  const priceLabel = rawPrice >= 1000 ? `₹${Math.round(rawPrice / 1000)}K` : `₹${rawPrice}`;
  const iconEmoji = isMarket ? '🛒' : '🏠';
  
  const htmlContent = `
    <div style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:20px;background:#0b1325;border:1.5px solid #22c55e;box-shadow:0 4px 12px rgba(0,0,0,0.4);white-space:nowrap;font-family:sans-serif;">
      <span style="font-size:12px;">${iconEmoji}</span>
      <span style="font-size:11px;font-weight:900;color:#ffffff;letter-spacing:0.3px;">${priceLabel}</span>
    </div>
  `;

  const icon = L.divIcon({
    className: '',
    html: htmlContent,
    iconAnchor: [45, 18],
    popupAnchor: [0, -20],
    iconSize: [90, 36],
  });

  const handleClick = () => {
    try {
      map.flyTo([lat, lng], 15, { duration: 0.5 });
    } catch(e) {}
    ctx.openDetail?.(r.id);
  };

  return (
    <Marker position={[lat, lng]} icon={icon} eventHandlers={{ click: handleClick }}>
      <Popup>
        <div style={{ fontFamily: "'Outfit',sans-serif", minWidth: 190 }} className="p-1">
          <div className="text-sm font-black mb-1 text-slate-800">{r.name || r.title}</div>
          <div className="text-[11px] text-slate-500 mb-2">📍 {r.area}, {r.city}</div>
          <div className="mb-3">
            <span className="font-black text-base text-slate-800">₹{rawPrice.toLocaleString()}{isMarket ? '' : '/mo'}</span>
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
    </Marker>
  );
}
