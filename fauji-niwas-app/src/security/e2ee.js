/**
 * E2EE Core — Elliptic Curve Diffie-Hellman (ECDH) + AES-GCM
 * Follows Web Crypto API standard. No external dependencies.
 */

const CURVE_NAME = 'P-256';

/**
 * 1. Generates an ECDH key pair for the current user.
 * Returns { publicKey, privateKey }.
 */
export async function generateE2EEKeyPair() {
  return await window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: CURVE_NAME },
    true, // Extractable so we can store it in IndexedDB/Firestore
    ['deriveKey', 'deriveBits']
  );
}

/**
 * Exports a public key to raw bytes (ArrayBuffer) for saving to Firestore.
 */
export async function exportPublicKeyRaw(publicKey) {
  return await window.crypto.subtle.exportKey('raw', publicKey);
}

/**
 * Imports a raw byte public key (from Firestore) back into a CryptoKey.
 */
export async function importPublicKeyRaw(rawBytes) {
  return await window.crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'ECDH', namedCurve: CURVE_NAME },
    true,
    []
  );
}

/**
 * 2. Derives an AES-GCM shared key using ECDH.
 * Takes the local user's private key and the remote user's public key.
 */
export async function deriveSharedAesKey(localPrivateKey, remotePublicKey) {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: remotePublicKey
    },
    localPrivateKey,
    { name: 'AES-GCM', length: 256 },
    true, // Extractable false in prod, true here just in case debugging
    ['encrypt', 'decrypt']
  );
}

/**
 * 3. Encrypts a plaintext message string.
 * Returns { ciphertextBuffer, iv }
 */
export async function encryptMessage(aesKey, plaintextStr) {
  const enc = new TextEncoder();
  const encodedPlaintext = enc.encode(plaintextStr);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedPlaintext
  );
  
  return { ciphertextBuffer, iv };
}

/**
 * 4. Decrypts a ciphertext buffer back into a plaintext string.
 */
export async function decryptMessage(aesKey, ciphertextBuffer, iv) {
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ciphertextBuffer
    );
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (e) {
    console.error("[E2EE] Decryption failed. Corrupt payload or wrong key.", e);
    return "[Encrypted message unreadable]";
  }
}

/**
 * 5. Calculates a Safety Number (hash of both public keys) for manual verification.
 * Standardizes to {aliceRawKey + bobRawKey} ordered lexicographically so both parties see the same hash.
 */
export async function calculateSafetyNumber(pubKey1Raw, pubKey2Raw) {
  const arr1 = Array.from(new Uint8Array(pubKey1Raw)).map(b => b.toString(16).padStart(2,'0')).join('');
  const arr2 = Array.from(new Uint8Array(pubKey2Raw)).map(b => b.toString(16).padStart(2,'0')).join('');
  
  const combined = [arr1, arr2].sort().join('');
  const enc = new TextEncoder().encode(combined);
  
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return a formatted blocks version: 4 segments
  const displaySafe = (hexHash.substring(0, 20).match(/.{1,5}/g) || []).join(' ');
  return displaySafe.toUpperCase();
}
