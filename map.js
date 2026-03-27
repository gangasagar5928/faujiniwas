import { state, SSB_DORMS } from './data.js';

// ─── Skeleton Loader ───
export function showLoadingSkeleton() {
    const el = document.getElementById('list');
    if (!el) return;
    el.innerHTML = Array(4).fill(`
    <div class="skel">
    <div class="skel-img"></div>
    <div class="skel-lines">
    <div class="skel-line" style="width:75%"></div>
    <div class="skel-line" style="width:50%"></div>
    <div class="skel-line" style="width:88%;margin-top:6px"></div>
    </div>
    </div>`).join('');
}

// ─── Render SSB Dorms ───
export function renderDorms() {
    const listEl = document.getElementById('list');
    const cntEl  = document.getElementById('cnt');
    listEl.innerHTML = '';
    cntEl.innerHTML  = `<div class="live-dot"></div> ${SSB_DORMS.length} SSB dorms found`;

    state.markerCluster.clearLayers();
    state.markers = {};
    const newMarkers = [];

    SSB_DORMS.forEach(d => {
        const card = document.createElement('div');
        card.className = 'dorm-card';
        card.innerHTML = `
        <div class="dorm-row">
        <h4>🏨 ${d.name}</h4>
        <span class="dorm-price">₹${d.price}/night</span>
        </div>
        <div class="dorm-meta">
        📍 ${d.area}, ${d.city}&nbsp;&nbsp;·&nbsp;&nbsp;🎯 ${d.ssb}
        <span class="dorm-dist">&nbsp;·&nbsp;🚶 ${d.distance} km</span>
        </div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:8px;">${d.desc}</p>
        <div class="dorm-badges">
        <span class="dorm-badge">${d.type}</span>
        ${d.amenities.map(a=>`<span class="dorm-badge">${a}</span>`).join('')}
        </div>`;
        card.onclick = () => {
            state.map.flyTo([d.lat, d.lng], 15, { duration: 0.6 });
            window.openFoodPanel(d.city);
        };
        listEl.appendChild(card);

        const icon = L.divIcon({
            className: '',
            html: `<div class="pm" style="border-color:#f4c542;color:#f4c542;background:#1a1a1a;font-size:17px;display:flex;align-items:center;justify-content:center;padding:6px 10px;">🏨</div>`,
            iconAnchor: [30, 34], popupAnchor: [0, -38], iconSize: [60, 34]
        });

        const popup = `
        <div style="font-family:'Outfit',sans-serif;min-width:200px;">
        <b style="font-size:15px;">${d.name}</b><br>
        <span style="color:var(--muted);font-size:13px;">${d.area}, ${d.city}</span><br>
        <b style="color:#f4c542;font-size:14px;">₹${d.price}/night · ${d.type}</b><br>
        <small style="color:var(--muted);">🎯 ${d.ssb} · 🚶 ${d.distance} km gate</small><br>
        <button ontouchend="event.preventDefault();window.openFoodPanel('${d.city}')" onclick="window.openFoodPanel('${d.city}')"
        style="margin-top:10px;width:100%;background:#f4c542;color:#000;border:none;padding:9px;border-radius:7px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;">
        🍽️ Nearby Food & Mess
        </button>
        </div>`;

        const m = L.marker([d.lat, d.lng], { icon }).bindPopup(popup);
        newMarkers.push(m);
        state.markers[d.id] = m;
    });

    state.markerCluster.addLayers(newMarkers);
}

