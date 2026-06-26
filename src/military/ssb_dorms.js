export const SSB_CENTERS = [
  { code: '11_SSB_ALLAHABAD', city: 'Prayagraj (Allahabad)', board: 'Selection Centre East' },
  { code: '21_SSB_BHOPAL', city: 'Bhopal', board: 'Selection Centre Central' },
  { code: '14_SSB_BANGALORE', city: 'Bengaluru', board: 'Selection Centre South' },
  { code: '17_SSB_JALANDHAR', city: 'Kapurthala / Jalandhar', board: 'Selection Centre North' },
  { code: '3AFSB_GANDHINAGAR', city: 'Gandhinagar', board: 'Air Force Selection Board' },
  { code: '4AFSB_VARANASI', city: 'Varanasi', board: 'Air Force Selection Board' },
];

export function getNearestSsbCenter(city) {
  return SSB_CENTERS.find(c => c.city.toLowerCase().includes(city.toLowerCase())) || null;
}
