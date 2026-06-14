# 🪖 Fauji Niwas — Product Roadmap, Security, and Architecture
> **The comprehensive, production-grade technical documentation and development blueprint for India’s military relocation operating system.**
> Live Web Platform: [faujiniwas.web.app](https://faujiniwas.web.app)
> Version: 3.6.0 (Security Hardening Roadmap Update)

---

## 📋 Detailed Table of Contents

1. [Core Identity & Strategic Positioning](#1-core-identity--strategic-positioning)
   - 1.1 Project Objective & Problem Statement
   - 1.2 Strategic Cantonment Advantage
   - 1.3 Target Demographics & Indian Defence Ecosystem
   - 1.4 HRA / Rank-Based Housing Budget Guidance Heuristics
2. [Technology Stack Deep Dive](#2-technology-stack-deep-dive)
   - 2.1 React Core & Vite Bundling Orchestration
   - 2.2 Global State Architecture (Zustand Slices)
   - 2.3 Map Engine (Leaflet.js, OpenStreetMap, & Marker Clustering)
   - 2.4 Progressive Web App (PWA) Offline Strategy
   - 2.5 Native Android Flutter Shell Integration
3. [System Architecture & Precise Data Flows](#3-system-architecture--precise-data-flows)
   - 3.1 High-Level Hybrid Cloud Architecture
   - 3.2 Live Database Synchronisation Data Flow
   - 3.3 Dynamic Peer-to-Peer Cryptographic Session Flow
4. [Firestore Database Schemas](#4-firestore-database-schemas)
   - 4.1 `/users` Collection Schema
   - 4.2 `/verifications` Collection Schema
   - 4.3 `/listings` Collection Schema
   - 4.4 `/chats` Collection Schema
   - 4.5 `/notices` (Cantt Bulletin Board) Collection Schema
   - 4.6 `/tiffin_orders` Collection Schema
5. [Feature Architecture & Core Algorithms](#5-feature-architecture--core-algorithms)
   - 5.1 Station-Adjacent Commute Proximity Calculation (Haversine Formula)
   - 5.2 Dynamic Trust-Graph & Peer Reputation Scoring (Trust Graph 2.0)
   - 5.3 CSD Home Tiffin Matching & Diet Algorithms
6. [Native Android Shell & Bridge Configuration](#6-native-android-shell--bridge-configuration)
   - 6.1 `InAppWebView` JavaScript Bridge Overrides
   - 6.2 Native Geolocation & File Selection Handling
   - 6.3 Gradle Build Target Specifications
7. [Comprehensive Privacy Policy & DPDP Act Principles](#7-comprehensive-privacy-policy--dpdp-act-principles)
   - 7.1 Data Protection Principles & Indian Context
   - 7.2 Strict Personal Identifiable Information (PII) Isolation
   - 7.3 Data Audits & Automatic Deletion Protocols
8. [Security Governance & Cryptographic Architecture](#8-security-governance--cryptographic-architecture)
   - 8.1 Client-Side AES-256-GCM Document Encryption Vault
   - 8.2 End-to-End Encrypted (E2EE) ECDH P-256 Session Key Rotation
   - 8.3 In-App Vulnerability & CSP Audit Specifications
9. [Threat Modeling (STRIDE) & Security Controls](#9-threat-modeling-stride--security-controls)
   - 9.1 Assets & Security Objectives
   - 9.2 Trust Boundaries & Entry Points
   - 9.3 STRIDE Threats by Subsystem
   - 9.4 Mitigation Matrix (Controls → Attacks)
   - 9.5 Security Test Plan (What to Validate)
10. [RBAC Documentation (Roles, Permissions, Enforcement)](#10-rbac-documentation-roles-permissions-enforcement)
   - 10.1 Roles Overview
   - 10.2 Permission Model (What each role can do)
   - 10.3 Enforcement Points (Client vs Rules vs Server)
   - 10.4 Admin Workflows & Approval Queues
   - 10.5 RBAC Change Management
11. [Audit Logs (Security & Compliance)](#11-audit-logs-security--compliance)
   - 11.1 What to Log (Event Taxonomy)
   - 11.2 Suggested Firestore Data Model
   - 11.3 Retention, Integrity, and Access Control
   - 11.4 Audit Review Cadence
12. [Firebase App Check (Abuse Prevention & Integrity)](#12-firebase-app-check-abuse-prevention--integrity)
   - 12.1 Threats this mitigates
   - 12.2 Deployment Strategy (Web + Android)
   - 12.3 Enforcement Rollout Plan
   - 12.4 Failure Handling & Observability
13. [Incident Response (IR) & Postmortems](#13-incident-response-ir--postmortems)
   - 13.1 Incident Severity Levels
   - 13.2 Detection & Triage Signals
   - 13.3 Containment, Eradication, Recovery
   - 13.4 Evidence Preservation & Legal Readiness
   - 13.5 Post-incident Review Checklist
14. [Detailed Historical Milestones (Phases 1–8)](#14-detailed-historical-milestones-phases-1-8)
   - 14.1 Phase 1: Foundational Framework
   - 14.2 Phase 2: Trust & Quality
   - 14.3 Phase 3: Communication Layer
   - 14.4 Phase 4: Expansion & Data Pulse
   - 14.5 Phase 5: Design Systems 2.0
   - 14.6 Phase 6: Intelligence & HUD
   - 14.7 Phase 7: Native Stability
   - 14.8 Phase 8: Hardened Security
15. [Advanced Relocation Infrastructure (Phases 9–20)](#15-advanced-relocation-infrastructure-phases-9-20)
    - 15.1 Phase 9: All-India Data Saturation
    - 15.2 Phase 10: Relocation Operating System
    - 15.3 Phase 11: Defence Ecosystem Expansion
    - 15.4 Phase 12: AI Intelligence Layer & Concierge
    - 15.5 Phases 13–15: Scale & Market Maturity
    - 15.6 Phases 16–20: Global Scale & Super App
16. [Privacy-First Community Protection Suite (Phases 21–25)](#16-privacy-first-community-protection-suite-phases-21-25)
    - 16.1 Phase 21: Connection Security Gatekeeper
    - 16.2 Phase 22: Offline Compass & Commute Navigation
    - 16.3 Phase 23: Veteran ECHS Health & Pension Vault
    - 16.4 Phase 24: Checked Title Proofs & Rental Agreement Badges
    - 16.5 Phase 25: Offline Mesh SOS Distress Broadcaster

---

## 1. CORE IDENTITY & STRATEGIC POSITIONING

### 1.1 Project Objective & Problem Statement
Every year, thousands of military and paramilitary families in India face sudden relocation orders. The transfer process is logistically complex, physically demanding, and vulnerable to housing brokers who charge exorbitant, illegal fees. **Fauji Niwas** provides a privacy-first, no-broker digital housing finder designed specifically to help active-duty soldiers, veterans, and military families find safe, Cantonment-adjacent rentals, shared roommates, home-cooked food, and packers & movers options without losing data privacy.

### 1.2 Strategic Cantonment Advantage
Unlike commercial real estate platforms that focus heavily on commercial hotspots and high-margin high-rises, Fauji Niwas is specifically built around **Cantonment Areas (Military Stations)**. We offer:
* **Station-Adjacent Locality Mapping**: Centering listings and amenities close to station boundaries and critical access points.
* **ID-Based Credentialing**: Vetting user accounts through voluntary, community-led verification using masked credentials.
* **Institutional Landmark Proximity**: Showing immediate walking or driving travel times to crucial locations like Unit Run Canteens (URCs), Military Hospitals (MH), Army Public Schools (APS), and Kendriya Vidyalayas (KV).

### 1.3 Target Demographics & Indian Defence Ecosystem
The platform actively serves four critical segments of the Indian Defence forces:
1. **Relocating Families**: Personnel seeking secure, family-friendly rental units close to Cantonment gates, school bus routes, and URC depots.
2. **Duty Bachelors & Officers**: Young officers seeking single rooms, tiffin services, and military roommates to share costs.
3. **SSB Candidates**: Aspirants attending selection boards near Bhopal, Kapurthala, Prayagraj, Coimbatore, and Bangalore, requiring walking-distance dormitories and budget auto guides.
4. **Retired Veterans**: Senior veterans seeking retirement properties adjacent to major Station Hospitals and ECHS polyclinics.

### 1.4 HRA / Rank-Based Housing Budget Guidance Heuristics
Because actual House Rent Allowance (HRA) depends dynamically on pay matrix levels, city classifications (Class X, Y, and Z), postings, and official quarters availability, the platform uses basic rent guidance benchmarks:
* **OR (Other Ranks / Sepoy to Havildar)**: Budget limits targeting ₹5,000 – ₹15,000/month.
* **JCO (Junior Commissioned Officers / Naib Subedar to Subedar Major)**: Budget limits targeting ₹15,000 – ₹30,000/month.
* **Officer (Lieutenant to General)**: Budget limits targeting ₹30,000 – ₹60,000+/month.

---

## 2. TECHNOLOGY STACK DEEP DIVE

### 2.1 React Core & Vite Bundling Orchestration
The web interface is engineered as an ultra-fast Single Page Application (SPA) using **React 18** and **Vite**.
* **Chunk Splitting Strategy**: Vite is configured with manual chunking inside `vite.config.js` to separate React core modules from Leaflet maps, Firebase services, and Zustand stores. This produces optimized split bundles to ensure fast loading times on field networks.
* **Zero-Bleed CSS**: Vanishing vanilla CSS Modules maintain structural class scoping, ensuring that styling remains isolated.

### 2.2 Global State Architecture (Zustand Slices)
Global state is managed via **Zustand**, with persistent state written directly to IndexedDB or LocalStorage.
```javascript
// Example Zustand Store Split Configuration
export const useFilterStore = create((set) => ({
  listings: [],
  activeView: 'rentals',
  showCommuteZones: false,
  showSchools: false,
  showHospitals: false,
  showCanteens: false,
  setActiveView: (view) => set({ activeView: view }),
  setListings: (list) => set({ listings: list }),
}));
```

### 2.3 Map Engine (Leaflet.js, OpenStreetMap, & Marker Clustering)
* **Leaflet OSM Tiles**: OpenStreetMap raster tiles are dynamically rendered with custom canvas overlays for high-performance navigation.
* **Marker Clustering**: Utilises `leaflet.markercluster` to dynamically group high-density properties, maintaining smooth rendering layouts optimized for low-end devices.

### 2.4 Progressive Web App (PWA) Offline Strategy
* **Service Workers**: Aggressive caching assets store map scripts, application shells, and previous housing queries.
* **Offline Fallbacks**: When internet connection drops, the PWA displays cached properties and switches the mapping screen to the offline vector navigation compass.

### 2.5 Native Android Flutter Shell Integration
* **Flutter InAppWebView**: Leverages an optimized native Flutter WebView shell that injects custom headers, bypasses web engine rendering latency, and bridges the device camera and file system securely.

---

## 3. SYSTEM ARCHITECTURE & PRECISE DATA FLOWS

### 3.1 High-Level Hybrid Cloud Architecture
```mermaid
graph TD
    User((Defence User))
    AndroidShell[Android Native App - Target SDK 34]
    ReactApp[React 18 / Vite Frontend]
    FirebaseBaaS[Firebase Backend as a Service]
    CryptoEngine[Web Crypto API Core]
    LocalDB[(IndexedDB / LocalStorage)]
    OSM[OpenStreetMap Tile Server]

    User --> AndroidShell
    AndroidShell -->|Bridges Geolocation & Files| ReactApp
    ReactApp -->|Calculates Haversine Proximity| OSM
    ReactApp -->|Decrypts Client-Side| CryptoEngine
    CryptoEngine -->|Stores E2EE Session Keys| LocalDB
    ReactApp -->|SMS Authentication| FirebaseBaaS
    ReactApp -->|Real-Time Snapshot Listeners| FirebaseBaaS
```

### 3.2 Live Database Synchronisation Data Flow
1. **Real-time Synchronization**: Client-initiated Firestore realtime subscription queries targeting the `/listings` collection.
2. **Client-Side Geo-Filtering**: Properties are filtered in-memory based on proximity to selected Cantonment coordinates.
3. **Outlier Flags**: The client performs local mathematical rent evaluations against city average prices, instantly raising warning flags on listing cards if price anomalies are detected.

### 3.3 Dynamic Peer-to-Peer Cryptographic Session Flow
```mermaid
sequenceDiagram
    participant Alice as Alice (Soldier)
    participant DB as Cloud Firestore
    participant Bob as Bob (Verified Host)

    Alice->>Alice: Generate ECDH P-256 Keypair
    Alice->>DB: Publish Public Key (Alice)
    Bob->>DB: Fetch Alice's Public Key
    Bob->>Bob: Generate ECDH P-256 Keypair
    Bob->>DB: Publish Public Key (Bob)
    Alice->>DB: Fetch Bob's Public Key
    Alice->>Alice: Derive Shared Secret Locally (ECDH)
    Bob->>Bob: Derive Shared Secret Locally (ECDH)
    Alice->>Bob: Run HKDF to derive symmetric AES-256-GCM Key
    Bob->>Alice: Exchange encrypted messages via Firestore
```

---

## 4. FIRESTORE DATABASE SCHEMAS

### 4.1 `/users` Collection Schema
```json
{
  "uid": "string (Firebase Auth UID)",
  "phoneNumber": "string (+91...)",
  "displayName": "string (DisplayName)",
  "rank": "string (OR | JCO | Officer)",
  "verified": "boolean | string (true | false | 'pending')",
  "points": "number (Community contribution score)",
  "notification": "string | null (Pushed alert message)",
  "createdAt": "timestamp"
}
```

### 4.2 `/verifications` Collection Schema
```json
{
  "uid": "string (User UID)",
  "verificationDoc": "string (Encrypted base64 ciphertext of ID document - Deleted post-review)",
  "uploadedAt": "timestamp",
  "status": "string ('pending' | 'approved' | 'rejected')"
}
```

### 4.3 `/listings` Collection Schema
```json
{
  "id": "string (Auto ID)",
  "uid": "string (Owner UID)",
  "name": "string (Listing Title)",
  "price": "number (Monthly rental price)",
  "city": "string (Cantonment City)",
  "area": "string (Locality name)",
  "lat": "number (Decimal coordinate)",
  "lng": "number (Decimal coordinate)",
  "distance": "number (Distance to main gate in km)",
  "type": "string (flat | room | house | pg)",
  "ownerType": "string (defence | civilian | broker)",
  "verified": "boolean (Title checked and payment-intent workflow protected)",
  "available": "string ('⚡ Now' | date)",
  "mediaUrls": "array [string (Storage webp paths)]",
  "rating": "number (Average host score)",
  "createdAt": "number (Epoch timestamp)"
}
```

### 4.4 `/chats` Collection Schema
```json
{
  "id": "string (Auto ID)",
  "participants": "array [string (UIDs)]",
  "lastMessage": "string (AES-256-GCM Encrypted ciphertext preview or metadata-safe stub)",
  "lastUpdated": "timestamp",
  "messages": "subcollection"
}
```

### 4.5 `/notices` (Cantt Bulletin Board) Collection Schema
```json
{
  "id": "string (Auto ID)",
  "cantt": "string (Delhi | Pune | Ambala | Secunderabad)",
  "category": "string (school | canteen | blood | event)",
  "title": "string (Post content)",
  "upvotes": "number (Count of military votes)",
  "votedUsers": "array [string (User UIDs)]",
  "createdAt": "timestamp"
}
```

### 4.6 `/tiffin_orders` Collection Schema
```json
{
  "id": "string (Auto ID)",
  "tiffinId": "string (Target Tiffin Vendor ID)",
  "buyerUid": "string (User UID)",
  "dietType": "string (veg | non-veg | high-protein)",
  "duration": "string (monthly | weekly | trial)",
  "status": "string (pending | active | completed)",
  "createdAt": "timestamp"
}
```

---

## 5. FEATURE ARCHITECTURE & CORE ALGORITHMS

### 5.1 Station-Adjacent Commute Proximity Calculation (Haversine Formula)
To compute precise driving boundaries without requesting paid, external mapping APIs, the Leaflet Overlay calculates the **Haversine Formula** locally in JavaScript:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cdot\cos(\phi_2)\cdot\sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2\cdot\operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R\cdot c$$

*Where $R = 6371\text{ km}$ (Earth's radius), $\phi$ is latitude, and $\lambda$ is longitude.*
```javascript
export function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}
```

### 5.2 Dynamic Trust-Graph & Peer Reputation Scoring (Trust Graph 2.0)
Fauji Niwas computes a real-time reputation trust score ($T$) ranging from 10 to 100 for every rental listing:

$$T = V_{id} + O_{def} + R_{avg}$$

*   $V_{id}$ (Verification Weight): $+30$ points if the listing is title-verified.
*   $O_{def}$ (Host Weight): $+30$ points if the owner is an active-duty or retired defence member.
*   $R_{avg}$ (Rating Weight): Calculated as $\text{Rating} \times 8$ (up to $+40$ points for a 5-star rating).

Listings with a score $T \ge 90$ are automatically awarded the golden **🎖️ Command Recommended** badge.

### 5.3 CSD Home Tiffin Matching & Diet Algorithms
Matching relocators with verified cooks targets military-specific diet protocols:
*   **High-Protein (SSB/Duty Candidates)**: Minimum 65g protein, low fat, high fiber.
*   **Heart-Healthy (Senior Veterans)**: Low sodium, non-processed, organic wheat chapatis.
*   **Free Delivery Boundary**: Integrated boundary calculation matching the seller's geofence limits against the Cantonment entrance checkpoints.

---

## 6. NATIVE ANDROID SHELL & BRIDGE CONFIGURATION

### 6.1 `InAppWebView` JavaScript Bridge Overrides
The Flutter shell overrides native rendering behaviors to run the React PWA in full-screen native contexts:
```dart
// Flutter Controller setup
InAppWebViewSettings settings = InAppWebViewSettings(
  useShouldOverrideUrlLoading: true,
  mediaPlaybackRequiresUserGesture: false,
  allowsInlineMediaPlayback: true,
  iframeAllowFullscreen: true,
  geolocationEnabled: true,
  userAgent: "FaujiNiwas/1.0 (Android Native Mobile Shell)"
);
```

### 6.2 Native Geolocation & File Selection Handling
*   **Geolocation**: Direct native bridge hooks intercept standard HTML5 `navigator.geolocation` triggers, feeding GPS coordinate values directly from native device sensors.
*   **File Chooser**: An overridden WebChromeClient callback intercepts `<input type="file">` file uploads, launching the secure native system file selector for document verification and ECHS card uploads.

### 6.3 Gradle Build Target Specifications (⬜ Planned / 🟡 In Progress)
*   `compileSdkVersion`: 34
*   `minSdkVersion`: 24 (Ensuring compatibility with older, entry-level Android devices used by military jawans and veteran families)
*   `targetSdkVersion`: 34
*   Permissions Required in `AndroidManifest.xml`:
    *   `android.permission.ACCESS_FINE_LOCATION`
    *   `android.permission.CAMERA`
    *   `android.permission.READ_MEDIA_IMAGES`

---

## 7. COMPREHENSIVE PRIVACY POLICY & DPDP ACT PRINCIPLES

### 7.1 Data Protection Principles & Indian Context
Fauji Niwas is designed with India's **Digital Personal Data Protection (DPDP) Act, 2023 principles in mind**. Personal details of serving military officers and jawans are carefully guarded to preserve locational privacy.

### 7.2 Strict Personal Identifiable Information (PII) Isolation
*   **No Advertising or Analytics SDKs**: We completely block third-party trackers to prevent telemetry aggregation.
*   **Phone Number Safeguard**: User phone numbers are only parsed during OTP checks and are never shared publicly. Peer-to-peer chats and anonymous WhatsApp redirect APIs are used for direct communication.

### 7.3 Data Audits & Automatic Deletion Protocols
All verification credentials (military IDs, posting orders, land registry deeds) are **automatically purged** from active server disks once the admin completes the review. Only locally encrypted cryptographic hashes are retained for session integrity.

---

## 8. SECURITY GOVERNANCE & CRYPTOGRAPHIC ARCHITECTURE

### 8.1 Client-Side AES-256-GCM Document Encryption Vault
Before transmitting lease contracts, veteran records, or service proofs to cloud storage, the application encrypts the files locally using a security-focused cryptographic design:
1.  Derives a 256-bit key from a user-provided passphrase using **PBKDF2** (100,000 iterations, SHA-256, 16-byte random salt).
2.  Encrypts the raw document payload using **AES-256-GCM** with a unique 12-byte initialization vector (IV).
3.  Uploads only the encrypted ciphertext envelope, leaving the private decryption keys stored locally. Keys are generated using Web Crypto API and persisted in IndexedDB as non-extractable CryptoKey where supported.

### 8.2 End-to-End Encrypted (E2EE) ECDH P-256 Session Key Rotation
Every chat session between a tenant and a verified host utilizes dynamic key exchanges:
*   **Curve**: **ECDH P-256** (secp256r1) generates local key pairs inside IndexedDB.
*   **Keys Persistence**: Keys are generated using Web Crypto API and persisted in IndexedDB as non-extractable CryptoKey where supported.
*   **Session Secret**: The shared secret is derived locally and converted to a symmetric session key via **HKDF-SHA256**.
*   **Key Fingerprints / Safety Verification**: Users can trigger manual session key rotations. The interface displays safety verification fingerprints to authenticate key integrity.

### 8.3 In-App Vulnerability & CSP Audit Specifications
The application enforces a Content Security Policy (CSP) to block Cross-Site Scripting (XSS) and code injection:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
```
*   **CSP Inline Exceptions**: Current CSP baseline exists; future hardening will remove unsafe-inline using nonces/hashes.

---

## 9. THREAT MODELING (STRIDE) & SECURITY CONTROLS

### 9.1 Assets & Security Objectives
**Primary assets**
- Serving-member identity artifacts (verification documents): `/verifications.verificationDoc`
- User profile & rank/verification status: `/users`
- Rental listing content & ownership claims: `/listings`
- Chat metadata + encrypted message envelopes: `/chats` + subcollection messages
- Locational privacy: user GPS origin, cantonment selection, approximate proximity computations
- Encryption keys (client-side): IndexedDB CryptoKeys for AES-256-GCM and ECDH

**Security objectives**
- Confidentiality of documents and chat payloads
- Integrity of listings/verifications and admin workflows
- Availability of search/browse and chat delivery
- Non-repudiation / traceability via audit logs (admin actions)
- Abuse prevention (scraping, token theft, unauthorized API calls)

### 9.2 Trust Boundaries & Entry Points
- **Browser/Android client boundary**: JavaScript, WebView bridge, Web Crypto API
- **Firebase Auth boundary**: SMS OTP and session token handling
- **Firestore boundary**: realtime reads/writes under security rules
- **Storage boundary**: encrypted blobs and public URL exposure
- **External tile/map boundary**: OpenStreetMap tile requests; avoid leaking PII
- **Admin console boundary**: privileged writes and verification decisions

### 9.3 STRIDE Threats by Subsystem

#### A) Authentication & Session (Spoofing/Tampering)
- **S (Spoofing)**: Attacker uses stolen Firebase tokens to write `/listings` or `/chats`.
- **T (Tampering)**: Replay or manipulation of chat key handshake metadata if not bound to participant set.
- **I (Information Disclosure)**: Token leakage from WebView or insecure local storage.
- **D (DoS)**: OTP brute force / high-rate auth attempts.

#### B) Verification Documents (Information Disclosure/Elevation of Privilege)
- **I**: If encrypted blobs are still exfiltrated, threat is mitigated only by strong encryption + access control.
- **E**: Unauthorized admin can approve/reject verifications.

#### C) Listings & Trust Graph (Tampering/Repudiation)
- **T**: Fraudulent listings with fake ownership/rank claims.
- **R**: Admin decisions without audit logs.

#### D) Chat (Confidentiality/Integrity)
- **I**: Metadata leakage via `participants`, `lastMessage` preview fields.
- **T**: Message substitution or ordering attacks.
- **D**: Flooding chats with spam/large payloads.

#### E) API Abuse / Scraping (DoS/Information Disclosure)
- **I/D**: Automated scraping to enumerate listings, distances, and approximate locations.
- **T**: Direct REST/SDK calls without a real app client.

### 9.4 Mitigation Matrix (Controls → Attacks)

| STRIDE Category | Threat Example | Controls (Planned/Existing) |
|---|---|---|
| Spoofing | Token reuse for writes | Firebase Security Rules + RBAC enforcement; App Check for abuse prevention; short-lived session handling |
| Tampering | Fake verification states | Admin-only RBAC; immutable event design for verification decision changes; audit logs |
| Repudiation | “I didn’t approve that” | Append-only audit logs for admin actions |
| Information Disclosure | Document blob exposure | Client-side AES-256-GCM vault; storage access rules; no public URLs for sensitive blobs |
| Information Disclosure | Chat metadata leaks | Minimize preview content; store only metadata-safe stubs; keep `lastMessage` ciphertext-only |
| Denial of Service | High-rate writes/reads | App Check enforcement; rate limits (where supported); per-user write quotas |
| Elevation of Privilege | Non-admin edits verifications | RBAC role checks in security rules and/or callable functions |

### 9.5 Security Test Plan (What to Validate)
- **Rules tests**: ensure unauthorized users cannot read/write admin-only docs
- **Encryption tests**: verify decrypt fails with wrong passphrase; verify AES-GCM tag validation
- **E2EE tests**: verify key rotation produces different fingerprints; MITM attempt fails at key fingerprint validation
- **Abuse tests**: attempt SDK calls without app attestation (App Check enforcement)
- **Audit tests**: each privileged action emits an immutable log entry

---

## 10. RBAC DOCUMENTATION (ROLES, PERMISSIONS, ENFORCEMENT)

### 10.1 Roles Overview
Define roles in a single authority model (recommended: `customClaims` in Firebase Auth or server-side role mapping). Roles below are conceptual; implementation must be consistent across Firestore rules and callable functions.

**Roles**
- **user**: authenticated standard user (tenant, seeker, host)
- **verified_host**: host with approved/verified listing capability
- **member**: any verified community participant (optional; can map to `user`)
- **moderator**: can moderate reports, but not approve identity documents
- **admin**: can approve/reject verifications and manage high-trust workflows
- **security_admin**: can perform security operations (e.g., freeze accounts, rotate keys if required)
- **system**: backend automation / scheduled jobs (if Cloud Functions used)

### 10.2 Permission Model (What each role can do)

**Core permissions**
- `LISTING_CREATE`: create `/listings` for `uid === owner uid`
- `LISTING_READ`: read `/listings` (scoped)
- `LISTING_VERIFY_STATUS_UPDATE`: update `verified` flag (admin-only)
- `VERIFICATION_UPLOAD`: upload encrypted docs to `/verifications` (user-only)
- `VERIFICATION_DECISION`: set `/verifications.status` (admin-only)
- `CHAT_PARTICIPATE`: read/write messages where `uid in participants`
- `CHAT_MODERATE`: moderate/disable chat features for abuse (security_admin/moderator)
- `REPORT_READ`: read `/reports` (if implemented) (moderator/security_admin)
- `AUDIT_LOG_READ`: read audit logs (admin/security_admin)

### 10.3 Enforcement Points (Client vs Rules vs Server)
- **Client**: provides UX guardrails (do not rely on it for security)
- **Firestore Security Rules**: enforce all permission-critical operations
- **Callable Functions / server** (recommended for privileged workflows):
  - Verification decisions
  - Audit log writes (if you want stronger integrity guarantees)

**Non-negotiable**
- Never rely on client-side `role` fields without checking Auth claims or server-side role mapping.

### 10.4 Admin Workflows & Approval Queues
**Verification decision workflow**
1. User uploads encrypted `verificationDoc` with `status=pending`
2. Admin reviews offline (inside secure admin UI)
3. Admin sets `status=approved|rejected`
4. Admin action triggers an audit log entry with:
   - who (admin uid)
   - what (verification doc id)
   - decision
   - timestamp
   - reason codes (optional)
5. Encrypted doc blob is purged post-review; only cryptographic hash remains (if retained)

### 10.5 RBAC Change Management
- Changes to role logic must be accompanied by:
  - security rules update
  - audit log taxonomy update
  - a migration note in ROADMAP.md or changelog
  - a rules test suite update

---

## 11. AUDIT LOGS (SECURITY & COMPLIANCE)

### 11.1 What to Log (Event Taxonomy)
**Privileged and security-relevant events** (append-only)
- `AUTH_LOGIN_SUCCESS` / `AUTH_LOGIN_FAILURE` (optional; often captured via Firebase logs)
- `VERIFICATION_DECISION` (admin)
- `LISTING_VERIFICATION_STATUS_UPDATE` (admin)
- `RBAC_ROLE_GRANT` / `RBAC_ROLE_REVOKE` (security_admin)
- `CHAT_SECURITY_ACTION` (moderator/security_admin)
- `APP_CHECK_ENFORCEMENT_FAILURE` (aggregate; consider Cloud Monitoring)
- `DATA_PURGE_COMPLETED` (admin/system)

**User-level events** (optional; minimize PII)
- `LISTING_CREATE` and `LISTING_DELETE` (user)
- `REPORT_SUBMIT` (user)

### 11.2 Suggested Firestore Data Model
Recommended pattern: separate audit collection (append-only) with strict read rules.

`/audit_logs/{logId}`
```json
{
  "logId": "string",
  "eventType": "string (e.g., VERIFICATION_DECISION)",
  "actorUid": "string (admin uid)",
  "actorRole": "string (optional; for readability)",
  "target": {
    "collection": "string",
    "docId": "string"
  },
  "details": {
    "decision": "approved|rejected",
    "reasonCode": "string|null",
    "ipHint": "string|null (avoid full IP; keep coarse if needed)"
  },
  "createdAt": "timestamp",
  "requestId": "string (idempotency / trace correlation)"
}
```

**Integrity enhancement**
- Use server timestamps (`FieldValue.serverTimestamp()`) when possible.
- Optional: store a hash of critical fields to detect tampering.

### 11.3 Retention, Integrity, and Access Control
- **Retention**: keep high-sensitivity logs for 90–180 days; aggregate summaries longer.
- **Access control**: only `admin/security_admin` can read full logs.
- **Tamper resistance**: write audit logs server-side (recommended) or via restricted admin-only clients.

### 11.4 Audit Review Cadence
- Weekly: verify spikes in verification decisions/rejections
- Monthly: review top abusive actors (if chat/report exists)
- Quarterly: validate audit log access and security rules

---

## 12. FIREBASE APP CHECK (ABUSE PREVENTION & INTEGRITY)

### 12.1 Threats this mitigates
- Automated scripts calling Firestore REST/SDK with stolen config
- Scraping of listing feeds
- Token harvesting attempts
- Replaying requests from non-attested environments

### 12.2 Deployment Strategy (Web + Android)
**Goal**: Only accept Firestore/Storage requests when the client is a valid app instance.

- **Web**: enable DeviceCheck/Play Integrity equivalent (Firebase supports reCAPTCHA Enterprise / web provider setups depending on project config)
- **Android**: enable Play Integrity API (recommended) via App Check provider

### 12.3 Enforcement Rollout Plan
1. **Monitoring mode**: collect App Check metrics without blocking
2. **Targeted enforcement**: enforce on write-heavy endpoints first (`/listings`, `/verifications`, chat writes)
3. **Full enforcement**: enforce on reads for high-abuse collections (if acceptable UX impact)

### 12.4 Failure Handling & Observability
- Surface user-safe error: “App integrity validation failed. Please reinstall/try again.”
- Log event aggregates to monitoring (do not leak PII)
- Keep a small allowlist window for QA/staging.

---

## 13. INCIDENT RESPONSE (IR) & POSTMORTEMS

### 13.1 Incident Severity Levels
- **SEV-0 (Critical)**: active breach confirmed (keys/documents exposed) or large-scale data exfiltration
- **SEV-1 (High)**: suspected breach with evidence of unauthorized access attempts (e.g., rules bypass in staging)
- **SEV-2 (Medium)**: abuse/DoS affecting service quality or limited scope compromise
- **SEV-3 (Low)**: isolated errors, minor policy violations, non-security regressions

### 13.2 Detection & Triage Signals
- App Check failure spikes
- Firestore/Storage rule denied spike (potential attack reconnaissance)
- Unusual admin verification decision patterns
- Chat spam volume anomalies
- CI/CD security alerts (dependency vulnerabilities)

### 13.3 Containment, Eradication, Recovery
**SEV-0 / SEV-1 (Breaches)**
1. Disable/roll back risky releases (feature flags)
2. Tighten Firestore rules immediately (deny writes, restrict reads)
3. Revoke compromised tokens / rotate any server-side secrets
4. If key material is suspected: invalidate affected E2EE sessions and require re-handshake

**SEV-2 (Abuse/DoS)**
1. Enforce App Check (if in monitoring)
2. Add throttling and deny abusive patterns
3. Temporarily limit write rates for specific collections/actors

### 13.4 Evidence Preservation & Legal Readiness
- Preserve audit logs and relevant admin actions (export to secure storage)
- Export App Check metrics time window
- Preserve deployment artifact version and config
- Document impact scope (what collections, what users, what time)

### 13.5 Post-incident Review Checklist
- Root cause analysis (RCA)
- Control gaps identified and assigned owners
- Update Threat Model, RBAC, and Audit Logs taxonomy if needed
- Add regression tests
- Communicate status internally with a concise timeline

---

## 14. DETAILED HISTORICAL MILESTONES (PHASES 1–8)

### 14.1 Phase 1: Foundational Framework (✅ Built)
*   **Objective**: Build a responsive map interface centered around military stations.
*   **Key Deliverables**: Leaflet maps integration, Indian (+91) OTP Firebase Auth integration, and direct P2P listing layouts.

### 14.2 Phase 2: Trust & Quality (✅ Built)
*   **Objective**: Launch community verification and prevent housing broker intrusion.
*   **Key Deliverables**: Verified Fauji badge, reporting panel, and 5-star rating system.

### 14.3 Phase 3: Communication Layer (✅ Built)
*   **Objective**: Enable direct, secure communication channels.
*   **Key Deliverables**: WhatsApp Direct-Connect, secure local storage messaging, and in-app call shortcuts.

### 14.4 Phase 4: Expansion & Data Pulse (✅ Built)
*   **Objective**: Deeply map nearby cantonment support points.
*   **Key Deliverables**: Mapped school locations (APS/KV), Cantonment Station Hospitals, and average monthly rent indices.

### 14.5 Phase 5: Design Systems 2.0 (✅ Built)
*   **Objective**: Craft a beautiful, low-power dark glassmorphic design system.
*   **Key Deliverables**: Glassmorphic dark styling, fluid transitions, and performance optimization for slower networks.

### 14.6 Phase 6: Intelligence & HUD (✅ Built)
*   **Objective**: Deliver commute routing calculations.
*   **Key Deliverables**: Proximity calculators, dynamic coordinates indicators, and side-panel card performance optimization.

### 14.7 Phase 7: Native Stability (🟡 In Progress)
*   **Objective**: Deliver a solid, crash-free native Android deployment package.
*   **Key Deliverables**: WebView rendering stabilization, background thread continuity, and Flutter shell integration.

### 14.8 Phase 8: Hardened Security (✅ Built)
*   **Objective**: Shield soldier data with cryptographic vaults.
*   **Key Deliverables**: Client-side AES key generation, document encryption vaults, and Content Security Policy (CSP) security headers.

---

## 15. ADVANCED RELOCATION INFRASTRUCTURE (PHASES 9–20)

### 15.1 Phase 9: All-India Data Saturation (✅ Built)
*   **Objective**: Map primary school databases, hospital lists, and canteen details.
*   **Key Deliverables**: 137 Army Public Schools (APS), 250+ Kendriya Vidyalayas (KV), and Cantonment Station Hospitals added to dataset listings.

### 15.2 Phase 10: Relocation Operating System (✅ Built)
*   **Objective**: Coordinate rankchecklists and timeline structures.
*   **Key Deliverables**: Checklists (OR, JCO, Officer) from T-45 days to T+15 days, and 7th Pay Commission HRA/TA allowances estimators in UI.

### 15.3 Phase 11: Defence Ecosystem Expansion (✅ Built)
*   **Objective**: Connect Serving Roommates and list spouse Cantonment jobs.
*   **Key Deliverables**: Roommate filter profiles matching rank/diet, auto fare estimator guides, and spouse job vacancies list.

### 15.4 Phase 12: AI Intelligence Layer & Concierge (✅ Built)
*   **Objective**: Build client-side checks for outlier prices and location mismatches.
*   **Key Deliverables**: Outlier calculators (+45% rent bounds) and location verification check warnings on camera uploads.

### 15.5 Phases 13–15: Scale & Market Maturity (✅ Built)
*   **Objective**: Set up Reputation Scoring, Movers discount pools, and Homestyle CSD Tiffin matches.
*   **Key Deliverables**: Command Recommended badges ($\ge 90$ trust rating), Packers & Movers pool discount selectors (35% off), and high-protein home tiffin lists.

### 15.6 Phases 16–20: Global Scale & Super App (✅ Built)
*   **Objective**: Render multi-language controls, Elderly Mode overrides, and Bulletin Boards.
*   **Key Deliverables**: English, Hindi, and Punjabi localization settings; Elderly Mode high-contrast large fonts toggle; ECDH key rotation console simulator; and station bulletin upvote boards.

---

## 16. PRIVACY-FIRST COMMUNITY PROTECTION SUITE (PHASES 21–25)

### 16.1 Phase 21: Connection Security Gatekeeper (🧪 Experimental Simulation)
*   **Intrusion Prevention**: Monitors page clicks to detect automated scrapers, data-mining operations, and spatial coordinate harvesting.
*   **Implementation**: Safe connection verification warning console built as a UI prototype inside [MapOverlay.jsx](file:///run/media/petronski/Local%20Disk%20D/fauji-niwas/fauji-niwas-app/src/components/Map/MapOverlay.jsx) that alerts users upon heuristic activity signatures.

### 16.2 Phase 22: Offline Compass & Commute Navigation (🧪 Experimental Simulation)
*   **Offline Direction Vector**: Provides a rotating compass pointer, heading degrees, and target coordinate vectors pointing to the nearest Cantonment Gate checkposts when network connections are down.
*   **Implementation**: Offline-mode UI compass mockup built inside [MapOverlay.jsx](file:///run/media/petronski/Local%20Disk%20D/fauji-niwas/fauji-niwas-app/src/components/Map/MapOverlay.jsx).

### 16.3 Phase 23: Veteran ECHS Health & Pension Vault (🧪 Experimental Simulation)
*   **ECHS Card Locker**: Allows retired veterans to upload ECHS health cards, discharge summaries, and pension books to an AES-256-GCM local encrypted vault.
    *   *Voluntary notice*: Users are advised to mask sensitive numbers before upload. Verification is voluntary.
*   **OPD Queue Token Booking**: Coordinates token pre-registration slots for major Station/Command Hospitals (e.g. Pune, Secunderabad, Delhi Cantt) to reduce waiting lines.
*   **Implementation**: Uploader box mockup and queue token generator simulator UI built inside the **Accessibility** settings tab of [ProfileModal.jsx](file:///run/media/petronski/Local%20Disk%20D/fauji-niwas/fauji-niwas-app/src/components/Modals/ProfileModal.jsx).

### 16.4 Phase 24: Checked Title Proofs & Rental Agreement Badges (🧪 Experimental Simulation)
*   **Verified Title Safeguard**: Displays a subtle, glassmorphic **"Verified Title & Rental Agreement Workflow"** card for verified listings, protecting security deposits.
*   **Implementation**: Rendered as a payment-intent security badge right under the main listing details inside [DetailModal.jsx](file:///run/media/petronski/Local%20Disk%20D/fauji-niwas/fauji-niwas-app/src/components/Modals/DetailModal.jsx).

### 16.5 Phase 25: Offline Mesh SOS Distress Broadcaster (🧪 Experimental Simulation)
*   **Zero-Network Mesh SOS**: Broadcaster simulating off-grid mesh networking (Bluetooth / Wi-Fi Direct) to transmit distress signals to the nearest cantonment security gate post.
*   **Implementation**: Offline Mesh SOS distress simulated logs and hops console built inside [MapOverlay.jsx](file:///run/media/petronski/Local%20Disk%20D/fauji-niwas/fauji-niwas-app/src/components/Map/MapOverlay.jsx).

---

## 17. SECURITY EXECUTION ROADMAP ADDENDUM (NEW)

This section specifies deliverables for the requested items—Threat Modeling, RBAC documentation, Audit Logs, App Check, and Incident Response—aligned with the platform’s current architecture.

### 17.1 Threat Modeling (STRIDE) — Deliverables
- Produce subsystem inventory (auth, listings, verifications, chats, admin workflows)
- Document trust boundaries and entry points
- Maintain STRIDE threats + mitigations matrix
- Add regression test mapping to threats (rules tests + E2EE test cases)

**Status**: ✅ Documented in Sections 9

### 17.2 RBAC Documentation — Deliverables
- Define roles (user, verified_host, moderator, admin, security_admin)
- Define permissions (listings, verifications, chat access, admin-only decisions)
- Identify enforcement points (Firestore rules / callable functions)
- Introduce change management expectations

**Status**: ✅ Documented in Section 10

### 17.3 Audit Logs — Deliverables
- Define audit event taxonomy
- Propose Firestore audit log schema
- Define retention, access control, and review cadence
- Ensure admin actions are append-only and attributable

**Status**: ✅ Documented in Section 11

### 17.4 Firebase App Check — Deliverables
- Define threat coverage (scraping, SDK abuse)
- Plan rollout (monitoring → targeted enforcement → full enforcement)
- Define failure handling strategy

**Status**: ✅ Documented in Section 12

### 17.5 Incident Response (IR) — Deliverables
- Define severity levels
- Provide detection/triage signals
- Provide containment/eradication/recovery runbook
- Provide evidence preservation and postmortem checklist

**Status**: ✅ Documented in Section 13

---

## 18. V4.2.0 ELITE UI/UX & SECURE FEATURE REFACTOR (IN PROGRESS)

### 18.1 Unified React SPA & Cinematic Motion
*   **Objective**: Merge legacy static landing pages into a unified React Router DOM SPA to enable heavy-inertia Framer Motion choreographies and asymmetric Tailwind v4 grid structures.
*   **Key Deliverables**: 5038.jpg Asymmetrical Bento Grid, Left Navigation Command Dock, Massive Typography Masks ("NIWAS").

### 18.2 Automated "Military Break Clause" Lease Generator
*   **Objective**: Protect service members from lost security deposits due to sudden posting orders.
*   **Key Deliverables**: Client-side PDF builder injecting legally binding 15-day break clauses upon production of movement orders.

### 18.3 WASM-Based Edge Document Masking
*   **Objective**: Comply with DPDP Act 2023 by zero-trusting admin panels with raw PII.
*   **Key Deliverables**: Tesseract.js / Face-API.js WASM integration to detect and pixelate ID numbers and faces in the browser *before* Firebase upload.

### 18.4 Crowdsourced CSD / URC Token & Inventory Pulse
*   **Objective**: Real-time insights on cantonment Unit Run Canteens.
*   **Key Deliverables**: Hyper-local ticker embedded in the Bento grid for upvoting wait times and liquor/grocery quota availability.

---

**Status**: Milestone In Progress (v4.2.0 Elite UI/UX & Security Refactor) | **Last Updated**: 2026-06-14 

