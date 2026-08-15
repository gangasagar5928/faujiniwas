# Contributing to Fauji Niwas

Thank you for your interest in contributing to **Fauji Niwas**, the peer-to-peer housing and relocation network for the Indian Armed Forces community.

---

## 🧭 Monorepo Structure

```text
├── fauji-niwas-app/    # React 18 + Vite Web Application & Static SEO Pages
├── fauji-niwas_app/    # Native Flutter Mobile Application (Android/iOS)
├── firestore.rules     # Production Firestore Security Rules
├── firebase.json       # Firebase Hosting & Header Configuration
├── scripts/            # Utility and SDK setup scripts
└── .github/            # CI/CD Workflows, PR & Issue Templates
```

---

## 🛠️ Contribution Workflow

1. **Fork the Repository:** Fork on GitHub to your account.
2. **Clone & Branch:** 
   ```bash
   git clone https://github.com/YOUR_USERNAME/Faujiniwas.git
   cd Faujiniwas
   git checkout -b feat/your-feature-name
   ```
3. **Develop & Verify:**
   - For web changes:
     ```bash
     cd fauji-niwas-app
     npm install
     npm run dev
     npm run build  # Ensure production bundle passes
     ```
   - For mobile changes:
     ```bash
     cd fauji-niwas_app
     flutter pub get
     flutter analyze
     ```
4. **Clean Commits:**
   - Keep commits atomic and informative (e.g. `feat(web): add cantonment distance filter`, `fix(mobile): resolve HRA calculation rounding`).
   - **Never commit `.apk`, `.diff`, `.log`, `.tmp`, or credential files.**
5. **Open a Pull Request:**
   - Submit PR against `main`. Fill in the PR template thoroughly.

---

## 📜 Code & Security Guidelines

- **Privacy First:** Never log, store, or solicit sensitive defence unit numbers or operational secrets.
- **Components:** In the web app, keep components modular and maintain CSS modules or utility classes consistently.
- **Leaflet Geo-data:** Sanitize latitude/longitude coordinates to avoid rendering exceptions or invalid bounding boxes.
- **Accessibility:** Ensure high contrast and mobile-friendly tap targets across all viewports.

---

## 🤝 Code of Conduct

Maintain respect, professional discourse, and dedication to serving our veterans and active-duty defence families.
