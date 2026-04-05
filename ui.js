import { state, FOOD_BY_CITY, ARMY_SCHOOLS, CAB_ROUTES } from './data.js';
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
        style="width:100%;background:rgba(255,153,51,0.08);color:var(--accent);border:1px solid rgba(255,153,51,0.3);padding:10px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;margin-bottom:8px;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(255,153,51,0.15)'"
        onmouseout="this.style.background='rgba(255,153,51,0.08)'">
        🍽️ Nearby Mess &amp; Hotels in ${r.city}
        </button>

        <!-- ── School Proximity ── -->
        <button onclick="window.openSchoolProximity('${r.city}',${r.lat||0},${r.lng||0})"
        style="width:100%;background:rgba(34,197,94,0.07);color:#22c55e;border:1px solid rgba(34,197,94,0.3);padding:10px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;margin-bottom:8px;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(34,197,94,0.15)'"
        onmouseout="this.style.background='rgba(34,197,94,0.07)'">
        🏫 KV / Army School Distances
        </button>

        <!-- ── Owner Rating + Rent Agreement ── -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <button onclick="window.openOwnerRating('${r.id}','${(r.name||'').replace(/'/g,"\'")}')"
        style="background:rgba(251,191,36,0.08);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);padding:10px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(251,191,36,0.18)'"
        onmouseout="this.style.background='rgba(251,191,36,0.08)'">
        ⭐ Rate Owner
        </button>
        <button onclick="window.openRentAgreement('${r.id}')"
        style="background:rgba(96,165,250,0.08);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);padding:10px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(96,165,250,0.18)'"
        onmouseout="this.style.background='rgba(96,165,250,0.08)'">
        📄 Rent Agreement
        </button>
        </div>

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
        const isSaved = window._isListingSaved ? window._isListingSaved(r.id) : false;
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
            <div style="display:grid;grid-template-columns:1fr 1fr 46px;gap:9px;align-items:stretch;">
            <a href="tel:+91${r.whatsapp}"
            onclick="window._trackContactedListing && window._trackContactedListing(window._currentListing)"
            style="display:flex;align-items:center;justify-content:center;gap:7px;background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:13px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;transition:background .2s;"
            onmouseover="this.style.background='rgba(56,189,248,0.22)'" onmouseout="this.style.background='rgba(56,189,248,0.12)'">
            📞 Call Owner
            </a>
            <button onclick="window._trackContactedListing && window._trackContactedListing(window._currentListing); window.startChatWithOwner(window._currentListing)"
            style="display:flex;align-items:center;justify-content:center;gap:7px;background:var(--accent);color:#000;border:none;cursor:pointer;font-family:'Outfit',sans-serif;padding:13px;border-radius:10px;font-weight:800;font-size:14px;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
            💬 Secure Chat
            </button>
            <button id="save-btn-${r.id}" onclick="window._doSaveToggle(this,'${r.id}')"
            title="${isSaved ? 'Remove from Saved' : 'Save Listing'}"
            style="display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:10px;border:1px solid var(--border2);background:var(--card2);cursor:pointer;transition:all 0.2s;">${isSaved ? '🔖' : '🏷️'}</button>
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
    // Use window.setStep — plain `setStep` is invisible inside ES module scope
    if (typeof window.setStep === 'function') window.setStep(1);
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

window._listingType = 'rental';
window.setListingType = (type) => {
    window._listingType = type;
    document.getElementById('post-type-rental').classList.toggle('auth-tab-active', type === 'rental');
    document.getElementById('post-type-market').classList.toggle('auth-tab-active', type === 'market');
    document.getElementById('rental-fields').style.display = type === 'rental' ? 'block' : 'none';
    document.getElementById('market-fields').style.display = type === 'market' ? 'block' : 'none';
};

