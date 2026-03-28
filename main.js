import { state } from './data.js';
import { db, onSnapshot, query, collection, where } from './firebase.js';
import { initMap, render } from './map.js';
import './ui.js';

// 1. Immediate initialization
function startApp() {
    try {
        initMap();

        // Show loading state in count bar
        const cnt = document.getElementById('cnt');
        if (cnt) cnt.innerHTML = `<div class="live-dot"></div> Connecting…`;

        // 2. Start Firebase listener AFTER map is ready
        const verifiedQuery = query(collection(db, 'rentals'), where('verified', '==', true));

        // Set a timeout fallback — if Firestore hasn't responded in 8s, show offline message
        let firstLoad = true;
        const offlineTimer = setTimeout(() => {
            if (firstLoad && cnt) {
                cnt.innerHTML = `<div class="live-dot" style="background:var(--red)"></div> No connection — check internet`;
            }
        }, 8000);

        onSnapshot(verifiedQuery, (snapshot) => {
            clearTimeout(offlineTimer);
            firstLoad = false;
            state.listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            render();
        }, (error) => {
            clearTimeout(offlineTimer);
            console.warn('Firestore error:', error.message);
            if (cnt) cnt.innerHTML = `<div class="live-dot" style="background:var(--red)"></div> Offline — retrying…`;
            // Render with empty/stale data so the UI isn't frozen
            render();
        });
    } catch (e) {
        console.error('Critical Start Error:', e);
    }
}

// Ensure the DOM is fully parsed before running
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

window.resetAdvFilters = () => {
    state.furnishFilter = 'all';
    state.sqftFilter    = 'all';
    state.availFilter   = 'all';
    const ids = ['furnishFilter','sqftFilter','availFilter'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
    _updateAdvIndicator();
    render();
};

function _updateAdvIndicator() {
    const active = state.furnishFilter !== 'all' || state.sqftFilter !== 'all' || state.availFilter !== 'all';
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
