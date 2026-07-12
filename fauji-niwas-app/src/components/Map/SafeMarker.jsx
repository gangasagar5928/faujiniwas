import { Marker as LeafletMarker, Circle as LeafletCircle } from 'react-leaflet';

/**
 * Safely creates a Leaflet Marker — returns null if position coordinates are
 * NaN, undefined, null, or otherwise invalid. Prevents the "Invalid LatLng
 * object: (NaN,NaN)" runtime error that crashes the map.
 */
export function SafeMarker({ position, children, ...props }) {
  const [lat, lng] = position || [];
  if (lat == null || lng == null) return null;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return <LeafletMarker position={[lat, lng]} {...props}>{children}</LeafletMarker>;
}

/**
 * Safely creates a Leaflet Circle — returns null if center coordinates are
 * invalid. Same NaN/isFinite guards as SafeMarker.
 */
export function SafeCircle({ center, children, ...props }) {
  const [lat, lng] = center || [];
  if (lat == null || lng == null) return null;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return <LeafletCircle center={[lat, lng]} {...props}>{children}</LeafletCircle>;
}

/**
 * Safely returns a coordinate array [lat, lng] or null.
 * Use this before passing coords to map.flyTo(), map.panTo(), etc.
 */
export function safeLatLng(lat, lng) {
  if (lat == null || lng == null) return null;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
  return [nLat, nLng];
}
