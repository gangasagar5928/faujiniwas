import { useContext } from 'react';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const setSmartSearchQ = useFilterStore((s) => s.setSmartSearchQ);
  const ctx = useContext(ModalContext);

  const tryVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      ctx?.showToast('Voice search not supported on this browser', 'error');
      return;
    }
    
    const r = new SR();
    r.lang = 'en-IN'; r.interimResults = false; r.maxAlternatives = 1; r.continuous = false;
    
    const btn = document.getElementById('mic-btn');
    
    r.onstart = () => {
      if (btn) btn.classList.add(styles.listening);
      ctx?.showToast('Listening...', 'ok');
    };

    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSmartSearchQ(transcript);
      const inp = document.getElementById('searchInput');
      if (inp) inp.value = transcript;
    };
    
    r.onerror = (err) => { 
      console.error('Speech error:', err);
      if (err.error === 'not-allowed') {
        ctx?.showToast('Microphone access denied', 'error');
      } else if (err.error === 'no-speech') {
        ctx?.showToast('No speech detected', 'error');
      } else {
        ctx?.showToast('Voice search error', 'error');
      }
    };
    
    r.onend = () => { if (btn) btn.classList.remove(styles.listening); };
    
    try {
      r.start();
    } catch (e) {
      console.error('SR start error:', e);
    }
  };

  return (
    <div className={styles.search}>
      <input
        id="searchInput"
        type="text"
        placeholder="Search cantt, city, area…"
        className={styles.input}
        value={useFilterStore(s => s.smartSearchQ)}
        onChange={(e) => setSmartSearchQ(e.target.value)}
        autoComplete="off"
      />
      {useFilterStore(s => s.smartSearchQ) && (
        <button 
          className={styles.clear} 
          onClick={() => {
            setSmartSearchQ('');
            const inp = document.getElementById('searchInput');
            if (inp) inp.value = '';
          }}
          title="Clear search"
        >✕</button>
      )}
      <button id="mic-btn" className={styles.mic} onClick={tryVoice} title="Voice search">🎤</button>
    </div>
  );
}
