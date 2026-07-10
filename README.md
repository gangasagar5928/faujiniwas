<div align="center">
  <img src="https://faujiniwas.web.app/assets/fauji-niwas-logo.svg" alt="Fauji Niwas Logo" width="200" />
  <h1>Fauji Niwas</h1>
  <p><strong>Relocate Safely, Trust Implicitly</strong></p>
  <p>A peer-to-peer network connecting Indian Armed Forces personnel, JCOs, and Officers with verified residential housing and transit stays near military stations.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange.svg)](https://firebase.google.com/)
</div>

<hr />

## 🌟 About

Fauji Niwas is designed to simplify transfer cycles for the Indian Armed Forces. Built for jawans, JCOs, and officers to share postings and rent homes near cantonments and military stations **without brokerage**. 

We ensure high-trust networks by vetting defence personnel and enabling direct P2P connections to avoid fraud.

## 🚀 Features

* **🗺️ Station Search & Routing:** Pinpoint accommodations and SSB transit stays near Cantonments, Air Force Stations, or Naval Bases.
* **🛡️ Verified Defence Listings:** Direct peer-to-peer listings posted by relocating personnel or verified defense-friendly owners. 
* **💰 HRA Allowance Estimator:** Align your search budget with government House Rent Allowance (HRA) limits for Officers, JCOs, or ORs.
* **📅 Relocation Timeline Match:** Sync your moving dates with vacancy states of outgoing officers to schedule seamless handovers.

## 🛠️ Technology Stack

* **Frontend:** React (Vite)
* **Styling:** CSS Modules + Vanilla CSS, Framer Motion for animations
* **Database:** Firebase Firestore (Realtime DB & Rules)
* **Hosting:** Firebase Hosting
* **Mapping:** Leaflet & React-Leaflet

---

## 📱 Native Mobile Application (Flutter)

Fauji Niwas includes a standalone native mobile app built in Flutter under the `fauji-niwas_app` directory. It operates fully offline using native Dart models and lists (seed synchronized with our database).

### Features:
- **Rentals & Station Search**: Native searches and filter bars (BHK, Max Rent, Owner type).
- **SSB Candidate Dorms**: Fast guest house browsing with gate distance metrics and nearby food finders.
- **CSD Canteens & Hospital Proximity**: Auto-calculation of nearest ECHS hubs, canteens, and schools.
- **TA/DA Relocation Matrix**: Slider-driven official luggage allowance reimbursement calculator.
- **Relocation Checklist**: Offline checklists tailored to OR, JCO, and Officer rank postings.

---

## 📦 Local Development Setup

### React Web Application:
To run the web app, you will need [Node.js](https://nodejs.org/) installed:

1. **Navigate to the app directory:**
   ```bash
   cd fauji-niwas-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Build for production (generates city SEO templates):**
   ```bash
   npm run build
   ```

### Native Flutter Mobile Application:
To run or build the Android APK, you will need [Flutter SDK](https://flutter.dev/docs/get-started/install) installed:

1. **Navigate to the mobile app directory:**
   ```bash
   cd fauji-niwas_app
   ```
2. **Get Flutter packages:**
   ```bash
   flutter pub get
   ```
3. **Run on connected emulator or device:**
   ```bash
   flutter run
   ```
4. **Build the production release APK:**
   ```bash
   flutter build apk --release
   ```
   *Compiled APK output will be generated at:* `fauji-niwas_app/build/app/outputs/flutter-apk/app-release.apk`

---

## 🔐 Firebase Configuration

Fauji Niwas relies on Firebase. You will need to setup your own Firebase project to fully use the backend:
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable Firestore and Hosting.
3. Update the firebase config inside `src/firebase.js` (or `.env` variables if configured).

To deploy:
```bash
npm run build
firebase deploy --only hosting:faujiniwas
```

## 🤝 Contributing

We welcome contributions to improve Fauji Niwas for our Armed Forces.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

**Project Admin** - [aman@faujiniwas.com](mailto:singhamankumar.5928@gmail.com)

**Live Link:** [https://faujiniwas.web.app](https://faujiniwas.web.app)
