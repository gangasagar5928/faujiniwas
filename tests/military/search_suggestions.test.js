import { filterGarrisons } from '../../src/military/search_suggestions.js';

describe('Garrison Search Suggestions', () => {
  test('Empty query returns default top garrisons', () => {
    expect(filterGarrisons('').length).toBe(6);
  });
  test('Query "Pune" returns Pune Cantt', () => {
    const res = filterGarrisons('Pune');
    expect(res).toContain('Pune Cantt');
  });
});
