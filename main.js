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
window.setSort = (v) => { state.sortPref = v; render(); };
