import { isWithinBoundingBox, DELHI_CANTT_BBOX } from '../../src/military/cantonment_geofence.js';

describe('Cantonment Geofence Validator', () => {
  test('Point inside Delhi Cantt is recognized', () => {
    expect(isWithinBoundingBox(28.5921, 77.1212, DELHI_CANTT_BBOX)).toBe(true);
  });
  test('Point outside Delhi Cantt is rejected', () => {
    expect(isWithinBoundingBox(28.4500, 77.0200, DELHI_CANTT_BBOX)).toBe(false);
  });
});
