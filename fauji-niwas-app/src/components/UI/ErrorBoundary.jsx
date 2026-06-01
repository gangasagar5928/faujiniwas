import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tactical System Failure:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: '#0b1325', color: '#fff',
          fontFamily: 'Outfit, sans-serif', textAlign: 'center', padding: 20
        }}>
          <h1 style={{fontSize: 64}}>⚠️</h1>
          <h2 style={{marginTop: 20}}>Tactical System Interrupted</h2>
          <p style={{color: '#7a8fa8', maxWidth: 400, marginTop: 10}}>
            An unexpected error occurred in the command center. 
            The system is attempting to stabilize.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 30, padding: '12px 24px', background: '#FF9933', 
              color: '#000', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer'
            }}
          >
            Reboot Command Center
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
