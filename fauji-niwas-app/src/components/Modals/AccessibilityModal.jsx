import React, { useState } from 'react';

export default function AccessibilityModal({ onClose }) {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fn_fontsize') || '16px');
  const [theme, setTheme] = useState(() => localStorage.getItem('fn_theme') || 'light');
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('fn_lang') || 'en');

  const applyFontSize = (size) => {
    setFontSize(size);
    document.documentElement.style.fontSize = size;
    localStorage.setItem('fn_fontsize', size);
    if (size === '20px') {
      document.body.classList.add('is-elderly-mode');
      localStorage.setItem('fn_senior', 'true');
    } else {
      document.body.classList.remove('is-elderly-mode');
      localStorage.setItem('fn_senior', 'false');
    }
  };

  const applyTheme = (mode) => {
    setTheme(mode);
    localStorage.setItem('fn_theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark', 'dark-theme');
      document.body.classList.add('dark', 'dark-theme');
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.documentElement.classList.remove('dark', 'dark-theme');
      document.body.classList.remove('dark', 'dark-theme');
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    }
    // Dispatch event so Map and components can adapt instantly
    window.dispatchEvent(new CustomEvent('theme-change', { detail: mode }));
  };

  const handleSetLang = (code) => {
    setCurrentLang(code);
    localStorage.setItem('fn_lang', code);
    
    // Set Google Translate cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/auto/${code}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/auto/${code}; path=/;`;

    if (window.setLang) {
      window.setLang(code);
    } else {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = code;
        combo.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      style={{
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)', 
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center', 
        zIndex: 999999,
        padding: '16px'
      }}
    >
      <div 
        className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-white"
        onClick={e => e.stopPropagation()}
        style={{
          fontFamily: "'Outfit', sans-serif",
          width: '320px',
          maxWidth: '92vw',
          padding: '18px 20px',
          borderRadius: '22px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ACCESSIBILITY 🎖️
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              fontWeight: 700,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

        {/* Controls Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 1. TEXT SIZE / आकार */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              TEXT SIZE / आकार
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { label: 'A-', size: '14px' },
                { label: 'A', size: '16px' },
                { label: 'A+', size: '18px' },
                { label: 'Senior', size: '20px' }
              ].map(item => {
                const isActive = fontSize === item.size;
                return (
                  <button
                    key={item.size}
                    onClick={() => applyFontSize(item.size)}
                    style={{
                      padding: '8px 0',
                      fontSize: '12px',
                      fontWeight: isActive ? 900 : 700,
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? '#f59e0b' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#334155',
                      boxShadow: isActive ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. LANGUAGE / भाषा */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              LANGUAGE / भाषा
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { code: 'en', label: 'EN' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'pa', label: 'ਪੰਜਾਬੀ' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'mr', label: 'मराठी' },
                { code: 'kn', label: 'ಕನ್ನಡ' },
                { code: 'bn', label: 'বাংলা' }
              ].map(lang => {
                const isActive = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSetLang(lang.code)}
                    style={{
                      padding: '8px 0',
                      fontSize: '12px',
                      fontWeight: isActive ? 900 : 700,
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? '#f59e0b' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#334155',
                      boxShadow: isActive ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                    }}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. CONTRAST THEME / थीम */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              CONTRAST THEME / थीम
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                onClick={() => applyTheme('dark')}
                style={{
                  padding: '10px 0',
                  fontSize: '12px',
                  fontWeight: theme === 'dark' ? 900 : 700,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: theme === 'dark' ? '#f59e0b' : '#f1f5f9',
                  color: theme === 'dark' ? '#ffffff' : '#334155',
                  boxShadow: theme === 'dark' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                }}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => applyTheme('light')}
                style={{
                  padding: '10px 0',
                  fontSize: '12px',
                  fontWeight: theme === 'light' ? 900 : 700,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: theme === 'light' ? '#f59e0b' : '#f1f5f9',
                  color: theme === 'light' ? '#ffffff' : '#334155',
                  boxShadow: theme === 'light' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                }}
              >
                ☀️ Light
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
