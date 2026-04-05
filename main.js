import { state } from './data.js';
import { PITCH_LISTINGS } from './pitch_data.js';
import { db, onSnapshot, getDocs, query, collection, where } from './firebase.js';
import { initMap, render } from './map.js';
import './ui.js';
import './chat.js';

// ─── App Bootstrap ────────────────────────────────────────

function startApp() {
    try {
        initMap();

        const cnt = document.getElementById('cnt');
        if (cnt) cnt.innerHTML = `<div class="live-dot"></div> Connecting…`;

        let firstLoad = true;
        const offlineTimer = setTimeout(() => {
            if (firstLoad && cnt) {
                cnt.innerHTML = `<div class="live-dot" style="background:var(--red)"></div> No connection — check internet`;
            }
        }, 8000);

        // Map Bounding-Box Optimization
        window.fetchListingsInBounds = async () => {
            if (!state.map) return;
            try {
                const bounds = state.map.getBounds();
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();
                
                // Firestore allows only ONE inequality filter without composite indexes.
                // We do 'lat' strictly, and filter 'lng' & 'verified' on the client.
                // Firebase throws fatal errors if lat exceeds numerical limits [-90, 90] when zooming heavily out
                const clampedSwLat = Math.max(-90, Math.min(90, sw.lat));
                const clampedNeLat = Math.max(-90, Math.min(90, ne.lat));

                const qr = query(collection(db, 'rentals'), 
                    where('lat', '>=', clampedSwLat), 
                    where('lat', '<=', clampedNeLat)
                );
                const qm = query(collection(db, 'marketplace'), 
                    where('lat', '>=', clampedSwLat), 
                    where('lat', '<=', clampedNeLat)
                );

                let fetched = [];
                try {
                    const [snapR, snapM] = await Promise.all([getDocs(qr), getDocs(qm)]);
                    clearTimeout(offlineTimer);
                    firstLoad = false;
                    if(cnt) cnt.innerHTML = `<div class="live-dot"></div> Updating…`;

                    snapR.forEach(d => {
                        const data = d.data();
                        if (data.verified && data.lng >= sw.lng && data.lng <= ne.lng) {
                            fetched.push({ id: d.id, _collection: 'rentals', ...data });
                        }
                    });
                    snapM.forEach(d => {
                        const data = d.data();
                        if (data.lng >= sw.lng && data.lng <= ne.lng) {
                            fetched.push({ id: d.id, _collection: 'market', ...data });
                        }
                    });
                } catch(dbErr) {
                    console.warn('Silent DB fetch fail (quota/bounds):', dbErr.message);
                    clearTimeout(offlineTimer);
                    // Silently continue so pitch listings still render without showing scary errors
                }

                // Blend in high-quality offline pitch data unconditionally to ensure they always show in the list
                PITCH_LISTINGS.forEach(p => {
                    const lat = parseFloat(p.lat);
                    const lng = parseFloat(p.lng);
                    if (lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng) {
                        fetched.push(p);
                    }
                });

                state.listings = fetched;
                render();

                // Deep-link auto-open
                if (!window._deepLinkHandled) {
                    window._deepLinkHandled = true;
                    const params = new URLSearchParams(window.location.search);
                    const sharedId = params.get('listing');
                    if (sharedId && window.openDetailModal) {
                        setTimeout(() => window.openDetailModal(sharedId), 400);
                    }
                }
            } catch (fatalErr) {
                console.error('Core bounds calculation error:', fatalErr);
            }
        };

        // Delay the first fetch so bounds are set correctly
        setTimeout(() => {
            window.fetchListingsInBounds();
        }, 300);

        state.map.on('moveend', () => {
             // Debounce map move
             clearTimeout(window._boundsDelay);
             window._boundsDelay = setTimeout(window.fetchListingsInBounds, 400);
        });
    } catch (e) {
        console.error('Critical Start Error:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}


// Wiring for UI
window.setFilter = (v, btn) => {
    state.typeFilter = v;
    document.querySelectorAll('header .fb').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (window.closeFoodPanel) window.closeFoodPanel();
    render();
};
window.setPrice = (v) => { state.maxPrice = parseInt(v); render(); };
window.setSmartSearch = (v) => { state.smartSearchQ = v.toLowerCase(); render(); };
window.setSort = (v) => {
    state.sortPref = v;
    // Keep both sort selects in sync
    const s1 = document.getElementById('sortFilter');
    const s2 = document.getElementById('sortFilterAdv');
    if (s1 && s1.value !== v) s1.value = v;
    if (s2 && s2.value !== v) s2.value = v;
    render();
};

// ── Advanced filters ──
window.setFurnishFilter = (v) => { state.furnishFilter = v; _updateAdvIndicator(); render(); };
window.setSqftFilter    = (v) => { state.sqftFilter    = v; _updateAdvIndicator(); render(); };
window.setAvailFilter   = (v) => { state.availFilter   = v; _updateAdvIndicator(); render(); };
window.setOwnerFilter   = (v) => { state.ownerFilter   = v; _updateAdvIndicator(); render(); };
window.setTermFilter    = (v) => { state.termFilter    = v; _updateAdvIndicator(); render(); };

window.resetAdvFilters = () => {
    state.furnishFilter = 'all';
    state.sqftFilter    = 'all';
    state.availFilter   = 'all';
    state.ownerFilter   = 'all';
    state.termFilter    = 'all';
    const ids = ['furnishFilter','sqftFilter','availFilter','ownerFilterAdv','termFilterAdv'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
    _updateAdvIndicator();
    render();
};

function _updateAdvIndicator() {
    const active = state.furnishFilter !== 'all' || state.sqftFilter !== 'all' || state.availFilter !== 'all' || state.ownerFilter !== 'all' || state.termFilter !== 'all';
    const btn = document.getElementById('advFilterToggle');
    if (btn) btn.classList.toggle('active-filters', active);
}

window.toggleAdvFilters = () => {
    const bar = document.getElementById('advFilterBar');
    const btn = document.getElementById('advFilterToggle');
    if (!bar) return;
    const isOpen = bar.classList.toggle('open');
    if (btn) btn.textContent = isOpen ? '✕ Close Filters ' : '⚡ More Filters ';
    // Re-append the indicator span (textContent clears it)
    if (btn) {
        const dot = document.createElement('span');
        dot.id = 'adv-filter-indicator';
        btn.appendChild(dot);
        _updateAdvIndicator();
    }
};
