import { state, FOOD_BY_CITY } from './data.js';
import { db, auth, collection, addDoc, doc, updateDoc, increment, query, where, getDocs, deleteDoc, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from './firebase.js';
import { getAIPanelHTML, getSuggestionBadgeHTML } from './suggest.js';

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
    const panel = document.getElementById('foodPanel');
    const backdrop = document.getElementById('foodBackdrop');
    const grid = document.getElementById('foodGrid');
    const label = document.getElementById('foodCity');
    if (!panel) return;

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
            <span class="fprice ${cls}">${f.budget} — ${f.note}</span>
            </div>`;
        }).join('');
    }

    // Reset any inline transform left over from a swipe-drag close, then animate open
    panel.classList.remove('open');
    panel.style.transform = '';
    void panel.offsetHeight; // flush style so browser registers start state
    requestAnimationFrame(() => {
        panel.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
    });
};

window.closeFoodPanel = () => {
    const panel = document.getElementById('foodPanel');
    const bd = document.getElementById('foodBackdrop');
    panel.classList.remove('open');
    if (bd) bd.classList.remove('open');
    // After CSS transition ends (380 ms), wipe any inline transform from swipe-drag
    // so the next openFoodPanel() always starts from translateY(100%)
    setTimeout(() => { panel.style.transform = ''; }, 420);
};

// ─── Detail Modal ───
window.openDetailModal = (id) => {
    const r = state.listings.find(l => l.id === id);
    if (!r) return;
    // Close food panel first — they should never overlap
    if (window.closeFoodPanel) window.closeFoodPanel();
    window._currentListing = r;
    window._openDetailModal(r);
};

window._openDetailModal = (r) => {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detail-content');
    const footer = document.getElementById('detail-footer');

    // ── Time display ──
    const daysAgo = r.createdAt ? Math.floor((Date.now() - r.createdAt) / 86400000) : null;
    let postedTxt = 'Date unknown';
    let postedFull = '';
    if (daysAgo !== null) {
        const d = new Date(r.createdAt);
        postedFull = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        if (daysAgo === 0) postedTxt = 'Today';
        else if (daysAgo === 1) postedTxt = 'Yesterday';
        else if (daysAgo < 7) postedTxt = `${daysAgo} days ago`;
        else if (daysAgo < 30) postedTxt = `${Math.ceil(daysAgo / 7)}w ago`;
        else postedTxt = postedFull;
    }
    const freshness = daysAgo !== null && daysAgo <= 3
        ? `<span style="font-size:10px;font-weight:700;color:#22c55e;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);padding:2px 7px;border-radius:100px;margin-left:6px;">🔥 Fresh</span>` : '';

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
    const dotsHtml = images.map((_, i) => `<div class="dot${i === 0 ? ' on' : ''}" id="dot-${i}"></div>`).join('');

    const bahColor = r.price <= 15000 ? '#22c55e' : r.price <= 30000 ? '#f4c542' : '#f43f5e';
    const bahText = r.price <= 15000 ? '🟢 Within OR Limit' : r.price <= 30000 ? '🟡 Within JCO Limit' : '🔴 Officer BAH';

    // Small overlay button style (no backdrop-filter — causes mobile jank)
    const oBtn = `position:absolute;border:none;cursor:pointer;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:15px;transition:opacity 0.18s;`;

    content.innerHTML = `
    <div class="car-wrap">
    <div class="car" onscroll="window.updateCarousel(this,${images.length})">${photosHtml}</div>
    <div class="car-badge" id="c-badge">1/${images.length} 📷</div>
    <div class="car-dots">${dotsHtml}</div>
    <button onclick="window.closeDetailModal()"
    style="${oBtn}background:rgba(0,0,0,0.65);color:#fff;top:10px;left:10px;"
    aria-label="Close">✕</button>
    <button onclick="window.shareListing(window._currentListing)"
    style="${oBtn}background:rgba(56,189,248,0.8);color:#fff;top:10px;right:52px;"
    aria-label="Share">🔗</button>
    <button onclick="window.openReportModal('${r.id}')"
    style="${oBtn}background:rgba(244,63,94,0.8);color:#fff;top:10px;right:10px;"
    aria-label="Report">🚩</button>
    </div>

    <div style="padding:14px 16px 0;">

    <!-- ── Name + Price ── -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;">
    <div style="flex:1;min-width:0;">
    <h2 style="font-size:18px;line-height:1.25;margin:0 0 4px;">${r.name}</h2>
    <div style="color:var(--muted);font-size:12px;">📍 ${r.area}, ${r.city}</div>
    </div>
    <div style="text-align:right;flex-shrink:0;">
    <div style="font-size:22px;font-weight:800;color:var(--gold);line-height:1;">₹${r.price.toLocaleString()}</div>
    <div style="font-size:11px;color:var(--muted);margin-top:2px;">/month</div>
    </div>
    </div>

    <!-- ── Trust Strip ── -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
    ${r.verified
            ? `<div style="display:flex;align-items:center;gap:5px;"><span style="font-size:18px;">✅</span><div><div style="font-size:12px;font-weight:700;color:#22c55e;">Verified Listing</div><div style="font-size:10px;color:var(--muted);">ID-checked by Faujiadda</div></div></div>`
            : `<div style="display:flex;align-items:center;gap:5px;"><span style="font-size:18px;">⏳</span><div><div style="font-size:12px;font-weight:700;color:#f4c542;">Under Review</div><div style="font-size:10px;color:var(--muted);">Verification pending</div></div></div>`
        }
    <div style="width:1px;height:32px;background:var(--border2);flex-shrink:0;"></div>
    <div>
    <div style="font-size:11px;font-weight:700;color:var(--text);">🕒 ${postedTxt}${freshness}</div>
    <div style="font-size:10px;color:var(--muted);margin-top:1px;">${postedFull ? 'Listed ' + postedFull : 'Recently listed'}</div>
    </div>
    <div style="width:1px;height:32px;background:var(--border2);flex-shrink:0;"></div>
    <div>
    <div style="font-size:11px;font-weight:700;color:${r.ownerType==='defence'?'var(--gold)':'var(--text)'};">
    ${r.ownerType==='defence'?'🎖️ Defence Owner':r.ownerType==='civilian'?'👤 Civilian Owner':'🏢 Broker'}</div>
    <div style="font-size:10px;color:var(--muted);margin-top:1px;">${r.ownerType==='broker'?'Agent fees apply':'No broker fee'}</div>
    </div>
    </div>

    <!-- ── Specs grid ── -->
    <div class="specs" style="margin-bottom:12px;">
    <div class="spc"><strong>${r.type?.toUpperCase() || '—'}</strong>Type</div>
    <div class="spc"><strong>${r.sqft ? r.sqft + ' ft²' : '~900 ft²'}</strong>Area</div>
    <div class="spc"><strong>${r.furnishing || r.furnish || 'Semi'}</strong>Furnish</div>
    <div class="spc"><strong>Floor ${r.floor || 'G'}</strong>Level</div>
    </div>

    <!-- ── BAH + Available tags ── -->
    <div style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:6px;">
    <span class="tag" style="font-size:12px;padding:5px 12px;border-color:${bahColor};color:${bahColor};">${bahText}</span>
    ${r.term === 'short' ? `<span class="tag" style="font-size:12px;padding:5px 12px;color:#60a5fa;border-color:#60a5fa;background:rgba(96,165,250,0.1);">🧳 Short-term (TD/Course)</span>` : ''}
    ${r.available
            ? `<span class="tag" style="font-size:12px;padding:5px 12px;color:#38bdf8;border-color:#38bdf8;">📅 From ${r.available}</span>`
            : `<span class="tag" style="font-size:12px;padding:5px 12px;color:#22c55e;border-color:#22c55e;">⚡ Available Now</span>`}
        </div>

        <!-- ── AI Rent Suggestion ── -->
        <div id="ai-suggestion-panel"></div>

        <!-- ── Food nearby ── -->
        <button onclick="window.openFoodPanel('${r.city}')"
        style="width:100%;background:rgba(255,153,51,0.08);color:var(--accent);border:1px solid rgba(255,153,51,0.3);padding:10px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;margin-bottom:10px;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(255,153,51,0.15)'"
        onmouseout="this.style.background='rgba(255,153,51,0.08)'">
        🍽️ Nearby Mess &amp; Hotels in ${r.city}
        </button>

        <!-- ── Similar listings ── -->
        <div id="similar-listings-wrap"></div>
        </div>
        `;

    // ── Footer: Contact buttons ──
    const maskedNum = r.whatsapp
        ? `+91 ●●●●●● ${r.whatsapp.toString().slice(-4)}`
        : '+91 ●●●● ●●●●';
    const ownerIdLine = auth.currentUser
        ? (auth.currentUser.phoneNumber || auth.currentUser.email || 'Verified User')
        : maskedNum;
    const ownerVerifiedLine = r.verified
        ? `<span style="font-size:11px;color:#22c55e;font-weight:700;">✅ Verified Owner</span>`
        : `<span style="font-size:11px;color:#f4c542;font-weight:700;">⏳ Verification Pending</span>`;

    if (!auth.currentUser) {
        footer.innerHTML = `
            <div style="background:linear-gradient(135deg,rgba(255,153,51,0.1),rgba(255,153,51,0.04));border:1px solid rgba(255,153,51,0.3);border-radius:12px;padding:14px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:13px;">
            <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,153,51,0.15);border:2px solid rgba(255,153,51,0.35);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👤</div>
            <div>
            <div style="font-weight:800;font-size:14px;">Owner Contact Hidden</div>
            <div style="font-size:12px;color:var(--muted);margin-top:3px;">📞 ${maskedNum} &nbsp;·&nbsp; 💬 WhatsApp</div>
            <div style="margin-top:4px;">${ownerVerifiedLine}</div>
            </div>
            </div>
            <button onclick="window.closeModals();window.openPostModal();"
            style="width:100%;background:var(--accent);color:#000;padding:13px;border:none;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;font-family:'Outfit',sans-serif;transition:transform .15s;"
            onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">
            🔐 Login to Reveal Contact
            </button>
            <p style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;">Phone OTP — <b style="color:var(--accent);">30 seconds</b>, 100% free.</p>
            </div>`;
    } else if (r.whatsapp) {
        footer.innerHTML = `
            <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:${r.verified ? 'rgba(34,197,94,0.12)' : 'rgba(255,153,51,0.08)'};border:2px solid ${r.verified ? 'rgba(34,197,94,0.3)' : 'rgba(255,153,51,0.2)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">👤</div>
            <div>
            <div style="font-weight:800;font-size:13px;">Direct Owner</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">📞 +91 ${r.whatsapp}</div>
            <div style="margin-top:3px;">${ownerVerifiedLine}</div>
            </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">
            <a href="tel:+91${r.whatsapp}"
            style="display:flex;align-items:center;justify-content:center;gap:7px;background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:13px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;transition:background .2s;"
            onmouseover="this.style.background='rgba(56,189,248,0.22)'" onmouseout="this.style.background='rgba(56,189,248,0.12)'">
            📞 Call Owner
            </a>
            <button onclick="window.startChatWithOwner(window._currentListing)"
            style="display:flex;align-items:center;justify-content:center;gap:7px;background:var(--accent);color:#000;border:none;cursor:pointer;font-family:'Outfit',sans-serif;padding:13px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
            💬 Secure Chat
            </button>
            </div>
            </div>`;
    } else {
        footer.innerHTML = `
            <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;text-align:center;">
            <div style="font-size:28px;margin-bottom:6px;">📵</div>
            <div style="font-weight:700;margin-bottom:4px;">Contact Not Provided</div>
            <div style="font-size:12px;color:var(--muted);">Owner hasn't added a WhatsApp number yet.</div>
            </div>`;
    }

    // Inject AI rent panel (before display so there's no flash of empty)
    const aiPanel = document.getElementById('ai-suggestion-panel');
    if (aiPanel) aiPanel.innerHTML = getAIPanelHTML(r, state.listings);

    // Inject Similar listings
    const simWrap = document.getElementById('similar-listings-wrap');
    if (simWrap) renderSimilarListings(r, simWrap);

    modal.style.display = 'block';
    // Reset #detail-content scroll (the actual scroll container) to top
    const dc = document.getElementById('detail-content');
    if (dc) dc.scrollTop = 0;
};

window.closeDetailModal = () => { document.getElementById('detailModal').style.display = 'none'; };
window.updateCarousel = (el, total) => {
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    document.getElementById('c-badge').innerText = `${idx + 1}/${total} 📷`;
    document.querySelectorAll('.dot').forEach((d, i) => d.className = 'dot' + (i === idx ? ' on' : ''));
};

// ─── Similar Listings ───
function renderSimilarListings(current, container) {
    const PHOTO_POOL = [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=300&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&q=80',
    ];

    const similar = state.listings
        .filter(l =>
            l.id !== current.id &&
            l.city?.toLowerCase() === current.city?.toLowerCase() &&
            l.price >= current.price * 0.7 &&
            l.price <= current.price * 1.3
        )
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3);

    if (!similar.length) { container.innerHTML = ''; return; }

    container.innerHTML = `
    <div style="margin-bottom:10px;">
    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:10px;">🔁 Similar in ${current.city}</p>
    <div style="display:flex;flex-direction:column;gap:8px;">
    ${similar.map(s => {
        const thumb = s.mediaUrls?.[0] || PHOTO_POOL[Math.abs((s.createdAt || 0) % PHOTO_POOL.length)];
        const bahColor = s.price <= 15000 ? '#22c55e' : s.price <= 30000 ? '#f4c542' : '#f43f5e';
        const aiBadge = getSuggestionBadgeHTML(s, state.listings);
        return `<div onclick="window.openDetailModal('${s.id}')" style="display:flex;gap:10px;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px;cursor:pointer;transition:border-color .18s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
        <img src="${thumb}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--border);flex-shrink:0;" loading="lazy">
        <div style="flex:1;overflow:hidden;">
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">📍 ${s.area}</div>
        <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;align-items:center;">
        <span style="font-weight:800;font-size:13px;color:${bahColor};">₹${s.price.toLocaleString()}/mo</span>
        ${aiBadge}
        </div>
        </div>
        </div>`;
    }).join('')}
    </div>
    </div>`;
}

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
    } catch (e) {
        window.showToast?.('Error: ' + e.message, 'err');
    }
};

// ─── Auth & Post Wizard ───

// Helper: advance past auth step
function _onAuthSuccess(user) {
    document.getElementById('step-auth').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    document.getElementById('stepper').style.display = 'flex';
    // Pre-fill phone if available
    try {
        const phone = user.phoneNumber || '';
        document.getElementById('f_phone').value = phone.replace('+91', '');
    } catch (_) { }
    window.showToast?.('Verified! ✅ Fill in your listing details.', 'ok');
    if (typeof setStep === 'function') setStep(1);
}

// ── Tab switcher (Phone / Email) ──
window.switchAuthTab = (tab) => {
    const phoneTab = document.getElementById('auth-tab-phone');
    const emailTab = document.getElementById('auth-tab-email');
    const phonePane = document.getElementById('auth-pane-phone');
    const emailPane = document.getElementById('auth-pane-email');
    if (tab === 'phone') {
        phoneTab.classList.add('auth-tab-active');
        emailTab.classList.remove('auth-tab-active');
        phonePane.style.display = 'block';
        emailPane.style.display = 'none';
    } else {
        emailTab.classList.add('auth-tab-active');
        phoneTab.classList.remove('auth-tab-active');
        emailPane.style.display = 'block';
        phonePane.style.display = 'none';
    }
};

// ── Email mode toggle (login / register) ──
window.switchEmailMode = (mode) => {
    const loginFields = document.getElementById('email-login-fields');
    const regFields = document.getElementById('email-register-fields');
    const submitBtn = document.getElementById('btn-email-submit');
    const modeSub = document.getElementById('email-mode-sub');
    const forgotLink = document.getElementById('email-forgot-link');

    if (mode === 'login') {
        loginFields.style.display = 'block';
        regFields.style.display = 'none';
        submitBtn.textContent = '🔓 Login with Email';
        modeSub.innerHTML = `No account? <button class="auth-link" onclick="window.switchEmailMode('register')">Register free →</button>`;
        forgotLink.style.display = 'block';
    } else {
        loginFields.style.display = 'block';
        regFields.style.display = 'block';
        submitBtn.textContent = '✅ Create Account & Continue';
        modeSub.innerHTML = `Already have an account? <button class="auth-link" onclick="window.switchEmailMode('login')">Login →</button>`;
        forgotLink.style.display = 'none';
    }
    submitBtn.dataset.mode = mode;
};

// ── Email submit (login or register) ──
window.emailAuthSubmit = async () => {
    const email = document.getElementById('auth_email').value.trim();
    const pass = document.getElementById('auth_pass').value;
    const btn = document.getElementById('btn-email-submit');
    const mode = btn.dataset.mode || 'login';

    if (!email || !pass) { window.showToast?.('Enter email and password', 'err'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { window.showToast?.('Enter a valid email address', 'err'); return; }
    if (pass.length < 6) { window.showToast?.('Password must be at least 6 characters', 'err'); return; }

    if (mode === 'register') {
        const name = document.getElementById('auth_display_name')?.value.trim();
        if (!name) { window.showToast?.('Enter your name', 'err'); return; }
    }

    btn.textContent = mode === 'login' ? 'Logging in... ⏳' : 'Creating account... ⏳';
    btn.disabled = true;

    try {
        let cred;
        if (mode === 'login') {
            cred = await signInWithEmailAndPassword(auth, email, pass);
        } else {
            cred = await createUserWithEmailAndPassword(auth, email, pass);
        }
        _onAuthSuccess(cred.user);
    } catch (e) {
        const msg = {
            'auth/user-not-found': 'No account found for this email.',
            'auth/wrong-password': 'Incorrect password. Try again.',
            'auth/email-already-in-use': 'Email already registered. Choose Login.',
            'auth/weak-password': 'Password too weak (6+ chars required).',
            'auth/invalid-email': 'Invalid email address format.',
            'auth/invalid-credential': 'Wrong email or password.',
        }[e.code] || e.message;
        window.showToast?.('Error: ' + msg, 'err');
    } finally {
        btn.disabled = false;
        btn.textContent = mode === 'login' ? '🔓 Login with Email' : '✅ Create Account & Continue';
    }
};

// ── Forgot password ──
window.forgotPassword = async () => {
    const email = document.getElementById('auth_email').value.trim();
    if (!email) { window.showToast?.('Enter your email first', 'err'); return; }
    try {
        await sendPasswordResetEmail(auth, email);
        window.showToast?.('Reset link sent to ' + email + ' 📧', 'ok', 5000);
    } catch (e) {
        window.showToast?.('Error: ' + e.message, 'err');
    }
};
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
    } catch (e) {
        // Reset reCAPTCHA on error so user can retry
        try { window.recaptchaVerifier.clear(); } catch (_) { }
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
        _onAuthSuccess(result.user);
    } catch (e) {
        window.showToast?.('Invalid OTP. Please try again.', 'err');
        if (verifyBtn) { verifyBtn.textContent = 'Verify & Continue ✅'; verifyBtn.disabled = false; }
    }
};

async function geocode(address) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data?.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (e) { }
    return null;
}

window.goToStep2 = async () => {
    const name = document.getElementById('f_name').value.trim();
    const area = document.getElementById('f_area').value.trim();
    const city = document.getElementById('f_city').value.trim();
    const price = document.getElementById('f_price').value;
    const phone = document.getElementById('f_phone').value;
    if (!name || !area || !city || !price || !phone) {
        window.showToast?.('Please fill all required fields', 'err'); return;
    }

    const btn = document.getElementById('step1NextBtn');
    btn.textContent = 'Finding location... ⏳'; btn.disabled = true;

    state.draftCoords = await geocode(`${area}, ${city}, India`)
        || await geocode(`${city}, India`)
        || { lat: 22.5, lng: 82.0 };

    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';

    if (!miniMap) {
        miniMap = L.map('mini-map').setView([state.draftCoords.lat, state.draftCoords.lng], 14);
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
        try {
            const sn = document.getElementById('sn1'); sn.className = 'sn done'; sn.textContent = '✓';
            const sn2 = document.getElementById('sn2'); sn2.className = 'sn act';
            document.getElementById('sl1').className = 'sl done';
        } catch (e) { }
    }

    btn.textContent = 'Next: Pin Location 📍'; btn.disabled = false;
};

// Helper to compress images client-side before uploading
async function compressImage(file, maxWidth = 1080) {
    return new Promise((resolve) => {
        if (!file.type.match(/image.*/) || file.size < 300000) return resolve(file); // Skip small/non-images
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.75);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

window.submitFinalListing = async () => {
    const btn = document.getElementById('finalSubmitBtn');
    btn.textContent = 'Uploading... ⏳'; btn.disabled = true;
    try {
        const files = document.getElementById('f_media')?.files || [];
        let uploadedUrls = [];
        const cloudName = 'dyp27u9es';

        for (let i = 0; i < Math.min(files.length, 5); i++) {
            const compressedFile = await compressImage(files[i]);
            const fd = new FormData();
            fd.append('file', compressedFile);
            fd.append('upload_preset', 'rentmap_uploads');
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.secure_url) uploadedUrls.push(data.secure_url);
        }

        await addDoc(collection(db, 'rentals'), {
            name: document.getElementById('f_name').value.trim(),
            area: document.getElementById('f_area').value.trim(),
            city: document.getElementById('f_city').value.trim(),
            price: Number(document.getElementById('f_price').value),
            type: document.getElementById('f_type')?.value || 'Flat',
            ownerType: document.getElementById('f_owner_type')?.value || 'civilian',
            term: document.getElementById('f_lease_term')?.value || 'standard',
            sqft: document.getElementById('f_sqft')?.value || '',
            furnishing: document.getElementById('f_furnish')?.value || '',
            floor: document.getElementById('f_floor')?.value || '',
            whatsapp: document.getElementById('f_phone').value.trim(),
            available: document.getElementById('f_date')?.value || '',
            lat: state.draftCoords.lat,
            lng: state.draftCoords.lng,
            mediaUrls: uploadedUrls,
            verified: false,
            createdAt: Date.now(),
            reportCount: 0,
            uid: auth.currentUser?.uid || 'unknown'
        });

        window.closePostModal();
        window.showToast?.('🎉 Listing submitted! Goes live after review.', 'ok', 5000);
    } catch (e) {
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
    const userIdentity = auth.currentUser.phoneNumber || auth.currentUser.email || 'Unknown User';
    const userIcon = auth.currentUser.phoneNumber ? '📱' : '✉️';
    document.getElementById('profile-details').innerHTML = `
    <div style="background:var(--card2);padding:14px;border-radius:12px;border:1px solid var(--border);">
    <div style="display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:10px;">
    <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,153,51,0.12);border:2px solid rgba(255,153,51,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;">${userIcon}</div>
    <div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:2px;">Logged in as</div>
    <div style="font-weight:700;font-size:14px;">${userIdentity}</div>
    <div style="font-size:10px;color:#22c55e;margin-top:2px;">✅ Verified defence member</div>
    </div>
    </div>
    <button onclick="window.logoutUser()" style="background:rgba(244,63,94,.1);color:var(--red);border:1px solid rgba(244,63,94,.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;flex-shrink:0;">Log Out</button>
    </div>
    </div>`;

    const container = document.getElementById('my-listings-container');
    container.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px;">Loading... ⏳</p>`;

    try {
        const snap = await getDocs(query(collection(db, 'rentals'), where('uid', '==', auth.currentUser.uid)));
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
    } catch (e) {
        container.innerHTML = `<p style="color:var(--red);">Error: ${e.message}</p>`;
    }
};

