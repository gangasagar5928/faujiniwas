// Fauji Niwas Advanced Security & Trust Engine (Client-Side & Simulation Engine)

// 1. Rating Decay Constant (Decay rate over time - e.g. lambda = 0.005 per day)
export const DECAY_LAMBDA = 0.005;

/**
 * Calculates rating decay over time.
 * R_decayed = R * e^(-lambda * t)
 * @param {number} rating - Initial rating (1-5)
 * @param {number} createdAt - Timestamp of rating creation
 */
export function getDecayedRating(rating, createdAt) {
  if (!rating || !createdAt) return rating || 5;
  const daysElapsed = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.exp(-DECAY_LAMBDA * daysElapsed);
  return parseFloat((rating * decayFactor).toFixed(2));
}

/**
 * Computes price deviation Z-score for a listing: Z = (P - mean) / std_dev
 */
export function getPriceDeviationZScore(price, city, type) {
  // Modeled baseline prices and deviations per city/type
  const basePrices = {
    'Delhi': { '1BHK': 11000, '2BHK': 18000, '3BHK': 28000, 'std': 3000 },
    'Pune': { '1BHK': 9500, '2BHK': 14000, '3BHK': 22000, 'std': 2500 },
    'Lucknow': { '1BHK': 7500, '2BHK': 12000, '3BHK': 22000, 'std': 2000 },
    'Secunderabad': { '1BHK': 8500, '2BHK': 13000, '3BHK': 20000, 'std': 2200 },
    'Bengaluru': { '1BHK': 12000, '2BHK': 16000, '3BHK': 32000, 'std': 4000 }
  };

  const cityNorm = basePrices[city] || basePrices['Delhi'];
  const mean = cityNorm[type] || (type.includes('3') ? cityNorm['3BHK'] : cityNorm['2BHK']);
  const std = cityNorm['std'];

  const zScore = (price - mean) / std;
  return parseFloat(zScore.toFixed(2));
}

/**
 * Generate a simple content hash for anti-tamper verification
 */
export function generateContentHash(dataObj) {
  const str = JSON.stringify({
    name: dataObj.name,
    price: dataObj.price,
    city: dataObj.city,
    uid: dataObj.uid
  });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Calculates a dynamic Adversarial Trust Score (0-100)
 */
export function calculateAdversarialTrustScore(signals) {
  let score = 50; // Base score

  // 1. Attestation Signals
  if (signals.appCheckPassed) score += 30;
  if (signals.verifiedUser) score += 20;

  // 2. Behavioral Deductions
  if (signals.newDevice) score -= 10;
  if (signals.vpnDetected) score -= 15;
  if (signals.multipleReports) score -= 30;

  // 3. Anomaly & Suspicion Penalties
  if (signals.pricingAnomaly) score -= 20;
  if (signals.duplicateSuspect) score -= 15;
  if (signals.ratingDecayPenalty) score -= Math.min(15, parseFloat(signals.ratingDecayPenalty));

  return Math.max(0, Math.min(100, score));
}

/**
 * Formats a standardized SIEM-Lite log entry
 */
export function createSIEMLog(action, severity, desc, uid = 'anonymous', context = {}) {
  return {
    event: action,
    severity: severity, // info, medium, high
    desc: desc,
    uid: uid,
    timestamp: Date.now(),
    ip: context.ip || '127.0.0.1',
    deviceFingerprint: context.fingerprint || 'unknown_agent',
    vpn: !!context.vpn
  };
}
