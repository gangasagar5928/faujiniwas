export function generateAlertTopic(cantonmentId, minBhk = 2) {
  return `alerts_${cantonmentId}_${minBhk}bhk`;
}
