export const DEFENCE_CLUB_FACILITIES = {
  TRANSIT_ROOMS: 'officers_transit_rooms',
  SWIMMING_POOL: 'olympic_pool',
  TENNIS_COURTS: 'clay_tennis_courts',
  OFFICERS_DINING: 'wardroom_and_dining',
  GYM_FITNESS: 'service_gymnasium',
};

export function canBookTransitRoom(userRank, membershipValid) {
  return membershipValid && userRank !== 'Civilian';
}
