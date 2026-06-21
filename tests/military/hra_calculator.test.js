import { calculateHraEntitlement } from '../../src/military/hra_calculator.js';

describe('7th CPC HRA Calculator', () => {
  test('Class X city calculates 30% HRA for basic pay 56100 (Lt/Capt)', () => {
    expect(calculateHraEntitlement(56100, 'X')).toBe(16830);
  });
  test('Class Y city calculates 20% HRA for basic pay 61300 (Major)', () => {
    expect(calculateHraEntitlement(61300, 'Y')).toBe(12260);
  });
  test('Class Z station calculates 10% HRA for peace station', () => {
    expect(calculateHraEntitlement(56100, 'Z')).toBe(5610);
  });
});
