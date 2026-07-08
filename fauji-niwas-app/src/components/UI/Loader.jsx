import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles.loader}>
      <div className={styles.brand}>🪖 FAUJI <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>NIWAS</span></div>
      
      {/* Tactical Status Circle */}
      <div className={styles.circleContainer}>
        <div className={styles.outerRing}></div>
        <div className={styles.midRing}></div>
        <div className={styles.centerDot}></div>
      </div>
      
      {/* Readiness Fill Bar */}
      <div className={styles.bar}>
        <div className={styles.fill} />
      </div>
      
      <div className={styles.status}>INITIALIZING SECURE SESSION RELAY...</div>
      <div className={styles.sub}>Verifying database credentials and encrypting communication channels</div>
    </div>
  );
}
