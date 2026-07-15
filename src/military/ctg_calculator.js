import { estimateCompositeTransferGrant } from './relocation_allowance.js';

export function calculateRelocationBudget(basicPay, familyMembers, distanceKm) {
  const ctg = estimateCompositeTransferGrant(basicPay);
  const luggageAllowance = distanceKm > 500 ? 15000 : 8000;
  return {
    ctgAmount: ctg,
    luggageAllowance: luggageAllowance,
    totalGrant: ctg + luggageAllowance,
  };
}
