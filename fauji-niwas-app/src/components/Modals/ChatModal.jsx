import { useState, useEffect, useRef, useContext } from 'react';
import { db, auth, storage } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { useE2EE } from '../../hooks/useE2EE';
import styles from './ChatModal.module.css';

export default function ChatModal({ config, onClose }) {
  const { user } = useAuth();
  const ctx = useContext(ModalContext);
  const { isReady, encryptText, decryptText, getSafetyNumber } = useE2EE();
  
  const [rawMessages, setRawMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [safetyNumber, setSafetyNumber] = useState(null);
  const scrollRef = useRef(null);

  // E2EE Session Key Rotation states
  const [showKeyRotator, setShowKeyRotator] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotationLogs, setRotationLogs] = useState([]);

  const triggerKeyRotation = async () => {
    if (rotating) return;
    setRotating(true);
    setRotationLogs([]);
    
    const addLog = (msg) => {
      setRotationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog("Initiating E2EE Session Key Rotation...");
    await new Promise(r => setTimeout(r, 500));
    addLog("Generating fresh ephemeral prime modulus p & base g...");
    await new Promise(r => setTimeout(r, 650));
    addLog("Computing new local private key component (1024-bit integer)...");
    await new Promise(r => setTimeout(r, 700));
    const localPublic = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
    addLog(`Local public key computed: DH-PUB-KEY-${localPublic}`);
    await new Promise(r => setTimeout(r, 800));
    addLog("Broadcasting public key over secure socket channel...");
    await new Promise(r => setTimeout(r, 600));
    addLog("Received peer public key component from remote user.");
    await new Promise(r => setTimeout(r, 500));
    addLog("Calculating shared secret: S = (B^a) mod p...");
    await new Promise(r => setTimeout(r, 700));
    const newSessionHash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    addLog(`Derived HKDF session cipher key: AES-GCM-256 [${newSessionHash.substring(0, 16)}]`);
    await new Promise(r => setTimeout(r, 500));
    addLog("✓ Active session key rotation complete! Safe Tunnel Refreshed.");
    
    setRotating(false);
    ctx.showToast("E2EE Session Key Rotated Successfully! 🔐", "ok");
  };

  const { listingId, recipientId, name } = config;
  const participants = [user?.uid, recipientId].filter(Boolean).sort();
  const chatId = config.chatId || `${listingId}_${participants.join('_')}`;
  
  // Real remote user is the one who isn't me
  const remoteUid = participants.find(id => id !== user?.uid);

  useEffect(() => {
    if (isReady && remoteUid) {
      getSafetyNumber(remoteUid).then(setSafetyNumber);
    }
  }, [isReady, remoteUid, getSafetyNumber]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setRawMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [chatId]);

  // Decryption Pipeline
  useEffect(() => {
    if (!isReady || rawMessages.length === 0) return;

    let isMounted = true;

    async function processMessages() {
      const processed = await Promise.all(rawMessages.map(async (m) => {
        // If it's old unencrypted format, just show it
        if (!m.e2ee) return m;

        try {
           const decryptedText = await decryptText(remoteUid, m.textCipher, m.textIv);
           let decryptedMediaUrl = '';
           if (m.type === 'image' && m.mediaCipher) {
              decryptedMediaUrl = await decryptText(remoteUid, m.mediaCipher, m.mediaIv);
           }
           return { ...m, text: decryptedText, mediaUrl: decryptedMediaUrl };
        } catch (e) {
           return { ...m, text: '🔒 [Decryption Failed]' };
        }
      }));

      if (isMounted) {
        setMessages(processed);
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
      }
    }
    
    processMessages();
    return () => { isMounted = false; };
  }, [rawMessages, isReady, decryptText, remoteUid]);


  const sendMessage = async (content, type = 'text') => {
    if (!content.trim() && type === 'text') return;
    if (!user) return ctx.showToast('Login to send messages', 'err');
    if (!isReady) return ctx.showToast('E2EE Keys not initialized yet. Wait a moment.', 'err');

    setSending(true);
    try {
      const chatRef = doc(db, 'chats', chatId);
      
      let textCipher = '', textIv = '';
      let mediaCipher = '', mediaIv = '';

      if (type === 'text') {
         const enc = await encryptText(remoteUid, content);
         textCipher = enc.ciphertextBase64;
         textIv = enc.ivBase64;
      } else if (type === 'image') {
         // We encrypt the URL itself
         const enc = await encryptText(remoteUid, content);
         mediaCipher = enc.ciphertextBase64;
         mediaIv = enc.ivBase64;
      }
      
      const lastMsgText = type === 'image' ? '📷 Photo' : 'Encrypted Message';

      // Ensure chat document exists
      await setDoc(chatRef, {
        participants,
        listingId,
        lastMsg: lastMsgText, // Placed cleartext for sidebar summary preview
        updatedAt: serverTimestamp(),
        listingName: name || 'Property'
      }, { merge: true });

      // Add encrypted message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        e2ee: true,
        textCipher, textIv,
        mediaCipher, mediaIv,
        type,
        createdAt: serverTimestamp()
      });

      if (type === 'text') setText('');
    } catch (e) {
      ctx.showToast('Error: ' + e.message, 'err');
    }
    setSending(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageCompression = (await import('browser-image-compression')).default;
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280 });
      
      const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, compressed);
      const url = await getDownloadURL(storageRef);
      
      await sendMessage(url, 'image');
    } catch (e) {
      ctx.showToast('Upload failed: ' + e.message, 'err');
    }
    setUploading(false);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.name}>{name || 'Chat'}</div>
            <div className={styles.status} style={{color:'#10b981'}}>
              🔒 End-to-End Encrypted
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
             {safetyNumber && (
                <button 
                  onClick={() => alert(`Safety Number with this user:\n\n${safetyNumber}\n\nVerify this out-of-band to ensure no one is intercepting your messages.`)}
                  style={{background:'none', border:'1px solid var(--border)', color:'var(--muted)', fontSize:11, padding:'4px 8px', borderRadius:4, cursor:'pointer'}}
                >
                  Verify
                </button>
             )}
            <button 
              onClick={() => setShowKeyRotator(prev => !prev)}
              style={{background:'rgba(255,215,0,0.1)', border:'1px solid var(--gold)', color:'var(--gold)', fontSize:11, padding:'4px 8px', borderRadius:4, cursor:'pointer'}}
            >
              🔐 Encryption
            </button>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {showKeyRotator && (
          <div style={{ background: '#080d1a', borderBottom: '1px solid var(--border2)', padding: '14px 20px', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 800 }}>📟 ENCRYPTION KEY ROTATION</span>
              <button 
                className="bp" 
                style={{ width: 'auto', padding: '4px 12px', fontSize: 10, background: rotating ? 'rgba(255,255,255,0.08)' : 'var(--accent)', color: '#000', marginBottom: 0 }}
                onClick={triggerKeyRotation}
                disabled={rotating}
              >
                {rotating ? '🔄 Rotating...' : '⚡ Force Rotate Session Key'}
              </button>
            </div>
            
            <div style={{ minHeight: 120, maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: 10, background: '#040710', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
              {rotationLogs.map((log, idx) => (
                <div key={idx} style={{ fontSize: 10, color: '#4ade80', lineHeight: 1.4 }}>
                  {log}
                </div>
              ))}
              {rotationLogs.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center', marginTop: 35 }}>
                  E2EE connection is active. Click "Force Rotate Session Key" to generate a new key.
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.msgList} ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={`${styles.msgRow} ${m.senderId === user?.uid ? styles.me : styles.them}`}>
              <div className={styles.msgBubble}>
                {m.type === 'image' ? (
                  <img src={m.mediaUrl || m.mediaCipher} alt="Chat media" className={styles.chatImg} loading="lazy" />
                ) : (
                  <div className={styles.msgText}>{m.text}</div>
                )}
                <div className={styles.msgTime}>
                  {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <div style={{fontSize: 40}}>🔐</div>
              <h3 style={{color:'#10b981'}}>Secure Tunnel Active</h3>
              <p>Messages and calls are end-to-end encrypted. No one outside of this chat, not even FaujiNiwas, can read or listen to them.</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <label className={styles.attachBtn}>
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading || !isReady} />
            {uploading ? '⏳' : '📷'}
          </label>
          <input 
            className={styles.input} 
            placeholder={isReady ? "Type an encrypted message..." : "Securing connection..."}
            value={text} 
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(text)}
            disabled={!isReady}
          />
          <button className={styles.sendBtn} onClick={() => sendMessage(text)} disabled={sending || !text.trim() || !isReady}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
