import { CACHE_NAME, CACHED_ASSETS } from '../../src/military/map_cache.js';

describe('Map Offline Cache', () => {
  test('Cache name contains version', () => {
    expect(CACHE_NAME).toMatch(/v4/);
  });
  test('Cached assets includes leaflet core', () => {
    expect(CACHED_ASSETS).toContain('/assets/leaflet.js');
  });
});