window.goToStep2 = async () => {
    const area = document.getElementById('f_area').value.trim();
    const city = document.getElementById('f_city').value.trim();
    const phone = document.getElementById('f_phone').value;
    
    if (window._listingType === 'rental') {
        const name = document.getElementById('f_name').value.trim();
        const price = document.getElementById('f_price').value;
        if (!name || !area || !city || !price || !phone) {
            window.showToast?.('Please fill all required fields', 'err'); return;
        }
    } else {
        const title = document.getElementById('m_title').value.trim();
        const price = document.getElementById('m_price').value;
        if (!title || !area || !city || !price || !phone) {
            window.showToast?.('Please fill all required fields', 'err'); return;
        }
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

    // Update stepper
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

        if (window._listingType === 'rental') {
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
        } else {
            await addDoc(collection(db, 'marketplace'), {
                title: document.getElementById('m_title').value.trim(),
                area: document.getElementById('f_area').value.trim(),
                city: document.getElementById('f_city').value.trim(),
                price: Number(document.getElementById('m_price').value),
                category: document.getElementById('m_category')?.value || 'Vehicles',
                description: document.getElementById('m_desc').value.trim(),
                whatsapp: document.getElementById('f_phone').value.trim(),
                lat: state.draftCoords.lat,
                lng: state.draftCoords.lng,
                mediaUrls: uploadedUrls,
                verified: false,
                createdAt: Date.now(),
                uid: auth.currentUser?.uid || 'unknown'
            });
        }

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
        // Not logged in → show login/post modal
        window.openPostModal();
        return;
    }
    document.getElementById('profileModal').style.display = 'block';
    // Always open on "My Listings" tab
    window.switchProfileTab('listings');

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
    // switchProfileTab('listings') above already triggers _loadMyListings — no double-call needed
};

// ─── Profile Tab Switcher ───
window.switchProfileTab = (tab) => {
    const tabs = ['listings', 'contacted', 'saved'];
    tabs.forEach(t => {
        const btn = document.getElementById('ptab-' + t);
        const pane = document.getElementById('profile-pane-' + t);
        if (btn) btn.classList.toggle('auth-tab-active', t === tab);
        if (pane) pane.style.display = t === tab ? 'block' : 'none';
    });
    if (tab === 'listings') window._loadMyListings?.();
    if (tab === 'contacted') window._renderContactedListings?.();
    if (tab === 'saved') window._renderSavedListings?.();
};

