export function redactDefenceIdForDisplay(idString) {
  if (!idString || idString.length < 4) return '***';
  return idString.substring(0, 2) + '****' + idString.substring(idString.length - 2);
}
