import React, { useState, useContext } from 'react';
import { useFilterStore } from '../../store/filterStore';
import { ModalContext } from '../../App';
import styles from './TacticalFAB.module.css';

const navItems = [
  { id: 'rentals', label: 'Home', icon: '🏠', view: 'rentals' },
  { id: 'map',     label: 'Map',  icon: '🗺️', isMap: true },
  { id: 'market',  label: 'Market',icon: '🛒', view: 'market' },
  { id: 'profile', label: 'Me',   icon: '👤', isProfile: true },
];

export default function TacticalFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeView, setActiveView } = useFilterStore();
  const ctx = useContext(ModalContext);

  const handleAction = (item) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
    if (item.isProfile) {
      ctx.openProfile();
    } else if (item.view) {
      setActiveView(item.view);
    }
    setIsOpen(false);
  };

  return (
    <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
      {/* Backdrop for closing when open */}
      {isOpen && <div className={styles.backdrop} onClick={() => {
        if (window.navigator?.vibrate) window.navigator.vibrate(5);
        setIsOpen(false);
      }} />}

      <div className={styles.menu}>
        {navItems.map((item, i) => (
          <button
            key={item.id}
            className={`${styles.item} ${activeView === item.view ? styles.active : ''}`}
            style={{ 
              '--i': i,
              transitionDelay: `${i * 0.05}s` 
            }}
            onClick={() => handleAction(item)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>

      <button 
        className={styles.mainBtn} 
        onClick={() => {
          if (window.navigator?.vibrate) window.navigator.vibrate(15);
          setIsOpen(!isOpen);
        }}
        aria-label="Toggle Menu"
      >
        <div className={styles.burger}>
          <span className={isOpen ? styles.cross : ''} />
        </div>
      </button>
    </div>
  );
}
