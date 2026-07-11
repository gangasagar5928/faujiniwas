export const POPULAR_GARRISONS = [
  'Pune Cantt', 'Delhi Cantt', 'Lucknow Cantt', 'Ambala Cantt',
  'Chandimandir', 'Secunderabad', 'Jalandhar Cantt', 'Dehradun Cantt',
  'Meerut Cantt', 'Bareilly Cantt', 'Bathinda Cantt', 'Jhansi Cantt'
];

export function filterGarrisons(query) {
  if (!query) return POPULAR_GARRISONS.slice(0, 6);
  const q = query.toLowerCase();
  return POPULAR_GARRISONS.filter(g => g.toLowerCase().includes(q));
}
