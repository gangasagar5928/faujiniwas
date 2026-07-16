import React, { Component } from 'react';
import {createRoot} from 'react-dom/client';
import App from './AppNew';
import './indexNew.css';

// Error boundary so crashes show a message instead of blank screen
class ErrorBoundary extends Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position:'fixed', inset:0, background:'#0f172a', color:'#f87171',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          fontFamily:'monospace', padding:'2rem', gap:'1rem', textAlign:'center'
        }}>
          <div style={{fontSize:'24px'}}>⚠️ App Error</div>
          <div style={{fontSize:'13px', color:'#fbbf24', maxWidth:'600px', wordBreak:'break-all'}}>
            {this.state.error.message}
          </div>
          <div style={{fontSize:'11px', color:'#64748b', maxWidth:'600px', whiteSpace:'pre-wrap'}}>
            {this.state.error.stack?.slice(0, 400)}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{background:'#10b981', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:700}}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
