import { useContext } from 'react';
import { auth, db, doc, updateDoc, increment } from '../../firebase';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import styles from './ReportModal.module.css';

export default function ReportModal({ id, onClose }) {
  const ctx = useContext(ModalContext);

  const submit = async () => {
    const sel = document.querySelector('input[name="rr"]:checked');
    if (!sel) { ctx.showToast('Please select a reason', 'err'); return; }
    try {
      await updateDoc(doc(db, 'rentals', id), { reportCount: increment(1) });
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
            <label key={r} className={styles.opt}>
              <input type="radio" name="rr" value={r} />
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{r}</div>
              </div>
            </label>
          ))}
          <button className="bp" style={{marginTop:12}} onClick={submit}>Submit Report</button>
        </div>
      </div>
    </div>
  );
}
