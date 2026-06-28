import { getNearestSsbCenter, SSB_CENTERS } from '../../src/military/ssb_dorms.js';

describe('SSB Transit Locator', () => {
  test('Contains minimum 6 major selection boards', () => {
    expect(SSB_CENTERS.length).toBeGreaterThanOrEqual(6);
  });
  test('Finds Bhopal selection center', () => {
    const center = getNearestSsbCenter('Bhopal');
    expect(center).not.toBeNull();
    expect(center.code).toBe('21_SSB_BHOPAL');
  });
});
