/**
 * Document Encryption (AES-GCM 256)
 * Encrypts military ID photos client-side BEFORE uploading to Firebase Storage.
 */

/**
 * Generates an AES-GCM 256-bit key.
 */
export async function generateAesKey() {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable (so we can save it to Firestore)
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an ArrayBuffer (or File bytes) using AES-GCM.
 * Returns { ciphertext, iv, hexKey }.
 */
export async function encryptFileBytes(fileBytes) {
  const key = await generateAesKey();
  
  // Initialization Vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBytes
  );
  
  // Export the key as raw hex to save to DB separately
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  const hexKey = Array.from(new Uint8Array(rawKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    ciphertext: new Blob([ciphertextBuffer]),
    ivHex,
    hexKey // WARNING: Must be stored in a secured Firestore location, not public!
  };
}

/**
 * Decrypts an encrypted file Blob back into an Image Blob.
 */
export async function decryptFileBytes(ciphertextBlob, hexKey, ivHex, mimeType = 'image/webp') {
  const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const ciphertextBuffer = await ciphertextBlob.arrayBuffer();
  
  const plaintextBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertextBuffer
  );
  
  return new Blob([plaintextBuffer], { type: mimeType });
}
