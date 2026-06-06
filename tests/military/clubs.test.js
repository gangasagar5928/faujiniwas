import { canBookTransitRoom, DEFENCE_CLUB_FACILITIES } from '../../src/military/clubs_schema.js';

describe('Defence Services Club Facilities', () => {
  test('Officer with valid card can book transit rooms', () => {
    expect(canBookTransitRoom('Major', true)).toBe(true);
  });
  test('Civilian without service card is restricted', () => {
    expect(canBookTransitRoom('Civilian', true)).toBe(false);
  });
});
