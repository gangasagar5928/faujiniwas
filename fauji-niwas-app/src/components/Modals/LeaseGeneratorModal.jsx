import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { X, FileText, Download } from 'lucide-react';

export default function LeaseGeneratorModal({ onClose }) {
  const [formData, setFormData] = useState({
    landlordName: '',
    tenantName: '',
    tenantRank: '',
    tenantServiceNo: '',
    propertyAddress: '',
    monthlyRent: '',
    securityDeposit: '',
    commencementDate: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generatePDF = () => {
    const doc = new jsPDF();
    const marginX = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RENT AGREEMENT', pageWidth / 2, cursorY, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    cursorY += 8;
    doc.text('(WITH MANDATORY MILITARY BREAK CLAUSE)', pageWidth / 2, cursorY, { align: 'center' });

    cursorY += 20;
    doc.setFontSize(12);

    const introText = `This Rent Agreement is made on this ______ day of ____________, 20____ at ${formData.propertyAddress ? formData.propertyAddress.split(',')[0] : '_______________'}, between:`;
    const splitIntro = doc.splitTextToSize(introText, pageWidth - marginX * 2);
    doc.text(splitIntro, marginX, cursorY);
    cursorY += splitIntro.length * 7;

    doc.setFont('helvetica', 'bold');
    doc.text('1. THE LANDLORD:', marginX, cursorY);
    cursorY += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${formData.landlordName || '________________________'}`, marginX + 5, cursorY);
    cursorY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('2. THE TENANT (MILITARY PERSONNEL):', marginX, cursorY);
    cursorY += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Rank & Name: ${formData.tenantRank} ${formData.tenantName}`, marginX + 5, cursorY);
    cursorY += 7;
    doc.text(`Service No: ${formData.tenantServiceNo || '__________________'}`, marginX + 5, cursorY);
    cursorY += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS:', marginX, cursorY);
    cursorY += 10;
    doc.setFont('helvetica', 'normal');

    const terms = [
      `1. The Landlord lets and the Tenant takes the premises situated at ${formData.propertyAddress || '________________________________________'} on a monthly rent of Rs. ${formData.monthlyRent || '_________'} starting from ${formData.commencementDate || '_____________'}.`,
      `2. The Tenant has paid a security deposit of Rs. ${formData.securityDeposit || '_________'} which is fully refundable at the time of vacating the premises.`,
    ];

    terms.forEach(term => {
      const splitTerm = doc.splitTextToSize(term, pageWidth - marginX * 2);
      doc.text(splitTerm, marginX, cursorY);
      cursorY += splitTerm.length * 7;
    });

    // Special Break Clause
    cursorY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0); // Highlighting break clause slightly
    doc.text('3. MILITARY BREAK CLAUSE (MANDATORY):', marginX, cursorY);
    cursorY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const breakClause = `Due to the exigencies of military service, if the Tenant receives a sudden movement order, posting order, or temporary duty (TD) exceeding 30 days, the Tenant holds the right to terminate this agreement by serving a 15-day notice, accompanied by a copy of the official movement/posting order. Upon such termination, the Landlord shall refund the security deposit in full within 7 days, after adjusting for actual unpaid utility bills or verifiable damages.`;

    const splitBreak = doc.splitTextToSize(breakClause, pageWidth - marginX * 2);
    doc.text(splitBreak, marginX, cursorY);
    cursorY += splitBreak.length * 7 + 10;

    doc.text('_________________________', marginX, cursorY);
    doc.text('_________________________', pageWidth - marginX - 50, cursorY);
    cursorY += 5;
    doc.text('Signature of Landlord', marginX, cursorY);
    doc.text('Signature of Tenant', pageWidth - marginX - 50, cursorY);

    doc.save('Military_Rent_Agreement.pdf');
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ maxWidth: 640, width: '95%', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 className="mh2" style={{ fontSize: 18 }}>Military Break Clause Generator</h2>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Generate a legally binding rent agreement PDF</p>
            </div>
          </div>
          <motion.button whileTap={{scale:0.97}} onClick={onClose} className="fluid-press" style={{ padding: 8, color: 'var(--muted)', borderRadius: '50%', cursor: 'pointer', border: 'none', background: 'none', fontSize: 20 }}>
            <X size={20} />
          </motion.button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13 }}>
          <div className="liquid-glass-chip" style={{ padding: 16, borderRadius: 12, color: 'var(--green)' }}>
            <strong>Objective:</strong> This document automatically injects the 15-day Military Break Clause into your agreement, protecting your security deposit against sudden posting orders.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Tenant Rank</label>
              <input type="text" name="tenantRank" placeholder="e.g. Capt, Subedar, Sgt" value={formData.tenantRank} onChange={handleChange} className="fi" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Tenant Name</label>
              <input type="text" name="tenantName" placeholder="Full Name" value={formData.tenantName} onChange={handleChange} className="fi" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Service Number</label>
              <input type="text" name="tenantServiceNo" placeholder="Optional" value={formData.tenantServiceNo} onChange={handleChange} className="fi" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Landlord Name</label>
              <input type="text" name="landlordName" placeholder="Full Name" value={formData.landlordName} onChange={handleChange} className="fi" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Complete Property Address</label>
              <textarea name="propertyAddress" rows="2" placeholder="House No, Street, Cantonment, City" value={formData.propertyAddress} onChange={handleChange} className="fi" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Monthly Rent (₹)</label>
              <input type="number" name="monthlyRent" placeholder="15000" value={formData.monthlyRent} onChange={handleChange} className="fi" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Security Deposit (₹)</label>
              <input type="number" name="securityDeposit" placeholder="30000" value={formData.securityDeposit} onChange={handleChange} className="fi" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>Commencement Date</label>
              <input type="date" name="commencementDate" value={formData.commencementDate} onChange={handleChange} className="fi" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border2)', display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button
            whileTap={{scale:0.97}}
            onClick={generatePDF}
            className="bp fluid-press"
          >
            <Download size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Generate PDF
          </motion.button>
        </div>
      </div>
    </div>
  );
}
