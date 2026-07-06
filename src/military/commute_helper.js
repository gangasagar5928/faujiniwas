export function estimateCommuteMinutes(distanceKm, trafficFactor = 1.2) {
  const avgSpeedKmh = 30.0; // Typical cantonment approach speed
  const hours = (distanceKm / avgSpeedKmh) * trafficFactor;
  return Math.ceil(hours * 60);
}
