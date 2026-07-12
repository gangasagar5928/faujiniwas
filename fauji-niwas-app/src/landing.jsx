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

// Always register Service Worker in production for the PWA experience
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[PWA] Service Worker registration failed:', err);
    });
  });
}
