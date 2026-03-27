import { state } from './data.js';
import { db, onSnapshot, query, collection, where } from './firebase.js';
import { initMap, render } from './map.js';
import './ui.js';

// 1. Immediate initialization
function startApp() {
    console.log("Initializing Map...");
    try {
        initMap();

        // 2. Start Firebase listener AFTER map is ready
        const verifiedQuery = query(collection(db, "rentals"), where("verified", "==", true));
        onSnapshot(verifiedQuery, (snapshot) => {
            state.listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            render();
        }, (error) => {
            console.error("Firebase Error:", error);
        });
    } catch (e) {
        console.error("Critical Start Error:", e);
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
    if(btn) btn.classList.add('active');
    if(window.closeFoodPanel) window.closeFoodPanel();
    render();
};
window.setPrice = (v) => { state.maxPrice = parseInt(v); render(); };
window.setSmartSearch = (v) => { state.smartSearchQ = v.toLowerCase(); render(); };
window.setSort = (v) => { state.sortPref = v; render(); };
