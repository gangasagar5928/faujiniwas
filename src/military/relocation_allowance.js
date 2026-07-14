export function estimateCompositeTransferGrant(basicPay) {
  // 7th CPC CTG rate = 80% of last drawn Basic Pay for transfers over 20km
  return Math.round(basicPay * 0.80);
}
