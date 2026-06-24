export const DefenceServiceBranch = {
  ARMY: 'Indian Army',
  NAVY: 'Indian Navy',
  AIR_FORCE: 'Indian Air Force',
  COAST_GUARD: 'Indian Coast Guard',
  PARAMILITARY: 'Assam Rifles / CAPF',
};

export function validateServiceNumberFormat(serviceNum) {
  // Typical formats: IC-12345A, SS-12345M, 12345678A
  const regex = /^[A-Z0-9]{2,4}-?[0-9]{4,8}[A-Z]?$/i;
  return regex.test(serviceNum.trim());
}
