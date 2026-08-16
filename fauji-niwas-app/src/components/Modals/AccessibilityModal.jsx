import React, { useState, useEffect } from 'react';

export default function AccessibilityModal({ onClose }) {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fn_fontsize') || '16px');
  const [theme, setTheme] = useState(() => localStorage.getItem('fn_theme') || 'light');
  const [ttsEnabled, setTtsEnabled] = useState(() => localStorage.getItem('fn_tts') === 'true');
  const [seniorMode, setSeniorMode] = useState(() => localStorage.getItem('fn_senior') === 'true');

  const applyFontSize = (size) => {
    setFontSize(size);
    document.documentElement.style.fontSize = size;
    localStorage.setItem('fn_fontsize', size);
    if (size === '20px') {
      document.body.classList.add('is-elderly-mode');
      localStorage.setItem('fn_senior', 'true');
      setSeniorMode(true);
    } else {
      document.body.classList.remove('is-elderly-mode');
      localStorage.setItem('fn_senior', 'false');
      setSeniorMode(false);
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

  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    localStorage.setItem('fn_tts', next ? 'true' : 'false');
    window.fn_tts_active = next;
    if (next && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("Voice Assistant Enabled. Tap any listing to read details.");
      msg.lang = 'en-IN';
      window.speechSynthesis.speak(msg);
    }
  };

  const handleSetLang = (code) => {
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="mc bg-white dark:bg-[#0f172a] text-slate-800 dark:text-white p-6 max-w-md w-[92%] rounded-2xl shadow-2xl border-2 border-emerald-600/30 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♿</span>
            <div>
              <h3 className="text-base font-extrabold text-[#1b4332] dark:text-amber-400 uppercase tracking-wide">
                Accessibility Suite / सुगम्यता
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tailored for Defence Veterans, Seniors & Vision Care
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col gap-5 text-sm">
          
          {/* 1. Font Size / Senior Mode */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Text Size & Legibility / पाठ का आकार
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'A-', size: '14px' },
                { label: 'A (Std)', size: '16px' },
                { label: 'A+', size: '18px' },
                { label: 'Senior 🎖️', size: '20px' }
              ].map(item => (
                <button
                  key={item.size}
                  onClick={() => applyFontSize(item.size)}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    fontSize === item.size
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. High Contrast / Theme */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Contrast & Color Mode / थीम
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applyTheme('light')}
                className={`py-3 px-4 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                }`}
              >
                ☀️ Light Mode (Standard)
              </button>
              <button
                onClick={() => applyTheme('dark')}
                className={`py-3 px-4 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                }`}
              >
                🌙 High Contrast Dark
              </button>
            </div>
          </div>

          {/* 3. Text-to-Speech Voice Assistant */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-1.5">
                <span>🗣️ Voice Reader (AI Speech)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Speaks listing details out loud when tapped.
              </p>
            </div>
            <button
              onClick={toggleTts}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                ttsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full transition-transform transform ${
                ttsEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* 4. Language Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Language / भाषा बदलें
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'pa', label: 'ਪੰਜਾਬੀ' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'mr', label: 'मराठी' },
                { code: 'kn', label: 'ಕನ್ನಡ' },
                { code: 'bn', label: 'বাংলা' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSetLang(lang.code)}
                  className="py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Done button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-[#1b4332] hover:bg-[#15803d] text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-center"
        >
          Save & Apply Settings / सहेजें
        </button>
      </div>
    </div>
  );
}
