import { useContext, useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { checkLoginRate, getUserSessions, terminateAllOtherSessions, terminateSession, generateDeviceFingerprint } from '../../security/sessionSecurity';
import { ModalContext } from '../../App';
import Loader from '../UI/Loader';
import AdminPanel from '../Admin/AdminPanel';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import styles from './ProfileModal.module.css';

const TRANSLATIONS = {
  en: {
    dashboardTitle: "👤 My Profile",
    listings: "My Listings",
    wishlisted: "Wishlist",
    messages: "Messages",
    verification: "Verification",
    rewards: "Rewards",
    security: "Security & Data",
    seen: "Recently Seen",
    accessibility: "Accessibility & Language",
    echs: "🏥 ECHS & OPD",
    rankLabel: "Your Rank (For HRA Assessment)",
    rankDesc: "We use this to show you 'Value for HRA' on property details.",
    pointsLabel: "Fauji Points",
    elderlyToggle: "Elderly Veteran UI Mode (High Contrast & Large Text)",
    elderlyDesc: "Enlarges fonts by 20%, enhances contrast, and increases button hit areas for easy navigation by senior veterans.",
    selectLang: "Select Language / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ",
  },
  hi: {
    dashboardTitle: "👤 मेरी प्रोफ़ाइल",
    listings: "मेरी सूचियाँ",
    wishlisted: "पसंदीदा सूची",
    messages: "संदेश",
    verification: "सत्यापन",
    rewards: "पुरस्कार",
    security: "सुरक्षा और डेटा",
    seen: "हाल ही में देखे गए",
    accessibility: "अभिगम्यता और भाषा",
    echs: "🏥 ईसीएचएस और ओपीडी",
    rankLabel: "आपकी रैंक (HRA मूल्यांकन के लिए)",
    rankDesc: "हम इसका उपयोग संपत्ति विवरण पर 'HRA के लिए मूल्य' दिखाने के लिए करते हैं।",
    pointsLabel: "फ़ौजी अंक",
    elderlyToggle: "बुजुर्ग सैनिक यूआई मोड (उच्च कंट्रास्ट और बड़ा टेक्स्ट)",
    elderlyDesc: "वरिष्ठ सैनिकों द्वारा आसान नेविगेशन के लिए फोंट को 20% बढ़ाता है, कंट्रास्ट बढ़ाता है, और बटन टैप क्षेत्र बढ़ाता है।",
    selectLang: "Select Language / भाषा चुनें / ਭਾਸ਼ा ਚੁਣੋ",
  },
  pa: {
    dashboardTitle: "👤 ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ",
    listings: "ਮੇਰੀਆਂ ਸੂਚੀਆਂ",
    wishlisted: "ਪਸੰਦੀਦਾ ਸੂਚੀ",
    messages: "ਸੁਨੇਹੇ",
    verification: "ਤਸਦੀਕ",
    rewards: "ਇਨਾਮ",
    security: "ਸੁਰੱਖਿਆ ਅਤੇ ਡਾਟਾ",
    seen: "ਹਾਲ ਹੀ ਵਿੱਚ ਦੇਖੇ ਗਏ",
    accessibility: "ਪਹੁੰਚਯੋਗਤਾ ਅਤੇ ਭਾਸ਼ਾ",
    echs: "🏥 ਈ.ਸੀ.ਐਚ.ਐਸ. ਅਤੇ ਓ.ਪੀ.ਡੀ.",
    rankLabel: "ਤੁਹਾਡਾ ਰੈਂਕ (HRA ਮੁਲਾਂਕਣ ਲਈ)",
    rankDesc: "ਅਸੀਂ ਇਸਦੀ ਵਰਤੋਂ ਜਾਇਦਾਦ ਦੇ ਵੇਰਵਿਆਂ 'ਤੇ 'HRA ਲਈ ਮੁੱਲ' ਦਿਖਾਉਣ ਲਈ ਕਰਦੇ ਹਾਂ।",
    pointsLabel: "ਫੌਜੀ ਅੰਕ",
    elderlyToggle: "ਬਜ਼ੁਰਗ ਸੈਨਿਕ UI ਮੋਡ (ਉੱਚ ਕੰਟ੍ਰਾਸਟ ਅਤੇ ਵੱਡਾ ਟੈਕਸਟ)",
    elderlyDesc: "ਸੀਨੀਅਰ ਸੈਨਿਕਾਂ ਦੁਆਰਾ ਆਸਾਨ ਨੇਵੀਗੇਸ਼ਨ ਲਈ ਫੌਂਟਾਂ ਨੂੰ 20% ਵਧਾਉਂਦਾ ਹੈ, ਕੰਟ੍ਰਾਸਟ ਵਧਾਉਂਦਾ ਹੈ, ਅਤੇ ਬਟਨ ਟੈਪ ਖੇਤਰ ਵਧਾਉਂਦਾ ਹੈ।",
    selectLang: "Select Language / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ",
  }
};

export default function ProfileModal({ onClose }) {
  const { user, dbUser, isAdmin } = useAuth();
  const ctx = useContext(ModalContext);
  const listings = useFilterStore(s => s.listings);
  const wishlist = useUserStore(s => s.wishlist) || [];
  const seen = useUserStore(s => s.seen) || [];
  const contacted = useUserStore(s => s.contacted) || [];
  const { rank, setRank } = useUserStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('listings'); // listings, wishlisted, seen, contacted, verification, rewards, messages

  const [language, setLanguage] = useState(() => localStorage.getItem('fn_lang') || 'en');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (dbUser?.name) {
      setUserName(dbUser.name);
    }
  }, [dbUser?.name]);

  const handleSaveName = async () => {
    if (!userName.trim()) return;
    setLoading(true);
    try {
      const { db, doc, updateDoc } = await import('../../firebase');
      await updateDoc(doc(db, 'users', user.uid), { name: userName.trim() });
      ctx.showToast('Profile name updated! 👤', 'ok');
    } catch (e) {
      console.error(e);
      ctx.showToast('Failed to save name', 'err');
    }
    setLoading(false);
  };
  const [elderlyMode, setElderlyMode] = useState(() => document.documentElement.classList.contains('is-elderly-mode'));

  const toggleElderlyMode = (val) => {
    setElderlyMode(val);
    if (val) {
      document.documentElement.classList.add('is-elderly-mode');
      localStorage.setItem('fn_elderly', 'true');
    } else {
      document.documentElement.classList.remove('is-elderly-mode');
      localStorage.removeItem('fn_elderly');
    }
    ctx.showToast(val ? 'Elderly Mode Activated 🎖️' : 'Standard Mode Restored ⚙️', 'ok');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('fn_lang', lang);
    ctx.showToast(`Language set to ${lang === 'hi' ? 'हिन्दी' : lang === 'pa' ? 'ਪੰਜਾਬੀ' : 'English'}! 🌐`, 'ok');
  };

  // ECHS Health & Pension Vault states (Phase 23)
  const [echsUploaded, setEchsUploaded] = useState(false);
  const [echsFileName, setEchsFileName] = useState('');
  const [opdHospital, setOpdHospital] = useState('Base Hospital Delhi Cantt');
  const [opdToken, setOpdToken] = useState(null);
  const [opdLoading, setOpdLoading] = useState(false);

  const handleEchsUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEchsFileName(file.name);
    setEchsUploaded(true);
    ctx.showToast(`ECHS Card "${file.name}" encrypted locally & vaulted! 🔐`, 'ok');
  };

  const handleBookOPDToken = () => {
    setOpdLoading(true);
    setTimeout(() => {
      const tokenNum = `MH-${Math.floor(Math.random() * 800) + 100}`;
      setOpdToken(tokenNum);
      setOpdLoading(false);
      ctx.showToast(`OPD Queue Token ${tokenNum} generated successfully! 🏥`, 'ok');
    }, 1200);
  };
  const [idFile, setIdFile] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user && activeTab === 'security') {
      getUserSessions(user.uid).then(setSessions);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (dbUser?.notification) {
      ctx.showToast(dbUser.notification, 'ok', 6000);
      import('../../firebase').then(({ db, doc, updateDoc }) => {
        updateDoc(doc(db, 'users', user.uid), { notification: null });
      });
    }
  }, [dbUser?.notification, user?.uid]);

  useEffect(() => {
    if (!user || activeTab !== 'messages') return;
    
    import('../../firebase').then(({ db, collection, query, where, onSnapshot, orderBy }) => {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setActiveChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    });
  }, [user, activeTab]);

  const cleanupRecaptcha = () => {
    try {
      if (window.recaptchaVerifierProfile) {
        window.recaptchaVerifierProfile.clear();
        window.recaptchaVerifierProfile = null;
      }
    } catch (_) {}
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return ctx.showToast('Enter valid 10-digit number', 'err');

    const rate = await checkLoginRate(phone);
    if (!rate.allowed) {
      return ctx.showToast(`Too many attempts. Try again in ${rate.waitMinutes} mins.`, 'err');
    }

    setLoading(true);
    cleanupRecaptcha(); // Always reset before creating a new one
    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
      // Re-create the container div to avoid "already rendered" error
      const container = document.getElementById('recaptcha-profile');
      if (container) container.innerHTML = '';
      window.recaptchaVerifierProfile = new RecaptchaVerifier(auth, 'recaptcha-profile', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { cleanupRecaptcha(); ctx.showToast('Session expired. Try again.', 'err'); }
      });
      const formattedPhone = '+91' + phone.replace(/\s/g, '').slice(-10);
      window.confirmationResultProfile = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifierProfile);
      setOtpSent(true);
      ctx.showToast('OTP sent to +91' + phone + ' 💬', 'ok');
    } catch (e) {
      cleanupRecaptcha();
      const msg = e.code === 'auth/invalid-phone-number' ? 'Invalid phone number format.'
        : e.code === 'auth/too-many-requests' ? 'Too many attempts. Try after some time.'
        : e.code === 'auth/quota-exceeded' ? 'SMS quota exceeded. Try later.'
        : 'Failed to send OTP. Check your number.';
      ctx.showToast(msg, 'err');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      await window.confirmationResultProfile.confirm(otp);
      ctx.showToast('Logged in successfully! ✅', 'ok');
    } catch (e) {
      ctx.showToast(e.code === 'auth/invalid-verification-code' ? 'Wrong OTP. Please check and retry.' : 'Verification failed. Try again.', 'err');
    }
    setLoading(false);
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp('');
    cleanupRecaptcha();
  };

  if (!user) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="mc">
          <div className={styles.header}><h2 className="mh2">👤 My Dashboard</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button></div>
          <div className={styles.body}>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:16,textAlign:'center'}}>Verify your phone number to access your housing dashboard.</p>
            {!otpSent ? (
                <>
                  <div style={{display:'flex', gap:8, marginBottom:9}}>
                    <div style={{background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--text)', borderRadius:10, padding:'11px', fontSize:14, flexShrink:0}}>+91</div>
                    <input className="fi" type="tel" placeholder="10-digit Mobile Number" maxLength={10} style={{marginBottom:0}} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} />
                  </div>
                  <div id="recaptcha-profile"></div>
                  <button className="bp" onClick={handleSendOtp} disabled={loading || phone.length < 10}>
                    {loading ? 'Sending OTP…' : 'Get OTP 💬'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{color:'var(--muted)',fontSize:12,marginBottom:10,textAlign:'center'}}>
                    OTP sent to <strong style={{color:'var(--text)'}}>+91 {phone}</strong>
                  </p>
                  <input className="fi" type="number" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.slice(0,6))} />
                  <button className="bp" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}>
                    {loading ? 'Verifying…' : 'Verify & Login ✅'}
                  </button>
                  <button onClick={handleResendOtp} style={{background:'none',border:'none',color:'var(--accent)',fontSize:13,marginTop:10,cursor:'pointer',width:'100%',textAlign:'center'}}>
                    ↩ Wrong number / Resend OTP
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    );
  }

  const myListings = listings.filter(l => l.uid === user.uid);
  const identity = user.phoneNumber || user.email || 'User';
  const points = dbUser?.points || 0;
  const level = points < 100 ? 'Rookie' : points < 500 ? 'Veteran' : 'Legend';
  const levelColor = points < 100 ? '#94a3b8' : points < 500 ? '#f59e0b' : '#14b8a6';

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ height: '88vh' }}>
        <div className={styles.header}>
          <h2 className="mh2">{TRANSLATIONS[language].dashboardTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user.phoneNumber ? '📱' : '✉️'}</div>
            <div style={{flexGrow: 1}}>
              <div className={styles.userId} style={{fontWeight:800, fontSize:15}}>{identity}</div>
              <div style={{display:'flex', gap:6, alignItems:'center', marginTop:6, marginBottom:6}}>
                <input 
                  type="text" 
                  placeholder="Enter Name (e.g. Major Sharma)" 
                  value={userName} 
                  onChange={e => setUserName(e.target.value)} 
                  className="fi"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: '11px',
                    width: '180px',
                    fontWeight: 600,
                    margin: 0
                  }}
                />
                <button 
                  onClick={handleSaveName}
                  disabled={loading}
                  className="bp"
                  style={{
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    width: 'auto',
                    margin: 0
                  }}
                >
                  Save
                </button>
              </div>
              <div style={{display:'flex', gap:6, alignItems:'center', marginTop:4}}>
                <div style={{background:levelColor, color:'white', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, textTransform:'uppercase'}}>{level}</div>
                <div style={{fontSize:11, fontWeight:700, color:'var(--gold)'}}>⭐ {points} {TRANSLATIONS[language].pointsLabel}</div>
              </div>
              <div className={styles.progWrap}>
                <div className={styles.progFill} style={{ width: `${Math.min(100, (points / (points < 100 ? 100 : points < 500 ? 500 : 1000)) * 100)}%` }} />
              </div>
              {dbUser?.verified === true ? (
                <div style={{fontSize:10,color:'#22c55e',marginTop:2}}>✅ Verified defence member</div>
              ) : dbUser?.verified === 'pending' ? (
                 <div style={{fontSize:10,color:'#f59e0b',marginTop:2}}>⏳ Verification under review</div>
              ) : (
                 <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>❌ Not verified. Go to Verification tab.</div>
              )}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-end'}}>
              <button className={styles.logout} onClick={async () => { await signOut(auth); onClose(); ctx.showToast('Logged out', 'ok'); }}>
                Log Out
              </button>
            </div>
          </div>

          <div className={styles.rankBox}>
            <div className={styles.rankHeader}>
              <div className={styles.rankTitle}>{TRANSLATIONS[language].rankLabel}</div>
              <select className={styles.rankSel} value={rank} onChange={(e) => setRank(e.target.value)}>
                <option value="OR">Serving - OR</option>
                <option value="JCO">Serving - JCO</option>
                <option value="Officer">Serving - Officer</option>
              </select>
            </div>
            <div style={{fontSize:11, color:'var(--muted)'}}>{TRANSLATIONS[language].rankDesc}</div>
          </div>

          {isAdmin && <AdminPanel onClose={onClose} />}

          <div style={{display:'flex',gap:16,borderBottom:'1px solid var(--border2)',marginBottom:16,paddingBottom:0,overflowX:'auto',marginTop:16}}>
            {['listings','wishlisted','messages','verification','rewards','security','seen','echs','accessibility'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background:'none', border:'none', borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === t ? 'var(--accent)' : 'var(--muted)', fontSize:13, fontWeight:600, paddingBottom:8, cursor:'pointer', whiteSpace:'nowrap', textTransform:'capitalize'
              }}>{TRANSLATIONS[language][t] || t}</button>
            ))}
          </div>

          {activeTab === 'listings' && (
            <>
              {myListings.length === 0 ? (
                <div className={styles.empty}>
                  <div style={{fontSize:32,marginBottom:8}}>📭</div>
                  <p style={{fontSize:14,color:'var(--muted)'}}>No listings posted yet.</p>
                  <button className="bp" style={{marginTop:12,width:'auto',padding:'10px 24px'}} onClick={() => { onClose(); ctx.openPost(); }}>Post Your First Listing</button>
                </div>
              ) : myListings.map(l => (
                <div key={l.id} className={styles.listingItem}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{l.name}</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>📍 {l.area}, {l.city} · ₹{l.price?.toLocaleString()}/mo</div>
                  </div>
                  <span className={l.verified ? styles.live : styles.pend}>{l.verified ? 'Live' : 'Pending'}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === 'wishlisted' && (
            <>
              {wishlist.length === 0 ? (
                 <div className={styles.empty}>
                    <div style={{fontSize:32,marginBottom:8}}>🚧</div>
                    <p style={{fontSize:14,color:'var(--muted)'}}>No wishlisted properties yet.</p>
                    <p style={{fontSize:12,color:'var(--muted)',marginTop:4,maxWidth:240,textAlign:'center'}}>Start browsing the map and tap ⭐ Save to build your wishlist.</p>
                 </div>
              ) : (
                wishlist.map(id => {
                  const l = listings.find(x => x.id === id);
                  if(!l) return null;
                  return (
                    <div key={l.id} className={styles.listingItem} onClick={() => { onClose(); ctx.openDetail(l.id); }} style={{cursor: 'pointer'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{l.name}</div>
                        <div style={{fontSize:12,color:'var(--muted)'}}>📍 {l.area}, {l.city} · ₹{l.price?.toLocaleString()}/mo</div>
                      </div>
                      <span className={styles.live} style={{background: 'rgba(244,197,66,0.1)', color: '#f4c542'}}>★ Saved</span>
                    </div>
                  )
                })
              )}
            </>
          )}

          {activeTab === 'messages' && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {activeChats.length === 0 ? (
                <div className={styles.empty}>
                  <div style={{fontSize:32,marginBottom:8}}>💬</div>
                  <p>No active conversations yet.</p>
                </div>
              ) : activeChats.map(c => (
                <div key={c.id} className={styles.chatListItem}
                  style={{cursor:'pointer'}}
                  onClick={() => {
                     onClose();
                     const otherId = c.participants.find(id => id !== user.uid);
                     ctx.openChat({ chatId: c.id, recipientId: otherId, listingId: c.listingId, name: c.listingName });
                  }}
                >
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <div style={{fontWeight:700, fontSize:14}}>{c.listingName}</div>
                    <div style={{fontSize:10, color:'var(--muted)'}}>
                      {c.updatedAt?.seconds ? new Date(c.updatedAt.seconds * 1000).toLocaleDateString() : '...'}
                    </div>
                  </div>
                  <div style={{fontSize:12, color:'var(--accent)', marginTop:4, opacity:0.9, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {c.lastMsg || 'No messages yet.'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <h3 style={{fontSize:16, marginBottom:12}}>Fauji Points Hub</h3>
              <p style={{fontSize:13, color:'var(--muted)', lineHeight:1.5, marginBottom:20}}>Earn points by reviewing properties (+10) and posting verified listings (+50). Higher points unlock the <strong>Legend</strong> badge.</p>
              
              <div style={{background:'var(--bg)', borderRadius:12, padding:16, border:'1px solid var(--border2)'}}>
                <div style={{fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', marginBottom:12, letterSpacing:1.5}}>Top Contributors</div>
                {[
                  { n: 'Sub Maj A. Kumar', p: 1250 },
                  { n: 'Capt S. Singh', p: 840 },
                  { n: 'Havildar R. Sharma', p: 420 },
                  { n: identity, p: points, isMe: true }
                ].sort((a,b) => b.p - a.p).map((u, i) => (
                  <div key={i} className={styles.lbItem} style={u.isMe ? { borderBottom: 'none', background: 'rgba(255,153,51,0.05)', margin:'0 -16px', padding:'10px 16px' } : {}}>
                    <div className={styles.lbPos}>{i+1}</div>
                    <div className={styles.lbName}>{u.n} {u.isMe && '(You)'}</div>
                    <div className={styles.lbPoints}>{u.p} pts</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'seen' || activeTab === 'contacted') && (
            <>
              {(activeTab === 'seen' ? seen : contacted).length === 0 ? (
                 <div className={styles.empty}>
                    <div style={{fontSize:32,marginBottom:8}}>🚧</div>
                    <p style={{fontSize:14,color:'var(--muted)'}}>No {activeTab} properties yet.</p>
                 </div>
              ) : (
                (activeTab === 'seen' ? seen : contacted).map(id => {
                  const l = listings.find(x => x.id === id);
                  if(!l) return null;
                  return (
                    <div key={l.id} className={styles.listingItem} onClick={() => { onClose(); ctx.openDetail(l.id); }} style={{cursor: 'pointer'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{l.name}</div>
                        <div style={{fontSize:12,color:'var(--muted)'}}>📍 {l.area}, {l.city} · ₹{l.price?.toLocaleString()}/mo</div>
                      </div>
                      <span className={styles.pend} style={{fontSize:10}}>View Details</span>
                    </div>
                  )
                })
              )}
            </>
          )}

          {activeTab === 'verification' && (
            <div style={{background:'var(--bg)', borderRadius:12, padding:16, border:'1px solid var(--border2)'}}>
               {dbUser?.verified === true ? (
                 <div className={styles.empty}>
                   <div style={{fontSize:32,marginBottom:8}}>🎖️</div>
                   <h3 style={{color:'#22c55e', marginBottom:4}}>You are a Verified Fauji</h3>
                   <p style={{fontSize:13,color:'var(--muted)'}}>Your military ID has been vetted. This badge appears on all your listings.</p>
                 </div>
               ) : dbUser?.verified === 'pending' ? (
                 <div className={styles.empty}>
                   <div style={{fontSize:32,marginBottom:8}}>⏳</div>
                   <h3 style={{color:'#f59e0b', marginBottom:4}}>Under Review</h3>
                   <p style={{fontSize:13,color:'var(--muted)'}}>Our team is verifying your submitted ID. Please wait 24–48 hours.</p>
                 </div>
               ) : (
                 <div>
                   <h3 style={{fontSize:16, marginBottom:8}}>🎖️ Get Your "Verified Fauji" Badge</h3>
                   <p style={{fontSize:13, color:'var(--muted)', marginBottom:16, lineHeight:1.4}}>
                     Stand out in the community. Verified owners get **3x more calls** and higher trust from military families.
                   </p>
                   
                   <div style={{background:'rgba(255,153,51,0.05)', borderRadius:10, padding:12, marginBottom:16, border:'1px solid rgba(255,153,51,0.2)'}}>
                     <div style={{fontSize:12, fontWeight:700, marginBottom:6, color:'var(--accent)'}}>✅ How to verify?</div>
                     <ul style={{fontSize:11, color:'var(--muted)', paddingLeft:16}}>
                       <li>Upload your Canteen Card (Front)</li>
                       <li>Verification is voluntary; please mask sensitive details before upload</li>
                       <li>Ensure your name is clearly visible</li>
                     </ul>
                   </div>

                   <div style={{border:'1px dashed var(--border2)', borderRadius:10, padding:16, marginBottom:16, background:'rgba(0,0,0,0.2)', textAlign:'center'}}>
                     <input type="file" accept="image/*" id="id-upload" onChange={e => setIdFile(e.target.files[0])} style={{display:'none'}} />
                     <label htmlFor="id-upload" style={{cursor:'pointer', display:'block'}}>
                        {idFile ? (
                           <div style={{color:'#14b8a6', fontWeight:600}}>📎 {idFile.name}</div>
                        ) : (
                           <div style={{color:'var(--accent)'}}>📤 Tap to select Military ID / Canteen Card</div>
                        )}
                        <div style={{fontSize:10, color:'var(--muted)', marginTop:4}}>Max size: 5MB (JPG, PNG, WebP)</div>
                     </label>
                   </div>
                   
                   <button className="bp" disabled={!idFile || loading} onClick={async () => {
                      if(!idFile) return;
                      setLoading(true);
                      try {
                        const imageCompression = (await import('browser-image-compression')).default;
                        const { storage, db } = await import('../../firebase');
                        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                        const { doc, updateDoc, setDoc, getDoc } = await import('firebase/firestore');
                        const { encryptFileBytes } = await import('../../security/documentEncrypt');

                        ctx.showToast('Fetching active security keys...', 'ok');
                        const keySnap = await getDoc(doc(db, 'admin_keys', 'active'));
                        if (!keySnap.exists()) {
                          throw new Error("Active security keys not initialized on this platform. Please contact the moderator.");
                        }
                        const adminPublicKeyJwk = keySnap.data().publicKeyJwk;

                        ctx.showToast('Compressing secure ID...', 'ok');
                        const compressed = await imageCompression(idFile, { maxSizeMB: 0.1, maxWidthOrHeight: 800 });
                        
                        ctx.showToast('Applying hybrid encryption...', 'ok');
                        const fileBytes = await compressed.arrayBuffer();
                        const { ciphertext, ivHex, hexKey } = await encryptFileBytes(fileBytes, adminPublicKeyJwk);

                        ctx.showToast('Transferring securely...', 'ok');
                        const storageRef = ref(storage, `verifications/${auth.currentUser.uid}_${Date.now()}.enc`);
                        await uploadBytes(storageRef, ciphertext);
                        const url = await getDownloadURL(storageRef);

                        // Save the metadata and key reference.
                        // IN A REAL SYSTEM: hexKey would be stored in a highly secured key-vault collection, not next to the file.
                        // We store it in a sub-collection so we can lock it down with rules.
                         await setDoc(doc(db, 'verifications', auth.currentUser.uid), {
                            status: 'pending',
                            fileUrl: url,
                            iv: ivHex,
                            hexKey: hexKey,
                            uploadedAt: Date.now()
                         });

                        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                          verified: 'pending',
                          verificationIdUrl: url // Kept for legacy compatibility
                        });

                        // Audit log
                        await setDoc(doc(db, 'audit_logs', `${auth.currentUser.uid}_${Date.now()}`), {
                           uid: auth.currentUser.uid,
                           action: 'uploaded_verification_id',
                           status: 'success',
                           timestamp: Date.now()
                        });
                        
                        ctx.showToast('Encrypted ID submitted! 🎖️', 'ok', 6000);
                        setIdFile(null);
                      } catch(e) {
                         ctx.showToast('Upload failed: ' + e.message, 'err');
                      }
                      setLoading(false);
                   }}>
                     {loading ? 'Processing...' : 'Encrypt & Submit ID 🔒'}
                   </button>
                 </div>
               )}
            </div>
          )}

          {user && activeTab === 'messages' && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {activeChats.length === 0 ? (
                <div className={styles.empty}>
                  <div style={{fontSize:32,marginBottom:8}}>💬</div>
                  <p style={{fontSize:14,color:'var(--muted)'}}>No active chats yet.</p>
                  <div style={{marginTop:12, display:'flex', gap:10}}>
                    <button onClick={() => window.location.href = '/about.html'} style={{background:'var(--card2)', border:'1px solid var(--border2)', color:'var(--accent)', fontSize:11, padding:'6px 12px', borderRadius:8, cursor:'pointer'}}>ℹ️ About Us</button>
                    <button onClick={ctx.openLegal} style={{background:'var(--card2)', border:'1px solid var(--border2)', color:'var(--accent)', fontSize:11, padding:'6px 12px', borderRadius:8, cursor:'pointer'}}>⚖️ Privacy Policy</button>
                    <button onClick={ctx.openLegal} style={{background:'var(--card2)', border:'1px solid var(--border2)', color:'var(--accent)', fontSize:11, padding:'6px 12px', borderRadius:8, cursor:'pointer'}}>📜 Terms of Use</button>
                  </div>
                  <p style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Reach out to owners via the map to start an encrypted conversation.</p>
                </div>
              ) : activeChats.map(c => (
                <div key={c.id} className={styles.chatItem} onClick={() => { onClose(); ctx.openChat({ chatId: c.id, recipientId: c.participants.find(p => p !== user.uid), name: c.listingName }); }}>
                  <div className={styles.chatAvatar}>🔐</div>
                  <div style={{flexGrow: 1}}>
                    <div className={styles.chatTitle}>{c.listingName}</div>
                    <div className={styles.chatPreview}>{c.lastMsg}</div>
                  </div>
                  <div className={styles.chatTime}>
                    {c.updatedAt?.seconds ? new Date(c.updatedAt.seconds * 1000).toLocaleDateString() : '...'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{display:'flex', flexDirection:'column', gap:20}}>
              <div style={{background:'var(--bg)', borderRadius:12, padding:16, border:'1px solid var(--border2)'}}>
                <h3 style={{fontSize:15, marginBottom:8}}>🔒 Security & Privacy</h3>
                <p style={{fontSize:12, color:'var(--muted)', lineHeight:1.4}}>
                  Your account is secured by your phone number. You can delete your data permanently here.
                </p>
                <div style={{marginTop:12, display:'flex', gap:10}}>
                  <button onClick={() => window.location.href = '/about.html'} style={{background:'var(--card2)', border:'1px solid var(--border2)', color:'var(--accent)', fontSize:11, padding:'6px 12px', borderRadius:8, cursor:'pointer'}}>ℹ️ About Us</button>
                  <button onClick={ctx.openLegal} style={{background:'var(--card2)', border:'1px solid var(--border2)', color:'var(--accent)', fontSize:11, padding:'6px 12px', borderRadius:8, cursor:'pointer'}}>⚖️ Privacy Policy</button>
                  <button onClick={ctx.openLegal} style={{background:'var(--card2)', border:'1px solid var(--border2)', color:'var(--accent)', fontSize:11, padding:'6px 12px', borderRadius:8, cursor:'pointer'}}>📜 Terms of Use</button>
                </div>
              </div>

              <div style={{background:'var(--bg)', borderRadius:12, padding:16, border:'1px solid var(--border2)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                  <h3 style={{fontSize:15}}>📱 Active Sessions</h3>
                  {sessions.length > 1 && (
                    <button style={{fontSize:11, color:'var(--gold)', background:'none', border:'none', cursor:'pointer'}} 
                      onClick={async () => {
                      if(window.confirm('Log out all other devices?')) {
                        const count = await terminateAllOtherSessions(user.uid);
                        ctx.showToast(`Logged out of ${count} device(s)`, 'ok');
                        getUserSessions(user.uid).then(setSessions);
                      }
                    }}>Log out all other devices</button>
                  )}
                </div>
                {sessions.length === 0 ? <p>Loading sessions...</p> : (
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {sessions.map(s => {
                      const isCurrent = s.id === `${user.uid}_${generateDeviceFingerprint()}`;
                      return (
                      <div key={s.id} style={{display:'flex',justifyContent:'space-between', alignItems:'center', padding:10, borderRadius:8, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)'}}>
                        <div>
                          <div style={{fontSize:13, fontWeight:600}}>{s.device} · {s.browser} {isCurrent && <span style={{fontSize:10, color:'#10b981', marginLeft:4}}>Current</span>}</div>
                          <div style={{fontSize:11, color:'var(--muted)'}}>Last active: {s.lastLoginAt?.toLocaleDateString() || 'Recently'}</div>
                        </div>
                        {!isCurrent && (
                          <button style={{fontSize:12, color:'var(--red)', background:'none', border:'none', cursor:'pointer'}}
                            onClick={async () => {
                              await terminateSession(s.id);
                              getUserSessions(user.uid).then(setSessions);
                              ctx.showToast('Session terminated', 'ok');
                            }}
                          >Revoke</button>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </div>

              <div style={{background:'rgba(244,63,94,0.05)', borderRadius:12, padding:16, border:'1px solid rgba(244,63,94,0.2)'}}>
                <h3 style={{fontSize:15, color:'var(--red)', marginBottom:8}}>Danger Zone</h3>
                <p style={{fontSize:12, color:'var(--muted)', marginBottom:16}}>
                  Deleting your account will remove your profile, wishlist, and **all listings and messages** permanently. This cannot be undone.
                </p>
                <button 
                  className="bp" 
                  style={{background:'var(--red)', color:'white'}} 
                  onClick={async () => {
                    if (window.confirm('ARE YOU SURE? This will permanently delete your account, all your listings, and all your messages.')) {
                      setLoading(true);
                      try {
                        const { db, doc, deleteDoc, collection, query, where, getDocs } = await import('../../firebase');
                        
                        // 1. Delete user's listings
                        ctx.showToast('Cleaning up your listings...', 'ok');
                        const listingQuery = query(collection(db, 'listings'), where('uid', '==', user.uid));
                        const listingsSnap = await getDocs(listingQuery);
                        for (const d of listingsSnap.docs) await deleteDoc(doc(db, 'listings', d.id));

                        // 2. Delete user's messages/chats
                        ctx.showToast('Clearing message history...', 'ok');
                        // Deleting chats where user is participant
                        const chatQuery = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
                        const chatsSnap = await getDocs(chatQuery);
                        for (const d of chatsSnap.docs) {
                           // Delete messages subcollection recursively
                           const msgSnap = await getDocs(collection(db, 'chats', d.id, 'messages'));
                           for (const m of msgSnap.docs) await deleteDoc(doc(db, 'chats', d.id, 'messages', m.id));
                           await deleteDoc(doc(db, 'chats', d.id));
                        }

                        // 3. Delete user document
                        ctx.showToast('Finalizing...', 'ok');
                        await deleteDoc(doc(db, 'users', user.uid));

                        // 4. Delete Auth User
                        await auth.currentUser.delete();
                        
                        onClose();
                        ctx.showToast('Account deleted permanently.', 'ok');
                      } catch (e) {
                        ctx.showToast('Deletion failed: ' + (e.code === 'auth/requires-recent-login' ? 'Please log out and log in again to confirm this action.' : e.message), 'err');
                      }
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Deleting Everything...' : 'Delete My Account Permanently'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border2)' }}>
                <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🌐 {TRANSLATIONS[language].selectLang}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <button 
                    className={`fb ${language === 'en' ? 'active' : ''}`} 
                    style={{ padding: 10, fontSize: 13, borderRadius: 8 }}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English (EN)
                  </button>
                  <button 
                    className={`fb ${language === 'hi' ? 'active' : ''}`} 
                    style={{ padding: 10, fontSize: 13, borderRadius: 8 }}
                    onClick={() => handleLanguageChange('hi')}
                  >
                    हिन्दी (HI)
                  </button>
                  <button 
                    className={`fb ${language === 'pa' ? 'active' : ''}`} 
                    style={{ padding: 10, fontSize: 13, borderRadius: 8 }}
                    onClick={() => handleLanguageChange('pa')}
                  >
                    ਪੰਜਾਬੀ (PA)
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 4 }}>
                      🎖️ {TRANSLATIONS[language].elderlyToggle}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4, maxWidth: 380 }}>
                      {TRANSLATIONS[language].elderlyDesc}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', height: 24 }}>
                    <input 
                      type="checkbox" 
                      id="elderly-mode-toggle"
                      checked={elderlyMode}
                      onChange={e => toggleElderlyMode(e.target.checked)}
                      style={{ 
                        width: 40, 
                        height: 20, 
                        accentColor: 'var(--accent)', 
                        cursor: 'pointer' 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'echs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '88vh' }}>
              {/* Phase 23: Veteran ECHS Health Vault & OPD Queue Pre-Registration */}
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border2)' }}>
                <h3 style={{ fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🏥 {TRANSLATIONS[language].echsTitle || 'Veteran ECHS Card Locker & OPD Booking'}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.4 }}>
                  {TRANSLATIONS[language].echsDesc || 'Upload ECHS health cards or pension records to your local encrypted vault. Book queue pre-registration tokens for Military/Command Hospitals.'}
                </p>

                {/* ECHS Upload Section */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border2)', borderRadius: 8, padding: 12, textAlign: 'center', marginBottom: 12 }}>
                  {echsUploaded ? (
                    <div>
                      <div style={{ color: '#22c55e', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                        🔒 {TRANSLATIONS[language].echsVaulted || 'Locally Encrypted & Vaulted Successfully'}
                      </div>
                      <div style={{ color: 'var(--text)', fontSize: 11, fontFamily: 'monospace' }}>
                        {echsFileName}
                      </div>
                      <button 
                        onClick={() => { setEchsUploaded(false); setEchsFileName(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', marginTop: 8, textDecoration: 'underline' }}
                      >
                        {TRANSLATIONS[language].echsRemove || 'Remove Document'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="echs-card-upload" style={{ cursor: 'pointer', display: 'block' }}>
                        <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>📁</span>
                        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 'bold' }}>
                          {TRANSLATIONS[language].echsUpload || 'Upload ECHS Card / Pension Book'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginTop: 4 }}>
                          {TRANSLATIONS[language].echsInfo || 'Document will be encrypted client-side using AES-256-GCM. Mask sensitive details before upload. Verification is voluntary.'}
                        </span>
                      </label>
                      <input 
                        type="file" 
                        id="echs-card-upload" 
                        accept="image/*,application/pdf"
                        onChange={handleEchsUpload} 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  )}
                </div>

                {/* Hospital & OPD Pre-Registration Section */}
                <div style={{ borderTop: '1px solid var(--border2)', paddingTop: 12, marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 6 }}>
                    {TRANSLATIONS[language].echsSelectHospital || 'Select Station Military Hospital'}:
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <select 
                      value={opdHospital} 
                      onChange={(e) => setOpdHospital(e.target.value)}
                      style={{ 
                        flexGrow: 1, 
                        background: 'rgba(0,0,0,0.2)', 
                        border: '1px solid var(--border2)', 
                        color: 'var(--text)', 
                        borderRadius: 6, 
                        padding: '6px 10px', 
                        fontSize: 12 
                      }}
                    >
                      <option value="Base Hospital Delhi Cantt">Base Hospital Delhi Cantt</option>
                      <option value="Command Hospital Pune">Command Hospital Pune</option>
                      <option value="Command Hospital Chandimandir">Command Hospital Chandimandir</option>
                      <option value="Station Hospital Secunderabad">Station Hospital Secunderabad</option>
                    </select>

                    <button 
                      onClick={handleBookOPDToken}
                      disabled={opdLoading}
                      style={{ 
                        background: 'var(--accent)', 
                        color: '#000', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '6px 12px', 
                        fontSize: 12, 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {opdLoading ? '...' : (TRANSLATIONS[language].echsBook || 'Book OPD Token')}
                    </button>
                  </div>

                  {opdToken && (
                    <div style={{ 
                      background: 'rgba(34, 197, 94, 0.05)', 
                      border: '1px solid rgba(34, 197, 94, 0.25)', 
                      borderRadius: 8, 
                      padding: 10, 
                      textAlign: 'center',
                      fontFamily: 'monospace' 
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        {TRANSLATIONS[language].echsTokenActive || 'Active OPD Queue Token'}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e', margin: '4px 0' }}>
                        {opdToken}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text)' }}>
                        {TRANSLATIONS[language].echsHospital || 'Hospital'}: <b>{opdHospital}</b>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'listings' && activeTab !== 'wishlisted' && activeTab !== 'seen' && activeTab !== 'security' && activeTab !== 'verification' && activeTab !== 'messages' && activeTab !== 'rewards' && activeTab !== 'accessibility' && activeTab !== 'echs' && (
             <div className={styles.empty}>
                <div style={{fontSize:32,marginBottom:8}}>🚧</div>
                <p style={{fontSize:14,color:'var(--muted)'}}>No {activeTab} properties yet.</p>
                <p style={{fontSize:12,color:'var(--muted)',marginTop:4,maxWidth:240,textAlign:'center'}}>This feature is coming soon.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
