import { useState, useContext, useEffect } from 'react';
import { db, collection, addDoc, query, orderBy, onSnapshot, auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { ModalContext } from '../../App';
import styles from './ProfileModal.module.css'; // Reusing some base styles

export default function TransfersModal({ onClose }) {
  const { user } = useAuth();
  const ctx = useContext(ModalContext);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'transfers'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTransfers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return ctx.showToast('Login to post alerts', 'err');
    if (!from || !to) return ctx.showToast('Enter From/To cities', 'err');
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'transfers'), {
        uid: user.uid,
        userName: user.displayName || user.phoneNumber || 'Fauji Member',
        from, to,
        message: msg,
        createdAt: Date.now()
      });
      setMsg(''); setFrom(''); setTo('');
      ctx.showToast('Movement Alert Posted! 🎖️', 'ok');
    } catch (err) {
      ctx.showToast('Error: ' + err.message, 'err');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{maxWidth: 500}}>
        <div className={styles.header}>
          <h2 className="mh2">🎖️ Movement Board</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <p style={{fontSize:13, color:'var(--muted)', marginBottom:16, textAlign:'center'}}>
            Post your upcoming transfer to help others plan or find shared cabs.
          </p>

          <form onSubmit={handleSubmit} style={{background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 12, padding: 16, marginBottom: 24}}>
            <div style={{display:'flex', gap:8, marginBottom:8}}>
              <input className="fi" style={{marginBottom:0}} placeholder="From (City/Cantt)" value={from} onChange={e => setFrom(e.target.value)} required />
              <input className="fi" style={{marginBottom:0}} placeholder="To (City/Cantt)" value={to} onChange={e => setTo(e.target.value)} required />
            </div>
            <textarea className="fi" placeholder="Message (e.g., Looking for flat-mate or shared cab...)" 
              value={msg} onChange={e => setMsg(e.target.value)} style={{height:60, resize:'none'}} />
            <button className="bp" type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Alert 🔔'}
            </button>
          </form>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {transfers.map(t => (
              <div key={t.id} style={{background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius:12, padding: 12}}>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                  <div style={{fontWeight:700, fontSize:14}}>{t.from}</div>
                  <div style={{fontSize:12, color:'var(--muted)'}}>➡️</div>
                  <div style={{fontWeight:700, fontSize:14}}>{t.to}</div>
                </div>
                {t.message && <p style={{fontSize:13, color:'var(--text2)', marginBottom:8}}>{t.message}</p>}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontSize:11, color:'var(--accent)', fontWeight:600}}>🎖️ {t.userName}</div>
                  <div style={{fontSize:10, color:'var(--muted)'}}>{new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {transfers.length === 0 && <p style={{textAlign:'center', color:'var(--muted)', fontSize:13}}>No active movement alerts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
