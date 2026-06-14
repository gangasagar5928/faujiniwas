import styles from './DormCard.module.css';

export default function DormCard({ dorm: d, onFoodClick }) {
  return (
    <div className={`${styles.card} listing-card`} onClick={() => onFoodClick?.(d.city)}>
      <div className={styles.row}>
        <h4>🏨 {d.name}</h4>
        <span className={styles.price}>₹{d.price}/night</span>
      </div>
      <div className={styles.meta}>
        📍 {d.area}, {d.city}&nbsp;·&nbsp;🎯 {d.ssb}
        <span className={styles.dist}>&nbsp;·&nbsp;🚶 {d.distance} km</span>
      </div>
      <p className={styles.desc}>{d.desc}</p>
      <div className={styles.badges}>
        <span className={styles.badge}>{d.type}</span>
        {d.amenities.map(a => <span key={a} className={styles.badge}>{a}</span>)}
      </div>
    </div>
  );
}
