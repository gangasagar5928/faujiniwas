import { useContext } from 'react';
import { Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ModalContext } from '../../App';
import { SafeMarker, safeLatLng } from './SafeMarker';

export default function DormMarker({ dorm: d }) {
  const map = useMap();
  const ctx = useContext(ModalContext);

  if (!d || !d.lat || !d.lng || Number.isNaN(parseFloat(d.lat)) || Number.isNaN(parseFloat(d.lng))) {
    return null; // Safety check
  }

  const safePos = safeLatLng(d.lat, d.lng);
  if (!safePos) return null;

  const icon = L.divIcon({
    className: '',
    html: `<div class="pm" style="border-color:#f4c542;color:#f4c542;background:#1a1a1a;font-size:17px;padding:6px 10px;">🏨</div>`,
    iconAnchor: [30, 34], popupAnchor: [0, -38], iconSize: [60, 34],
  });

  return (
    <SafeMarker position={safePos} icon={icon} eventHandlers={{
      click: () => {
        map.flyTo(safePos, 15, { duration: 0.6 });
        ctx.openFood(d.city);
      }
    }}>
      <Popup>
        <div style={{ fontFamily: "'Outfit',sans-serif", minWidth: 200 }}>
          <b style={{ fontSize: 15 }}>{d.name}</b><br />
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d.area}, {d.city}</span><br />
          <b style={{ color: '#f4c542', fontSize: 14 }}>₹{d.price}/night · {d.type}</b><br />
          <small style={{ color: 'var(--muted)' }}>🎯 {d.ssb} · 🚶 {d.distance} km gate</small><br />
          <button
            onClick={() => ctx.openFood(d.city)}
            style={{ marginTop: 10, width: '100%', background: '#f4c542', color: '#000', border: 'none', padding: 9, borderRadius: 7, fontWeight: 700, cursor: 'pointer' }}
          >🍽️ Nearby Food & Mess</button>
        </div>
      </Popup>
    </SafeMarker>
  );
}
