# 🪖 Fauji Niwas — Platform Roadmap, Architecture & Security Guide

> **India's exclusive verified housing platform for defence personnel, military families, and SSB candidates.**
> Live at: [faujiniwas.web.app](https://faujiniwas.web.app)

---

## 📋 Table of Contents

1. [What Is Fauji Niwas?](#1-what-is-fauji-niwas)
2. [How It Was Built — Tech Stack](#2-how-it-was-built--tech-stack)
3. [Architecture — How It Works](#3-architecture--how-it-works)
4. [Feature Breakdown](#4-feature-breakdown)
5. [Android App — How It Works](#5-android-app--how-it-works)
6. [Build & Deploy Pipeline](#6-build--deploy-pipeline)
7. [Privacy Policy](#7-privacy-policy)
8. [Security Architecture](#8-security-architecture)
9. [Roadmap — What's Next](#9-roadmap--whats-next)

---

## 1. What Is Fauji Niwas?

Fauji Niwas is a **defence-exclusive, map-first housing discovery platform** built for India's armed forces community. It solves a real problem: finding trusted, verified accommodation near cantonment stations during postings, transfers, and SSB appearances — without relying on civilian brokers who overcharge or don't understand military logistics.

### Core Value Propositions
| Problem | Fauji Niwas Solution |
|:---|:---|
| No broker knows cantonment areas | Map is centered on defence stations, not city centers |
| Civilians don't trust military norms (short notice, frequent moves) | Listed by owners who are Fauji families themselves |
| High brokerage fees | Zero brokerage model — direct owner contact |
| SSB candidates need dorms for 5 days | Dedicated SSB Dorm category with short-term stays |
| No mess/food info near stations | Food & Mess listings integrated on the same map |
| Hard to verify if landlord is genuine | Fauji Verified badge system (Canteen Card / Military ID) |

---

## 2. How It Was Built — Tech Stack

### Web Application (React + Vite)
```
faujiadda-app/
├── src/
│   ├── App.jsx                    ← Root component, context providers
│   ├── index.css                  ← Global design system (dark theme, tokens)
│   ├── firebase.js                ← Firebase SDK initialization
│   ├── components/
│   │   ├── AppShell/              ← Header, navigation, layout wrapper
│   │   ├── Map/                   ← Leaflet map, price markers, clustering
│   │   ├── Sidebar/               ← Listings panel, search, filter bar
│   │   │   ├── ListingCard.jsx    ← Individual property card component
│   │   │   ├── FilterBar.jsx      ← Type, price, rank filters
│   │   │   ├── SearchBar.jsx      ← Live search with voice input
│   │   │   └── Sidebar.jsx        ← Sidebar container + footer
│   │   └── Modals/
│   │       ├── DetailModal.jsx    ← Full property detail view (images, map, contact)
│   │       ├── PostModal.jsx      ← Owner listing creation form
│   │       ├── ProfileModal.jsx   ← User dashboard, OTP login, wishlist
│   │       ├── ReportModal.jsx    ← Report a listing as fake/wrong
│   │       ├── CompareModal.jsx   ← Side-by-side property comparison
│   │       └── TransfersModal.jsx ← Movement alerts board
│   ├── hooks/
│   │   └── useAuth.js             ← Firebase Auth state + Firestore user sync
│   └── store/
│       ├── filterStore.js         ← Zustand — listings + active filters
│       └── userStore.js           ← Zustand — wishlist, seen, contacted (localStorage)
├── public/
│   ├── home.html                  ← Landing page (separate from the React SPA)
│   ├── chatbot.js                 ← AI Transfer Assistant widget
│   ├── manifest.json              ← PWA manifest (installable app)
│   ├── sitemap.xml                ← SEO sitemap
│   ├── robots.txt                 ← Search engine crawl rules
│   └── .well-known/
│       └── assetlinks.json        ← Android App Links verification
└── index.html                     ← SPA entry point (React app)
```

### Backend (Firebase)
```
Firebase Project: rentmap-live
├── Firestore Database
│   ├── /listings/{id}             ← Property listings (realtime)
│   ├── /users/{uid}               ← User profiles, points, verified status
│   └── /reports/{id}              ← User-submitted reports
├── Firebase Storage
│   └── /verifications/{uid}       ← Encrypted military ID uploads
├── Firebase Authentication
│   └── Phone (SMS OTP via Google)  ← Indian numbers (+91)
└── Firebase Hosting
    ├── faujiniwas (target)        ← faujiniwas.web.app
    └── faujirentals (target)      ← faujirentals.web.app
```

### Android App (Flutter)
```
faujiadda_app/
├── lib/main.dart                  ← Full Flutter app (WebView wrapper)
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   ← Permissions: INTERNET, AUDIO, LOCATION
│   │   │   └── res/                  ← App icons, themes, splash colors
│   │   ├── build.gradle              ← Signing, R8 minification, SDK config
│   │   └── faujiadda-release.jks     ← Production keystore (RSA SHA384)
│   ├── gradle.properties             ← JVM memory limits (RAM-safe build)
│   └── key.properties                ← Signing credentials (gitignored)
└── pubspec.yaml                   ← Flutter dependencies
```

---

## 3. Architecture — How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICE                          │
│                                                         │
│  ┌─────────────┐        ┌────────────────────────────┐  │
│  │  Browser    │        │  Android App (Flutter)     │  │
│  │  (PWA)      │        │                            │  │
│  │             │        │  ┌──────────────────────┐  │  │
│  │  React SPA  │        │  │ WebView              │  │  │
│  │  (Vite)     │        │  │ (loads faujiniwas    │  │  │
│  │             │        │  │  .web.app)           │  │  │
│  └──────┬──────┘        │  └──────────┬───────────┘  │  │
│         │               └─────────────┼──────────────┘  │
└─────────┼───────────────────────────── ┼ ────────────────┘
          │                             │
          │  HTTPS                      │  HTTPS + Permissions
          │  (Firebase CDN)             │  (GPS, Mic, Camera)
          ▼                             ▼
┌──────────────────────────────────────────────────────────┐
│                 Firebase Cloud (Google)                   │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────┐ │
│  │  Firestore   │  │  Auth (SMS)   │  │  Storage      │ │
│  │              │  │               │  │               │ │
│  │  /listings   │  │  Phone OTP    │  │ /verifications│ │
│  │  /users      │  │  (+91 India)  │  │ (Military IDs)│ │
│  │  /reports    │  │               │  │               │ │
│  └──────────────┘  └───────────────┘  └───────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Firebase Hosting (CDN — Global Edge Network)    │   │
│  │  faujiniwas.web.app  /  faujirentals.web.app     │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│  Leaflet Maps (OpenStreetMap)    │
│  Tile server: tile.openstreet   │
│  map.org (free, open-source)    │
└──────────────────────────────────┘
```

### Data Flow — Finding a Property
```
1. App loads → Firestore onSnapshot() subscribes to /listings (realtime)
2. Listings rendered as price markers on Leaflet map
3. User applies filters → Zustand filterStore recomputes in memory (no extra reads)
4. User clicks marker → DetailModal opens with full property data
5. User taps Call/WhatsApp → direct link to owner (we never store the call)
6. User saves to wishlist → local Zustand store (persisted to localStorage)
```

### Auth Flow — Logging In
```
1. User opens Profile → enters 10-digit mobile number
2. Firebase sends SMS OTP via Google (Twilio backend)
3. RecaptchaVerifier (invisible) validates the browser session
4. User enters 6-digit OTP → Firebase confirms → user is authenticated
5. Firestore /users/{uid} doc created/synced automatically
6. Session persists across refreshes (Firebase IndexedDB persistence)
```

---

## 4. Feature Breakdown

### Map Features
- **Leaflet.js** map with OpenStreetMap tiles (no Google Maps API key needed)
- **Price markers** color-coded by BAH rank tier (OR/JCO/Officer)
- **Cluster markers** — group pins when zoomed out
- **"Near Me"** — browser geolocation to center map on user
- **Distance** calculated from selected station gate to property

### Listing Discovery
- **Real-time** — Firestore `onSnapshot` pushes new listings instantly
- **Filters**: Type (Flat/Room/Quarter/Dorm), Price range, Rank tier, Stay duration
- **Voice Search** — Web Speech API (microphone) for hands-free search
- **Compare** — side-by-side two properties on all metrics

### Owner Features (Post a Listing)
- Form with photo upload (compressed before upload via `browser-image-compression`)
- Images stored in Firebase Storage, URL saved in Firestore
- Listing appears on map **immediately** after post (realtime)

### User Dashboard
- **My Listings** — manage posted properties
- **Wishlisted** — saved properties (localStorage)
- **Seen / Contacted** — browsing history
- **Fauji Points** — loyalty system (post = +50, review = +10)
- **Verification** — upload Canteen Card for ✅ Verified Fauji badge

### AI Transfer Assistant (Chatbot)
- Answers cantonment-specific questions
- Knows about SSB centers, transfer seasons, BAH rates
- Runs fully in the browser (no external API — keyword rule engine)

---

## 5. Android App — How It Works

The Android app is a **Flutter WebView wrapper** — lightweight, fast, and always in sync with the live web app.

```
Flutter App (shell)
    │
    ├── Splash Screen (Fauji Niwas branding, saffron/white theme)
    │
    └── WebViewController
            │
            ├── Loads: https://faujiniwas.web.app
            ├── JavaScript: unrestricted (needed for Firebase + Leaflet)
            ├── Permissions granted in-app:
            │       ├── 🎤 Microphone   → Voice Search
            │       ├── 📍 GPS Location  → "Find Me" on map (setGeolocationEnabled)
            │       └── 📷 Camera       → Photo upload for listings
            ├── Back button → WebView history navigation
            └── Loading overlay → Navy spinner while page loads
```

**Why WebView instead of native?**
- Web app already has all features — no duplication needed
- Any update to the web app automatically reflects in the Android app
- Keeps APK size small (~7 MB vs. 30 MB+ for a full native app)
- Play Store listing can be maintained with minimal native code changes

### Android Permissions
| Permission | When Requested | Why |
|:---|:---|:---|
| `INTERNET` | Always | Load the web app |
| `RECORD_AUDIO` | On first voice search | Web Speech API (microphone) |
| `ACCESS_FINE_LOCATION` | On first map locate | GPS precision for "Find Me" |
| `ACCESS_COARSE_LOCATION` | Fallback | Network-based location |

---

## 6. Build & Deploy Pipeline

### Web Deploy
```bash
# 1. Build React app
cd faujiadda-app
NODE_OPTIONS="--max-old-space-size=1536" npm run build
# Output: faujiadda-app/dist/ (38 files, ~750 KB gzipped)

# 2. Deploy to Firebase
firebase deploy --only hosting
# Targets: faujiniwas + faujirentals
# Live in ~30 seconds via Firebase CDN
```

### Android Build
```bash
# From project root:
./build.sh    # Builds React + Android APK (signed)

# Or APK only:
cd faujiadda_app
flutter build apk --release --no-pub --target-platform android-arm64
# Output: faujiadda_app/build/app/outputs/flutter-apk/app-release.apk
```

### Signing (Production)
- **Keystore**: `faujiadda_app/android/app/faujiadda-release.jks`
- **Algorithm**: RSA, SHA384withRSA
- **Fingerprint (SHA256)**: `72:84:9A:EF:88:3C:32:D6:6F:F9:80:82:0E:2D:4A:66:84:65:7F:CE:93:40:55:B3:53:B7:A4:01:DF:2B:DE:8C`
- **Credentials**: stored in `android/key.properties` (not committed to git)

### PWA (Progressive Web App)
- Service Worker generated via `vite-plugin-pwa` (Workbox mode)
- Precaches 32 files (~1.49 MB)
- Works offline: previously viewed listings cached
- Installable on Android home screen directly from Chrome

---

## 7. Privacy Policy

**Effective Date:** April 2026
**Platform:** Fauji Niwas (faujiniwas.web.app)
**Operated by:** Fauji Niwas Platform

---

### 7.1 What Data We Collect

| Data | Source | Purpose | Stored Where |
|:---|:---|:---|:---|
| Phone number | User (OTP login) | Authentication only | Firebase Auth |
| Listing details | Property owner | Show on map | Firestore |
| Device location (GPS) | Optional, user-granted | Center map on user | Never stored |
| Military ID photo | Voluntary (verification) | One-time admin review | Firebase Storage (private) |
| Wishlist / Seen | Browser local storage | Personal history | Your device only |
| Usage analytics | None | — | Not collected |

### 7.2 What We Do NOT Collect
- ❌ Aadhaar / PAN / any government ID numbers
- ❌ Bank details or payment information
- ❌ Call recordings or WhatsApp message content
- ❌ IP address logs or browsing history
- ❌ Any data from children (platform is for serving military personnel)
- ❌ Third-party advertising trackers

### 7.3 Location Data
- Location is accessed **only** when you tap "Find My Location" on the map
- Your coordinates are used **only** to center the map
- Coordinates are **never sent to our servers** or stored in any database
- You can deny location permission — all other features still work normally

### 7.4 Military ID Verification
- Submitted photos are stored in **Firebase Storage with private access rules**
- Only our admin can view them (through Firebase Console with authentication)
- After verification is approved or rejected, the photo is no longer needed
- We strongly recommend **hiding your service number** before photographing your Canteen Card

### 7.5 Phone Numbers of Property Owners
- Owner phone numbers are visible to logged-in users to enable direct contact
- We cannot control how users use this information once viewed
- Owners can request listing removal at any time

### 7.6 Data Retention
| Data Type | Retention Period |
|:---|:---|
| User account | Until user requests deletion |
| Listings | Until owner deletes them |
| Verification ID photos | 30 days after review |
| Wishlist / local storage | Until user clears browser data |
| SMS OTP logs | Handled by Firebase/Google (72 hours) |

### 7.7 Your Rights
You can at any time:
- **Delete your account** — contact us or sign out (data removed within 7 days)
- **Remove your listing** — from your dashboard
- **Clear local data** — clear site data in browser settings
- **Opt out of verification** — it's entirely voluntary

### 7.8 Third-Party Services
| Service | Provider | Purpose | Their Privacy Policy |
|:---|:---|:---|:---|
| Firebase Auth | Google | Phone OTP login | [policies.google.com](https://policies.google.com) |
| Firestore | Google | Database | [policies.google.com](https://policies.google.com) |
| Firebase Storage | Google | Image storage | [policies.google.com](https://policies.google.com) |
| Firebase Hosting | Google | CDN delivery | [policies.google.com](https://policies.google.com) |
| OpenStreetMap | OSMF | Map tiles | [osmfoundation.org](https://osmfoundation.org/wiki/Privacy_Policy) |
| Google Fonts | Google | Typography | [policies.google.com](https://policies.google.com) |

---

## 8. Security Architecture

### 8.1 Authentication Security
```
SMS OTP (Firebase Phone Auth)
├── reCAPTCHA v3 (invisible) — bot protection on every login attempt
├── OTP expires in 5 minutes
├── Max 5 attempts per number per hour (Firebase rate limiting)
├── Session stored in Firebase IndexedDB (encrypted)
└── No password stored anywhere — phone is the only identity
```

### 8.2 Database Security (Firestore Rules)
```javascript
// Listings — anyone can read, only auth user can write their own
match /listings/{id} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth.uid == resource.data.uid;
}

// Users — only the owner can read/write their own document
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
}
```

### 8.3 Storage Security (Firebase Storage Rules)
```javascript
// Verification IDs — only the uploading user can write, nobody else can read
match /verifications/{file} {
  allow write: if request.auth != null && file.startsWith(request.auth.uid);
  allow read: if false; // Admin accesses via Firebase Console only
}
```

### 8.4 HTTPS / Transport Security
- All traffic over **TLS 1.3** (enforced by Firebase Hosting CDN)
- Android app has `usesCleartextTraffic="false"` — **no HTTP allowed**
- HTTP requests in-browser upgrade to HTTPS via Firebase redirect rules
- `X-Content-Type-Options: nosniff` header on all responses

### 8.5 Content Security
- Images served via Firebase Storage signed URLs (expire after time)
- Images compressed to WebP before upload (reduces attack surface)
- No `eval()` or dynamic code execution in the React app
- CSP headers enforced at Firebase Hosting level

### 8.6 Android APK Security
- Signed with **RSA SHA384** production keystore
- R8 code shrinking + ProGuard enabled (obfuscates code)
- Resource minification enabled (removes unused resources)
- `ACCESS_FINE_LOCATION` runtime permission (must be user-granted)
- No hardcoded secrets in the APK (all config via Firebase SDK)

### 8.7 Data Minimization
We follow the principle of **collecting only what is necessary**:
- No analytics SDK (no Google Analytics, no Mixpanel)
- No advertising SDK
- No crash reporting SDK that sends PII (no Sentry)
- Wishlist / browsing history stored **on device only** (Zustand + localStorage)

---

## 9. Roadmap — What's Next

### ✅ Phase 1 — Foundation (Complete)
- [x] Map-first property discovery
- [x] Real-time Firestore listings
- [x] Photo upload with compression
- [x] Phone OTP login (Firebase)
- [x] Wishlist & browsing history
- [x] Voice search (Web Speech API)
- [x] PWA + Android app
- [x] Fauji Points (loyalty)
- [x] Movement alerts board
- [x] Property comparison tool
- [x] AI Transfer chatbot

### 🚧 Phase 2 — Trust & Quality (Next)
- [ ] **Admin verification panel** — approve/reject Fauji badge submissions
- [ ] **Ratings & Reviews** — 1–5 star review per property
- [ ] **Verified Owner badge** — for military personnel who own property
- [ ] **Report moderation** — admin dashboard for fake listing reports
- [ ] **Station-specific pages** — SEO pages per cantonment city
- [ ] **Google Search integration** — rich results via JSON-LD

### 🚀 Phase 3 — Growth Features (Planned)
- [ ] **Price Trends** — historical rental data per station
- [ ] **AI Price Suggestion** — suggest fair rent based on nearby listings
- [ ] **Transfer Season Alerts** — push notifications before ARC season
- [ ] **Mess & Food ratings** — community-rated mess quality scores
- [ ] **iOS App** — extend WebView wrapper to Flutter iOS target
- [ ] **Private messaging** — in-app contact without sharing phone
- [ ] **Fauji Classifieds** — buy/sell military household items

### 🏆 Phase 4 — Scale (Future)
- [ ] **100+ stations** — expand cantonment coverage across India
- [ ] **Partner with Regimental Centres** — official listing channels
- [ ] **Verified Mess Partners** — onboard official CSD/mess vendors
- [ ] **CSD Canteen locator** — integrated with map
- [ ] **Play Store listing** — public release on Google Play

---

## 📞 Contact

For security issues, data deletion requests, or partnership enquiries:
- **Web**: [faujiniwas.web.app](https://faujiniwas.web.app)
- **Platform built for**: Indian Armed Forces — Army, Navy, Air Force, Paramilitary

---

*This document is maintained alongside the codebase and updated with every major release.*
*Last updated: April 2026*
