import React, { useState, useEffect } from 'react';

export default function AccessibilityModal({ onClose }) {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fn_fontsize') || '16px');
  const [theme, setTheme] = useState(() => localStorage.getItem('fn_theme') || 'light');
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('fn_lang') || 'en');
  const [ttsEnabled, setTtsEnabled] = useState(() => localStorage.getItem('fn_tts') === 'true');

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const indVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (indVoice) utterance.voice = indVoice;
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

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
  };

  const handleSetLang = (code) => {
    setCurrentLang(code);
    localStorage.setItem('fn_lang', code);
    if (window.setLang) {
      window.setLang(code);
    } else {
      var combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = code;
        combo.dispatchEvent(new Event('change'));
      }
    }
  };

  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    localStorage.setItem('fn_tts', next ? 'true' : 'false');
    window.fn_tts_active = next;
    if (next) {
      speakText("Voice Reader Enabled. Tap any listing to read details.");
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 999999
    }}>
      <div 
        className="mc bg-white dark:bg-[#0f172a] text-slate-800 dark:text-white p-6 max-w-[350px] w-[90%] rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 font-sans"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header matching Image 2 */}
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            ACCESSIBILITY 🎖️
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Thin Divider */}
        <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />

        {/* Controls Container */}
        <div className="flex flex-col gap-4">
          
          {/* 1. TEXT SIZE / आकार */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TEXT SIZE / आकार
            </label>
            <div className="grid grid-cols-4 gap-2">
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
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#f59e0b] text-white font-black shadow-sm'
                        : 'bg-[#f1f5f9] dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. LANGUAGE / भाषा */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              LANGUAGE / भाषा
            </label>
            <div className="grid grid-cols-4 gap-1.5">
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
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#f59e0b] text-white font-black shadow-sm'
                        : 'bg-[#f1f5f9] dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. CONTRAST THEME / थीम */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CONTRAST THEME / थीम
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applyTheme('dark')}
                className={`py-2.5 font-bold rounded-xl text-xs transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#f59e0b] text-white font-black shadow-sm'
                    : 'bg-[#f1f5f9] dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => applyTheme('light')}
                className={`py-2.5 font-bold rounded-xl text-xs transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#f59e0b] text-white font-black shadow-sm'
                    : 'bg-[#f1f5f9] dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* 4. VOICE READER (AI SPEECH) */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 mt-1">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🗣️ Voice Reader (AI Speech)</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Speaks listing details when tapped.
              </p>
            </div>
            <button
              onClick={toggleTts}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                ttsEnabled ? 'bg-[#f59e0b]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform transform ${
                ttsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
