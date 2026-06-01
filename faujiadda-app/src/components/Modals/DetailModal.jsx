import { useContext, useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { useAuth } from '../../hooks/useAuth';
import { ModalContext } from '../../App';
import { auth, db, collection, addDoc, doc, updateDoc, increment, onSnapshot, query, orderBy } from '../../firebase';
import styles from './DetailModal.module.css';
import { FOOD_BY_CITY, ARMY_SCHOOLS, MILITARY_HOSPITALS } from '../../data';
import { generateNeighborhoodInsight } from '../../aiInsights';

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
];

function getFallbackPhotos(seed) {
  const idx = Math.abs((seed || 0) % PHOTO_POOL.length);
  return Array.from({ length: 5 }, (_, i) => PHOTO_POOL[(idx + i) % PHOTO_POOL.length]);
}

function getBahColor(p) { return p <= 15000 ? '#22c55e' : p <= 30000 ? '#f4c542' : '#f43f5e'; }
function getBahText(p)  { return p <= 15000 ? '🟢 Within OR Limit' : p <= 30000 ? '🟡 Within JCO Limit' : '🔴 Officer BAH'; }

export default function DetailModal({ id, onClose }) {
  const listings = useFilterStore((s) => s.listings);
  const { user, isAdmin } = useAuth();
  const ctx = useContext(ModalContext);
  const [imgIdx, setImgIdx] = useState(0);
  const carRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');
  const [submittingRev, setSubmittingRev] = useState(false);

  const addSeen = useUserStore(s => s.addSeen);
  const addContacted = useUserStore(s => s.addContacted);
  const { rank } = useUserStore();
  const comparison = useUserStore(s => s.comparison) || [];
  const toggleComparison = useUserStore(s => s.toggleComparison);
  const isComparing = comparison.includes(id);

  useEffect(() => {
    setImgIdx(0);
    // Force scroll reset after a tiny delay to ensure layout is ready
    const timer = setTimeout(() => {
      if (carRef.current) carRef.current.scrollTo({ left: 0 });
    }, 50);

    if (id) {
      addSeen(id);
      // Subscribe to reviews
      const q = query(collection(db, 'rentals', id, 'reviews'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => {
        clearTimeout(timer);
        unsub();
      };
    }
  }, [id, addSeen]);

  const submitReview = async () => {
    if (!user) return ctx.showToast('Login to review', 'err');
    if (!revText.trim()) return ctx.showToast('Write a comment', 'err');
    setSubmittingRev(true);
    try {
      await addDoc(collection(db, 'rentals', id, 'reviews'), {
        uid: user.uid,
        userName: user.displayName || user.phoneNumber || 'Anonymous',
        rating: revRating,
        text: revText,
        createdAt: Date.now()
      });
      setRevText('');
      setRevRating(5);
      ctx.showToast('Review added! ⭐', 'ok');
    } catch (e) {
      ctx.showToast('Error: ' + e.message, 'err');
    }
    setSubmittingRev(false);
  };

  const r = listings.find(l => l.id === id);
  if (!r) return null;

  const images = r.mediaUrls?.length >= 1 ? r.mediaUrls : getFallbackPhotos(r.createdAt);
  const price = r.price || 0;
  const bahColor = getBahColor(price);
  const bahText  = getBahText(price);

  const daysAgo = r.createdAt ? Math.floor((Date.now() - r.createdAt) / 86400000) : null;
  const postedTxt = daysAgo === null ? 'Unknown' : daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : daysAgo < 7 ? `${daysAgo}d ago` : `${Math.ceil(daysAgo/7)}w ago`;

  // Similar listings
  const similar = listings.filter(l =>
    l.id !== id && l.city?.toLowerCase() === r.city?.toLowerCase() &&
    l.price >= price * 0.7 && l.price <= price * 1.3
  ).slice(0, 3);

  // BAH Arbitrage Logic
  const bahRates = { OR: 12000, JCO: 22000, Officer: 35000 };
  const userBah = bahRates[rank] || 15000;
  const arbRatio = price / userBah;
  const arbResult = arbRatio < 0.85 ? { label: '💎 Great Deal', color: '#22c55e', text: `This property is priced well below the average BAH for an ${rank}. Choosing this could net you significant monthly savings.` } :
                    arbRatio <= 1.1 ? { label: '⚖️ Fair Value', color: '#f4c542', text: `Price is in line with the standard BAH for your rank. This represents a safe, market-rate choice.` } :
                    { label: '✨ Premium', color: '#8a2be2', text: `This property exceeds the standard ${rank} BAH. It may offer superior amenities or location, but will require out-of-pocket spending.` };

  // Tactical Proximity Calculation
  const getNearest = (dict, lat, lng) => {
    let min = Infinity, nearest = null;
    Object.values(dict).flat().forEach(item => {
      const d = Math.sqrt(Math.pow(item.lat - lat, 2) + Math.pow(item.lng - lng, 2)) * 111; // rough km
      if (d < min) { min = d; nearest = { ...item, dist: d.toFixed(1) }; }
    });
    return nearest;
  };
  const nearestSchool = getNearest(ARMY_SCHOOLS, r.lat, r.lng);
  const nearestHosp = getNearest(MILITARY_HOSPITALS, r.lat, r.lng);

  const aiInsight = generateNeighborhoodInsight(r, { nearestSchool, nearestHosp });

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <Helmet>
        <title>{r.name} - Fauji Niwas</title>
        <meta property="og:title" content={`${r.name} in ${r.city}`} />
        <meta property="og:description" content={`📍 ${r.area}, ${r.city} • ₹${price.toLocaleString()}/month`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta property="og:url" content={`${window.location.origin}/app?listing=${r.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="mc">
        {/* Scrollable content */}
        <div className={styles.content} id="detail-content">
          {/* Carousel */}
          <div className={styles.carWrap}>
            <div className={styles.car} ref={carRef}
              onScroll={e => setImgIdx(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
              {images.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding={i === 0 ? 'sync' : 'async'}
                  crossOrigin="anonymous"
                  alt={`${r.name} photo ${i+1}`}
                  onError={e => { e.currentTarget.src = `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80`; }}
                />
              ))}
            </div>
            <div className={styles.carBadge}>{imgIdx+1}/{images.length} 📷</div>
            <div className={styles.dots}>
              {images.map((_, i) => (
                <div key={i} className={i === imgIdx ? `${styles.dot} ${styles.dotOn}` : styles.dot} />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {/* Action strip */}
            <div className={styles.actionStrip}>
              <button className={styles.shareBtn} onClick={async () => {
                const url = `${location.origin}/app?listing=${r.id}`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: r.name, url });
                  } catch (err) {
                    navigator.clipboard?.writeText(url);
                    ctx.showToast('Link copied!', 'ok');
                  }
                } else {
                  navigator.clipboard?.writeText(url);
                  ctx.showToast('Link copied!', 'ok');
                }
              }}>🔗 Share</button>
              <button className={styles.reportBtn} 
                style={isComparing ? { color: '#14b8a6', borderColor: '#14b8a6', background: 'rgba(20,184,166,0.1)' } : {}}
                onClick={() => { 
                  toggleComparison(r.id); 
                  if (!isComparing && comparison.length === 1) ctx.showToast('2 listings added. Compare now? 🔁', 'ok', 6000); 
                }}>
                {isComparing ? '🗸 Comparing' : '🔁 Compare'}
              </button>
              <button className={styles.reportBtn} onClick={() => { onClose(); ctx.openReport(r.id); }}>🚩 Report</button>
            </div>

            {/* Name + price */}
            <div className={styles.nameRow}>
              <div>
                <h2 className={styles.name}>{r.name}</h2>
                <div className={styles.loc}>📍 {r.area}, {r.city}</div>
              </div>
              <div className={styles.priceCol}>
                <div className={styles.price}>₹{price.toLocaleString()}</div>
                <div className={styles.perMonth}>/month</div>
              </div>
            </div>

            {/* Trust strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                {r.verified
                  ? <><span>✅</span><div><div className={styles.trustTitle} style={{color:'#22c55e'}}>Verified</div><div className={styles.trustSub}>ID-checked</div></div></>
                  : <><span>⏳</span><div><div className={styles.trustTitle} style={{color:'#f4c542'}}>Under Review</div><div className={styles.trustSub}>Pending {isAdmin && <button style={{background:'var(--accent)',color:'white',border:'none',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:10,marginLeft:4}} onClick={async(e)=>{e.stopPropagation();try{await updateDoc(doc(db,'rentals',r.id),{verified:true});ctx.showToast('Verified! ✅','ok');}catch(err){ctx.showToast('Error','err');}}}>Verify ✅</button>}</div></div></>
                }
              </div>
              <div className={styles.trustDiv} />
              <div className={styles.trustItem}>
                <div>
                  <div className={styles.trustTitle}>🕒 {postedTxt}</div>
                  <div className={styles.trustSub}>Listed</div>
                </div>
              </div>
              <div className={styles.trustDiv} />
              <div className={styles.trustItem}>
                <div>
                  <div className={styles.trustTitle} style={{color: r.ownerType==='defence' ? 'var(--gold)' : 'var(--text)'}}>
                    {r.ownerType==='defence'?'🎖️ Fauji Owner':r.ownerType==='civilian'?'👤 Civilian':'🏢 Broker'}
                  </div>
                  <div className={styles.trustSub}>{r.ownerType==='broker'?'Agent fees':'No broker fee'}</div>
                </div>
              </div>
            </div>

            {/* AI BAH Arbitrage Checker */}
            <div className={styles.arbCard}>
              <div className={styles.arbRow}>
                <div className={styles.arbLabel}>BAH Value Index ({rank})</div>
                <div className={styles.arbScore} style={{color: arbResult.color, background: arbResult.color + '15', border: '1px solid ' + arbResult.color + '30'}}>
                  {arbResult.label}
                </div>
              </div>
              {/* Animated BAH progress bar */}
              <div style={{margin:'10px 0 6px', background:'var(--border)', borderRadius:999, height:6, overflow:'hidden'}}>
                <div style={{
                  height:'100%', borderRadius:999,
                  width: `${Math.min(100, arbRatio * 100).toFixed(0)}%`,
                  background: arbResult.color,
                  transition: 'width 0.8s cubic-bezier(0.34,1.22,0.64,1)',
                  boxShadow: `0 0 8px ${arbResult.color}88`
                }} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--muted)', marginBottom:8}}>
                <span>₹0</span>
                <span style={{color: arbResult.color, fontWeight:700}}>{Math.min(100, Math.round(arbRatio * 100))}% of ₹{userBah.toLocaleString()} BAH</span>
                <span>100%+</span>
              </div>
              <p className={styles.arbSub}>{arbResult.text}</p>

              {/* Commute Proximity Row */}
              <div style={{marginTop:12, display:'flex', gap:8, overflowX:'auto', paddingBottom:2}}>
                {[
                  { icon:'🏪', label:'CSD',    dist: nearestSchool ? (nearestSchool.dist * 0.7).toFixed(1) : '—' },
                  { icon:'🏥', label:'MH',     dist: nearestHosp   ? nearestHosp.dist   : '—' },
                  { icon:'🏫', label:'KV',     dist: nearestSchool ? nearestSchool.dist  : '—' },
                  { icon:'📦', label:'APS',    dist: nearestSchool ? (nearestSchool.dist * 0.9).toFixed(1) : '—' },
                  { icon:'🛒', label:'Market', dist: nearestSchool ? (nearestSchool.dist * 0.4).toFixed(1) : '—' },
                ].map(({ icon, label, dist }) => (
                  <div key={label} style={{
                    flex:'0 0 auto', textAlign:'center',
                    background:'var(--bg)', border:'1px solid var(--border2)',
                    borderRadius:10, padding:'8px 12px', minWidth:60
                  }}>
                    <div style={{fontSize:18}}>{icon}</div>
                    <div style={{fontSize:11, fontWeight:700, marginTop:2}}>{label}</div>
                    <div style={{fontSize:10, color:'var(--muted)'}}>{dist} km</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight Card */}
            <div className={styles.aiCard}>
              <div className={styles.aiIcon}>🤖</div>
              <div className={styles.aiText}>
                <strong>AI Neighborhood Insight</strong>
                {generateNeighborhoodInsight(r)}
              </div>
            </div>

            {/* BHK / Pets info */}
            <div style={{display:'flex', gap:10, marginBottom:20}}>
              <div style={{flex:1, background:'var(--bg)', border:'1px solid var(--border2)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:18, marginBottom:4}}>🏠</div>
                <div style={{fontSize:14, fontWeight:700}}>{r.bhk || '1'} BHK</div>
                <div style={{fontSize:11, color:'var(--muted)'}}>Configuration</div>
              </div>
              <div style={{flex:1, background:'var(--bg)', border:'1px solid var(--border2)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:18, marginBottom:4}}>{r.petFriendly ? '🐶' : '🚫'}</div>
                <div style={{fontSize:14, fontWeight:700}}>{r.petFriendly ? 'Pet Friendly' : 'No Pets'}</div>
                <div style={{fontSize:11, color:'var(--muted)'}}>Policy</div>
              </div>
              {r.furnishing && (
                <div style={{flex:1, background:'var(--bg)', border:'1px solid var(--border2)', borderRadius:12, padding:12, textAlign:'center'}}>
                  <div style={{fontSize:18, marginBottom:4}}>🛌</div>
                  <div style={{fontSize:14, fontWeight:700}}>{r.furnishing}</div>
                  <div style={{fontSize:11, color:'var(--muted)'}}>Furnishing</div>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className={styles.specs}>
              {[
                ['Type', r.type?.toUpperCase()||'—'],
                ['Area', r.sqft ? r.sqft+' ft²' : '~900 ft²'],
                ['Floor', 'Floor '+(r.floor||'G')],
              ].map(([k,v]) => (
                <div key={k} className={styles.spec}><strong>{v}</strong>{k}</div>
              ))}
            </div>

            {/* BAH tag */}
            <div className={styles.tags}>
              <span className="tag" style={{fontSize:12,padding:'5px 12px',borderColor:bahColor,color:bahColor}}>{bahText}</span>
              {r.available && <span className="tag" style={{fontSize:12,padding:'5px 12px',color:'#60a5fa',borderColor:'#60a5fa'}}>📅 From {r.available}</span>}
            </div>

            {/* Buttons */}
            <button className={styles.wideBtn} style={{color:'var(--accent)',borderColor:'rgba(255,153,51,.3)',background:'rgba(255,153,51,.08)'}}
              onClick={() => ctx.openFood(r.city)}>
              🍽️ Nearby Mess & Hotels in {r.city}
            </button>
            <button className={styles.wideBtn} style={{color:'#14b8a6',borderColor:'rgba(20,184,166,.3)',background:'rgba(20,184,166,.07)'}}
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat||28.5961},${r.lng||77.1587}`, '_blank')}>
              📍 Commute Navigator
            </button>

            {/* Reviews Section */}
            <div style={{marginTop:30, borderTop:'1px solid var(--border2)', paddingTop:20}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16}}>
                <h3 style={{fontSize:18, fontWeight:700}}>User Reviews ({reviews.length})</h3>
                <div style={{fontSize:20, fontWeight:700, color:'var(--gold)'}}>⭐ {reviews.length > 0 ? (reviews.reduce((acc,rv)=>acc+rv.rating,0)/reviews.length).toFixed(1) : '—'}</div>
              </div>

              {/* Review Form */}
              {user ? (
                <div style={{background:'var(--bg)', border:'1px solid var(--border2)', borderRadius:12, padding:16, marginBottom:20}}>
                  <div style={{display:'flex', gap:8, marginBottom:10}}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={()=>setRevRating(s)} style={{fontSize:20, background:'none', border:'none', cursor:'pointer', opacity: revRating >= s ? 1 : 0.3}}>⭐</button>
                    ))}
                  </div>
                  <textarea 
                    className="fi" 
                    placeholder="Share your experience (e.g., area safety, owner behavior)..." 
                    value={revText} 
                    onChange={e => setRevText(e.target.value)}
                    style={{height:80, resize:'none'}}
                  />
                  <button className="bp" onClick={submitReview} disabled={submittingRev} style={{marginTop:8, width:'auto', padding:'10px 20px'}}>
                    {submittingRev ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              ) : (
                <div style={{background:'rgba(0,0,0,0.03)', borderRadius:10, padding:12, fontSize:13, color:'var(--muted)', textAlign:'center', marginBottom:20}}>
                  🔐 Login to share your feedback.
                </div>
              )}

              {/* Review List */}
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {reviews.map(rv => (
                  <div key={rv.id} style={{borderBottom:'1px solid var(--border2)', paddingBottom:12}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                      <div style={{fontSize:13, fontWeight:700}}>{rv.userName}</div>
                      <div style={{fontSize:12, color:'var(--gold)'}}>{'★'.repeat(rv.rating)}</div>
                    </div>
                    <div style={{fontSize:14, lineHeight:1.4, color:'var(--text2)'}}>{rv.text}</div>
                    <div style={{fontSize:11, color:'var(--muted)', marginTop:4}}>{new Date(rv.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {reviews.length === 0 && <p style={{fontSize:13, color:'var(--muted)', textAlign:'center'}}>No reviews yet. Be the first!</p>}
              </div>
            </div>

            {/* Similar listings */}
            {similar.length > 0 && (
              <div className={styles.similarWrap}>
                <p className={styles.similarTitle}>🔁 Similar in {r.city}</p>
                {similar.map(s => (
                  <div key={s.id} className={styles.similarCard}
                    onClick={() => { 
                      ctx.openDetail(s.id); 
                      document.getElementById('detail-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                    <img src={s.mediaUrls?.[0]||PHOTO_POOL[0]} loading="lazy" alt={s.name} />
                    <div>
                      <div className={styles.similarName}>{s.name}</div>
                      <div className={styles.similarLoc}>📍 {s.area}</div>
                      <div className={styles.similarPrice} style={{color:getBahColor(s.price)}}>₹{s.price.toLocaleString()}/mo</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className={styles.footer}>
          {!user ? (
            <button className="bp" onClick={() => { onClose(); ctx.openPost(); }}>
              🔐 Login to Reveal Contact
            </button>
          ) : (r.phone || r.whatsapp) ? (
            <div className={styles.contactGrid}>
              <a href={`tel:+91${r.phone || r.whatsapp}`} 
                 className={styles.callBtn}
                 onClick={() => addContacted(r.id)}>📞 Call Owner</a>
              <a href={`https://wa.me/91${r.phone || r.whatsapp}?text=${encodeURIComponent(`Hi, I saw your listing on Fauji Niwas — ${r.name}`)}`}
                target="_blank" rel="noreferrer" 
                className={styles.waBtn}
                onClick={() => addContacted(r.id)}>💬 WhatsApp</a>
            </div>
          ) : (
            <div className={styles.noContact}>📵 Contact not provided yet.</div>
          )}
        </div>

        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
