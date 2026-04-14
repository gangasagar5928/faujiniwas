import { useContext, useState } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import styles from './ProfileModal.module.css';

export default function ProfileModal({ onClose }) {
  const { user, dbUser } = useAuth();
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
  const [activeTab, setActiveTab] = useState('listings'); // listings, wishlisted, seen, contacted, verification, rewards
  const [idFile, setIdFile] = useState(null);

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
      <div className="mc">
        <div className={styles.header}>
          <h2 className="mh2">👤 My Profile</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user.phoneNumber ? '📱' : '✉️'}</div>
            <div style={{flexGrow: 1}}>
              <div className={styles.userId}>{identity}</div>
              <div style={{display:'flex', gap:6, alignItems:'center', marginTop:4}}>
                <div style={{background:levelColor, color:'white', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, textTransform:'uppercase'}}>{level}</div>
                <div style={{fontSize:11, fontWeight:700, color:'var(--gold)'}}>⭐ {points} Fauji Points</div>
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
              <div className={styles.rankTitle}>Your Rank (For BAH Assessment)</div>
              <select className={styles.rankSel} value={rank} onChange={(e) => setRank(e.target.value)}>
                <option value="OR">Serving - OR</option>
                <option value="JCO">Serving - JCO</option>
                <option value="Officer">Serving - Officer</option>
              </select>
            </div>
            <div style={{fontSize:11, color:'var(--muted)'}}>We use this to show you "Value for BAH" on property details.</div>
          </div>

          <div style={{display:'flex',gap:16,borderBottom:'1px solid var(--border2)',marginBottom:16,paddingBottom:0,overflowX:'auto'}}>
            {['listings','wishlisted','rewards','verification','seen','contacted'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background:'none', border:'none', borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === t ? 'var(--accent)' : 'var(--muted)', fontSize:13, fontWeight:600, paddingBottom:8, cursor:'pointer', whiteSpace:'nowrap', textTransform:'capitalize'
              }}>{t === 'listings' ? 'My Listings' : t}</button>
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
                   <p style={{fontSize:13,color:'var(--muted)'}}>Our team is verifying your submitted ID. Please wait 24-48 hours.</p>
                 </div>
               ) : (
                 <div>
                   <h3 style={{fontSize:16, marginBottom:8}}>Get Verified</h3>
                   <p style={{fontSize:13, color:'var(--muted)', marginBottom:16}}>Upload a photo of your Canteen Card or Military ID to get the golden "Verified Fauji" badge on your rentals. Protect your privacy by hiding the ID number.</p>
                   
                   <div style={{border:'1px dashed var(--border2)', borderRadius:10, padding:16, marginBottom:16, background:'rgba(0,0,0,0.2)'}}>
                     <input type="file" accept="image/*" onChange={e => setIdFile(e.target.files[0])} style={{width:'100%', fontSize:13}} />
                     {idFile && <div style={{fontSize:12, color:'#14b8a6', marginTop:8}}>File selected: {idFile.name}</div>}
                   </div>
                   
                   <button className="bp" disabled={!idFile || loading} onClick={async () => {
                      if(!idFile) return;
                      setLoading(true);
                      try {
                        const imageCompression = (await import('browser-image-compression')).default;
                        const { storage, db } = await import('../../firebase');
                        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                        const { doc, updateDoc } = await import('firebase/firestore');

                        ctx.showToast('Compressing secure ID...', 'ok');
                        const compressed = await imageCompression(idFile, { maxSizeMB: 0.1, maxWidthOrHeight: 800 });
                        
                        ctx.showToast('Transferring securely...', 'ok');
                        const storageRef = ref(storage, `verifications/${auth.currentUser.uid}_${Date.now()}.webp`);
                        await uploadBytes(storageRef, compressed);
                        const url = await getDownloadURL(storageRef);

                        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                          verified: 'pending',
                          verificationIdUrl: url
                        });
                        
                        ctx.showToast('Verification submitted! 🎖️', 'ok', 6000);
                        // Reload app state implicitly or manually clear
                        setIdFile(null);
                      } catch(e) {
                         ctx.showToast('Upload failed: ' + e.message, 'err');
                      }
                      setLoading(false);
                   }}>
                     {loading ? 'Uploading safely...' : 'Submit ID for Verification 🔒'}
                   </button>
                 </div>
               )}
            </div>
          )}

          {activeTab !== 'listings' && activeTab !== 'wishlisted' && activeTab !== 'seen' && activeTab !== 'contacted' && activeTab !== 'verification' && (
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
