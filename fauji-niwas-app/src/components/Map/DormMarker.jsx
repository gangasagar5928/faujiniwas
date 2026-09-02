import { useContext } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ModalContext } from '../../App';

export default function DormMarker({ dorm: d }) {
  const map = useMap();
  const ctx = useContext(ModalContext);

  if (!d) return null;
  const lat = Number(d.lat);
  const lng = Number(d.lng);
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) {
    return null;
  }

  const icon = L.divIcon({
    className: 'custom-price-marker',
    html: `<div style="display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:18px;background:#ffffff;border:1.5px solid #e2e8f0;box-shadow:0 3px 10px rgba(0,0,0,0.25);white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:transform 0.15s ease;">
      <span style="font-size:13px;display:flex;align-items:center;">🏨</span>
      <span style="font-size:11px;font-weight:900;color:#0f172a;letter-spacing:0.2px;">${d.name ? d.name.split(' ')[0] : 'Dorm'}</span>
    </div>`,
    iconAnchor: [30, 34], popupAnchor: [0, -38], iconSize: [60, 34],
  });

  const handleClick = () => {
    try {
      map.flyTo([lat, lng], 15, { duration: 0.6 });
    } catch(e) {}
    ctx.openFood?.(d.city);
  };

  return (
    <Marker position={[lat, lng]} icon={icon} eventHandlers={{ click: handleClick }}>
      <Popup>
        <div style={{ fontFamily: "'Plus Jakarta Sans','Outfit',sans-serif", minWidth: 200 }}>
          <b style={{ fontSize: 15 }}>{d.name}</b><br />
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d.area}, {d.city}</span><br />
          <b style={{ color: '#0f172a', fontSize: 14 }}>₹{d.price}/night · {d.type}</b><br />
          <small style={{ color: 'var(--muted)' }}>🎯 {d.ssb} · 🚶 {d.distance} km gate</small><br />
          <button
            onClick={() => ctx.openFood?.(d.city)}
            style={{ marginTop: 10, width: '100%', background: 'var(--accent)', color: '#0f172a', border: 'none', padding: 9, borderRadius: 7, fontWeight: 700, cursor: 'pointer' }}
          >🍽️ Nearby Food & Mess</button>
        </div>
      </Popup>
    </Marker>
  );
}