// ─── My Listings loader (extracted so tab can call it) ───
window._loadMyListings = async () => {
    const container = document.getElementById('my-listings-container');
    if (!container) return;
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

// ─── Contacted Properties (localStorage-backed) ───
window._trackContactedListing = (listing) => {
    try {
        const key = 'fauji_contacted';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const already = existing.find(l => l.id === listing.id);
        if (!already) {
            existing.unshift({ id: listing.id, name: listing.name, city: listing.city, area: listing.area, price: listing.price, contactedAt: Date.now() });
            localStorage.setItem(key, JSON.stringify(existing.slice(0, 30))); // keep last 30
        }
    } catch (_) {}
};

window._renderContactedListings = () => {
    const container = document.getElementById('contacted-listings-container');
    if (!container) return;
    try {
        const items = JSON.parse(localStorage.getItem('fauji_contacted') || '[]');
        if (!items.length) {
            container.innerHTML = `
            <div style="text-align:center;padding:30px 16px;">
                <div style="font-size:32px;margin-bottom:10px;">📞</div>
                <p style="color:var(--muted);font-size:14px;">No contacted properties yet.<br>Open a listing and tap Call or Chat to track it here.</p>
            </div>`;
            return;
        }
        container.innerHTML = items.map(l => {
            const date = new Date(l.contactedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
            return `
            <div class="pli" onclick="window.openDetailModal('${l.id}')" style="cursor:pointer;">
                <div style="overflow:hidden;flex:1;">
                    <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px;">${l.name}</strong>
                    <small style="color:var(--muted);">📍 ${l.area}, ${l.city} · ₹${(l.price||0).toLocaleString()}/mo</small><br>
                    <span style="font-size:11px;color:var(--muted);">📞 Contacted on ${date}</span>
                </div>
                <span style="color:var(--accent);font-size:18px;flex-shrink:0;">›</span>
            </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = `<p style="color:var(--red);">Error loading history.</p>`;
    }
};

// ─── Saved / Bookmarked Properties (localStorage-backed) ───
window._toggleSaveListing = (listing) => {
    try {
        const key = 'fauji_saved';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = existing.findIndex(l => l.id === listing.id);
        if (idx !== -1) {
            existing.splice(idx, 1);
            window.showToast?.('Removed from saved 🔖', 'hi');
        } else {
            existing.unshift({ id: listing.id, name: listing.name, city: listing.city, area: listing.area, price: listing.price, savedAt: Date.now() });
            window.showToast?.('Saved! 🔖 Find it in your profile.', 'ok');
        }
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
        return idx === -1; // true = just saved, false = unsaved
    } catch (_) { return false; }
};

window._isListingSaved = (id) => {
    try {
        const items = JSON.parse(localStorage.getItem('fauji_saved') || '[]');
        return items.some(l => l.id === id);
    } catch (_) { return false; }
};

window._renderSavedListings = () => {
    const container = document.getElementById('saved-listings-container');
    if (!container) return;
    try {
        const items = JSON.parse(localStorage.getItem('fauji_saved') || '[]');
        if (!items.length) {
            container.innerHTML = `
            <div style="text-align:center;padding:30px 16px;">
                <div style="font-size:32px;margin-bottom:10px;">🔖</div>
                <p style="color:var(--muted);font-size:14px;">No saved properties yet.<br>Tap the bookmark button on any listing to save it here.</p>
            </div>`;
            return;
        }
        container.innerHTML = items.map(l => {
            const date = new Date(l.savedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
            return `
            <div class="pli" onclick="window.openDetailModal('${l.id}')" style="cursor:pointer;">
                <div style="overflow:hidden;flex:1;">
                    <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px;">${l.name}</strong>
                    <small style="color:var(--muted);">📍 ${l.area}, ${l.city} · ₹${(l.price||0).toLocaleString()}/mo</small><br>
                    <span style="font-size:11px;color:var(--muted);">🔖 Saved on ${date}</span>
                </div>
                <button onclick="event.stopPropagation();window._toggleSaveListing({id:'${l.id}',name:'${(l.name||'').replace(/'/g,'')}',city:'${l.city||''}',area:'${l.area||''}',price:${l.price||0}});window._renderSavedListings();"
                  style="background:rgba(244,63,94,.1);color:var(--red);border:1px solid rgba(244,63,94,.3);padding:6px 10px;border-radius:8px;cursor:pointer;font-size:11px;flex-shrink:0;">Remove</button>
            </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = `<p style="color:var(--red);">Error loading saved properties.</p>`;
    }
};


// _doSaveToggle: called by the 🏷️/🔖 button in the listing detail footer
window._doSaveToggle = (btn, id) => {
    const listing = window._currentListing;
    if (!listing) return;
    const justSaved = window._toggleSaveListing(listing);
    if (btn) {
        btn.textContent = justSaved ? '🔖' : '🏷️';
        btn.title = justSaved ? 'Remove from Saved' : 'Save Listing';
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
            size: 'invisible',
            callback: () => { },
            'expired-callback': () => {
                window.recaptchaVerifier = null;
                window.initRecaptcha();
            }
        });
        window.recaptchaVerifier.render();
    } catch (e) { console.warn('reCaptcha init failed:', e.message); }
};

// ═══════════════════════════════════════════════════
// ─── NEW FEATURES ───────────────────────────────────
// ═══════════════════════════════════════════════════

// ── Helper: open / close feature modals ──
window.openFeatureModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('open'));
};
window.closeFeatureModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    setTimeout(() => { el.style.display = 'none'; }, 380);
};

// ── haversine distance km ──
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

