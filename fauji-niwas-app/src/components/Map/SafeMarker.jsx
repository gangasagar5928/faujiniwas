import { Marker as LeafletMarker, Circle as LeafletCircle } from 'react-leaflet';

/**
 * Safely creates a Leaflet Marker — returns null if position coordinates are
 * NaN, undefined, null, or otherwise invalid. Prevents the "Invalid LatLng
 * object: (NaN,NaN)" runtime error that crashes the map.
 */
export function SafeMarker({ position, children, ...props }) {
  const [rawLat, rawLng] = position || [];
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (isNaN(lat) || isNaN(lng) || !Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  return <LeafletMarker position={[lat, lng]} {...props}>{children}</LeafletMarker>;
}

export function SafeCircle({ center, children, ...props }) {
  const [rawLat, rawLng] = center || [];
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (isNaN(lat) || isNaN(lng) || !Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  return <LeafletCircle center={[lat, lng]} {...props}>{children}</LeafletCircle>;
}

export function safeLatLng(lat, lng) {
  if (lat == null || lng == null) return null;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng) || !Number.isFinite(nLat) || !Number.isFinite(nLng) || (nLat === 0 && nLng === 0)) return null;
  return [nLat, nLng];
}
