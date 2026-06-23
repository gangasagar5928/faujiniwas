import { calculateHaversineKm } from '../../src/military/haversine_geo.js';

describe('Haversine Geodesic Distance', () => {
  test('Zero distance between identical coordinates', () => {
    expect(calculateHaversineKm(28.6139, 77.2090, 28.6139, 77.2090)).toBe(0);
  });
  test('Distance between Delhi Cantt and Gurugram', () => {
    const dist = calculateHaversineKm(28.5921, 77.1212, 28.4595, 77.0266);
    expect(dist).toBeGreaterThan(15);
    expect(dist).toBeLessThan(25);
  });
});
