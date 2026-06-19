export function calculateSchoolCommuteScore(distanceKm, busRouteAvailable) {
  let score = 100 - (distanceKm * 8);
  if (busRouteAvailable) score += 15;
  return Math.max(10, Math.min(100, Math.round(score)));
}
