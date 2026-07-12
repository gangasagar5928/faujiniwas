import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { getPrivateKey, storePrivateKey, getPublicKey, storePublicKey } from '../security/keyStore';
import { generateE2EEKeyPair, exportPublicKeyRaw, importPublicKeyRaw, deriveSharedAesKey, encryptMessage, decryptMessage, calculateSafetyNumber } from '../security/e2ee';

/**
 * useE2EE Hook
 * Handles auto-generation of keys for new devices, fetching remote public keys,
 * determining shared AES keys, and surfacing encrypt/decrypt functions.
 */
export function useE2EE() {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [localKeys, setLocalKeys] = useState(null);
  
  // Cache of derived AES keys per remote UID
  const [sharedKeyCache, setSharedKeyCache] = useState({});

  // 1. Initialize local keys on mount
  useEffect(() => {
    if (!user) {
      setLocalKeys(null);
      setIsReady(false);
      return;
    }

    async function initKeys() {
      try {
        let privKey = await getPrivateKey(user.uid);
        let pubKey = await getPublicKey(user.uid);

        if (!privKey || !pubKey) {
          console.log('[E2EE] Generating new key pair for device...');
          const keys = await generateE2EEKeyPair();
          privKey = keys.privateKey;
          pubKey = keys.publicKey;
          
          await storePrivateKey(user.uid, privKey);
          await storePublicKey(user.uid, pubKey);

          // Upload public key to Firestore for others to find
          const rawPub = await exportPublicKeyRaw(pubKey);
          // Convert to Base64 to store in Firestore simply
          const b64Pub = btoa(String.fromCharCode(...new Uint8Array(rawPub)));
          
          await setDoc(doc(db, 'public_keys', user.uid), {
            keyBase64: b64Pub,
            updatedAt: Date.now()
          }, { merge: true });
        }

        setLocalKeys({ privateKey: privKey, publicKey: pubKey });
        setIsReady(true);
      } catch (e) {
        console.error('[E2EE] Init failed:', e);
      }
    }

    initKeys();
  }, [user]);

  // 2. Fetch Remote Public Key & Derive Shared Key
  const getSharedKey = useCallback(async (remoteUid) => {
    if (sharedKeyCache[remoteUid]) return sharedKeyCache[remoteUid];
    if (!localKeys?.privateKey) throw new Error("Local E2EE not ready");

    // Fetch remote public key from Firestore
    const snap = await getDoc(doc(db, 'public_keys', remoteUid));
    if (!snap.exists()) {
       throw new Error(`Remote user ${remoteUid} has not initialized E2EE yet.`);
    }

    const b64 = snap.data().keyBase64;
    const rawBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
    
    const remotePubKey = await importPublicKeyRaw(rawBytes);
    
    const aesKey = await deriveSharedAesKey(localKeys.privateKey, remotePubKey);
    
    // Cache it
    setSharedKeyCache(prev => ({ ...prev, [remoteUid]: aesKey }));
    
    return aesKey;
  }, [localKeys, sharedKeyCache]);

  // 3. Encrypt for remote user
  const encryptText = useCallback(async (remoteUid, text) => {
    const aesKey = await getSharedKey(remoteUid);
    const { ciphertextBuffer, iv } = await encryptMessage(aesKey, text);
    
    return {
      ciphertextBase64: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
      ivBase64: btoa(String.fromCharCode(...new Uint8Array(iv)))
    };
  }, [getSharedKey]);

  // 4. Decrypt from remote user
  const decryptText = useCallback(async (remoteUid, ciphertextBase64, ivBase64) => {
    const aesKey = await getSharedKey(remoteUid);
    
    const ciphertextBuf = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0)).buffer;
    const ivBuf = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    
    return await decryptMessage(aesKey, ciphertextBuf, ivBuf);
  }, [getSharedKey]);

  // 5. Generate Safety Number
  const getSafetyNumber = useCallback(async (remoteUid) => {
    if (!localKeys?.publicKey) return null;
    try {
      const snap = await getDoc(doc(db, 'public_keys', remoteUid));
      if (!snap.exists()) return null;

      const remoteB64 = snap.data().keyBase64;
      const remoteRaw = Uint8Array.from(atob(remoteB64), c => c.charCodeAt(0)).buffer;
      const localRaw = await exportPublicKeyRaw(localKeys.publicKey);
      
      return await calculateSafetyNumber(localRaw, remoteRaw);
    } catch(e) {
      console.warn("Could not calculate safety number", e);
      return null;
    }
  }, [localKeys]);

  return {
    isReady,
    encryptText,
    decryptText,
    getSafetyNumber
  };
}
