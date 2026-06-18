export const AmenityType = {
  CSD_CANTEEN: 'csd_canteen',
  MILITARY_HOSPITAL: 'military_hospital',
  ECHS_POLYCLINIC: 'echs_polyclinic',
  ARMY_PUBLIC_SCHOOL: 'army_public_school',
  KENDRIYA_VIDYALAYA: 'kendriya_vidyalaya',
  OFFICERS_MESS: 'officers_mess',
};

export function evaluateAmenityProximity(distanceKm) {
  if (distanceKm <= 1.5) return 'Garrison Perimeter (<1.5 km)';
  if (distanceKm <= 4.0) return 'Immediate Cantonment (1.5 - 4.0 km)';
  if (distanceKm <= 8.0) return 'Accessible Commute (4.0 - 8.0 km)';
  return 'Outskirts (>8.0 km)';
}
