import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPanel from '../components/Admin/AdminPanel';
import Loader from '../components/UI/Loader';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1325' }}>
        <Loader />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070d18',
        color: '#f8fafc',
        fontFamily: "'Outfit', sans-serif",
        padding: 24,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
        <h1 style={{ color: '#ef4444', fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: '0.05em' }}>
          RESTRICTED CANTONMENT AREA
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 440, lineHeight: 1.6, marginBottom: 24 }}>
          Access to this command console requires verified Military Administrator credentials. Unauthorized access attempts are monitored and logged.
        </p>
        <button
          onClick={() => navigate('/app')}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#070d18',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 100,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.35)'
          }}
        >
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1325', padding: '24px 16px', color: '#f8fafc' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button
            onClick={() => navigate('/app')}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            ← Back to App
          </button>
          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
            ● ADMIN SESSION ACTIVE
          </span>
        </div>
        <AdminPanel onClose={() => navigate('/app')} />
      </div>
    </div>
  );
}
