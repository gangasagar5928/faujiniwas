# Fauji Niwas Technical Wiki & Architecture Reference

> **Version:** 2.0 Production | **Stack:** React 19 / Vite / Tailwind CSS 4 / Firebase / Flutter | **Deployment:** Firebase Hosting & Android APK
>
> Fauji Niwas is a zero-brokerage housing, relocation, and SSB transit accommodation network purpose-built for Indian Armed Forces personnel, Veterans, and defence families across 62+ military cantonments.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Web Application Architecture (React 19 & Vite)](#2-web-application-architecture-react-19--vite)
3. [Mobile Application Architecture (Flutter)](#3-mobile-application-architecture-flutter)
4. [Firebase Backend & Security Model](#4-firebase-backend--security-model)
5. [Cantonment & Geographic Coverage Engine](#5-cantonment--geographic-coverage-engine)
6. [Army Public School (APS) Proximity Mapping](#6-army-public-school-aps-proximity-mapping)
7. [Military Identity Verification & Trust Protocol](#7-military-identity-verification--trust-protocol)
8. [Automated CI/CD & Deployment Workflows](#8-automated-cicd--deployment-workflows)

---

## 1. System Architecture Overview

Fauji Niwas operates a unified multi-client architecture backed by Firebase serverless cloud infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│   Web SPA (React 19 / Tailwind 4)  │ Flutter Mobile App     │
├─────────────────────────────────────────────────────────────┤
│                    Routing & SEO Static Engine              │
│   62+ Static City Portals │ Manifest │ Structured Data JSON │
├─────────────────────────────────────────────────────────────┤
│                    Application State & Services             │
│   Army Public School Locator │ Geolocation Engine           │
│   Zero-Brokerage Verified Listing State Manager             │
├─────────────────────────────────────────────────────────────┤
│                    Backend & Cloud Storage                  │
│   Firebase Hosting │ Firestore NoSQL │ Firebase Storage     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Web Application Architecture (React 19 & Vite)

Located in `fauji-niwas-app/`:
- **Framework:** React 19 with Vite 8 bundler.
- **Styling:** Tailwind CSS 4 with custom military camo accents, translucent glassmorphic navigation bars, and dynamic dark/light theme switching.
- **Mapping:** Interactive Leaflet map integration with custom military base and station markers.
- **City Portals:** Pre-rendered high-performance landing pages for key military hubs (Delhi Cantt, Pune, Bangalore, Lucknow, Secunderabad, Jodhpur, Dehradun, Ambala, Pathankot, etc.).

---

## 3. Mobile Application Architecture (Flutter)

Located in `fauji-niwas_app/`:
- **Framework:** Flutter 3.x with Material 3 responsive layouts.
- **State Management:** Reactive streams for verified accommodation listings.
- **Offline Cache:** Offline-first caching of verified station listings and emergency military welfare contacts.

---

## 4. Firebase Backend & Security Model

Configured via `firebase.json` and `firestore.rules`:
- **Hosting:** Multi-site configuration routing static assets and SPA single-page fallback.
- **Security Rules:** Strict role-based Firestore access controls preventing unauthorized modification of defence property verification status.

---

## 5. Cantonment & Geographic Coverage Engine

The platform manages structured geographic dataset `src/geolocated_data.js` covering:
- Northern Command (Udhampur, Jammu, Srinagar, Leh)
- Western Command (Chandimandir, Ambala, Jalandhar)
- Eastern Command (Kolkata, Siliguri, Shillong, Guwahati)
- Southern Command (Pune, Mumbai, Bangalore, Chennai, Secunderabad)
- South Western Command (Jaipur, Jodhpur, Bathinda)
- Central Command (Lucknow, Prayagraj, Jabalpur, Mhow)

---

## 6. Army Public School (APS) Proximity Mapping

Engineered in `src/apsSchools.ts`:
- Correlates accommodation listings with distance to nearest Army Public Schools (APS), Kendriya Vidyalayas (KV), and Military Hospitals (MH).
- Calculates transit commute times for defence children and families during mid-term postings.

---

## 7. Military Identity Verification & Trust Protocol

- Strict verification gate for landlords and tenants via Service ID, Defence Email, or ECHS/CSD card validation.
- Complete elimination of middlemen and civilian brokerage charges (100% Zero Brokerage Policy).

---

## 8. Automated CI/CD & Deployment Workflows

Managed via `.github/workflows/`:
1. `ci.yml`: Automated validation of React build (`npm run build`) and Flutter static analysis.
2. `deploy.yml`: Direct automated deployment to Firebase Hosting upon merges to `main`.
3. `release-apk.yml`: Automated compilation and release of signed Android APKs on version tags.