window.closeProfileModal = () => document.getElementById('profileModal').style.display = 'none';
window.logoutUser = () => {
    signOut(auth)
        .then(() => { window.closeProfileModal(); window.showToast?.('Logged out 👋', 'hi'); setTimeout(() => location.reload(), 1000); })
        .catch(e => window.showToast?.(e.message, 'err'));
};
window.deleteListing = async (id) => {
    if (!confirm('Permanently delete this listing?')) return;
    try {
        await deleteDoc(doc(db, 'rentals', id));
        window.showToast?.('Listing deleted.', 'ok');
        window.openProfileModal();
    } catch (e) { window.showToast?.(e.message, 'err'); }
};

// ─── Share Listing ───
window.shareListing = (r) => {
    const url = `${window.location.origin}${window.location.pathname}?listing=${r.id}`;
    const text = `Check out this ${r.type?.toUpperCase() || 'flat'} in ${r.area}, ${r.city} for ₹${r.price?.toLocaleString()}/mo on Faujiadda 🇮🇳`;
    if (navigator.share) {
        navigator.share({ title: 'Faujiadda — Defence Housing', text, url })
            .catch(() => { });
    } else {
        navigator.clipboard?.writeText(`${text}\n${url}`)
            .then(() => window.showToast?.('Link copied to clipboard! 📋', 'ok'))
            .catch(() => window.showToast?.('Share: ' + url, 'ok', 5000));
    }
};

// ─── Recaptcha init (safe) ───
window.initRecaptcha = () => {
    if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) { }
        window.recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (!container) return;
    container.innerHTML = '';
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'normal',
            callback: () => { },
            'expired-callback': () => {
                window.recaptchaVerifier = null;
                window.initRecaptcha();
            }
        });
        window.recaptchaVerifier.render();
    } catch (e) { console.warn('reCaptcha init failed:', e.message); }
};
