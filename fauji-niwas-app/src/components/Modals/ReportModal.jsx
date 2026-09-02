import { useContext } from 'react';
import { motion } from 'framer-motion';
import { auth, db, doc, updateDoc, increment, collection, addDoc } from '../../firebase';
import { ModalContext } from '../../App';
import styles from './ReportModal.module.css';

const springTap = { whileTap: { scale: 0.97 }, transition: { type: 'spring', stiffness: 400, damping: 24 } };

export default function ReportModal({ id, onClose }) {
  const ctx = useContext(ModalContext);

  const submit = async () => {
    const sel = document.querySelector('input[name="rr"]:checked');
    if (!sel) { ctx.showToast('Please select a reason', 'err'); return; }
    try {
      await updateDoc(doc(db, 'rentals', id), { reportCount: increment(1) });
      
      // Detailed report tracking
      await addDoc(collection(db, 'reports'), {
        listingId: id,
        reason: sel.value,
        reportedBy: auth.currentUser?.uid || 'anonymous',
        createdAt: Date.now(),
        status: 'pending'
      });

      onClose();
      ctx.showToast('Report submitted — thank you 🙏', 'ok');
    } catch (e) {
      ctx.showToast('Error: ' + e.message, 'err');
    }
  };

  const reasons = ['Wrong information', 'Duplicate listing', 'Scam / Fraud', 'Inappropriate content', 'No longer available'];

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc">
        <div className={styles.header}>
          <h2 className="mh2">🚩 Report Listing</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <p style={{color:'var(--muted)',fontSize:13,marginBottom:12}}>Why are you reporting this listing?</p>
          {reasons.map(r => (
            <motion.label key={r} className={`liquid-glass-chip ${styles.opt}`} style={{display:'flex', alignItems:'flex-start', gap:12, padding:12, borderRadius:10, cursor:'pointer', marginBottom:8}} {...springTap}>
              <input type="radio" name="rr" value={r} />
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{r}</div>
              </div>
            </motion.label>
          ))}
          <motion.button className="bp fluid-press" style={{marginTop:12}} onClick={submit} {...springTap}>Submit Report</motion.button>
        </div>
      </div>
    </div>
  );
}
