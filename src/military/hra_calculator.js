export const HRA_RATES_7TH_CPC = {
  X: 0.30, // 30% for 50L+ population (Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad)
  Y: 0.20, // 20% for 5L to 50L population
  Z: 0.10, // 10% for remaining areas
};

export function calculateHraEntitlement(basicPay, cityTier) {
  const rate = HRA_RATES_7TH_CPC[cityTier.toUpperCase()] || HRA_RATES_7TH_CPC.Z;
  return Math.round(basicPay * rate);
}
