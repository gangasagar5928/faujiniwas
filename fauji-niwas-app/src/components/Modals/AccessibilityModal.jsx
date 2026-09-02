import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="mc"
        style={{
          width: 320,
          maxWidth: '92vw',
          padding: '18px 20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            ACCESSIBILITY 🎖️
          </div>
          <motion.button
            whileTap={{scale:0.97}}
            onClick={onClose}
            className="fluid-press"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1
            }}
            aria-label="Close modal"
          >
            ✕
          </motion.button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />

        {/* Controls Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 1. TEXT SIZE / आकार */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              TEXT SIZE / आकार
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { label: 'A-', size: '14px' },
                { label: 'A', size: '16px' },
                { label: 'A+', size: '18px' },
                { label: 'Senior', size: '20px' }
              ].map(item => {
                const isActive = fontSize === item.size;
                return (
                  <motion.button
                    key={item.size}
                    whileTap={{scale:0.97}}
                    onClick={() => applyFontSize(item.size)}
                    className="liquid-glass-chip fluid-press"
                    style={{
                      padding: '8px 0',
                      fontSize: 12,
                      fontWeight: isActive ? 900 : 700,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? 'var(--gold)' : 'var(--card2)',
                      color: isActive ? 'var(--text)' : 'var(--text)',
                      boxShadow: isActive ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                    }}
                  >
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2. LANGUAGE / भाषा */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              LANGUAGE / भाषा
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
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
                  <motion.button
                    key={lang.code}
                    whileTap={{scale:0.97}}
                    onClick={() => handleSetLang(lang.code)}
                    className="liquid-glass-chip fluid-press"
                    style={{
                      padding: '8px 0',
                      fontSize: 12,
                      fontWeight: isActive ? 900 : 700,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? 'var(--gold)' : 'var(--card2)',
                      color: isActive ? 'var(--text)' : 'var(--text)',
                      boxShadow: isActive ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                    }}
                  >
                    {lang.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 3. CONTRAST THEME / थीम */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              CONTRAST THEME / थीम
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <motion.button
                whileTap={{scale:0.97}}
                onClick={() => applyTheme('dark')}
                className="liquid-glass-chip fluid-press"
                style={{
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: theme === 'dark' ? 900 : 700,
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: theme === 'dark' ? 'var(--gold)' : 'var(--card2)',
                  color: theme === 'dark' ? 'var(--text)' : 'var(--text)',
                  boxShadow: theme === 'dark' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                }}
              >
                🌙 Dark
              </motion.button>
              <motion.button
                whileTap={{scale:0.97}}
                onClick={() => applyTheme('light')}
                className="liquid-glass-chip fluid-press"
                style={{
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: theme === 'light' ? 900 : 700,
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: theme === 'light' ? 'var(--gold)' : 'var(--card2)',
                  color: theme === 'light' ? 'var(--text)' : 'var(--text)',
                  boxShadow: theme === 'light' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
                }}
              >
                ☀️ Light
              </motion.button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
