<div align="center">
  <img src="fauji-niwas-app/public/favicon.svg" alt="Fauji Niwas Logo" width="120" />
  <h1>🪖 Fauji Niwas (फौजी निवास)</h1>
  <p><strong>Zero-Brokerage Housing & Transit Relocation Network for the Indian Armed Forces</strong></p>
  <p>Connecting Army, Navy, Air Force personnel, JCOs, and Officers with verified accommodations and SSB transit stays near military stations.</p>

  <p>
    <a href="https://faujiniwas.web.app" target="_blank"><img src="https://img.shields.io/badge/Live_Web_App-faujiniwas.web.app-238636?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
    <a href="https://github.com/gangasagar5928/Faujiniwas/releases"><img src="https://img.shields.io/badge/Android_APK-GitHub_Releases-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android Release" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
    <img src="https://img.shields.io/badge/React-18-61DAFB.svg?style=flat-square&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/Flutter-3.x-02569B.svg?style=flat-square&logo=flutter&logoColor=white" alt="Flutter" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Firebase-Hosting%20%7C%20Firestore-FFCA28.svg?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Maps-Leaflet%20%26%20OSM-199900.svg?style=flat-square&logo=leaflet&logoColor=white" alt="Leaflet Maps" />
    <img src="https://img.shields.io/badge/Coverage-62%2B%20Military%20Stations-success?style=flat-square" alt="62+ Stations" />
    <img src="https://img.shields.io/badge/Brokerage-0%25%20Zero%20Broker-red?style=flat-square" alt="Zero Brokerage" />
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  </p>
</div>

---

## 🎯 The Mission & Problem Space

Over **1.4 million active Indian Armed Forces personnel** and their families relocate every **2 to 3 years** across 62+ Cantonments and Military Stations nationwide.

### The Realities of Defence Relocation:
1. **Civilian Broker Exploitation:** Relocating jawans and officers lose thousands of rupees to aggressive civilian real estate brokers demanding 1–2 months' rent as brokerage.
2. **Station Proximity & Security:** Personnel need homes near specific Cantonment gates, CSD canteens, ECHS polyclinics, and Army Public Schools (APS), without exposing sensitive military details on public civilian forums.
3. **SSB & Transit Vulnerability:** Young SSB candidates and transit officers arriving at unfamiliar stations struggle to find verified, safe, budget-friendly transit dormitories.
4. **HRA & Allowance Mismatch:** Finding rentals that conform exactly to 7th Central Pay Commission (CPC) House Rent Allowance (HRA) limits (X, Y, Z category cities) without out-of-pocket loss.

**Fauji Niwas solves this with a verified peer-to-peer ecosystem built exclusively for the defence community.**

---

## ⚡ Key Platform Capabilities

| Feature | React Web App (`/fauji-niwas-app`) | Flutter Native App (`/fauji-niwas_app`) |
| :--- | :---: | :---: |
| **Interactive Station Map** | ✅ Leaflet Geo-clustering | ✅ Native Map Views |
| **Cantonment & Gate Search** | ✅ 62+ Stations indexed | ✅ Offline Station Cache |
| **Verified Defence Listings** | ✅ P2P direct handover | ✅ Native Card Feed |
| **SSB Transit Candidate Dorms** | ✅ Transit stays & ratings | ✅ Quick Gate Distance Finder |
| **7th CPC HRA Calculator** | ✅ Live City Tier Filter (X/Y/Z) | ✅ Rank-based HRA estimator |
| **Luggage TA/DA Matrix** | ✅ Relocation reimbursement | ✅ Slider Allowance Calculator |
| **Offline Checklists** | ✅ Web Checklist UI | ✅ SQLite / Native Checklist |
| **Military Identity Badging** | ✅ Verified Member Badge | ✅ Secure Defence Verification |

---

## 🏗️ Architecture & Monorepo Structure

```text
Faujiniwas/
├── fauji-niwas-app/             # 🌐 React 18 + Vite Web Application
│   ├── public/                  # SEO landing templates, static assets & icons
│   ├── src/
│   │   ├── components/          # Bento dashboard, Modals, Leaflet Map engine
│   │   ├── hooks/               # Auth, Geo-location, and Firestore hooks
│   │   ├── App.jsx              # Core React entry and state router
│   │   └── index.css            # Responsive styles & design system
│   └── package.json             # Web dependencies (React, Leaflet, Framer Motion)
│
├── fauji-niwas_app/             # 📱 Standalone Flutter Mobile Application
│   ├── lib/                     # Native Dart UI widgets, models & offline stores
│   ├── android/                 # Android native gradle config & permissions
│   └── pubspec.yaml             # Flutter dependencies & assets
│
├── .github/                     # ⚙️ Automation & Community Standards
│   ├── workflows/               # CI/CD pipelines, release builders & Firebase deploy
│   └── ISSUE_TEMPLATE/          # Standardized bug & feature request templates
│
├── firestore.rules              # 🛡️ Military-grade Firestore security rules
├── firebase.json                # 🚀 Fast zero-downtime routing & security headers
└── scripts/                     # 🔧 Development, SDK setup & maintenance scripts
```

---

## 🚀 Quickstart & Local Setup

### 1. React Web Application

```bash
# Navigate to web application directory
cd fauji-niwas-app

# Install dependencies
npm install

# Launch local development server
npm run dev

# Build production bundle with automated City SEO generation
npm run build
```

The web app will run locally at `http://localhost:5173`.

---

### 2. Flutter Mobile Application

```bash
# Navigate to mobile application directory
cd fauji-niwas_app

# Fetch Flutter packages
flutter pub get

# Run on connected Android / iOS device or emulator
flutter run

# Compile production release APK
flutter build apk --release
```

*Generated APK location:* `fauji-niwas_app/build/app/outputs/flutter-apk/app-release.apk`

---

## 📦 Automated Releases & CI/CD

To ensure high repository hygiene, **binary APK files are never committed directly into git history.** 

- **Pull Requests & Commits:** Continuous Integration (`.github/workflows/ci.yml`) runs automated builds and static analysis for both Web and Mobile apps.
- **Production APK Releases:** Every tagged release (`git tag v1.0.0 && git push --tags`) triggers `.github/workflows/release-apk.yml`, which automatically builds and publishes the optimized release APK to [GitHub Releases](https://github.com/gangasagar5928/Faujiniwas/releases).
- **Web Continuous Deployment:** Merges to `main` automatically deploy to [Firebase Hosting](https://faujiniwas.web.app) via `.github/workflows/deploy.yml`.

---

## 🛡️ Security & Defence Privacy Standards

Fauji Niwas adheres strictly to operational security best practices:
- **Zero Tactical Data:** No military unit numbers, tactical coordinates, or sensitive personnel records are ever requested or stored.
- **Client-Side Sanitization:** All user inputs and listings are sanitized using `DOMPurify` before DOM injection.
- **Strict Firestore Rules:** Unauthorized write attempts are blocked at the rule level.
- Read our complete [SECURITY.md](SECURITY.md) for responsible vulnerability disclosure.

---

## 🤝 Contributing

Contributions from the developer and defence community are warmly welcome. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

1. Fork the repo.
2. Create your branch (`git checkout -b feat/station-enhancement`).
3. Verify your changes (`npm run build` / `flutter analyze`).
4. Commit your changes (`git commit -m 'feat: add ECHS polyclinic distance filter'`).
5. Push to branch and open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <p>Jai Hind 🇮🇳 • Built with dedication for the Indian Armed Forces Community</p>
  <p><strong>Live Web Application:</strong> <a href="https://faujiniwas.web.app">https://faujiniwas.web.app</a></p>
</div>
