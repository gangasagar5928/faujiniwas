# Fauji Niwas — Defence Portal Security Hardening & Audit Report
**Audit Date**: 21 November 2026  
**Audited Target**: Fauji Niwas Monorepo (`fauji-niwas-app`, `android-app`, `firebase.json`, `firestore.rules`, `storage.rules`)  
**Status**: PASSED · Hardened to Defence Grade  

---

## 1. Executive Summary
A comprehensive end-to-end security audit and remediation was conducted across the entire Fauji Niwas codebase. All high-risk attack vectors—including missing IDOR ownership checks in database rules, reflected XSS in the transfer chatbot, exposed build logs, hardcoded mobile client credentials, lax password rules, and missing admin route protection—have been eliminated.

---

## 2. Key Hardening Actions & Remediations

### 2.1 API Key Protection & Environment Variables
- **Issue**: Firebase API key was statically declared in Android `FirebaseConfig.kt`.
- **Fix**: Replaced hardcoded strings with dynamic `BuildConfig.FIREBASE_API_KEY` loaded via Gradle properties or `System.getenv("FIREBASE_API_KEY")`.
- **Environment Checks**: Added runtime validation in `src/firebase.js` that checks for missing `.env` parameters (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`).
- **CI Injection**: Updated `.github/workflows/deploy.yml` to supply all required `VITE_FIREBASE_*` and `VITE_GOOGLE_MAPS_API_KEY` secrets into `npm run build`.

### 2.2 Database & Cloud Storage Security (Firestore & Storage Rules)
- **Issue**:
  - `rentals` and `marketplace` allowed any signed-in user to overwrite other users' listings or inject arbitrary UIDs.
  - `transfers` and `food_reviews` allowed unauthenticated/arbitrary delete and update operations.
  - `storage.rules` did not enforce upload size quotas or MIME-type boundaries.
- **Fix**:
  - Enforced zero-trust ownership (`request.resource.data.uid == request.auth.uid`) on every collection create.
  - Enforced resource-level ownership (`resource.data.uid == request.auth.uid || isAdmin()`) on updates and deletes across `rentals`, `marketplace`, `transfers`, and `food_reviews`.
  - Locked `verified` listing badges strictly to administrator updates; normal users cannot tamper with badges.
  - Implemented 10MB photo quota and strict `image/*` MIME-type validation in `storage.rules`.
  - Added root `storage.rules` and synchronized root `firebase.json` with storage rules.

### 2.3 Admin Route Protection & RBAC
- **Issue**: No dedicated `/admin` route existed; admin components relied solely on client state without defense-in-depth authorization gates.
- **Fix**:
  - Created dedicated `/admin` route in `main.jsx` and added dev/prod URL rewrites in `firebase.json` and `vite.config.js`.
  - Implemented `AdminPage.jsx` with strict authentication and role checking (`isAdmin`). Non-admins receive an explicit 403 Forbidden screen.
  - Added internal authorization guards inside `AdminPanel.jsx` and `AdminModal.jsx`.

### 2.4 Form Sanitization & Anti-XSS (DOMPurify & Entity Encoding)
- **Issue**: `public/chatbot.js` inserted user-supplied station names directly into DOM `innerHTML`, allowing reflected XSS.
- **Fix**:
  - Introduced `src/security/sanitize.js` using `DOMPurify` and custom HTML entity encoders.
  - Replaced unsafe `innerHTML` assignments in `chatbot.js` with `textContent` and entity-escaped HTML templates.
  - Sanitized form inputs in `PostModal.jsx`, `FoodPanel.jsx`, `ReportModal.jsx`, `ChatModal.jsx`, and `ProfileModal.jsx`.

### 2.5 Rate Limiting & Throttling
- **Implementation**: Created `src/security/rateLimit.js` implementing a sliding-window token bucket.
- **Enforced Limits**:
  - Phone / SMS OTP: Max 3 requests per 5 minutes
  - Listing submissions: Max 5 per 10 minutes
  - Food & Mess Reviews: Max 5 per minute
  - Moderation Reports: Max 3 per 5 minutes
  - E2EE Chat Messages: Max 25 per minute
  - Email Login / Password Resets: Max 5 per 5 minutes

### 2.6 Cryptographic Hardening & Password Security
- **PBKDF2 Work Factor**: Upgraded passphrase key derivation in `documentEncrypt.js` from 100,000 to **600,000 iterations** (OWASP-recommended for PBKDF2-HMAC-SHA256).
- **Key Extraction Defense**: Set `extractable: false` on derived AES-GCM shared keys in `e2ee.js` to prevent symmetric key theft via malicious scripts.
- **Password Strength**: Enforced minimum 8 characters with required alphanumeric complexity on account registration.
- **Password Recovery**: Added self-service password reset integration via `sendPasswordResetEmail`.

### 2.7 Security Headers & CORS Policy
- Synchronized and hardened `firebase.json` headers:
  - `Content-Security-Policy`: Restricted scripts, frames, connect origins, styles, and fonts; disabled object-src; restricted frame-ancestors to `'self'`.
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `SAMEORIGIN`
  - `X-XSS-Protection`: `1; mode=block`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: `camera=(), microphone=(), fullscreen=(self), geolocation=(self), payment=()`
  - `Cross-Origin-Opener-Policy`: `same-origin`
  - `Cross-Origin-Resource-Policy`: `same-origin`
- Verified default Same-Origin Policy (SOP) is strictly maintained with no wildcard `Access-Control-Allow-Origin: *` headers.

### 2.8 Debug Mode Disabled & Production Hardening
- Configured Vite `esbuild.drop: ['console', 'debugger']` in production builds.
- Disabled production sourcemaps (`build.sourcemap = false`) to prevent source exposure.
- Removed legacy `fn_mock_user` admin auto-escalation paths from production logic.

### 2.9 Dependency & File Pruning
- Removed unused heavy dependencies: `@react-google-maps/api`, `xlsx`, `jspdf-autotable`.
- Added `dompurify` explicitly to project dependencies.
- Purged git-tracked `build_log.txt` and empty `scratch/rewrite_dashboard.js`.
- Deleted untracked local debug logs (`deploy_debug.log`, `deploy_debug2.log`).
- Added `**/security-scanner.html` and `**/scanner.css` to `firebase.json` ignore list to prevent external reconnaissance.

---

## 3. Git History Secret Scan Results
- Scanned all commits from repository genesis to `HEAD`.
- No private keys (RSA/EC/PEM), SSH keys, AWS access keys, or third-party secret tokens were detected in git history.
- Historical client identifiers (Firebase public Web client IDs) are non-secret client endpoints guarded by Firestore rules.

---

## 4. Security Commit Timeline (9th Nov – 21st Nov 2026)
| Commit | Date | Summary |
|---|---|---|
| `545c73f` | 2026-11-09 | `security(env)`: Hide mobile credentials, validate environment variables, configure CI secret injection |
| `50f7af7` | 2026-11-11 | `security(db)`: Enforce zero-trust ownership checks, badge anti-tamper, and storage upload quotas |
| `5eb8513` | 2026-11-13 | `security(xss)`: Introduce DOMPurify sanitization engine and fix reflected XSS in transfer chatbot |
| `7cb8054` | 2026-11-15 | `feat(admin)`: Add protected admin route `/admin` and enforce defense-in-depth RBAC gates |
| `f58fe65` | 2026-11-17 | `security(ratelimit)`: Implement sliding-window rate limiters for postings, chats, reports, and reviews |
| `4d27c10` | 2026-11-19 | `security(crypto)`: Upgrade PBKDF2 to 600k iterations, lock down E2EE keys, and disable debug mode |
| `[HEAD]`  | 2026-11-21 | `security(audit)`: Apply strict CSP and security headers, prune dead dependencies, purge exposed files, complete audit |
