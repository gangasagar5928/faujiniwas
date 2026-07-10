import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './pages/LandingPage';
import './landing.css';

document.body.classList.add('landing-page');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);

// Signal to the inline loader that the app has mounted
window.dispatchEvent(new Event('app-ready'));

// Conditionally manage Service Worker for Native App vs Web
const isNativeApp = navigator.userAgent.includes('FaujiNiwas/1.0') || window.faujiApp;

if (isNativeApp && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
} else if (!isNativeApp && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
