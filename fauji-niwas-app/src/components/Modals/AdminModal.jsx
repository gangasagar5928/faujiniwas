import { useState, useEffect, useContext } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs, addDoc } from 'firebase/firestore';
import { ModalContext } from '../../App';
import styles from './AdminModal.module.css';

export default function AdminModal({ onClose }) {
  const ctx = useContext(ModalContext);
  const [activeTab, setActiveTab] = useState('verifications'); // verifications, reports
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({}); // userId -> reason
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for pending verifications
    const qUsers = query(collection(db, 'users'), where('verified', '==', 'pending'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setPendingUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // 2. Listen for detailed reports
    const qReports = query(collection(db, 'reports'), where('status', '==', 'pending'));
    const unsubReports = onSnapshot(qReports, (snap) => {
      setAllReports(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => { unsubUsers(); unsubReports(); };
  }, []);

  const handleVerify = async (userId, status) => {
    try {
      const userRef = doc(db, 'users', userId);
      const reason = rejectionReasons[userId] || 'Verification failed. Please upload a clearer ID.';
      await updateDoc(userRef, {
        verified: status,
        verificationStatusChanged: Date.now(),
        notification: status === true ? 'Your Fauji ID has been verified! 🎖️' : reason
      });
      
      // Write audit log
      await addDoc(collection(db, 'audit_logs'), {
        uid: auth.currentUser?.uid || 'system',
        action: status === true ? 'approve_verification' : 'reject_verification',
        targetId: userId,
        reason: status === true ? 'Verified military status' : reason,
        timestamp: Date.now()
      });

      // Also update their rentals if verified
      if (status === true) {
        const q = query(collection(db, 'rentals'), where('uid', '==', userId));
        const snaps = await getDocs(q);
        snaps.forEach(async (d) => {
          await updateDoc(d.ref, { verified: true });
        });
      }

      ctx.showToast(status === true ? 'User verified!' : 'User rejected', 'ok');
    } catch (e) {
      ctx.showToast(e.message, 'err');
    }
  };

  const handleDismissReport = async (rentalId) => {
    try {
      await updateDoc(doc(db, 'rentals', rentalId), { reportCount: 0 });
      
      // Write audit log
      await addDoc(collection(db, 'audit_logs'), {
        uid: auth.currentUser?.uid || 'system',
        action: 'dismiss_reports',
        targetId: rentalId,
        timestamp: Date.now()
      });

      ctx.showToast('Reports dismissed', 'ok');
    } catch (e) {
      ctx.showToast(e.message, 'err');
    }
  };

  const handleDeleteListing = async (rentalId) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await deleteDoc(doc(db, 'rentals', rentalId));
      
      // Write audit log
      await addDoc(collection(db, 'audit_logs'), {
        uid: auth.currentUser?.uid || 'system',
        action: 'delete_listing',
        targetId: rentalId,
        timestamp: Date.now()
      });

      ctx.showToast('Listing deleted', 'ok');
    } catch (e) {
      ctx.showToast(e.message, 'err');
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ maxWidth: 800, width: '95%' }}>
        <div className={styles.header}>
          <h2 className="mh2">🛠️ Admin Panel</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'verifications' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('verifications')}
          >
            Verifications ({pendingUsers.length})
          </button>
          <button 
            className={activeTab === 'reports' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('reports')}
          >
            Reports ({allReports.length})
          </button>
        </div>

        <div className={styles.body}>
          {activeTab === 'verifications' && (
            <div className={styles.list}>
              {pendingUsers.length === 0 ? (
                <div className={styles.empty}>No pending verifications.</div>
              ) : (
                pendingUsers.map(u => (
                  <div key={u.id} className={styles.card}>
                    <div className={styles.cardInfo}>
                      <strong>{u.phone || u.email || 'Unknown User'}</strong>
                      <div className={styles.meta}>UID: {u.id}</div>
                      {u.verificationIdUrl && (
                        <div className={styles.imgWrap}>
                           <img src={u.verificationIdUrl} alt="Military ID" />
                           <a href={u.verificationIdUrl} target="_blank" rel="noreferrer" className={styles.zoom}>🔍 Open Full Size</a>
                        </div>
                      )}
                    </div>
                    <div className={styles.actions}>
                      {u.verified !== true && (
                        <div className={styles.rejectWrap}>
                          <input 
                            className={styles.reasonInput} 
                            placeholder="Reason for rejection..." 
                            value={rejectionReasons[u.id] || ''}
                            onChange={(e) => setRejectionReasons(prev => ({ ...prev, [u.id]: e.target.value }))}
                          />
                          <button className={styles.btnApprove} onClick={() => handleVerify(u.id, true)}>Approve ✅</button>
                          <button className={styles.btnReject} onClick={() => handleVerify(u.id, false)}>Reject ❌</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className={styles.list}>
              {allReports.length === 0 ? (
                <div className={styles.empty}>No pending reports.</div>
              ) : (
                allReports.map(r => (
                  <div key={r.id} className={styles.card}>
                    <div className={styles.cardInfo}>
                      <div style={{display:'flex', gap:8, alignItems:'center'}}>
                        <strong style={{color:'var(--red)'}}>🚨 {r.reason}</strong>
                        <span className={styles.meta}>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <div className={styles.meta}>Listing ID: {r.listingId}</div>
                      <div className={styles.meta}>Reported by: {r.reportedBy}</div>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.btnDismiss} onClick={async () => {
                        await updateDoc(doc(db, 'reports', r.id), { status: 'dismissed' });
                        ctx.showToast('Report dismissed', 'ok');
                      }}>Dismiss 🤝</button>
                      <button className={styles.btnDelete} onClick={async () => {
                        if(confirm('Delete this listing?')) {
                          await deleteDoc(doc(db, 'rentals', r.listingId));
                          await updateDoc(doc(db, 'reports', r.id), { status: 'resolved' });
                          ctx.showToast('Listing deleted', 'ok');
                        }
                      }}>Delete Listing 🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
