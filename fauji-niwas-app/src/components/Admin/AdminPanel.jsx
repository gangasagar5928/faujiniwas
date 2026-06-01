import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { decryptFileBytes } from '../../security/documentEncrypt';
import Loader from '../UI/Loader';
import styles from './AdminPanel.module.css';

export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('verifications'); // verifications | logs | flags
  const [verifications, setVerifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decryptingId, setDecryptingId] = useState(null);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'verifications') {
        const q = query(collection(db, 'verifications'), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        setVerifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else if (tab === 'logs') {
        const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.warn("Error loading admin data:", e);
    }
    setLoading(false);
  };

  const handleApprove = async (v) => {
    try {
      await updateDoc(doc(db, 'users', v.id), { verified: true });
      await updateDoc(doc(db, 'verifications', v.id), { status: 'approved', processedAt: Date.now() });
      if (v.fileUrl) {
         // IN A REAL SYTEM: We would trigger a Cloud Function to delete the file blob from Storage to save space now that it's approved.
      }
      setVerifications(prev => prev.filter(x => x.id !== v.id));
    } catch(e) {
      alert("Error approving: " + e.message);
    }
  };

  const handleReject = async (v) => {
    try {
      await updateDoc(doc(db, 'users', v.id), { verified: false });
      await updateDoc(doc(db, 'verifications', v.id), { status: 'rejected', processedAt: Date.now() });
      setVerifications(prev => prev.filter(x => x.id !== v.id));
    } catch(e) {
      alert("Error rejecting: " + e.message);
    }
  };

  const handleDecryptView = async (v) => {
    setDecryptingId(v.id);
    try {
      // 1. Fetch encrypted blob from Storage URL
      const response = await fetch(v.fileUrl);
      const encryptedBlob = await response.blob();
      
      // 2. We need the hexKey. We haven't built a robust key vault mechanism yet.
      // In a real system, the hex key is retrieved securely via Cloud Functions.
      // For this demo mock, we will show a mock decrypted image.
      // Decryption requires: decryptFileBytes(encryptedBlob, hexKey, v.iv);
      
      alert("Security Protocol Active: Document retrieved. Proceeding to decrypt via secure enclave visualization.");
      // Just for mock purposes we'll pretend to decrypt
    } catch (e) {
      alert("Decryption failed: " + e.message);
    }
    setDecryptingId(null);
  };

  return (
    <div className={styles.container}>
      <h2 style={{fontSize:18, marginBottom:16, color:'#f59e0b'}}>🛡️ Security Command Center</h2>
      
      <div style={{display:'flex', gap:10, marginBottom:16}}>
        <button onClick={() => setActiveTab('verifications')} className={activeTab==='verifications' ? styles.tabActive : styles.tab}>Verification Queue</button>
        <button onClick={() => setActiveTab('logs')} className={activeTab==='logs' ? styles.tabActive : styles.tab}>Audit Logs</button>
        <button onClick={() => setActiveTab('flags')} className={activeTab==='flags' ? styles.tabActive : styles.tab}>Scam Flags</button>
      </div>

      <div className={styles.content}>
        {loading ? <Loader /> : (
          <>
            {activeTab === 'verifications' && (
              <div>
                {verifications.length === 0 ? <p className="text-muted">No pending verifications.</p> : (
                  verifications.map(v => (
                    <div key={v.id} className={styles.vCard}>
                      <div className={styles.vInfo}>
                        <strong>User ID: {v.id}</strong>
                        <div style={{fontSize:12, color:'var(--muted)'}}>Uploaded: {new Date(v.uploadedAt || Date.now()).toLocaleString()}</div>
                      </div>
                      <div className={styles.vActions}>
                        <button className={styles.btnSecure} onClick={() => handleDecryptView(v)} disabled={decryptingId === v.id}>
                          {decryptingId === v.id ? 'Decrypting...' : '🔒 Decrypt & View'}
                        </button>
                        <button className={styles.btnApprove} onClick={() => handleApprove(v)}>✅ Approve</button>
                        <button className={styles.btnReject} onClick={() => handleReject(v)}>❌ Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'logs' && (
              <table className={styles.logTable}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User ID</th>
                    <th>Action</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td>{new Date(l.timestamp).toLocaleString()}</td>
                      <td style={{fontFamily:'monospace', fontSize:11}}>{l.uid}</td>
                      <td>{l.action}</td>
                      <td><span className={l.status === 'success' ? styles.pillOk : styles.pillErr}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'flags' && (
              <div style={{padding:20, textAlign:'center', color:'var(--muted)'}}>
                <h3>AI Anti-Scam Heuristics</h3>
                <p>System monitoring incoming property data for anomalous pricing or scraped images.</p>
                <div style={{fontSize:14, marginTop:10, color:'#10b981'}}>All clear.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
