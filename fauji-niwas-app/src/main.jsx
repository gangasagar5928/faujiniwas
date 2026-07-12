import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

document.documentElement.classList.add('app-shell');
document.body.classList.add('app-shell');

// Global ErrorBoundary — prevents silent white screen on mobile crashes
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position:'fixed', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', background:'#0b1325', color:'#f0f4ff',
          fontFamily:"'Outfit',sans-serif", padding:24, textAlign:'center', gap:16,
        }}>
          <div style={{fontSize:40}}>⚠️</div>
          <h2 style={{color:'#FF9933'}}>Something went wrong</h2>
          <p style={{color:'#7a8fa8', fontSize:14}}>Please refresh the page or try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{background:'#FF9933', color:'#000', border:'none', padding:'12px 28px',
              borderRadius:100, fontWeight:800, fontSize:15, cursor:'pointer'}}>
            Reload App
          </button>
          <pre style={{fontSize:10, color:'#3a4f70', maxWidth:'90vw', overflow:'auto', marginTop:8}}>
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Signal to the inline loader that the app has mounted — use rAF so loader
// hides only after React's first real paint (prevents white-flash on slow devices)
requestAnimationFrame(() => {
  window.dispatchEvent(new Event('app-ready'));
});

// Always register Service Worker in production for the PWA experience
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[PWA] Service Worker registration failed:', err);
    });
  });
}