// ─────────────────────────────────────────────
// 1. TRANSFER SEASON ALERT
// ─────────────────────────────────────────────
window.openTransferAlert = (city) => {
    const body = document.getElementById('transfer-alert-body');
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const isTransferSeason = month >= 5 && month <= 7;
    const daysToJune = Math.max(0, Math.ceil((new Date(now.getFullYear(), 5, 1) - now) / 86400000));

    const cityArg = city || (window._currentListing?.city) || '';

    // Count listings posted in last 30 days
    const recentCount = state.listings.filter(l => {
        const age = (Date.now() - l.createdAt) / (1000 * 60 * 60 * 24);
        const cityMatch = !cityArg || l.city?.toLowerCase().includes(cityArg.toLowerCase());
        return age <= 30 && cityMatch;
    }).length;

    const cityLabel = cityArg || 'your city';

    body.innerHTML = `
    <div style="margin-bottom:16px;">
        ${isTransferSeason
            ? `<div style="background:linear-gradient(135deg,rgba(244,63,94,0.15),rgba(255,153,51,0.1));border:1px solid rgba(244,63,94,0.4);border-radius:12px;padding:14px;margin-bottom:14px;">
                <div style="font-size:22px;margin-bottom:6px;">🔴 Transfer Season is LIVE</div>
                <div style="font-weight:700;font-size:15px;margin-bottom:4px;">High demand period active</div>
                <div style="font-size:13px;color:var(--muted);">June–July is peak posting time across all stations. Act fast — listings get taken within days.</div>
               </div>`
            : `<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:14px;margin-bottom:14px;">
                <div style="font-size:22px;margin-bottom:6px;">🟢 Off-Season Now</div>
                <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${daysToJune > 0 ? `${daysToJune} days until Transfer Season` : 'Transfer Season starts soon'}</div>
                <div style="font-size:13px;color:var(--muted);">Good time to browse — less competition, owners open to negotiation.</div>
               </div>`
        }
        <div style="background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:14px;margin-bottom:12px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:10px;">📊 Listing Activity in ${cityLabel}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
                    <div style="width:${Math.min(100, recentCount * 10)}%;height:100%;background:${isTransferSeason?'var(--red)':'var(--accent)'};border-radius:4px;transition:width 1s ease;"></div>
                </div>
                <span style="font-size:13px;font-weight:700;color:var(--accent);">${recentCount} new</span>
            </div>
            <div style="font-size:11px;color:var(--muted);">Listings posted in the last 30 days${cityArg ? ' in ' + cityArg : ''}</div>
        </div>
        <div style="background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:14px;margin-bottom:12px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:10px;">📅 Transfer Calendar</div>
            ${[
                {month:'Jan–Mar', label:'Quiet Season', color:'#22c55e', tip:'Best for negotiating rent'},
                {month:'Apr–May', label:'Pre-Season Surge', color:'#f4c542', tip:'Listings start appearing'},
                {month:'Jun–Jul', label:'🔴 Peak Transfer Season', color:'#f43f5e', tip:'Act fast — 3–5 days avg'},
                {month:'Aug–Sep', label:'Wind-down', color:'#f4c542', tip:'Late movers, some deals left'},
                {month:'Oct–Dec', label:'Quiet Season', color:'#22c55e', tip:'Owners open to reduction'},
            ].map(t => `
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border);">
                <div style="width:8px;height:8px;border-radius:50%;background:${t.color};flex-shrink:0;"></div>
                <div style="flex:1;">
                    <span style="font-weight:700;font-size:12px;">${t.month}</span>
                    <span style="color:${t.color};font-size:12px;margin-left:6px;">${t.label}</span>
                    <div style="font-size:11px;color:var(--muted);">${t.tip}</div>
                </div>
            </div>`).join('')}
        </div>
        <div style="background:rgba(255,153,51,0.06);border:1px solid rgba(255,153,51,0.2);border-radius:10px;padding:12px;">
            <div style="font-size:12px;font-weight:700;margin-bottom:6px;">💡 Pro Tips for Transfer Season</div>
            <ul style="font-size:12px;color:var(--muted);padding-left:16px;margin:0;line-height:1.9;">
                <li>Save listings early — call within 24–48 hrs</li>
                <li>Ask owner if they'll hold for 2 weeks while orders are awaited</li>
                <li>Prefer verified listings — less risk of fake posts</li>
                <li>Consider short-term (TD) listings if final posting uncertain</li>
            </ul>
        </div>
    </div>`;

    window.openFeatureModal('transferAlertModal');
};

