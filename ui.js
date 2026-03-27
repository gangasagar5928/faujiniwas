import { state, FOOD_BY_CITY } from './data.js';
import { db, auth, collection, addDoc, doc, updateDoc, increment, query, where, getDocs, deleteDoc, RecaptchaVerifier, signInWithPhoneNumber, signOut } from './firebase.js';

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
    window._currentListing = r; // store for share button
    _openDetailModal(r);
};

window._openDetailModal = (r) => {
    const modal   = document.getElementById('detailModal');
    const content = document.getElementById('detail-content');
    const footer  = document.getElementById('detail-footer');

    const daysAgo   = r.createdAt ? Math.floor((Date.now() - r.createdAt) / 86400000) : 0;
    const postedTxt = daysAgo === 0 ? 'Posted today' : `Posted ${daysAgo}d ago`;

    // ── 5-6 fallback photos pool ──
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

    content.innerHTML = `
    <div class="car-wrap">
    <div class="car" onscroll="window.updateCarousel(this,${images.length})">${photosHtml}</div>
    <div class="car-badge" id="c-badge">1/${images.length} 📷</div>
    <div class="car-dots">${dotsHtml}</div>
    <button onclick="window.closeDetailModal()" style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.6);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;backdrop-filter:blur(4px);">✕</button>
    </div>
    <div style="padding:14px 16px 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
    <h2 style="font-size:20px;line-height:1.2;">${r.name}</h2>
    <h2 style="font-size:20px;color:var(--gold);white-space:nowrap;margin-left:10px;">₹${r.price.toLocaleString()}</h2>
    </div>
    <p style="color:var(--muted);font-size:13px;margin-bottom:10px;">📍 ${r.area}, ${r.city} &nbsp;·&nbsp; <span style="color:var(--muted2);font-size:12px;">${postedTxt}</span></p>
    <div class="specs">
    <div class="spc"><strong>${r.type?.toUpperCase() || '—'}</strong>Type</div>
    <div class="spc"><strong>${r.sqft || '~900'}</strong>Sq.Ft</div>
    <div class="spc"><strong>${r.furnishing || r.furnish || 'Semi'}</strong>Furnish</div>
    <div class="spc"><strong>Floor ${r.floor || 1}</strong>Level</div>
    </div>
    <div style="margin-bottom:12px;">
    <span class="tag" style="font-size:12px;padding:5px 12px;border-color:${bahColor};color:${bahColor};">${bahText}</span>
    ${r.available ? `<span class="tag" style="margin-left:6px;font-size:12px;padding:5px 12px;">📅 Available: ${r.available}</span>` : ''}
    </div>

    <!-- ✅ Nearby Food Button — always visible -->
    <button onclick="window.openFoodPanel('${r.city}')"
    style="width:100%;background:rgba(255,153,51,0.08);color:var(--accent);border:1px solid rgba(255,153,51,0.3);padding:12px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:'Outfit',sans-serif;margin-bottom:10px;transition:all 0.2s;"
    onmouseover="this.style.background='rgba(255,153,51,0.15)'"
    onmouseout="this.style.background='rgba(255,153,51,0.08)'">
    🍽️ Nearby Food & Hotels in ${r.city}
    </button>

    <!-- ✅ Share Button -->
    <button onclick="window.shareListing(window._currentListing)"
    style="width:100%;background:rgba(56,189,248,0.08);color:#38bdf8;border:1px solid rgba(56,189,248,0.25);padding:11px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;margin-bottom:10px;transition:all 0.2s;"
    onmouseover="this.style.background='rgba(56,189,248,0.15)'"
    onmouseout="this.style.background='rgba(56,189,248,0.08)'">
    🔗 Share this Listing
    </button>

    <!-- ✅ Report button — always visible -->
    <button onclick="window.openReportModal('${r.id}')"
    style="width:100%;background:transparent;border:1px solid rgba(244,63,94,0.2);color:var(--red);padding:9px;border-radius:8px;cursor:pointer;font-size:12px;font-family:'Outfit',sans-serif;margin-bottom:4px;transition:all 0.2s;"
    onmouseover="this.style.borderColor='rgba(244,63,94,0.5)'"
    onmouseout="this.style.borderColor='rgba(244,63,94,0.2)'">
    🚩 Report this Listing
    </button>
    </div>
    `;

    if (!auth.currentUser) {
        footer.innerHTML = `<button onclick="window.closeModals();window.openPostModal();" style="width:100%;background:var(--accent);color:#000;padding:14px;border:none;border-radius:8px;font-weight:800;font-size:15px;cursor:pointer;font-family:'Outfit',sans-serif;">🔒 Login to View Contact</button>
        <p style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;">OTP login — takes 30 seconds</p>`;
    } else if (r.whatsapp) {
        footer.innerHTML = `
        <a href="https://wa.me/91${r.whatsapp}?text=Hi, I saw your listing on Faujiadda — ${encodeURIComponent(r.name)}. Is it still available?" target="_blank"
        style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#000;padding:14px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;">
        💬 Chat on WhatsApp
        </a>`;
    } else {
        footer.innerHTML = `<button disabled style="width:100%;background:#333;color:#666;padding:14px;border:none;border-radius:8px;font-weight:700;font-size:15px;">Contact Unavailable</button>`;
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
    const phoneInput = document.getElementById('auth_phone').value.trim();
    if (!phoneInput) { window.showToast?.('Enter your phone number', 'err'); return; }
    const btn = document.getElementById('btn-send-otp');
    btn.textContent = 'Sending... ⏳'; btn.disabled = true;
    try {
        const result = await signInWithPhoneNumber(auth, phoneInput, window.recaptchaVerifier);
        window.confirmationResult = result;
        document.getElementById('otp-section').style.display = 'block';
        window.showToast?.('OTP sent! Check your SMS 📱', 'ok');
    } catch(e) {
        window.showToast?.(e.message, 'err');
    }
    btn.textContent = 'Resend OTP 💬'; btn.disabled = false;
};

window.verifyOTP = async () => {
    const code = document.getElementById('auth_otp').value.trim();
    if (!code) { window.showToast?.('Enter the OTP', 'err'); return; }
    try {
        const result = await window.confirmationResult.confirm(code);
        try { document.getElementById('f_phone').value = result.user.phoneNumber.replace('+91',''); } catch(e){}
        document.getElementById('step-auth').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        document.getElementById('stepper').style.display = 'flex';
        // setStep(1) defined in app.html inline script
        window.showToast?.('Verified! ✅ Fill in your listing details.', 'ok');
    } catch(e) {
        window.showToast?.('Invalid OTP. Try again.', 'err');
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
    if (!window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'normal',
                callback: () => {},
                                                             'expired-callback': () => { window.recaptchaVerifier = null; }
            });
            window.recaptchaVerifier.render();
        } catch(e) { console.warn('reCaptcha init failed:', e.message); }
    }
};
