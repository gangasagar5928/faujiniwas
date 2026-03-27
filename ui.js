import { state, FOOD_BY_CITY } from './data.js';
import { db, auth, collection, addDoc, doc, updateDoc, increment, query, where, getDocs, deleteDoc, RecaptchaVerifier, signInWithPhoneNumber, signOut } from './firebase.js';

// Expose auth to inline scripts
window._fbAuth = auth;

// ─── Image fallback ───
window.addEventListener('error', e => {
    if (e.target.tagName?.toLowerCase() === 'img') {
        const fallbacks = [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=500&q=80'
        ];
        e.target.src = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}, true);

let miniMap, miniMarker;

// ─── Food Panel ───
window.openFoodPanel = (city) => {
    window.closeFoodPanel();
    const panel = document.getElementById('foodPanel');
    const grid  = document.getElementById('foodGrid');
    const label = document.getElementById('foodCity');

    const key = Object.keys(FOOD_BY_CITY).find(k => city?.toLowerCase().includes(k.toLowerCase()));
    const opts = key ? FOOD_BY_CITY[key] : [];
    label.textContent = city || '';

    if (!opts.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;color:var(--muted);text-align:center;padding:20px 0;">No food data yet for ${city} 😔</div>`;
    } else {
        grid.innerHTML = opts.map(f => {
            const cls = f.budget === '₹' ? 'fp-lo' : f.budget === '₹₹' ? 'fp-mid' : 'fp-hi';
            return `<div class="food-card">
            <div class="fname">${f.name}</div>
            <div class="ftype">${f.type}</div>
            <span class="fprice ${cls}">${f.budget}</span>
            <div style="font-size:11px;color:var(--muted);margin-top:5px;">${f.note}</div>
            </div>`;
        }).join('');
    }
    panel.classList.add('open');
};

window.closeFoodPanel = () => document.getElementById('foodPanel').classList.remove('open');

// ─── Detail Modal ───
window.openDetailModal = (id) => {
    const r = state.listings.find(l => l.id === id);
    if (!r) return;
    window._currentListing = r;
    window._openDetailModal(r);
};

window._openDetailModal = (r) => {
    const modal   = document.getElementById('detailModal');
    const content = document.getElementById('detail-content');
    const footer  = document.getElementById('detail-footer');

    // ── Time display ──
    const daysAgo = r.createdAt ? Math.floor((Date.now() - r.createdAt) / 86400000) : null;
    let postedTxt = 'Listing date unknown';
    if (daysAgo !== null) {
        if (daysAgo === 0) postedTxt = 'Updated today';
        else if (daysAgo === 1) postedTxt = 'Updated yesterday';
        else if (daysAgo < 30) postedTxt = `Updated ${daysAgo}d ago`;
        else {
            const d = new Date(r.createdAt);
            postedTxt = `Updated ${d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}`;
        }
    }

    // Verified badge
    const verifiedBadge = r.verified
        ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(34,197,94,0.12);color:#22c55e;border:1px solid rgba(34,197,94,0.35);font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;margin-left:8px;vertical-align:middle;letter-spacing:0.03em;">✅ Verified</span>`
        : `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(244,197,66,0.1);color:#f4c542;border:1px solid rgba(244,197,66,0.3);font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;margin-left:8px;vertical-align:middle;letter-spacing:0.03em;">⏳ Pending</span>`;

    // ── Fallback photos ──
    const PHOTO_POOL = [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=600&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80',
    ];
    function getFallbackPhotos(seed) {
        const idx = Math.abs((seed || 0) % PHOTO_POOL.length);
        return Array.from({ length: 5 }, (_, i) => PHOTO_POOL[(idx + i) % PHOTO_POOL.length]);
    }
    const images = (r.mediaUrls?.length >= 3) ? r.mediaUrls : getFallbackPhotos(r.createdAt);
    const photosHtml = images.map(u => `<img src="${u}" loading="lazy">`).join('');
    const dotsHtml   = images.map((_, i) => `<div class="dot${i===0?' on':''}" id="dot-${i}"></div>`).join('');

    const bahColor = r.price <= 15000 ? '#22c55e' : r.price <= 30000 ? '#f4c542' : '#f43f5e';
    const bahText  = r.price <= 15000 ? '🟢 Within OR Limit' : r.price <= 30000 ? '🟡 Within JCO Limit' : '🔴 Officer BAH';

    // Small overlay button style (reused)
    const oBtn = `position:absolute;border:none;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:15px;transition:transform 0.18s,background 0.18s;`;

    content.innerHTML = `
    <div class="car-wrap">
      <div class="car" onscroll="window.updateCarousel(this,${images.length})">${photosHtml}</div>
      <div class="car-badge" id="c-badge">1/${images.length} 📷</div>
      <div class="car-dots">${dotsHtml}</div>

      <!-- ✕ Close — top left -->
      <button onclick="window.closeDetailModal()"
        style="${oBtn}background:rgba(0,0,0,0.6);color:#fff;top:10px;left:10px;"
        title="Close" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✕</button>

      <!-- Share — top right -->
      <button onclick="window.shareListing(window._currentListing)"
        style="${oBtn}background:rgba(56,189,248,0.75);color:#fff;top:10px;right:52px;"
        title="Share" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🔗</button>

      <!-- Report — top right -->
      <button onclick="window.openReportModal('${r.id}')"
        style="${oBtn}background:rgba(244,63,94,0.75);color:#fff;top:10px;right:10px;"
        title="Report" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🚩</button>
    </div>

    <div style="padding:14px 16px 0;">
      <!-- Name + Verified badge + Price -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
            <h2 style="font-size:19px;line-height:1.25;margin:0;">${r.name}</h2>
            ${verifiedBadge}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:20px;font-weight:800;color:var(--gold);line-height:1;">₹${r.price.toLocaleString()}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">/month</div>
        </div>
      </div>

      <!-- Location + Last Updated -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:4px;">
        <div style="color:var(--muted);font-size:13px;">📍 ${r.area}, ${r.city}</div>
        <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted2);background:var(--bg);border:1px solid var(--border);padding:3px 10px;border-radius:100px;">
          <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;flex-shrink:0;animation:livepulse 2s infinite;"></span>
          ${postedTxt}
        </div>
      </div>

      <!-- Specs grid -->
      <div class="specs">
        <div class="spc"><strong>${r.type?.toUpperCase() || '—'}</strong>Type</div>
        <div class="spc"><strong>${r.sqft || '~900'}</strong>Sq.Ft</div>
        <div class="spc"><strong>${r.furnishing || r.furnish || 'Semi'}</strong>Furnish</div>
        <div class="spc"><strong>Floor ${r.floor || 1}</strong>Level</div>
      </div>

      <!-- BAH + Available tags -->
      <div style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:6px;">
        <span class="tag" style="font-size:12px;padding:5px 12px;border-color:${bahColor};color:${bahColor};">${bahText}</span>
        ${r.available ? `<span class="tag" style="font-size:12px;padding:5px 12px;">📅 Available: ${r.available}</span>` : ''}
      </div>

      <!-- Food nearby button -->
      <button onclick="window.openFoodPanel('${r.city}')"
        style="width:100%;background:rgba(255,153,51,0.08);color:var(--accent);border:1px solid rgba(255,153,51,0.3);padding:11px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:'Outfit',sans-serif;margin-bottom:8px;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(255,153,51,0.15)'"
        onmouseout="this.style.background='rgba(255,153,51,0.08)'">
        🍽️ Nearby Food &amp; Hotels in ${r.city}
      </button>
    </div>
    `;

    // ── Footer: Contact buttons ──
    if (!auth.currentUser) {
        footer.innerHTML = `
        <button onclick="window.closeModals();window.openPostModal();"
          style="width:100%;background:var(--accent);color:#000;padding:14px;border:none;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;font-family:'Outfit',sans-serif;">
          🔒 Login to View Contact
        </button>
        <p style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;">OTP login — takes 30 seconds</p>`;
    } else if (r.whatsapp) {
        footer.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <a href="tel:+91${r.whatsapp}"
            style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:13px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;transition:background 0.2s;"
            onmouseover="this.style.background='rgba(56,189,248,0.22)'"
            onmouseout="this.style.background='rgba(56,189,248,0.12)'">
            📞 Call Owner
          </a>
          <a href="https://wa.me/91${r.whatsapp}?text=Hi%2C+I+saw+your+listing+on+Faujiadda+%E2%80%94+${encodeURIComponent(r.name)}%2E+Is+it+still+available%3F" target="_blank"
            style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#000;padding:13px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;">
            💬 WhatsApp
          </a>
        </div>`;
    } else {
        footer.innerHTML = `<button disabled style="width:100%;background:#333;color:#666;padding:14px;border:none;border-radius:10px;font-weight:700;font-size:15px;">Contact Unavailable</button>`;
    }

    modal.style.display = 'block';
};

window.closeDetailModal = () => { document.getElementById('detailModal').style.display='none'; };
window.updateCarousel = (el, total) => {
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    document.getElementById('c-badge').innerText = `${idx+1}/${total} 📷`;
    document.querySelectorAll('.dot').forEach((d,i) => d.className = 'dot' + (i===idx?' on':''));
};

// ─── Report Modal ───
window.openReportModal = (id) => {
    state.currentReportId = id;
    document.getElementById('detailModal').style.display = 'none';
    document.getElementById('reportModal').style.display = 'block';
};

window.submitReport = async () => {
    const reason = document.querySelector('input[name="rr"]:checked');
    if (!reason) { window.showToast?.('Please select a reason', 'err'); return; }
    try {
        await updateDoc(doc(db, 'rentals', state.currentReportId), { reportCount: increment(1) });
        document.getElementById('reportModal').style.display = 'none';
        window.showToast?.('Report submitted — thank you 🙏', 'ok');
    } catch(e) {
        window.showToast?.('Error: ' + e.message, 'err');
    }
};

// ─── Auth & Post Wizard ───


window.sendOTP = async () => {
    let phoneInput = document.getElementById('auth_phone').value.trim();
    if (!phoneInput) { window.showToast?.('Enter your phone number', 'err'); return; }

    // Auto-format: add +91 if bare 10-digit Indian number
    if (/^[6-9]\d{9}$/.test(phoneInput)) {
        phoneInput = '+91' + phoneInput;
        document.getElementById('auth_phone').value = phoneInput;
    } else if (/^0\d{10}$/.test(phoneInput)) {
        phoneInput = '+91' + phoneInput.slice(1);
        document.getElementById('auth_phone').value = phoneInput;
    }

    if (!/^\+[1-9]\d{9,14}$/.test(phoneInput)) {
        window.showToast?.('Enter a valid phone number (e.g. +91XXXXXXXXXX)', 'err');
        return;
    }

    // Ensure reCAPTCHA is ready
    if (!window.recaptchaVerifier) {
        window.initRecaptcha?.();
        await new Promise(r => setTimeout(r, 800));
    }
    if (!window.recaptchaVerifier) {
        window.showToast?.('reCAPTCHA not ready. Please refresh and try again.', 'err');
        return;
    }

    const btn = document.getElementById('btn-send-otp');
    btn.textContent = 'Sending... ⏳'; btn.disabled = true;
    try {
        const result = await signInWithPhoneNumber(auth, phoneInput, window.recaptchaVerifier);
        window.confirmationResult = result;
        document.getElementById('otp-section').style.display = 'block';
        document.getElementById('auth_otp').focus();
        window.showToast?.('OTP sent! Check your SMS 📱', 'ok');
        btn.textContent = 'Resend OTP 💬'; btn.disabled = false;
    } catch(e) {
        // Reset reCAPTCHA on error so user can retry
        try { window.recaptchaVerifier.clear(); } catch(_) {}
        window.recaptchaVerifier = null;
        window.initRecaptcha?.();
        window.showToast?.('Error: ' + (e.message || 'Could not send OTP'), 'err');
        btn.textContent = 'Send OTP 💬'; btn.disabled = false;
    }
};

window.verifyOTP = async () => {
    const code = document.getElementById('auth_otp').value.trim();
    if (code.length < 6) { window.showToast?.('Enter the 6-digit OTP', 'err'); return; }
    if (!window.confirmationResult) { window.showToast?.('Please send OTP first', 'err'); return; }
    const verifyBtn = document.querySelector('#otp-section .bp');
    if (verifyBtn) { verifyBtn.textContent = 'Verifying... ⏳'; verifyBtn.disabled = true; }
    try {
        const result = await window.confirmationResult.confirm(code);
        try { document.getElementById('f_phone').value = result.user.phoneNumber.replace('+91',''); } catch(e){}
        document.getElementById('step-auth').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        document.getElementById('stepper').style.display = 'flex';
        // Update stepper
        if (typeof setStep === 'function') setStep(1);
        window.showToast?.('Verified! ✅ Fill in your listing details.', 'ok');
    } catch(e) {
        window.showToast?.('Invalid OTP. Please try again.', 'err');
        if (verifyBtn) { verifyBtn.textContent = 'Verify & Continue ✅'; verifyBtn.disabled = false; }
    }
};

async function geocode(address) {
    try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data?.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch(e) {}
    return null;
}

window.goToStep2 = async () => {
    const name  = document.getElementById('f_name').value.trim();
    const area  = document.getElementById('f_area').value.trim();
    const city  = document.getElementById('f_city').value.trim();
    const price = document.getElementById('f_price').value;
    const phone = document.getElementById('f_phone').value;
    if (!name || !area || !city || !price || !phone) {
        window.showToast?.('Please fill all required fields', 'err'); return;
    }

    const btn = document.getElementById('step1NextBtn');
    btn.textContent = 'Finding location... ⏳'; btn.disabled = true;

    state.draftCoords = await geocode(`${area}, ${city}, India`)
    || await geocode(`${city}, India`)
    || { lat: 22.9074, lng: 79.1469 };

    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';

    if (!miniMap) {
        miniMap    = L.map('mini-map').setView([state.draftCoords.lat, state.draftCoords.lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(miniMap);
        miniMarker = L.marker([state.draftCoords.lat, state.draftCoords.lng], { draggable: true }).addTo(miniMap);
        miniMarker.on('dragend', () => { state.draftCoords = miniMarker.getLatLng(); });
    } else {
        miniMap.setView([state.draftCoords.lat, state.draftCoords.lng], 14);
        miniMarker.setLatLng([state.draftCoords.lat, state.draftCoords.lng]);
    }
    setTimeout(() => miniMap.invalidateSize(), 250);

    // Update stepper (defined in app.html script)
    if (typeof setStep === 'function') setStep(2); else {
        try { const sn=document.getElementById('sn1'); sn.className='sn done'; sn.textContent='✓';
            const sn2=document.getElementById('sn2'); sn2.className='sn act';
            document.getElementById('sl1').className='sl done'; } catch(e){}
    }

    btn.textContent = 'Next: Pin Location 📍'; btn.disabled = false;
};

window.submitFinalListing = async () => {
    const btn = document.getElementById('finalSubmitBtn');
    btn.textContent = 'Uploading... ⏳'; btn.disabled = true;
    try {
        const files = document.getElementById('f_media')?.files || [];
        let uploadedUrls = [];
        const cloudName = 'dyp27u9es';

        for (let i = 0; i < Math.min(files.length, 5); i++) {
            const fd = new FormData();
            fd.append('file', files[i]);
            fd.append('upload_preset', 'rentmap_uploads');
            const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method:'POST', body:fd });
            const data = await res.json();
            if (data.secure_url) uploadedUrls.push(data.secure_url);
        }

        await addDoc(collection(db, 'rentals'), {
            name:      document.getElementById('f_name').value.trim(),
                     area:      document.getElementById('f_area').value.trim(),
                     city:      document.getElementById('f_city').value.trim(),
                     price:     Number(document.getElementById('f_price').value),
                     type:      document.getElementById('f_type')?.value || 'Flat',
                     sqft:      document.getElementById('f_sqft')?.value || '',
                     furnishing:document.getElementById('f_furnish')?.value || '',
                     floor:     document.getElementById('f_floor')?.value || '',
                     whatsapp:  document.getElementById('f_phone').value.trim(),
                     available: document.getElementById('f_date')?.value || '',
                     lat:       state.draftCoords.lat,
                     lng:       state.draftCoords.lng,
                     mediaUrls: uploadedUrls,
                     verified:  false,
                     createdAt: Date.now(),
                     reportCount: 0,
                     uid: auth.currentUser?.uid || 'unknown'
        });

        window.closePostModal();
        window.showToast?.('🎉 Listing submitted! Goes live after review.', 'ok', 5000);
    } catch(e) {
        window.showToast?.('Error: ' + e.message, 'err');
    }
    btn.textContent = 'Submit for Review ✅'; btn.disabled = false;
};

// ─── Profile ───
window.openProfileModal = async () => {
    if (!auth.currentUser) {
        window.openPostModal();
        return;
    }
    document.getElementById('profileModal').style.display = 'block';
    document.getElementById('profile-details').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--card2);padding:14px;border-radius:10px;border:1px solid var(--border);">
    <div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:2px;">Logged in as</div>
    <div style="font-weight:700;">${auth.currentUser.phoneNumber}</div>
    </div>
    <button onclick="window.logoutUser()" style="background:rgba(244,63,94,.1);color:var(--red);border:1px solid rgba(244,63,94,.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Log Out</button>
    </div>`;

    const container = document.getElementById('my-listings-container');
    container.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px;">Loading... ⏳</p>`;

    try {
        const snap = await getDocs(query(collection(db,'rentals'), where('uid','==',auth.currentUser.uid)));
        if (snap.empty) {
            container.innerHTML = `<div style="text-align:center;padding:20px;">
            <div style="font-size:28px;margin-bottom:8px;">🏠</div>
            <p style="color:var(--muted);margin-bottom:12px;">No listings yet.</p>
            <button onclick="window.closeProfileModal();window.openPostModal();" style="background:var(--accent);color:#000;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">+ Post Your First Room</button>
            </div>`;
            return;
        }
        container.innerHTML = '';
        snap.forEach(s => {
            const d = s.data();
            const badge = d.verified
            ? '<span class="badge-live">✅ Live</span>'
            : '<span class="badge-pend">⏳ Pending</span>';
            const item = document.createElement('div');
            item.className = 'pli';
            item.innerHTML = `
            <div style="overflow:hidden;">
            <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.name}</strong>
            <small style="color:var(--muted);">📍 ${d.area} · ₹${d.price?.toLocaleString()}/mo</small><br>
            ${badge}
            </div>
            <button class="del-btn" onclick="window.deleteListing('${s.id}')">Delete</button>`;
            container.appendChild(item);
        });
    } catch(e) {
        container.innerHTML = `<p style="color:var(--red);">Error: ${e.message}</p>`;
    }
};

window.closeProfileModal = () => document.getElementById('profileModal').style.display='none';
window.logoutUser = () => {
    signOut(auth)
    .then(() => { window.closeProfileModal(); window.showToast?.('Logged out 👋', 'hi'); setTimeout(()=>location.reload(),1000); })
    .catch(e => window.showToast?.(e.message,'err'));
};
window.deleteListing = async (id) => {
    if (!confirm('Permanently delete this listing?')) return;
    try {
        await deleteDoc(doc(db,'rentals',id));
        window.showToast?.('Listing deleted.','ok');
        window.openProfileModal();
    } catch(e) { window.showToast?.(e.message,'err'); }
};

// ─── Share Listing ───
window.shareListing = (r) => {
    const url  = `${window.location.origin}${window.location.pathname}?listing=${r.id}`;
    const text = `Check out this ${r.type?.toUpperCase() || 'flat'} in ${r.area}, ${r.city} for ₹${r.price?.toLocaleString()}/mo on Faujiadda 🇮🇳`;
    if (navigator.share) {
        navigator.share({ title: 'Faujiadda — Defence Housing', text, url })
        .catch(() => {});
    } else {
        navigator.clipboard?.writeText(`${text}\n${url}`)
        .then(() => window.showToast?.('Link copied to clipboard! 📋', 'ok'))
        .catch(() => window.showToast?.('Share: ' + url, 'ok', 5000));
    }
};

// ─── Recaptcha init (safe) ───
window.initRecaptcha = () => {
    // Clear any broken existing verifier
    if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(_) {}
        window.recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (!container) return;
    container.innerHTML = ''; // Clear stale widget
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {},
            'expired-callback': () => {
                window.recaptchaVerifier = null;
                window.initRecaptcha();
            }
        });
        window.recaptchaVerifier.render();
    } catch(e) { console.warn('reCaptcha init failed:', e.message); }
};
