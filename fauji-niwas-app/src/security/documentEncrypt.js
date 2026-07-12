/**
 * Document Encryption (Hybrid AES-GCM & RSA-OAEP)
 * Encrypts military ID photos client-side. The AES key is wrapped with the Admin's RSA Public Key.
 */

const DB_NAME = 'FaujiNiwasCryptoDB';
const STORE_NAME = 'AdminKeys';

export function openKeyDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function storePrivateKey(privateKey) {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(privateKey, 'adminPrivateKey');
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getPrivateKey() {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('adminPrivateKey');
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * 1. Admin Setup: Generate and Publish RSA Keys
 */
export async function generateAdminRsaKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    false, // Private key is NOT extractable
    ["wrapKey", "unwrapKey"]
  );

  // Export the Public Key to store in Firestore (e.g., /admin_keys/active)
  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  
  // Save keyPair.privateKey to the Admin's local IndexedDB securely
  await storePrivateKey(keyPair.privateKey);
  
  return { publicKeyJwk, privateKey: keyPair.privateKey };
}

/**
 * 2. User Upload: Encrypting the File and Wrapping the Key
 */
export async function encryptFileForAdmin(fileBytes, adminPublicKeyJwk) {
  // 1. Import the Admin's Public Key from Firestore
  const adminPublicKey = await window.crypto.subtle.importKey(
    "jwk",
    adminPublicKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["wrapKey"]
  );

  // 2. Generate an ephemeral AES-GCM key for this specific file
  const aesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // Must be extractable to be wrapped
    ['encrypt', 'decrypt']
  );

  // 3. Encrypt the file data
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    fileBytes
  );

  // 4. WRAP THE KEY: Encrypt the AES key using the Admin's RSA Public Key
  const wrappedKeyBuffer = await window.crypto.subtle.wrapKey(
    "raw",
    aesKey,
    adminPublicKey,
    { name: "RSA-OAEP" }
  );

  // Convert buffers to hex for Firestore storage
  const bufferToHex = (buffer) => Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    ciphertextBlob: new Blob([ciphertextBuffer]),
    ivHex: bufferToHex(iv),
    wrappedKeyHex: bufferToHex(wrappedKeyBuffer) // This goes to Firestore /verifications
  };
}

/**
 * 3. Admin Decryption: Unwrapping the Key and Viewing the File
 */
export async function decryptUserFile(ciphertextBlob, wrappedKeyHex, ivHex, adminPrivateKey) {
  // Helper to convert Hex back to ArrayBuffer
  const hexToBuffer = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;
  
  const wrappedKeyBuffer = hexToBuffer(wrappedKeyHex);
  const iv = new Uint8Array(hexToBuffer(ivHex));

  // 1. UNWRAP THE KEY: Use Admin's Private Key to unlock the AES Key
  const aesKey = await window.crypto.subtle.unwrapKey(
    "raw",
    wrappedKeyBuffer,
    adminPrivateKey,
    { name: "RSA-OAEP" },
    { name: "AES-GCM", length: 256 },
    false, // The unwrapped AES key remains non-extractable
    ["decrypt"]
  );

  // 2. Decrypt the file using the unwrapped AES key
  const ciphertextBuffer = await ciphertextBlob.arrayBuffer();
  const plaintextBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ciphertextBuffer
  );

  // 3. Return the usable image Blob
  return new Blob([plaintextBuffer], { type: 'image/webp' });
}

// Keep backward compatibility wrappers if needed
export async function encryptFileBytes(fileBytes, adminPublicKeyJwk) {
  const result = await encryptFileForAdmin(fileBytes, adminPublicKeyJwk);
  return {
    ciphertext: result.ciphertextBlob,
    ivHex: result.ivHex,
    hexKey: result.wrappedKeyHex
  };
}

export async function decryptFileBytes(ciphertextBlob, wrappedKeyHex, ivHex, adminPrivateKey) {
  return await decryptUserFile(ciphertextBlob, wrappedKeyHex, ivHex, adminPrivateKey);
}