// ─────────────────────────────────────────────
// 2. OWNER RATING SYSTEM
// ─────────────────────────────────────────────
window.openOwnerRating = (listingId, listingName) => {
    const body = document.getElementById('owner-rating-body');

    // Load existing ratings from localStorage
    const ratings = JSON.parse(localStorage.getItem('fauji_ratings') || '{}');
    const myRating = ratings[listingId];
    const allRatings = Object.entries(ratings)
        .filter(([k]) => k.startsWith(listingId + '_'))
        .map(([,v]) => v);

    let selectedStars = myRating?.stars || 0;

    const avgRating = allRatings.length
        ? (allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length).toFixed(1)
        : '—';

    body.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:13px;color:var(--muted);margin-bottom:4px;">${listingName}</div>
        <div style="font-size:32px;font-weight:800;margin-bottom:4px;">${avgRating === '—' ? '—' : '⭐ ' + avgRating}</div>
        <div style="font-size:12px;color:var(--muted);">${allRatings.length} review${allRatings.length !== 1 ? 's' : ''}</div>
    </div>

    <div style="background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:16px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;text-align:center;">Your Rating</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:14px;" id="star-row">
            ${[1,2,3,4,5].map(i => `
            <span class="rating-star" data-star="${i}" onclick="window._setRatingStar(${i},'${listingId}')"
            style="color:${i <= selectedStars ? '#fbbf24' : 'var(--border2)'}">★</span>`).join('')}
        </div>
        <div id="rating-label" style="text-align:center;font-size:13px;color:var(--muted);margin-bottom:12px;">
            ${selectedStars ? ['','Terrible 😞','Poor 😕','Okay 😐','Good 😊','Excellent 🌟'][selectedStars] : 'Tap a star to rate'}
        </div>
        <textarea id="rating-comment" class="agreement-field" rows="2" placeholder="Optional: Write a short review about the owner..." style="resize:none;">${myRating?.comment || ''}</textarea>
        <button onclick="window._submitRating('${listingId}','${(listingName||'').replace(/'/g,"\'")}')"
        style="width:100%;background:var(--accent);color:#000;border:none;padding:12px;border-radius:10px;font-weight:800;font-size:14px;cursor:pointer;font-family:'Outfit',sans-serif;">
        ⭐ Submit Rating
        </button>
    </div>

    <div id="recent-reviews" style="margin-top:4px;"></div>`;

    // Load existing reviews
    window._renderReviews(listingId);
    window.openFeatureModal('ownerRatingModal');
};

window._setRatingStar = (n, listingId) => {
    window._selectedRatingStars = n;
    document.querySelectorAll('#star-row .rating-star').forEach((el, i) => {
        el.style.color = i < n ? '#fbbf24' : 'var(--border2)';
    });
    const labels = ['','Terrible 😞','Poor 😕','Okay 😐','Good 😊','Excellent 🌟'];
    document.getElementById('rating-label').textContent = labels[n] || '';
};

window._submitRating = (listingId, listingName) => {
    const stars = window._selectedRatingStars || 0;
    if (!stars) { window.showToast?.('Please select a star rating', 'err'); return; }
    const comment = document.getElementById('rating-comment')?.value.trim() || '';

    const ratings = JSON.parse(localStorage.getItem('fauji_ratings') || '{}');
    const key = `${listingId}_${Date.now()}`;
    ratings[key] = { stars, comment, listingName, date: Date.now() };
    localStorage.setItem('fauji_ratings', JSON.stringify(ratings));

    window.showToast?.('Rating submitted! Thank you 🌟', 'ok');
    window.openOwnerRating(listingId, listingName); // refresh
};

window._renderReviews = (listingId) => {
    const container = document.getElementById('recent-reviews');
    if (!container) return;
    const ratings = JSON.parse(localStorage.getItem('fauji_ratings') || '{}');
    const reviews = Object.entries(ratings)
        .filter(([k]) => k.startsWith(listingId + '_') && ratings[k].comment)
        .map(([,v]) => v)
        .sort((a,b) => b.date - a.date)
        .slice(0, 5);

    if (!reviews.length) { container.innerHTML = ''; return; }
    container.innerHTML = `
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px;">Recent Reviews</div>
    ${reviews.map(r => `
    <div style="background:var(--card2);border:1px solid var(--border2);border-radius:10px;padding:11px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <span style="color:#fbbf24;font-size:14px;">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span>
            <span style="font-size:10px;color:var(--muted);">${new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
        </div>
        <div style="font-size:13px;color:var(--text);">${r.comment}</div>
    </div>`).join('')}`;
};

// ─────────────────────────────────────────────
// 3. DIGITAL RENT AGREEMENT GENERATOR
// ─────────────────────────────────────────────
window.openRentAgreement = (listingId) => {
    const r = window._currentListing;
    const body = document.getElementById('rent-agreement-body');

    body.innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:14px;">Fill in the details below and generate a printable rent agreement.</div>

    <input class="agreement-field" id="ag_tenant" placeholder="Tenant Full Name *" value="">
    <input class="agreement-field" id="ag_rank" placeholder="Rank & Service Number (e.g. Maj XYZ, IC-12345)" value="">
    <input class="agreement-field" id="ag_unit" placeholder="Unit / Formation (e.g. 21 Engr Regt)" value="">
    <input class="agreement-field" id="ag_owner" placeholder="Owner Full Name *" value="${r?.name ? r.name.replace(/"/g,'') : ''}">
    <input class="agreement-field" id="ag_address" placeholder="Property Address *" value="${r ? (r.area + ', ' + r.city) : ''}">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <input class="agreement-field" id="ag_rent" placeholder="Monthly Rent ₹ *" value="${r?.price || ''}">
        <input class="agreement-field" id="ag_deposit" placeholder="Security Deposit ₹" value="${r?.price ? r.price * 2 : ''}">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <input class="agreement-field" type="date" id="ag_from" value="${new Date().toISOString().slice(0,10)}">
        <input class="agreement-field" type="date" id="ag_to" value="${new Date(Date.now() + 365*86400000).toISOString().slice(0,10)}">
    </div>
    <input class="agreement-field" id="ag_notice" placeholder="Notice Period (e.g. 1 month)" value="1 month">

    <button onclick="window._generateAgreement()"
    style="width:100%;background:var(--accent);color:#000;border:none;padding:13px;border-radius:10px;font-weight:800;font-size:14px;cursor:pointer;font-family:'Outfit',sans-serif;margin-top:4px;">
    📄 Generate Agreement
    </button>
    <div style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;">For reference only · Not a legally registered document</div>`;

    window.openFeatureModal('rentAgreementModal');
};

