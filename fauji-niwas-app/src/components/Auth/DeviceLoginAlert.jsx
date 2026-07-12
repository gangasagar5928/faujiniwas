import { useState, useEffect, useCallback } from 'react';
import styles from './DeviceLoginAlert.module.css';

/**
 * DeviceLoginAlert — "New Device Detected" notification toast.
 * Shows once when a login from a new device fingerprint is detected.
 * Dismisses on click or auto-dismisses after 10 seconds.
 */
export default function DeviceLoginAlert({ device, browser, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 10000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div className={`${styles.alert} ${exiting ? styles.exit : ''}`} onClick={dismiss}>
      <div className={styles.icon}>🔐</div>
      <div className={styles.content}>
        <div className={styles.title}>New Device Login Detected</div>
        <div className={styles.sub}>
          Signed in from <strong>{browser}</strong> on <strong>{device}</strong>.
          <span className={styles.hint}> Not you? Go to Profile → Security to manage sessions.</span>
        </div>
      </div>
      <button className={styles.close} onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}
