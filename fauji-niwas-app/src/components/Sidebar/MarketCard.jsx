import { useContext } from 'react';
import { ModalContext } from '../../App';
import styles from './MarketCard.module.css';

export default function MarketCard({ item, index, onClick }) {
  const ctx = useContext(ModalContext);
  const { name, area, city, price, category, condition, mediaUrls, negotiable } = item;
  const thumb = mediaUrls?.[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400';

  const getIcon = (cat) => {
    const map = {
      'Furniture': '🪑',
      'Electronics': '💻',
      'Vehicles': '🚗',
      'Household': '🏠',
      'Kit/Gear': '🎖️',
      'Other': '📦'
    };
    return map[cat] || '🏷️';
  };

  return (
    <div className={`${styles.card} listing-card`} onClick={onClick} style={{ '--delay': `${index * 0.05}s` }}>
      <div className={styles.imgWrap}>
        <img src={thumb} alt={name} className={styles.img} />
        <div className={styles.categoryBadge}>{getIcon(category)} {category}</div>
        {negotiable && <div className={styles.negBadge}>Negotiable</div>}
      </div>
      
      <div className={styles.info}>
        <div className={styles.top}>
          <div className={styles.price}>₹{price.toLocaleString()}</div>
          <div className={`${styles.condition} ${styles[condition?.toLowerCase()]}`}>{condition}</div>
        </div>
        
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.loc}>{area}, {city}</p>
        
        <div className={styles.footer}>
          <button className={styles.chatBtn} onClick={(e) => { e.stopPropagation(); ctx.openChat({ listingId: item.id, recipientId: item.uid, name: item.name }); }}>
            💬 Chat
          </button>
          <button className={styles.viewBtn}>View Details</button>
        </div>
      </div>
    </div>
  );
}
