export function isWithinBoundingBox(lat, lon, bbox) {
  return lat >= bbox.minLat && lat <= bbox.maxLat &&
         lon >= bbox.minLon && lon <= bbox.maxLon;
}

export const DELHI_CANTT_BBOX = {
  minLat: 28.5600,
  maxLat: 28.6200,
  minLon: 77.1000,
  maxLon: 77.1600,
};
