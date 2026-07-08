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
