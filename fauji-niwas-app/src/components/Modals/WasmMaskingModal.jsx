import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { maskDocument } from '../../security/EdgeDocumentMasker';
import { X, Upload, ShieldCheck, RefreshCw } from 'lucide-react';

export default function WasmMaskingModal({ onClose }) {
  const [originalImage, setOriginalImage] = useState(null);
  const [maskedImage, setMaskedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOriginalImage(URL.createObjectURL(file));
    setMaskedImage(null);
    setIsProcessing(true);

    try {
      const maskedBlob = await maskDocument(file);
      setMaskedImage(URL.createObjectURL(maskedBlob));
    } catch (err) {
      console.error(err);
      alert('Error masking document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ maxWidth: 800, width: '95%', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="mh2" style={{ fontSize: 20 }}>WASM Edge Document Masking</h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>DPDP Act 2023 Compliant Zero-Trust Uploads</p>
            </div>
          </div>
          <motion.button whileTap={{scale:0.97}} onClick={onClose} className="fluid-press" style={{ padding: 8, color: 'var(--muted)', borderRadius: '50%', cursor: 'pointer', border: 'none', background: 'none' }}>
            <X size={24} />
          </motion.button>
        </div>

        {/* Body */}
        <div style={{ padding: 32, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <div className="liquid-glass-chip" style={{ padding: 20, borderRadius: 14, color: 'var(--accent)', fontSize: 13, lineHeight: 1.6 }}>
            <strong>How it works:</strong> This module uses client-side WebAssembly (WASM) to run OCR and Face Detection directly in your browser. It automatically finds and redacts faces, Aadhaar numbers, PAN cards, and Military Service Numbers <em>before</em> the image is ever transmitted to Firebase Storage. The server never sees the raw PII.
          </div>

          {!originalImage ? (
            <motion.div
              whileTap={{scale:0.98}}
              onClick={() => fileInputRef.current?.click()}
              className="liquid-glass fluid-press"
              style={{ border: '2px dashed var(--border2)', borderRadius: 20, height: 256, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <div className="liquid-glass-chip" style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', marginBottom: 16 }}>
                <Upload size={28} />
              </div>
              <p style={{ fontWeight: 500, fontSize: 16, color: 'var(--text)' }}>Click to Upload ID Document</p>
              <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>JPEG, PNG, WEBP</p>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* Original Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  Original <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--red)', background: 'rgba(244,63,94,0.1)', padding: '2px 10px', borderRadius: 20 }}>Dangerous (Never Uploaded)</span>
                </h3>
                <div className="liquid-glass" style={{ borderRadius: 14, aspectRatio: '3/2', overflow: 'hidden', position: 'relative' }}>
                  <img src={originalImage} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Masked Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  Masked Output <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--green)', background: 'rgba(34,197,94,0.1)', padding: '2px 10px', borderRadius: 20 }}>Safe to Store</span>
                </h3>
                <div className="liquid-glass" style={{ borderRadius: 14, aspectRatio: '3/2', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {isProcessing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent)', gap: 12 }}>
                      <RefreshCw size={32} className="animate-spin" />
                      <p style={{ fontSize: 13, fontWeight: 500 }}>Running Neural Engine in Browser...</p>
                    </div>
                  ) : maskedImage ? (
                    <img src={maskedImage} alt="Masked" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

          {originalImage && !isProcessing && (
             <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
               <motion.button
                 whileTap={{scale:0.97}}
                 onClick={() => { setOriginalImage(null); setMaskedImage(null); }}
                 className="fluid-press"
                 style={{ color: 'var(--muted)', textDecoration: 'underline', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none' }}
               >
                 Try another document
               </motion.button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