window._generateAgreement = () => {
    const g = (id) => document.getElementById(id)?.value.trim() || '';
    const tenant = g('ag_tenant'), owner = g('ag_owner'), address = g('ag_address'), rent = g('ag_rent');
    if (!tenant || !owner || !address || !rent) {
        window.showToast?.('Please fill required fields *', 'err'); return;
    }
    const rank = g('ag_rank'), unit = g('ag_unit'), deposit = g('ag_deposit');
    const fromDate = g('ag_from'), toDate = g('ag_to'), notice = g('ag_notice');
    const today = new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'});

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Rent Agreement – ${tenant}</title>
    <style>
        body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 24px;color:#111;line-height:1.7;}
        h1{text-align:center;font-size:20px;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #111;padding-bottom:10px;}
        h2{font-size:15px;margin-top:28px;}
        .clause{margin-bottom:14px;}
        .sign-row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px;}
        .sign-box{border-top:1px solid #555;padding-top:8px;font-size:13px;}
        @media print{body{margin:20px;}}
    </style></head><body>
    <h1>Rental Agreement</h1>
    <p style="text-align:center;font-size:13px;">This agreement is made on <strong>${today}</strong></p>

    <h2>Parties</h2>
    <div class="clause">
        <strong>Owner (Landlord):</strong> ${owner}<br>
        <strong>Tenant:</strong> ${tenant}${rank ? '<br><strong>Rank / Service No.:</strong> ' + rank : ''}${unit ? '<br><strong>Unit / Formation:</strong> ' + unit : ''}
    </div>

    <h2>Property</h2>
    <div class="clause">The Owner agrees to rent the residential property at: <strong>${address}</strong></div>

    <h2>Terms</h2>
    <div class="clause">
        <strong>Monthly Rent:</strong> ₹${parseInt(rent).toLocaleString('en-IN')}/- (Rupees ${numberToWords(parseInt(rent))} only)<br>
        ${deposit ? `<strong>Security Deposit:</strong> ₹${parseInt(deposit).toLocaleString('en-IN')}/-<br>` : ''}
        <strong>Lease Period:</strong> ${fromDate} to ${toDate}<br>
        <strong>Notice Period:</strong> ${notice}<br>
        <strong>Rent Due:</strong> 5th of every month
    </div>

    <h2>Clauses</h2>
    <div class="clause">
        1. The Tenant shall use the premises only for residential purposes.<br>
        2. The Tenant shall not sublet the property without written consent of the Owner.<br>
        3. The Tenant shall maintain the property in good condition and pay all utility bills.<br>
        4. Either party may terminate this agreement by giving ${notice} written notice.<br>
        5. The security deposit shall be refunded within 30 days of vacating, after deducting damages if any.<br>
        6. The Tenant shall allow the Owner to inspect the premises with prior notice of 24 hours.<br>
        7. Any dispute arising out of this agreement shall be subject to the jurisdiction of local civil courts.
    </div>

    <div class="sign-row">
        <div class="sign-box"><strong>${owner}</strong><br>Owner / Landlord<br><small>Signature & Date</small></div>
        <div class="sign-box"><strong>${tenant}</strong><br>Tenant${rank ? '<br>' + rank : ''}<br><small>Signature & Date</small></div>
    </div>
    <p style="font-size:10px;color:#888;margin-top:40px;text-align:center;">Generated via Faujiadda · For reference only · Not a registered legal document</p>
    </body></html>`;

    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RentAgreement_${tenant.replace(/\s+/g,'_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast?.('Agreement downloaded! Open in browser to print 🖨️', 'ok', 4000);
};

function numberToWords(n) {
    const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '');
    if (n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + numberToWords(n%100) : '');
    if (n < 100000) return numberToWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + numberToWords(n%1000) : '');
    return numberToWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + numberToWords(n%100000) : '');
}

// ─────────────────────────────────────────────
// 4. SHARED CAB FINDER
// ─────────────────────────────────────────────
window.openCabFinder = (city) => {
    const body = document.getElementById('cab-finder-body');
    const cityFilter = city || window._currentListing?.city || '';

    const relevant = CAB_ROUTES.filter(r =>
        !cityFilter ||
        r.from.toLowerCase().includes(cityFilter.toLowerCase()) ||
        r.to.toLowerCase().includes(cityFilter.toLowerCase())
    );
    const others = cityFilter ? CAB_ROUTES.filter(r =>
        !r.from.toLowerCase().includes(cityFilter.toLowerCase()) &&
        !r.to.toLowerCase().includes(cityFilter.toLowerCase())
    ) : [];

    const renderRoutes = (routes, heading) => routes.length ? `
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:10px 0 8px;">${heading}</div>
    ${routes.map(r => `
    <div class="cab-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px;">
            <div>
                <div style="font-weight:800;font-size:13px;">📍 ${r.from} → ${r.to}</div>
                <div style="font-size:11px;color:var(--muted);margin-top:2px;">via ${r.via} · ${r.distance} · ${r.time}</div>
            </div>
            <span style="background:rgba(255,153,51,0.1);color:var(--accent);border:1px solid rgba(255,153,51,0.3);border-radius:100px;font-size:11px;font-weight:700;padding:3px 8px;flex-shrink:0;margin-left:8px;">${r.peak}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:800;color:#22c55e;">${r.typical}</span>
            <button onclick="window._postCabRequest('${r.from}','${r.to}')"
            style="background:var(--accent);color:#000;border:none;padding:7px 14px;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;font-family:'Outfit',sans-serif;">
            🚗 Post Request
            </button>
        </div>
    </div>`).join('')}` : '';

    body.innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px;">Find defence personnel sharing cabs for long transfers. Post a request and connect on community board.</div>

    <div style="background:rgba(255,153,51,0.07);border:1px solid rgba(255,153,51,0.25);border-radius:10px;padding:11px;margin-bottom:12px;font-size:12px;">
        <strong>🗺️ How it works:</strong> Browse popular routes, post your travel dates on the community board, and coordinate with other families doing the same transfer.
    </div>

    ${relevant.length ? renderRoutes(relevant, cityFilter ? `Routes near ${cityFilter}` : 'Popular Routes') : ''}
    ${others.length ? renderRoutes(others, 'Other Popular Routes') : ''}
    ${!relevant.length && !others.length ? '<div style="text-align:center;padding:24px;color:var(--muted);">No routes found. Post on Community Board!</div>' : ''}

    <button onclick="window.closeFeatureModal('cabFinderModal');window.location.href='community.html';"
    style="width:100%;background:rgba(96,165,250,0.1);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);padding:11px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;margin-top:8px;">
    💬 Go to Community Board →
    </button>`;

    window.openFeatureModal('cabFinderModal');
};

window._postCabRequest = (from, to) => {
    window.closeFeatureModal('cabFinderModal');
    window.showToast?.(`Opening community to post: ${from} → ${to}`, 'ok', 3000);
    setTimeout(() => { window.location.href = 'community.html'; }, 800);
};

// ─────────────────────────────────────────────
// 5. SCHOOL PROXIMITY FILTER
// ─────────────────────────────────────────────
window.openSchoolProximity = (city, listingLat, listingLng) => {
    const body = document.getElementById('school-proximity-body');
    const cityKey = Object.keys(ARMY_SCHOOLS).find(k =>
        city?.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city?.toLowerCase())
    );
    const schools = cityKey ? ARMY_SCHOOLS[cityKey] : [];

    if (!schools.length) {
        body.innerHTML = `
        <div style="text-align:center;padding:24px 16px;">
            <div style="font-size:32px;margin-bottom:10px;">🏫</div>
            <div style="font-weight:700;margin-bottom:6px;">No school data for ${city}</div>
            <div style="font-size:13px;color:var(--muted);">We're expanding our school database. Check back soon!</div>
        </div>`;
        window.openFeatureModal('schoolProximityModal');
        return;
    }

    const withDist = schools.map(s => ({
        ...s,
        dist: (listingLat && listingLng) ? haversineKm(listingLat, listingLng, s.lat, s.lng) : null
    })).sort((a,b) => (a.dist||999) - (b.dist||999));

    body.innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:14px;">Distances from this listing to nearby KV / Army Schools in ${city}.</div>
    ${withDist.map(s => {
        const distColor = !s.dist ? 'var(--muted)' : s.dist <= 2 ? '#22c55e' : s.dist <= 5 ? '#f4c542' : '#f43f5e';
        const distLabel = !s.dist ? 'Distance unknown' : s.dist <= 2 ? '✅ Very close' : s.dist <= 5 ? '🟡 Manageable' : '🔴 Far';
        const typeColor = s.type === 'APS' ? 'var(--gold)' : '#60a5fa';
        return `
        <div style="background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:13px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                <div style="flex:1;">
                    <div style="font-weight:800;font-size:14px;">${s.name}</div>
                    <div style="font-size:11px;color:var(--muted);margin-top:2px;">📍 ${s.address}</div>
                </div>
                <span style="background:rgba(255,153,51,0.1);color:${typeColor};border:1px solid ${typeColor}33;border-radius:100px;font-size:10px;font-weight:700;padding:3px 8px;flex-shrink:0;margin-left:8px;">${s.type}</span>
            </div>
            ${s.dist !== null ? `
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
                    <div style="width:${Math.max(5, 100 - s.dist*8)}%;height:100%;background:${distColor};border-radius:3px;"></div>
                </div>
                <span style="font-size:13px;font-weight:800;color:${distColor};">${s.dist} km</span>
                <span style="font-size:11px;color:var(--muted);">${distLabel}</span>
            </div>` : '<div style="font-size:12px;color:var(--muted);margin-top:4px;">Pin the listing on map for accurate distance</div>'}
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.address)}"
            target="_blank"
            style="display:inline-block;margin-top:8px;font-size:11px;color:var(--accent);text-decoration:none;">
            🗺️ Open in Google Maps →
            </a>
        </div>`}).join('')}

    <div style="background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.2);border-radius:10px;padding:11px;margin-top:4px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:5px;">💡 Tip</div>
        <div style="font-size:12px;color:var(--muted);">Use the <strong>School Proximity</strong> filter in ⚡ More Filters to find listings within a specific distance from KV / Army schools.</div>
    </div>`;

    window.openFeatureModal('schoolProximityModal');
};

// ── School proximity filter for listings ──
window.setSchoolFilter = (km) => {
    state.schoolKmFilter = km === 'all' ? null : parseFloat(km);
    if (window.renderListings) window.renderListings();
};

// ── Inject Transfer Alert banner in sidebar if transfer season ──
(function() {
    const month = new Date().getMonth() + 1;
    if (month >= 5 && month <= 7) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const banner = document.createElement('div');
            banner.onclick = () => window.openTransferAlert();
            banner.style.cssText = 'background:linear-gradient(90deg,rgba(244,63,94,0.12),rgba(255,153,51,0.08));border:1px solid rgba(244,63,94,0.3);border-radius:10px;padding:10px 12px;margin:8px 12px;cursor:pointer;transition:all .2s;flex-shrink:0;';
            banner.innerHTML = '<div style="font-size:12px;font-weight:800;color:#f43f5e;margin-bottom:2px;">🔴 Transfer Season Active</div><div style="font-size:11px;color:var(--muted);">June–July peak · Listings move fast. Tap for tips.</div>';
            banner.onmouseover = () => banner.style.borderColor = '#f43f5e';
            banner.onmouseout = () => banner.style.borderColor = 'rgba(244,63,94,0.3)';
            // Insert after search bar
            const stop = sidebar.querySelector('.s-top');
            if (stop) stop.after(banner);
        }
    }
})();
