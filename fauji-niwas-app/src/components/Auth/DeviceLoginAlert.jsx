import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeviceLoginAlert.module.css';

/**
 * DeviceLoginAlert — "New Device Detected" notification toast.
 * Shows once when a login from a new device fingerprint is detected.
 * Dismisses on click or auto-dismisses after 10 seconds.
 */
export default function DeviceLoginAlert({ device, browser, onDismiss }) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 10000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.alert}
          onClick={dismiss}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        >
          <div className={styles.icon}>🔐</div>
          <div className={styles.content}>
            <div className={styles.title}>New Device Login Detected</div>
            <div className={styles.sub}>
              Signed in from <strong>{browser}</strong> on <strong>{device}</strong>.
              <span className={styles.hint}> Not you? Go to Profile → Security to manage sessions.</span>
            </div>
          </div>
          <motion.button className={styles.close} onClick={dismiss} aria-label="Dismiss" whileTap={{ scale: 0.8 }}>✕</motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
