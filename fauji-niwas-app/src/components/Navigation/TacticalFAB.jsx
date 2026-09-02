import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
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
          <motion.button
            key={item.id}
            className={`${styles.item} liquid-glass-chip ${activeView === item.view ? styles.active : ''}`}
            style={{
              '--i': i,
              transitionDelay: `${i * 0.05}s`
            }}
            onClick={() => handleAction(item)}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        className={`${styles.mainBtn} fluid-press`}
        onClick={() => {
          if (window.navigator?.vibrate) window.navigator.vibrate(15);
          setIsOpen(!isOpen);
        }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        aria-label="Toggle Menu"
      >
        <div className={styles.burger}>
          <span className={isOpen ? styles.cross : ''} />
        </div>
      </motion.button>
    </div>
  );
}
