import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles.loader}>
      <div className={styles.logo}>Fauji<span>Adda</span></div>
      <div className={styles.bar}><div className={styles.fill} /></div>
      <div className={styles.sub}>Loading defence housing data…</div>
    </div>
  );
}
