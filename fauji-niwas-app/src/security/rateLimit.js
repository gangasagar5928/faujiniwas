/**
 * Client-Side Action Rate Limiter
 * Implements sliding window rate limiting to mitigate spam, denial-of-service,
 * credential stuffing, and SMS OTP exhaustion.
 */

const RATE_LIMIT_CONFIGS = {
  otp: { maxRequests: 3, windowMs: 5 * 60 * 1000, name: 'OTP requests' },
  listing: { maxRequests: 5, windowMs: 10 * 60 * 1000, name: 'Listing submissions' },
  review: { maxRequests: 5, windowMs: 60 * 1000, name: 'Reviews' },
  report: { maxRequests: 3, windowMs: 5 * 60 * 1000, name: 'Reports' },
  chat: { maxRequests: 25, windowMs: 60 * 1000, name: 'Chat messages' },
  login: { maxRequests: 5, windowMs: 5 * 60 * 1000, name: 'Login attempts' },
};

/**
 * Checks if an action is allowed under the rate limit.
 * If allowed, records the current timestamp and returns { allowed: true }.
 * If throttled, returns { allowed: false, message, retryAfterSeconds }.
 */
export function checkRateLimit(actionType, customKey = '') {
  const config = RATE_LIMIT_CONFIGS[actionType] || { maxRequests: 10, windowMs: 60 * 1000, name: actionType };
  const storageKey = `_fn_rl_${actionType}${customKey ? '_' + customKey : ''}`;
  const now = Date.now();

  let timestamps = [];
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (raw) {
      timestamps = JSON.parse(raw);
      if (!Array.isArray(timestamps)) timestamps = [];
    }
  } catch (_) {
    timestamps = [];
  }

  // Filter timestamps within sliding window
  const windowStart = now - config.windowMs;
  timestamps = timestamps.filter((t) => typeof t === 'number' && t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const oldestInWindow = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestInWindow + config.windowMs - now) / 1000);
    return {
      allowed: false,
      message: `Rate limit reached for ${config.name}. Please wait ${retryAfterSeconds}s before trying again.`,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  // Record new action
  timestamps.push(now);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(timestamps));
  } catch (_) {}

  return { allowed: true };
}
