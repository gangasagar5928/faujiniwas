import { useState, useEffect, useContext } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp } from '../../firebase';
import { FOOD_BY_CITY, SSB_DORMS } from '../../data';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import styles from './FoodPanel.module.css';

const TIFFIN_SERVICES = [
  {
    name: "Auntie's Homely Tiffin",
    rating: 4.9,
    reviews: 24,
    type: "Veg & Non-Veg Homely Thali",
    price: "₹3,500 / month",
    diet: "High-protein, Low-oil diet",
    special: "⚡ Free Delivery to Cantt Area",
    phone: "9876543211",
    menu: "Roti, Rice, Dal Fry, Special Subzi / Chicken Curry (Sundays)"
  },
  {
    name: "Subedar Major's Desi Kitchen",
    rating: 4.8,
    reviews: 18,
    type: "Pure Veg authentic North Indian",
    price: "₹2,800 / month (or ₹110/meal)",
    diet: "Homestyle wheat rotis, fresh vegetables",
    special: "📦 Custom single-bachelor meal boxes",
    phone: "9876543212",
    menu: "4 Rotis, Seasonal Veg, Tadka Dal, Jeera Rice, Salad & Pickle"
  },
  {
    name: "Defence Tiffin Hub",
    rating: 4.7,
    reviews: 31,
    type: "South Indian & Dietary Specials",
    price: "₹3,200 / month",
    diet: "Bachelors Special: Balanced calories",
    special: "🎖️ Standard home packaging",
    phone: "9876543213",
    menu: "Idli/Dosa (Breakfast), Sambar, Rice, Thoran, Curd & Pickle"
  }
];

const StarRating = ({ rating, count }) => (
  <div className={styles.stars}>
    <span className={styles.starGold}>★</span>
    <span className={styles.starText}>{rating ? (Number(rating).toFixed(1)) : 'No ratings'}</span>
    {count > 0 && <span className={styles.starCount}>({count})</span>}
  </div>
);

