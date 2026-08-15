import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './pages/LandingPage';
import './landing.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('LandingPage Error:', e, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: 600, margin: '40px auto' }}>
          <h2 style={{ color: '#b45309', fontSize: 24, fontWeight: 'bold' }}>Fauji Niwas</h2>
          <p style={{ color: '#dc2626', fontSize: 14, margin: '16px 0' }}>App rendering issue detected: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ background: '#b45309', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

document.body.classList.add('landing-page');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <LandingPage />
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);

window.__APP_READY__ = true;
window.dispatchEvent(new Event('app-ready'));

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[PWA] Service Worker registration failed:', err);
    });
  });
}
