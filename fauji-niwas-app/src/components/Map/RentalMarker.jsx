import { useContext } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ModalContext } from '../../App';

function getHraColor(price) {
  return price <= 15000 ? '#22c55e' : price <= 30000 ? '#f4c542' : '#f43f5e';
}

export default function RentalMarker({ listing: r }) {
  const map = useMap();
  const ctx = useContext(ModalContext);

  if (!r || !r.lat || !r.lng || Number.isNaN(parseFloat(r.lat)) || Number.isNaN(parseFloat(r.lng))) {
    return null; // Prevent Map crash from invalid coordinates
  }

  const price = Number(String(r.price).replace(/[^0-9.]/g, '')) || 0;
  const isMarket = r._collection === 'market' || r._collection === 'marketplace';
  const color = isMarket ? '#14b8a6' : getHraColor(price);
  const label = isMarket
    ? `🪙 ₹${(price / 1000).toFixed(0)}K`
    : `₹${(price / 1000).toFixed(0)}K`;

  const icon = L.divIcon({
    className: '',
    html: `<div class="pm" style="--pm-color:${color};border-color:${color};color:${color};">${label}</div>`,
    iconAnchor: [30, 34], popupAnchor: [0, -38], iconSize: [60, 34],
  });

  const handleClick = () => {
    map.flyTo([r.lat, r.lng], 15, { duration: 0.5 });
    ctx.openDetail(r.id);
  };

  return (
    <Marker position={[r.lat, r.lng]} icon={icon} eventHandlers={{ click: handleClick }}>
      <Popup>
        <div style={{ fontFamily: "'Outfit',sans-serif", minWidth: 190 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{r.name || r.title}</div>
          <div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 6 }}>📍 {r.area}, {r.city}</div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color, fontWeight: 800, fontSize: 15 }}>₹{price.toLocaleString()}{isMarket ? '' : '/mo'}</span>
            {r.verified && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,.12)', padding: '2px 6px', borderRadius: 100, border: '1px solid rgba(34,197,94,.3)', marginLeft: 6 }}>✅ Verified</span>
            )}
          </div>
          <button
            onClick={handleClick}
            style={{ width: '100%', background: 'var(--accent)', color: '#000', padding: 10, border: 'none', borderRadius: 7, fontWeight: 800, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
          >
            View Full Details →
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
