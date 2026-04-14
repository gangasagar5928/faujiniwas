import { FOOD_BY_CITY } from '../../data';
import styles from './FoodPanel.module.css';

export default function FoodPanel({ city, onClose }) {
  const key = Object.keys(FOOD_BY_CITY).find(k => city?.toLowerCase().includes(k.toLowerCase()));
  const opts = key ? FOOD_BY_CITY[key] : [];

  return (
    <>
      <div className={`${styles.backdrop} ${styles.open}`} onClick={onClose} />
      <div className={`${styles.panel} ${styles.open}`}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <h3>🍽️ Mess & Hotels in {city}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {!opts.length ? (
          <div className={styles.empty}>No food data yet for {city} 😔</div>
        ) : (
          <div className={styles.grid}>
            {opts.map((f, i) => {
              const cls = f.budget === '₹' ? styles.fpLo : f.budget === '₹₹' ? styles.fpMid : styles.fpHi;
              return (
                <div key={i} className={styles.card}>
                  <div className={styles.fname}>{f.name}</div>
                  <div className={styles.ftype}>{f.type}</div>
                  <span className={`${styles.fprice} ${cls}`}>{f.budget} — {f.note}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
