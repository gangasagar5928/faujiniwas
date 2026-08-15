# Security Policy

## 🛡️ Commitment to Defence Personnel Safety & Privacy

Fauji Niwas is dedicated to serving Indian Armed Forces personnel, JCOs, and Officers. Because our platform deals with military station relocations and service personnel verification, security and operational privacy are critical priorities.

## Supported Versions

| Version / Component | Supported |
| ------------------- | --------- |
| Web Application (`fauji-niwas-app`) | ✅ Yes |
| Flutter Mobile (`fauji-niwas_app`) | ✅ Yes |
| Firestore Rules & Backend API | ✅ Yes |

## Reporting a Vulnerability

If you discover a security vulnerability or sensitive data leakage risk:

1. **Do NOT disclose publicly** via GitHub Issues or discussions.
2. Email full reproduction steps directly to: **singhamankumar.5928@gmail.com** (Subject: `[SECURITY VULNERABILITY] Fauji Niwas`).
3. Include:
   - Vulnerability classification (e.g. Broken Access Control, Firestore Rule Bypass, XSS).
   - Step-by-step reproduction payload or proof-of-concept.
   - Potential impact on defence personnel data.

## Security Practices
- **No Operational Unit Details**: We do not store, index, or request military operational unit numbers, battalion designations, or tactical assets.
- **Client-Side Sanitization**: All user-generated text inputs are sanitized with DOMPurify before rendering.
- **Strict Firestore Rules**: All write operations require verified authentication headers and schema validation.
