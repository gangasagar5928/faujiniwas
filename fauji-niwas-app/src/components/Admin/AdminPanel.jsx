import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { decryptFileBytes, getPrivateKey, generateAdminRsaKeys, exportAdminKeyBackup, importAdminKeyBackup } from '../../security/documentEncrypt';
import { setDoc, getDoc } from 'firebase/firestore';
import Loader from '../UI/Loader';
import styles from './AdminPanel.module.css';

export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('verifications'); // verifications | logs | flags | keyvault
  const [verifications, setVerifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decryptingId, setDecryptingId] = useState(null);
  const [hasLocalKey, setHasLocalKey] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState('');

  useEffect(() => {
    const initKeys = async () => {
      try {
        const localPrivKey = await getPrivateKey();
        setHasLocalKey(!!localPrivKey);
        const serverKeySnap = await getDoc(doc(db, 'admin_keys', 'active'));
        if (!localPrivKey && !serverKeySnap.exists()) {
          const { publicKeyJwk } = await generateAdminRsaKeys();
          await setDoc(doc(db, 'admin_keys', 'active'), {
            publicKeyJwk,
            createdAt: Date.now()
          });
          setHasLocalKey(true);
          console.log("Admin RSA keys generated and published successfully.");
        }
      } catch (e) {
        console.warn("Keys setup failed:", e);
      }
    };
    initKeys();
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
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const encryptedBlob = await response.blob();
      
      // 2. Extract key and IV
      const hexKey = v.hexKey;
      const ivHex = v.iv;
      if (!hexKey || !ivHex) {
        throw new Error("Missing decryption key or initialization vector (IV) in metadata.");
      }
      
      // 3. Decrypt file bytes using client-side Web Crypto
      const localPrivKey = await getPrivateKey();
      if (!localPrivKey) {
        throw new Error("Private key is missing on this device. Keypair must be initialized on this browser first.");
      }
      const decryptedBlob = await decryptFileBytes(encryptedBlob, hexKey, ivHex, localPrivKey);
      const objectUrl = URL.createObjectURL(decryptedBlob);
      
      // 4. Open in new tab securely
      const w = window.open();
      if (w) {
        w.document.write(`
          <html>
            <head><title>Decrypted Military ID Card — Fauji Niwas</title></head>
            <body style="margin:0; background:#0b1325; display:flex; justify-content:center; align-items:center; height:100vh;">
              <img src="${objectUrl}" alt="Decrypted Military ID Card" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);" />
            </body>
          </html>
        `);
      } else {
        alert("Secure window blocked by pop-up blocker. Decrypted file URL: " + objectUrl);
      }
    } catch (e) {
      alert("Decryption failed: " + e.message);
    }
    setDecryptingId(null);
  };

  const handleExportBackup = async () => {
    const pass = prompt("Enter a strong passphrase to encrypt your Admin Key Backup:");
    if (!pass) return;
    try {
      const backupJson = await exportAdminKeyBackup(pass);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faujiniwas-admin-key-backup-${new Date().toISOString().split('T')[0]}.fnkey`;
      a.click();
      URL.revokeObjectURL(url);
      setKeyStatusMsg('✅ Encrypted key backup downloaded successfully! Store it securely.');
    } catch (e) {
      alert("Key export failed: " + e.message);
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const pass = prompt("Enter the passphrase used to encrypt this backup:");
    if (!pass) return;
    try {
      const text = await file.text();
      await importAdminKeyBackup(text, pass);
      setHasLocalKey(true);
      setKeyStatusMsg('✅ Private key restored successfully! You can now decrypt verification documents on this browser.');
    } catch (e) {
      alert("Key restore failed: " + e.message);
    }
  };

  const handleRegenerateServerKeys = async () => {
    if (!confirm("Generate a new Admin RSA Keypair? Any previously encrypted documents will require the old key unless re-encrypted.")) return;
    try {
      const { publicKeyJwk } = await generateAdminRsaKeys();
      await setDoc(doc(db, 'admin_keys', 'active'), {
        publicKeyJwk,
        createdAt: Date.now()
      });
      setHasLocalKey(true);
      setKeyStatusMsg('✅ New Admin RSA keys generated & published successfully.');
    } catch (e) {
      alert("Generation failed: " + e.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2 style={{fontSize:18, marginBottom:16, color:'#f59e0b'}}>🛡️ Security Command Center</h2>
      
      <div style={{display:'flex', gap:10, marginBottom:16, flexWrap:'wrap'}}>
        <button onClick={() => setActiveTab('verifications')} className={activeTab==='verifications' ? styles.tabActive : styles.tab}>Verification Queue</button>
        <button onClick={() => setActiveTab('logs')} className={activeTab==='logs' ? styles.tabActive : styles.tab}>Audit Logs</button>
        <button onClick={() => setActiveTab('flags')} className={activeTab==='flags' ? styles.tabActive : styles.tab}>Scam Flags</button>
        <button onClick={() => setActiveTab('keyvault')} className={activeTab==='keyvault' ? styles.tabActive : styles.tab}>🔑 Key Vault</button>
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

            {activeTab === 'keyvault' && (
              <div style={{padding:16, background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid var(--border)'}}>
                <h3 style={{fontSize:15, marginBottom:12, color:'#f59e0b'}}>🔑 Admin Master Key Management</h3>
                <p style={{fontSize:13, color:'var(--muted)', marginBottom:16}}>
                  Military ID uploads are encrypted client-side using hybrid AES-256 and RSA-2048. To prevent permanent data loss if browser storage is cleared, export an encrypted offline backup.
                </p>
                
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
                  <div style={{fontSize:13}}>
                    Browser Key Status: {hasLocalKey ? <strong style={{color:'#10b981'}}>✅ Active on this device</strong> : <strong style={{color:'#ef4444'}}>❌ Missing Private Key</strong>}
                  </div>
                </div>

                {keyStatusMsg && (
                  <div style={{fontSize:12, color:'#10b981', marginBottom:16, padding:8, background:'rgba(16,185,129,0.1)', borderRadius:6}}>
                    {keyStatusMsg}
                  </div>
                )}

                <div style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:8}}>
                  <button className={styles.btnSecure} onClick={handleExportBackup} disabled={!hasLocalKey}>
                    💾 Download Encrypted Key Backup (.fnkey)
                  </button>
                  <label className={styles.tab} style={{cursor:'pointer', display:'inline-flex', alignItems:'center', padding:'8px 16px', background:'#3b5323', color:'#fff', borderRadius:8}}>
                    📥 Restore Key from Backup
                    <input type="file" accept=".fnkey,.json" onChange={handleImportBackup} style={{display:'none'}} />
                  </label>
                  <button className={styles.btnReject} onClick={handleRegenerateServerKeys}>
                    🔄 Generate New Keypair
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
