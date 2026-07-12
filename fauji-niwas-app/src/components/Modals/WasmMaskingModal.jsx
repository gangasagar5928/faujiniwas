import React, { useState, useRef } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#13161c] border border-[#232833] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#232833] bg-[#0d0f12]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">WASM Edge Document Masking</h2>
              <p className="text-sm text-[#8892a4]">DPDP Act 2023 Compliant Zero-Trust Uploads</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#8892a4] hover:text-white rounded-full hover:bg-white/5 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
          
          <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 p-5 rounded-2xl text-[#00D4FF] text-sm leading-relaxed">
            <strong>How it works:</strong> This module uses client-side WebAssembly (WASM) to run OCR and Face Detection directly in your browser. It automatically finds and redacts faces, Aadhaar numbers, PAN cards, and Military Service Numbers <em>before</em> the image is ever transmitted to Firebase Storage. The server never sees the raw PII.
          </div>

          {!originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2d3646] hover:border-[#00D4FF] rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0d0f12] group"
            >
              <div className="w-16 h-16 rounded-full bg-[#171c24] flex items-center justify-center text-[#8892a4] group-hover:text-[#00D4FF] group-hover:bg-[#00D4FF]/10 transition-colors mb-4">
                <Upload size={28} />
              </div>
              <p className="text-white font-medium text-lg">Click to Upload ID Document</p>
              <p className="text-[#8892a4] mt-2">JPEG, PNG, WEBP</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Preview */}
              <div className="flex flex-col gap-3">
                <h3 className="text-white font-bold flex items-center gap-2">Original <span className="text-xs font-normal text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">Dangerous (Never Uploaded)</span></h3>
                <div className="bg-[#0d0f12] border border-[#2d3646] rounded-2xl aspect-[3/2] overflow-hidden relative">
                  <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Masked Preview */}
              <div className="flex flex-col gap-3">
                <h3 className="text-white font-bold flex items-center gap-2">Masked Output <span className="text-xs font-normal text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Safe to Store</span></h3>
                <div className="bg-[#0d0f12] border border-[#2d3646] rounded-2xl aspect-[3/2] overflow-hidden flex items-center justify-center relative">
                  {isProcessing ? (
                    <div className="flex flex-col items-center text-[#00D4FF] gap-3">
                      <RefreshCw size={32} className="animate-spin" />
                      <p className="text-sm font-medium animate-pulse">Running Neural Engine in Browser...</p>
                    </div>
                  ) : maskedImage ? (
                    <img src={maskedImage} alt="Masked" className="w-full h-full object-contain" />
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          {originalImage && !isProcessing && (
             <div className="flex justify-center mt-4">
               <button 
                 onClick={() => { setOriginalImage(null); setMaskedImage(null); }}
                 className="text-[#8892a4] hover:text-white underline text-sm"
               >
                 Try another document
               </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
