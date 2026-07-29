export function generateLeaseMetadata(tenantName, rank, unit, landlordName, rentAmount) {
  return {
    tenant: `${rank} ${tenantName} (${unit})`,
    landlord: landlordName,
    monthlyRent: rentAmount,
    generatedDate: new Date().toISOString().split('T')[0],
    militaryClauseIncluded: true,
  };
}
