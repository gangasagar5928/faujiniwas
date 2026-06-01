import { useContext, useState, useRef, useEffect, useLayoutEffect, useMemo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { useAuth } from '../../hooks/useAuth';
import { ModalContext } from '../../App';
import { auth, db, collection, addDoc, doc, updateDoc, increment, onSnapshot, query, orderBy } from '../../firebase';
import styles from './DetailModal.module.css';
import { FOOD_BY_CITY, ARMY_SCHOOLS, MILITARY_HOSPITALS, CANTEENS } from '../../data';
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
function getBahText(p)  { return p <= 15000 ? '🟢 Within OR Limit' : p <= 30000 ? '🟡 Within JCO Limit' : '🔴 Officer HRA'; }

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
  const currentListing = listings.find((listing) => listing.id === id);
  const isMarketItem = currentListing?._collection === 'market' || currentListing?._collection === 'marketplace';
  const reviewRoot = isMarketItem ? 'marketplace' : 'rentals';

  useLayoutEffect(() => {
    setImgIdx(0);
    const content = document.getElementById('detail-content');
    if (content) content.scrollTop = 0;
    if (carRef.current) carRef.current.scrollLeft = 0;
  }, [id]);

  useEffect(() => {
    if (id) {
      addSeen(id);
      // Subscribe to reviews
      const q = query(collection(db, reviewRoot, id, 'reviews'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [id, addSeen, reviewRoot]);

  const submitReview = async () => {
    if (!user) return ctx.showToast('Login to review', 'err');
    if (!revText.trim()) return ctx.showToast('Write a comment', 'err');
    setSubmittingRev(true);
    try {
      await addDoc(collection(db, reviewRoot, id, 'reviews'), {
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

  const r = currentListing;
  if (!r) return null;
  const displayName = r.name || r.title || 'Untitled Listing';

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

  // HRA Arbitrage Logic
  const bahRates = { OR: 12000, JCO: 22000, Officer: 35000 };
  const userBah = bahRates[rank] || 15000;
  const arbRatio = price / userBah;
  const arbResult = arbRatio < 0.85 ? { label: '💎 Great Deal', color: '#22c55e', text: `This property is priced well below the average HRA for an ${rank}. Choosing this could net you significant monthly savings.` } :
                    arbRatio <= 1.1 ? { label: '⚖️ Fair Value', color: '#f4c542', text: `Price is in line with the standard HRA for your rank. This represents a safe, market-rate choice.` } :
                    { label: '✨ Premium', color: '#8a2be2', text: `This property exceeds the standard ${rank} HRA. It may offer superior amenities or location, but will require out-of-pocket spending.` };

  const cityListings = listings.filter(l => l.city === r.city && l.price > 0 && l._collection === r._collection);
  const cityAvg = cityListings.length ? cityListings.reduce((sum, l) => sum + l.price, 0) / cityListings.length : 0;
  const isPriceOutlier = cityAvg && cityListings.length >= 3 && (price > cityAvg * 1.45 || price < cityAvg * 0.55);

  // Trust Graph 2.0 Reputation Score Calculation
  const hasVerifiedBadge = !!r.verified;
  const isDefenceOwner = r.ownerType === 'defence';
  const hasHighRating = (r.rating || 5) >= 4.5;
  const repScore = (hasVerifiedBadge ? 30 : 10) + (isDefenceOwner ? 30 : 15) + (hasHighRating ? 40 : 20);
  const isCommandRecommended = repScore >= 90;

  // Tactical Proximity Calculation — Memoized
  const proximity = useMemo(() => {
    const getNearest = (dict, lat, lng) => {
      let min = Infinity, nearest = null;
      Object.values(dict).flat().forEach(item => {
        const d = Math.sqrt(Math.pow(item.lat - lat, 2) + Math.pow(item.lng - lng, 2)) * 111; // rough km
        if (d < min) { min = d; nearest = { ...item, dist: d.toFixed(1) }; }
      });
      return nearest;
    };
    return {
      school: getNearest(ARMY_SCHOOLS, r.lat, r.lng),
      hosp: getNearest(MILITARY_HOSPITALS, r.lat, r.lng),
      canteen: getNearest(CANTEENS, r.lat, r.lng)
    };
  }, [r.lat, r.lng]);

  const nearestSchool = proximity.school;
  const nearestHosp = proximity.hosp;
  const nearestCanteen = proximity.canteen;

  const aiInsight = generateNeighborhoodInsight(r, { nearestSchool, nearestHosp, nearestCanteen });

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <Helmet>
        <title>{displayName} - Fauji Niwas</title>
        <meta property="og:title" content={`${displayName} in ${r.city}`} />
        <meta property="og:description" content={`📍 ${r.area}, ${r.city} • ₹${price.toLocaleString()}${isMarketItem ? '' : '/month'}`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta property="og:url" content={`${window.location.origin}/app?listing=${r.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": isMarketItem ? "Product" : "RealEstateListing",
            "name": displayName,
            "description": `📍 ${r.area}, ${r.city} • ₹${price.toLocaleString()}${isMarketItem ? '' : '/month'}`,
            "image": images[0] || "https://faujiniwas.web.app/og-image.jpg",
            "url": `${window.location.origin}/app?listing=${r.id}`,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": price
            }
          })}
        </script>
      </Helmet>
      <div className="mc glass-tactical" style={{ display: 'flex', flexDirection: 'column', height: '88vh' }}>
        {/* Scrollable content */}
        <div className={styles.content} id="detail-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
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
                    await navigator.share({ title: displayName, url });
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
              <button className={styles.reportBtn} onClick={() => ctx.openChat({ listingId: r.id, recipientId: r.uid, name: displayName })}>💬 Chat</button>
              <button className={styles.reportBtn} onClick={() => { onClose(); ctx.openReport(r.id); }}>🚩 Report</button>
            </div>

            {/* Name + price */}
            <div className={styles.nameRow}>
              <div>
                <h2 className={styles.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {displayName}
                  {isCommandRecommended && (
                    <span className="badge-verified-pulse" style={{
                      background: 'linear-gradient(135deg, var(--gold), #ff9933)',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
                      border: '1px solid var(--gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      🎖️ Command Recommended
                    </span>
                  )}
                </h2>
                <div className={styles.loc}>📍 {r.area}, {r.city}</div>
              </div>
              <div className={styles.priceCol}>
                <div className={styles.price}>₹{price.toLocaleString()}</div>
                <div className={styles.perMonth}>{isMarketItem ? 'one-time' : '/month'}</div>
              </div>
            </div>

            {/* Trust strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                {r.verified
                  ? <><span>✅</span><div><div className={`${styles.trustTitle} badge-verified-pulse`} style={{color:'#22c55e', padding: '2px 6px', borderRadius: 4}}>Verified</div><div className={styles.trustSub}>ID-checked</div></div></>
                  : <><span>⏳</span><div><div className={styles.trustTitle} style={{color:'#f4c542'}}>Under Review</div><div className={styles.trustSub}>Pending {isAdmin && <button style={{background:'var(--accent)',color:'white',border:'none',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:10,marginLeft:4}} onClick={async(e)=>{e.stopPropagation();try{await updateDoc(doc(db,reviewRoot,r.id),{verified:true});ctx.showToast('Verified! ✅','ok');}catch(err){ctx.showToast('Error','err');}}}>Verify ✅</button>}</div></div></>
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

            {r.verified && (
              <div className="glass-tactical" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                background: 'rgba(34, 197, 94, 0.04)',
                marginBottom: '14px',
                fontFamily: 'monospace',
                fontSize: '11px',
              }}>
                <span style={{ fontSize: '14px' }}>🛡️</span>
                <div>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Verified Title & Rent Escrow:</span>{' '}
                  <span style={{ color: 'var(--text)' }}>Land ownership checked & security deposit protected.</span>
                </div>
              </div>
            )}

            {isPriceOutlier && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.06)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--red)' }}>AI Security Alert: Price Outlier</div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', lineHeight: '1.4' }}>
                    This listing's price deviates significantly (over 45%) from the average rent of ₹{Math.round(cityAvg).toLocaleString()}/mo in {r.city}. Exercise extra vigilance and verify military credentials before making deposits.
                  </p>
                </div>
              </div>
            )}

            {/* AI HRA Value Checker */}
            <div className={`${styles.arbCard} bg-mesh`}>
              <div className={styles.arbRow}>
                <div className={styles.arbLabel}>HRA Value Index ({rank})</div>
                <div className={styles.arbScore} style={{color: arbResult.color, background: arbResult.color + '15', border: '1px solid ' + arbResult.color + '30'}}>
                  {arbResult.label}
                </div>
              </div>
              {/* Animated HRA progress bar */}
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
                <span style={{color: arbResult.color, fontWeight:700}}>{Math.min(100, Math.round(arbRatio * 100))}% of ₹{userBah.toLocaleString()} HRA</span>
                <span>100%+</span>
              </div>
              <p className={styles.arbSub}>{arbResult.text}</p>

              {/* Live Housing Intel — Commute Proximity */}
              <div className="glass-tactical" style={{marginTop:14, paddingTop:12, padding: 12, borderRadius: 12}}>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', marginBottom:12, display:'flex', alignItems:'center', gap:6}}>
                  <span className="live-dot" />
                  Cantonment Commute Proximity
                </div>
                <div style={{display:'flex', gap:10, overflowX:'auto', paddingBottom:6, WebkitOverflowScrolling:'touch', scrollbarWidth:'none'}}>
                  {[
                    { icon:'🏪', label:'URC/CSD', dist: nearestCanteen ? nearestCanteen.dist : '—', name: nearestCanteen?.name },
                    { icon:'🏥', label:'MH/Hosp', dist: nearestHosp ? nearestHosp.dist : '—', name: nearestHosp?.name },
                    { icon:'🏫', label:'APS/KV', dist: nearestSchool ? nearestSchool.dist : '—', name: nearestSchool?.name },
                  ].map(({ icon, label, dist, name }) => (
                    <div key={label} className="hover-scan" style={{
                      flex:'0 0 auto', textAlign:'left',
                      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                      borderRadius:10, padding:'10px 14px', minWidth:110
                    }}>
                      <div style={{fontSize:22}}>{icon}</div>
                      <div style={{fontSize:11, fontWeight:700, marginTop:4, color: 'var(--text)'}}>{label}</div>
                      <div style={{fontSize:12, color:'var(--accent)', fontWeight: 800, marginTop:2}}>{dist} km</div>
                      <div style={{fontSize:9, color:'var(--muted)', marginTop:2, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={name}>{name || 'Searching...'}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop: 12, padding: '8px 12px', background: 'rgba(255,153,51,0.05)', borderRadius: 8, fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{fontSize:14}}>📍</span> 
                  <span>Fastest route: {nearestCanteen ? Math.round(nearestCanteen.dist * 3) : '—'} mins by vehicle to nearest installation.</span>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className={styles.aiCard}>
              <div className={styles.aiIcon}>🤖</div>
              <div className={styles.aiText}>
                <strong>AI Neighborhood Insight</strong>
                {aiInsight}
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
              <button className={styles.chatPrimary} onClick={() => ctx.openChat({ listingId: r.id, recipientId: r.uid, name: r.name })}>
                💬 Message Owner
              </button>
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
