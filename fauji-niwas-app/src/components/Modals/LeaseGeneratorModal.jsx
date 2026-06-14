import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#171c24] border border-[#2d3646] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3646] bg-[#13161c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Military Break Clause Generator</h2>
              <p className="text-xs text-[#8892a4]">Generate a legally binding rent agreement PDF</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#8892a4] hover:text-white rounded-full hover:bg-white/5 transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-sm">
          <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-4 rounded-xl text-[#22c55e]">
            <strong>Objective:</strong> This document automatically injects the 15-day Military Break Clause into your agreement, protecting your security deposit against sudden posting orders.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Tenant Rank</label>
              <input type="text" name="tenantRank" placeholder="e.g. Capt, Subedar, Sgt" value={formData.tenantRank} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Tenant Name</label>
              <input type="text" name="tenantName" placeholder="Full Name" value={formData.tenantName} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Service Number</label>
              <input type="text" name="tenantServiceNo" placeholder="Optional" value={formData.tenantServiceNo} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Landlord Name</label>
              <input type="text" name="landlordName" placeholder="Full Name" value={formData.landlordName} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[#8892a4] mb-1 font-medium">Complete Property Address</label>
              <textarea name="propertyAddress" rows="2" placeholder="House No, Street, Cantonment, City" value={formData.propertyAddress} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Monthly Rent (₹)</label>
              <input type="number" name="monthlyRent" placeholder="15000" value={formData.monthlyRent} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Security Deposit (₹)</label>
              <input type="number" name="securityDeposit" placeholder="30000" value={formData.securityDeposit} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-[#8892a4] mb-1 font-medium">Commencement Date</label>
              <input type="date" name="commencementDate" value={formData.commencementDate} onChange={handleChange} className="w-full bg-[#0d0f12] border border-[#2d3646] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] [color-scheme:dark]" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d3646] bg-[#13161c] flex justify-end">
          <button 
            onClick={generatePDF}
            className="bg-gradient-to-r from-[#00D4FF] to-[#7c3aed] text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:opacity-90 transition shadow-[0_0_15px_rgba(0,212,255,0.3)]"
          >
            <Download size={18} />
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
