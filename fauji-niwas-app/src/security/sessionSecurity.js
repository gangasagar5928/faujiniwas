/**
 * Device Fingerprinting & Session Security
 * 
 * Generates a deterministic device fingerprint for login anomaly detection.
 * Tracks sessions in Firestore for multi-device awareness.
 */
import { db, doc, collection, getDocs, serverTimestamp } from '../firebase';
import { setDoc, deleteDoc, query, where } from 'firebase/firestore';

// ── Device Fingerprint ────────────────────────────────────

function generateDeviceFingerprint() {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform || 'unknown',
  ].join('|');

  // Simple hash (djb2) — not cryptographic, just for comparison
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function getDeviceLabel() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad/i.test(ua)) return 'iOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown Device';
}

function getBrowserLabel() {
  const ua = navigator.userAgent;
  if (/Chrome\//.test(ua) && !/Edg/.test(ua)) return 'Chrome';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  return 'Browser';
}

// ── Session Management ────────────────────────────────────

const SESSION_EXPIRY_DAYS = 7;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Records the current device session in Firestore.
 * Returns { isNewDevice, fingerprint, sessions }
 */
export async function registerDeviceSession(uid) {
  const fingerprint = generateDeviceFingerprint();
  const device = getDeviceLabel();
  const browser = getBrowserLabel();
  const sessionId = `${uid}_${fingerprint}`;
  const sessionRef = doc(db, 'sessions', sessionId);

  // Check if this fingerprint already exists (known device)
  let isNewDevice = false;

  try {
    const { getDoc } = await import('firebase/firestore');
    const snap = await getDoc(sessionRef);

    if (!snap.exists()) {
      isNewDevice = true;
    }

    // Upsert the session doc
    await setDoc(sessionRef, {
      uid,
      fingerprint,
      device,
      browser,
      lastLoginAt: serverTimestamp(),
      createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
      active: true,
    }, { merge: true });
  } catch (e) {
    console.warn('[SessionSec] Failed to register session:', e.message);
  }

  return { isNewDevice, fingerprint, device, browser };
}

/**
 * Gets all active sessions for a user.
 */
export async function getUserSessions(uid) {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('uid', '==', uid), where('active', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      lastLoginAt: d.data().lastLoginAt?.toDate?.() || null,
      createdAt: d.data().createdAt?.toDate?.() || null,
    }));
  } catch (e) {
    console.warn('[SessionSec] Failed to get sessions:', e.message);
    return [];
  }
}

/**
 * Terminates all sessions except the current one.
 */
export async function terminateAllOtherSessions(uid) {
  const currentFingerprint = generateDeviceFingerprint();
  const currentSessionId = `${uid}_${currentFingerprint}`;

  try {
    const sessions = await getUserSessions(uid);
    let terminated = 0;
    for (const s of sessions) {
      if (s.id !== currentSessionId) {
        await setDoc(doc(db, 'sessions', s.id), { active: false }, { merge: true });
        terminated++;
      }
    }
    return terminated;
  } catch (e) {
    console.warn('[SessionSec] Failed to terminate sessions:', e.message);
    return 0;
  }
}

/**
 * Terminates a specific session.
 */
export async function terminateSession(sessionId) {
  try {
    await setDoc(doc(db, 'sessions', sessionId), { active: false }, { merge: true });
    return true;
  } catch (e) {
    console.warn('[SessionSec] Failed to terminate session:', e.message);
    return false;
  }
}

// ── Session Expiry Check ──────────────────────────────────

/**
 * Checks if the current session has expired (> 7 days since last login).
 * Returns true if the user needs to re-authenticate.
 */
export function isSessionExpired(lastLoginTimestamp) {
  if (!lastLoginTimestamp) return false; // Can't determine, don't force re-auth
  const lastLogin = lastLoginTimestamp instanceof Date ? lastLoginTimestamp.getTime() : lastLoginTimestamp;
  return (Date.now() - lastLogin) > SESSION_EXPIRY_MS;
}

/**
 * Returns time remaining before session expires, in human-readable format.
 */
export function getSessionTimeRemaining(lastLoginTimestamp) {
  if (!lastLoginTimestamp) return 'Unknown';
  const lastLogin = lastLoginTimestamp instanceof Date ? lastLoginTimestamp.getTime() : lastLoginTimestamp;
  const remaining = SESSION_EXPIRY_MS - (Date.now() - lastLogin);

  if (remaining <= 0) return 'Expired';

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return '< 1h';
}

// ── Login Rate Tracking ───────────────────────────────────

/**
 * Records a login attempt. Returns { allowed, remaining } where remaining
 * is the number of attempts left before rate-limiting kicks in.
 * Max: 5 attempts per 10 minutes.
 */
export async function checkLoginRate(phoneNumber) {
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const MAX_ATTEMPTS = 5;

  const rateKey = `login_rate_${phoneNumber.replace(/\D/g, '')}`;
  const stored = localStorage.getItem(rateKey);

  let attempts = [];
  if (stored) {
    try {
      attempts = JSON.parse(stored);
    } catch (_) {
      attempts = [];
    }
  }

  // Filter to only attempts within the window
  const now = Date.now();
  attempts = attempts.filter(ts => (now - ts) < WINDOW_MS);

  if (attempts.length >= MAX_ATTEMPTS) {
    const oldestInWindow = Math.min(...attempts);
    const waitMs = WINDOW_MS - (now - oldestInWindow);
    const waitMin = Math.ceil(waitMs / 60000);
    return { allowed: false, remaining: 0, waitMinutes: waitMin };
  }

  // Record this attempt
  attempts.push(now);
  localStorage.setItem(rateKey, JSON.stringify(attempts));

  return { allowed: true, remaining: MAX_ATTEMPTS - attempts.length };
}

// ── Exports ───────────────────────────────────────────────

export {
  generateDeviceFingerprint,
  getDeviceLabel,
  getBrowserLabel,
  SESSION_EXPIRY_DAYS,
};