// ─── Main Render ───
export function render() {
    if (state.typeFilter === 'dorm') { renderDorms(); return; }

    const listEl = document.getElementById('list');
    const cntEl  = document.getElementById('cnt');

    let filtered = state.listings.filter(r => {
        if (r.reportCount >= 3) return false;
        if (state.maxPrice < 100000 && r.price > state.maxPrice) return false;
        const typeOk   = state.typeFilter === 'all' || r.type === state.typeFilter;
        const searchOk = !state.smartSearchQ
        || r.name.toLowerCase().includes(state.smartSearchQ)
        || r.area.toLowerCase().includes(state.smartSearchQ)
        || r.city.toLowerCase().includes(state.smartSearchQ);
        return typeOk && searchOk;
    });

    filtered.sort((a, b) => {
        if (state.sortPref === 'priceAsc')  return a.price - b.price;
        if (state.sortPref === 'priceDesc') return b.price - a.price;
        if (state.sortPref === 'near')      return parseFloat(a.distance || 2) - parseFloat(b.distance || 2);
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    cntEl.innerHTML = `<div class="live-dot"></div> ${filtered.length} listing${filtered.length !== 1 ? 's' : ''} found`;
    listEl.innerHTML = '';
    state.markerCluster.clearLayers();
    state.markers = {};
    const newMarkers = [];

    if (!filtered.length) {
        listEl.innerHTML = `<div class="empty">
        <div class="empty-ico">🔍</div>
        <h3>No homes found</h3>
        <p>Try adjusting filters or searching a different cantt.</p>
        </div>`;
        return;
    }

    filtered.forEach(r => {
        if (!r.distance) r.distance = (Math.random() * 3 + 0.5).toFixed(1);

        const bahColor = r.price <= 15000 ? '#22c55e' : r.price <= 30000 ? '#f4c542' : '#f43f5e';
        const bahLabel = r.price <= 15000 ? '🟢 OR'  : r.price <= 30000 ? '🟡 JCO' : '🔴 Offr';
        const bahTag   = `<span class="tag" style="border-color:${bahColor};color:${bahColor};">${bahLabel}</span>`;
        const dateTag  = r.available
        ? `<span class="tag" style="color:var(--gold);border-color:var(--gold);">📅 ${r.available}</span>`
        : `<span class="tag" style="color:#22c55e;border-color:#22c55e;">⚡ Immediate</span>`;

        const thumb = r.mediaUrls?.length > 0
        ? r.mediaUrls[0]
        : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=80';

        const card = document.createElement('div');
        card.className = 'lc';
        card.id = 'card-' + r.id;
        const verifiedBadge = r.verified
            ? `<span style="font-size:10px;font-weight:700;color:#22c55e;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);padding:2px 7px;border-radius:100px;vertical-align:middle;">✅</span>`
            : '';
        card.innerHTML = `
        <div class="lc-thumb"><img src="${thumb}" loading="lazy"></div>
        <div class="lc-info">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
        <strong style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;">${r.name} ${verifiedBadge}</strong>
        <b style="color:var(--gold);white-space:nowrap;font-size:14px;">₹${r.price.toLocaleString()}</b>
        </div>
        <small style="color:var(--muted);display:block;margin-top:2px;">📍 ${r.area}, ${r.city}</small>
        <small style="color:var(--muted2);display:block;">🚶 ${r.distance} km from gate</small>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">
        ${dateTag}
        <span class="tag">${r.type?.toUpperCase() || 'FLAT'}</span>
        ${bahTag}
        </div>
        </div>`;

        // Map marker
        const customIcon = L.divIcon({
            className: '',
            html: `<div class="pm" style="border-color:${bahColor};color:${bahColor};">
            <style>.pm::after{border-top-color:${bahColor}!important;}</style>
            ₹${(r.price/1000).toFixed(0)}K
            </div>`,
            iconAnchor: [30, 34], popupAnchor: [0, -38], iconSize: [60, 34]
        });

        const popupBtn = `<button ontouchend="event.preventDefault();window.openDetailModal('${r.id}')" onclick="window.openDetailModal('${r.id}')"
        style="width:100%;background:var(--accent);color:#000;padding:10px;border:none;border-radius:7px;font-weight:800;margin-top:10px;cursor:pointer;font-family:'Outfit',sans-serif;">
        View Full Details →
        </button>`;

        const m = L.marker([r.lat, r.lng], { icon: customIcon })
        .bindPopup(`<div style="font-family:'Outfit',sans-serif;min-width:180px;">
        <b style="font-size:15px;">${r.name}</b><br>
        <span style="color:var(--muted);font-size:13px;">📍 ${r.area}, ${r.city}</span><br>
        <b style="color:#22c55e;font-size:15px;">₹${r.price.toLocaleString()}/mo</b>
        ${popupBtn}
        </div>`);

        newMarkers.push(m);
        state.markers[r.id] = m;

        card.onclick = () => {
            state.map.flyTo([r.lat, r.lng], 15, { duration: 0.5 });
            setTimeout(() => m.openPopup(), 500);
            window.openDetailModal(r.id);
        };

        listEl.appendChild(card);
    });

    state.markerCluster.addLayers(newMarkers);
}

// ─── Map Init ───
export function initMap() {
    const indiaBounds = L.latLngBounds(L.latLng(6.5, 68.0), L.latLng(35.5, 97.5));
    state.map = L.map('map', {
        zoomControl: false,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        preferCanvas: true
    }).setView([22.9074, 79.1469], 5);

    // Clean light map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20, minZoom: 5, noWrap: true,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);

    // Zoom control (bottom-right)
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);

    state.markerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        iconCreateFunction: cluster => {
            const count = cluster.getChildCount();
            return L.divIcon({
                html: `<div style="background:var(--accent);color:#000;font-weight:800;font-size:13px;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(255,153,51,.4);font-family:'Outfit',sans-serif;">${count}</div>`,
                             className: '', iconSize: [36, 36]
            });
        }
    });
    state.map.addLayer(state.markerCluster);

    setTimeout(() => state.map.invalidateSize(), 600);
    showLoadingSkeleton();

    // Auto-locate user
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            pos => state.map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1.5 }),
                                                 () => {}
        );
    }
}
