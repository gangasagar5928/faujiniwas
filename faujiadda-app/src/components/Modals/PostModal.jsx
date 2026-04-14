import { useState, useContext } from 'react';
import { auth, db, collection, addDoc, updateDoc, doc, increment } from '../../firebase';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useFilterStore } from '../../store/filterStore';
import styles from './PostModal.module.css';

// Minimal pass-through PostModal — auth + single listing form
export default function PostModal({ onClose }) {
  const { user } = useAuth();
  const ctx = useContext(ModalContext);
  const listings = useFilterStore(s => s.listings);
  const [step, setStep] = useState(user ? 1 : 0);
  const [form, setForm] = useState({ name:'', area:'', city:'', price:'', type:'Flat', phone:'', ownerType:'civilian', furnishing:'Semi', available:'', bhk: '1', petFriendly: false });

  const sameCity = listings.filter(l => l.city?.toLowerCase() === form.city?.toLowerCase() && l.type === form.type);
  const avgPrice = sameCity.length > 0 ? Math.round(sameCity.reduce((acc,l)=>acc+(l.price||0), 0) / sameCity.length) : null;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const initRecaptcha = async () => {
    const { RecaptchaVerifier } = await import('firebase/auth');
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return ctx.showToast('Enter valid 10-digit number', 'err');
    setLoading(true);
    try {
      await initRecaptcha();
      const { signInWithPhoneNumber } = await import('firebase/auth');
      const formattedPhone = '+91' + phone;
      window.confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setOtpSent(true);
      ctx.showToast('OTP sent! 💬', 'ok');
    } catch (e) {
      ctx.showToast('Error: ' + e.message, 'err');
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      await window.confirmationResult.confirm(otp);
      setStep(1);
      ctx.showToast('Logged in! ✅', 'ok');
    } catch (e) {
      ctx.showToast('Invalid OTP', 'err');
    }
    setLoading(false);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.area || !form.city || !form.price || !form.phone) {
      ctx.showToast('Please fill all required fields', 'err'); return;
    }
    setLoading(true);
    try {
      // 1. Geocode
      let lat = 22.5, lng = 82.0;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.area+', '+form.city+', India')}`);
        const data = await res.json();
        if (data?.[0]) { lat = parseFloat(data[0].lat); lng = parseFloat(data[0].lon); }
      } catch {}

      // 2. Compress and Upload Images
      const mediaUrls = [];
      if (images.length > 0) {
        const imageCompression = (await import('browser-image-compression')).default;
        const { storage } = await import('../../firebase');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          ctx.showToast(`Compressing photo ${i+1}/${images.length}...`, 'ok', 3000);
          const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true });
          ctx.showToast(`Uploading photo ${i+1}/${images.length}...`, 'ok', 3000);
          const storageRef = ref(storage, `listings/${auth.currentUser.uid}_${Date.now()}_${i}.webp`);
          const snapshot = await uploadBytes(storageRef, compressed);
          const url = await getDownloadURL(snapshot.ref);
          mediaUrls.push(url);
        }
      }

      // 2.5 Broker Detection AI
      let finalOwnerType = form.ownerType;
      const matchingPhones = listings.filter(l => l.phone === form.phone);
      if (matchingPhones.length >= 5) {
        finalOwnerType = 'broker';
      }

      // 3. Save to Firestore
      await addDoc(collection(db, 'rentals'), {
        ...form,
        ownerType: finalOwnerType,
        price: Number(form.price),
        lat, lng,
        mediaUrls, // now properly populated
        verified: false,
        createdAt: Date.now(),
        reportCount: 0,
        uid: auth.currentUser?.uid || 'unknown',
      });

      // 4. Award Fauji Points (+50)
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          points: increment(50)
        });
      }
      
      onClose();
      ctx.showToast('🎉 Listing submitted! +50 Fauji Points awarded.', 'ok', 5000);
    } catch (e) {
      ctx.showToast('Error: ' + e.message, 'err');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc">
        <div className={styles.header}>
          <h2 className="mh2">{step === 0 ? '🔐 Login to Post' : '📝 Post a Listing'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {step === 0 ? (
            // Auth step
            <div>
              <p style={{color:'var(--muted)',fontSize:13,marginBottom:16}}>Verify your phone number to securely post a listing.</p>
              
              {!otpSent ? (
                <>
                  <div style={{display:'flex', gap:8, marginBottom:9}}>
                    <div style={{background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--text)', borderRadius:10, padding:'11px', fontSize:14, flexShrink:0}}>+91</div>
                    <input className="fi" type="tel" placeholder="Mobile Number" style={{marginBottom:0}} value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div id="recaptcha-container"></div>
                  <button className="bp" onClick={handleSendOtp} disabled={loading || phone.length < 10}>
                    {loading ? 'Please wait…' : 'Get OTP 💬'}
                  </button>
                </>
              ) : (
                <>
                  <input className="fi" type="number" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                  <button className="bp" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}>
                    {loading ? 'Verifying…' : 'Verify & Proceed ✅'}
                  </button>
                </>
              )}
            </div>
          ) : (
            // Listing form
            <div>
              <div style={{border:'1px dashed var(--border2)', borderRadius:10, padding:16, marginBottom:12, background:'var(--bg)'}}>
                <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8}}>Add Photos (Auto-Compressed)</label>
                <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} />
                {images.length > 0 && <div style={{fontSize:12, color:'#14b8a6', marginTop:6}}>✓ {images.length} photos selected ready for compression.</div>}
              </div>
              <input className="fi" placeholder="Listing title *" value={form.name} onChange={e => set('name',e.target.value)} />
              <div className={styles.row2}>
                <input className="fi" placeholder="Area / Locality *" value={form.area} onChange={e => set('area',e.target.value)} />
                <input className="fi" placeholder="City / Cantt *" value={form.city} onChange={e => set('city',e.target.value)} />
              </div>
              <div className={styles.row2} style={{marginBottom: avgPrice ? 0 : 12}}>
                <input className="fi" type="number" placeholder="Monthly Rent ₹ *" value={form.price} onChange={e => set('price',e.target.value)} style={{marginBottom:0}} />
                <select className="fi" value={form.type} onChange={e => set('type',e.target.value)} style={{marginBottom:0}}>
                  {['Flat','Room','Villa','PG','House'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              {avgPrice && (
                <div style={{fontSize:11, color:'var(--accent)', marginBottom:12, marginTop:4, display:'flex', gap:4, alignItems:'center'}}>
                   ✨ AI Suggestion: Market average in {form.city} is ₹{avgPrice.toLocaleString()} {form.price && Number(form.price) > avgPrice && <span style={{color:'#f43f5e'}}>(Yours is higher)</span>}
                </div>
              )}
              <div className={styles.row2}>
                <select className="fi" value={form.furnishing} onChange={e => set('furnishing',e.target.value)}>
                  <option>Semi</option><option>Fully</option><option>Unfurnished</option>
                </select>
                <select className="fi" value={form.ownerType} onChange={e => set('ownerType',e.target.value)}>
                  <option value="civilian">👤 Civilian</option>
                  <option value="defence">🎖️ Defence</option>
                  <option value="broker">🏢 Broker</option>
                </select>
              </div>
              <div className={styles.row2}>
                <select className="fi" value={form.bhk} onChange={e => set('bhk',e.target.value)}>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3+">3+ BHK</option>
                </select>
                <select className="fi" value={form.petFriendly ? 'yes' : 'no'} onChange={e => set('petFriendly',e.target.value === 'yes')}>
                  <option value="no">🚫 No Pets</option>
                  <option value="yes">🐶 Pet Friendly</option>
                </select>
              </div>
              <input className="fi" type="tel" placeholder="WhatsApp Number *" value={form.phone} onChange={e => set('phone',e.target.value)} />
              <input className="fi" type="date" placeholder="Available from" value={form.available} onChange={e => set('available',e.target.value)} />
              <button className="bp" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit for Review ✅'}
              </button>
              <p style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginTop:8}}>Listings go live after admin verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