export default function FoodPanel({ city, onClose }) {
  const { user } = useAuth();
  const ctx = useContext(ModalContext);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reviews, setReviews] = useState({}); // { vendorId: { avg, count } }
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const cityLower = city?.toLowerCase() || '';
  const key = Object.keys(FOOD_BY_CITY).find(k => cityLower.includes(k.toLowerCase()));
  const opts = key ? FOOD_BY_CITY[key] : [];
  
  // Also find any candidate stays for this city
  const stays = (SSB_DORMS || []).filter(d => 
    d.city?.toLowerCase().includes(cityLower) || cityLower.includes(d.city?.toLowerCase())
  );

  useEffect(() => {
    if (!opts.length) return;
    
    // Fetch summary for all vendors in this city
    const q = query(collection(db, 'food_reviews'), where('city', '==', key));
    const unsub = onSnapshot(q, (snap) => {
      const agg = {};
      snap.docs.forEach(d => {
        const r = d.data();
        if (!agg[r.vendorId]) agg[r.vendorId] = { sum: 0, count: 0 };
        agg[r.vendorId].sum += r.rating;
        agg[r.vendorId].count += 1;
      });
      const results = {};
      Object.keys(agg).forEach(vk => {
        results[vk] = { avg: agg[vk].sum / agg[vk].count, count: agg[vk].count };
      });
      setReviews(results);
    });
    return () => unsub();
  }, [key]);

  const handleRate = async () => {
    if (!user) return ctx.showToast('Login to rate', 'err');
    if (submitting) return;
    setSubmitting(true);
    try {
      const vendorId = `${key}_${selectedVendor.name}`;
      await addDoc(collection(db, 'food_reviews'), {
        vendorId,
        city: key,
        rating: newReview.rating,
        comment: newReview.comment,
        uid: user.uid,
        userName: user.displayName || user.phoneNumber || 'Fauji Member',
        createdAt: serverTimestamp()
      });
      ctx.showToast('Rating submitted! 🍽️', 'ok');
      setSelectedVendor(null);
      setNewReview({ rating: 5, comment: '' });
    } catch (e) {
      ctx.showToast('Error: ' + e.message, 'err');
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className={`${styles.backdrop} ${styles.open}`} onClick={onClose} />
      <div className={`${styles.panel} ${styles.open}`}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <h3>🍽️ Mess & Hotels in {city}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {selectedVendor ? (
          <div className={styles.reviewForm}>
            <button className={styles.backBtn} onClick={() => setSelectedVendor(null)}>← Back</button>
            <h4>Rate {selectedVendor.name}</h4>
            <div className={styles.starInput}>
              {[1,2,3,4,5].map(s => (
                <span key={s} className={newReview.rating >= s ? styles.starBigActive : styles.starBig} onClick={() => setNewReview(r => ({...r, rating: s}))}>★</span>
              ))}
            </div>
            <textarea className="fi" placeholder="How was the food/ambience?" value={newReview.comment} onChange={e => setNewReview(r => ({...r, comment: e.target.value}))} />
            <button className="bp" onClick={handleRate} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        ) : (!opts.length && !stays.length) ? (
          <div className={styles.empty}>No hospitality data yet for {city} 😔</div>
        ) : (
          <div className={styles.scrollArea}>
            {stays.length > 0 && (
              <div className={styles.staysSection}>
                <h4 className={styles.sectionTitle}>🏨 Recommended Candidate Stays</h4>
                <div className={styles.stayGrid}>
                   {stays.map(s => (
                     <div key={s.id} className={styles.stayCard}>
                        <div className={styles.stayName}>{s.name}</div>
                        <div className={styles.stayMeta}>{s.type} · ₹{s.price}/night</div>
                        <div className={styles.stayNote}>🎯 {s.ssb}</div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            <h4 className={styles.sectionTitle} style={{marginTop: 20}}>🍽️ Local Mess & Dhabas</h4>
            <div className={styles.grid}>
              {opts.map((f, i) => {
                const vendorId = `${key}_${f.name}`;
                const r = reviews[vendorId] || { avg: 0, count: 0 };
                const cls = f.budget === '₹' ? styles.fpLo : f.budget === '₹₹' ? styles.fpMid : styles.fpHi;
                return (
                  <div key={i} className={styles.card} onClick={() => setSelectedVendor(f)}>
                    <div className={styles.fname}>{f.name}</div>
                    <div className={styles.ftype}>{f.type}</div>
                    <StarRating rating={r.avg} count={r.count} />
                    <div className={`${styles.fprice} ${cls}`}>{f.budget} — {f.note}</div>
                    <div className={styles.rateHint}>Tap to rate ⭐️</div>
                  </div>
                );
              })}
            </div>

            {/* CSD Home Tiffin Marketplace */}
            <h4 className={styles.sectionTitle} style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
              🎖️ Home Tiffin Services 
              <span className="tag" style={{ fontSize: 9, color: 'var(--gold)', borderColor: 'var(--gold)', padding: '1px 6px', textTransform: 'uppercase' }}>Verified Home Cooks</span>
            </h4>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
              Home-cooked, hygienic thalis with free delivery inside Cantonment limits.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {TIFFIN_SERVICES.map((t, idx) => (
                <div 
                  key={idx} 
                  className={styles.card}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 8, 
                    cursor: 'default',
                    border: '1px solid var(--border2)', 
                    background: 'rgba(255,255,255,0.01)',
                    padding: 14,
                    borderRadius: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</span>
                      <span className="tag" style={{ marginLeft: 8, fontSize: 9, color: 'var(--green)', borderColor: 'var(--green)', padding: '1px 6px' }}>Welfare Vetted</span>
                    </div>
                    <StarRating rating={t.rating} count={t.reviews} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border2)', paddingBottom: 8 }}>
                    <div style={{ textAlign: 'left' }}>
                      <b>🍴 Menu:</b> {t.menu}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <b>🏋️ Diet:</b> {t.diet}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                    <div style={{ color: 'var(--gold)', fontWeight: 800 }}>
                      🏷️ Price: {t.price}
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#60a5fa' }}>
                      {t.special}
                    </div>
                  </div>

                  {/* WhatsApp Order Button */}
                  <button 
                    className="bp" 
                    style={{ 
                      marginTop: 4, 
                      padding: '8px 12px', 
                      fontSize: 12, 
                      background: 'rgba(34,197,94,0.1)', 
                      borderColor: 'var(--green)', 
                      color: 'var(--green)',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    onClick={() => {
                      const text = encodeURIComponent(`Hi, I'm interested in subscribing to your tiffin service: ${t.name}. I am stationed in the local Cantt area.`);
                      window.open(`https://wa.me/91${t.phone}?text=${text}`, '_blank');
                    }}
                  >
                    💬 Order via WhatsApp (Direct Contact)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
