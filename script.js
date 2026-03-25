// --- 1. FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, updateDoc, increment, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 2. CACHE CLEAR ---
if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())); }
if (window.indexedDB && indexedDB.databases) { indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name))); }

// --- 3. CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyCKMzqMBkRBOc9XJ1fDrH3LZ4HfltWVDmA",
    authDomain: "rentmap-live.firebaseapp.com",
    projectId: "rentmap-live",
    storageBucket: "rentmap-live.firebasestorage.app",
    messagingSenderId: "1018484183886",
    appId: "1:1018484183886:web:b8e8236196e434187d041f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

let map, markers={}, markerCluster, typeFilter='all', smartSearchQ='', sortPref='new', maxPrice=100000, listings=[];
let miniMap, miniMarker, draftCoords = { lat: 22.9074, lng: 79.1469 };
let currentReportId = null; 

function formatPrice(p) { return p >= 100000 ? '₹' + (p/100000).toFixed(1) + 'L' : p >= 1000 ? '₹' + (p/1000).toFixed(0) + 'K' : '₹' + p; }

// ══════════════════════════════════════════════════════
//  SSB DORMS DATA
// ══════════════════════════════════════════════════════
const SSB_DORMS = [
    { id: 'ssb1', name: 'Pragati Guesthouse', ssb: '1 SSB Allahabad', city: 'Prayagraj', area: 'Civil Lines', lat: 25.4358, lng: 81.8463, price: 400, type: 'Dormitory', distance: '1.2', amenities: ['AC', 'Mess', 'Locker'], budget: '₹', desc: 'Basic clean dorm, 5-min auto to Allahabad SSB. Mess available 3 meals.' },
    { id: 'ssb2', name: 'Station Rest House', ssb: '1 SSB Allahabad', city: 'Prayagraj', area: 'Naini', lat: 25.4025, lng: 81.8611, price: 600, type: 'Single Room', distance: '2.5', amenities: ['AC', 'WiFi', 'Attached Bath'], budget: '₹₹', desc: 'Quiet rooms near railway station. Ideal pre-SSB night stay.' },
    { id: 'ssb3', name: 'Shivam Dormitory', ssb: '2 SSB Bhopal', city: 'Bhopal', area: 'Habibganj', lat: 23.2340, lng: 77.4342, price: 350, type: 'Dormitory', distance: '3.0', amenities: ['Common Bath', 'Mess', 'Locker'], budget: '₹', desc: 'Budget-friendly dorm near Bhopal SSB. Canteen on premises.' },
    { id: 'ssb4', name: 'Hotel Palash Residency', ssb: '2 SSB Bhopal', city: 'Bhopal', area: 'MP Nagar', lat: 23.2240, lng: 77.4428, price: 900, type: 'Single Room', distance: '4.0', amenities: ['AC', 'WiFi', 'TV', 'Geyser'], budget: '₹₹', desc: 'Mid-range hotel. Good for candidates wanting comfort before SSB.' },
    { id: 'ssb5', name: 'Kapurthala Youth Hostel', ssb: '3 SSB Kapurthala', city: 'Kapurthala', area: 'Bus Stand Road', lat: 31.3798, lng: 75.3733, price: 300, type: 'Dormitory', distance: '1.8', amenities: ['Fan Rooms', 'Mess', 'Common Bath'], budget: '₹', desc: 'Most popular among SSB candidates. Book in advance — fills up fast.' },
    { id: 'ssb6', name: 'Hotel Satluj', ssb: '3 SSB Kapurthala', city: 'Kapurthala', area: 'GT Road', lat: 31.3851, lng: 75.3810, price: 700, type: 'Single Room', distance: '2.2', amenities: ['AC', 'WiFi', 'Hot Water'], budget: '₹₹', desc: 'Decent private rooms. Auto to SSB in 10 mins.' },
    { id: 'ssb7', name: 'SSB Candidate Lodge', ssb: '21 SSB Bangalore', city: 'Bengaluru', area: 'Vijayanagar', lat: 12.9716, lng: 77.5946, price: 500, type: 'Dormitory', distance: '2.8', amenities: ['Common Bath', 'Mess', 'Locker'], budget: '₹', desc: 'Near Bangalore SSB centre. Auto & metro accessible.' },
    { id: 'ssb8', name: 'OYO – Manekshaw Nagar', ssb: '21 SSB Bangalore', city: 'Bengaluru', area: 'Cantonment', lat: 12.9882, lng: 77.6101, price: 1200, type: 'Single Room', distance: '1.5', amenities: ['AC', 'WiFi', 'Geyser', 'TV'], budget: '₹₹₹', desc: 'Premium option close to SSB. Book OYO app for best price.' },
    { id: 'ssb9', name: 'Landmark PG House', ssb: '17 SSB Allahabad (Air)', city: 'Prayagraj', area: 'Bamrauli', lat: 25.4483, lng: 81.7337, price: 450, type: 'PG/Room', distance: '1.0', amenities: ['Fan', 'Mess', 'Attached Bath'], budget: '₹', desc: 'Closest budget PG to Air Force SSB gate. Highly recommended.' },
    { id: 'ssb10', name: 'NDA Candidate Hostel', ssb: '19 SSB Bangalore', city: 'Bengaluru', area: 'Ulsoor', lat: 12.9790, lng: 77.6208, price: 250, type: 'Dormitory', distance: '3.5', amenities: ['Basic Meals', 'Locker', 'Common Bath'], budget: '₹', desc: 'No-frills dormitory. Perfect for budget-conscious candidates.' },
    { id: 'ssb11', name: 'Hotel Landmark Mysore', ssb: '12 SSB Mysore', city: 'Mysuru', area: 'Nazarbad', lat: 12.3052, lng: 76.6552, price: 550, type: 'Single Room', distance: '2.0', amenities: ['AC', 'Hot Water', 'WiFi'], budget: '₹₹', desc: 'Clean rooms, 15 min from Mysore SSB. Popular among Navy candidates.' },
    { id: 'ssb12', name: 'Budget Stay – Ambad', ssb: '5 SSB Pune', city: 'Pune', area: 'Camp Area', lat: 18.5204, lng: 73.8567, price: 400, type: 'Dormitory', distance: '2.5', amenities: ['Fan', 'Common Bath', 'Mess'], budget: '₹', desc: 'Simple dorm near Pune SSB. Auto available outside 24/7.' }
];

// ══════════════════════════════════════════════════════
//  FOOD DATA BY CITY
// ══════════════════════════════════════════════════════
const FOOD_BY_CITY = {
    'Prayagraj': [
        { name: 'El Chico Restaurant', type: 'North Indian / Chinese', budget: '₹₹', note: 'Great thali, AC seating' },
        { name: 'Sharma Dhaba', type: 'Pure Veg Dhaba', budget: '₹', note: 'Under ₹100 full meal' },
        { name: 'Cafe Coffee Day', type: 'Café / Snacks', budget: '₹₹', note: 'Good for pre-SSB chill' },
        { name: 'Kamla Nehru Canteen', type: 'Snacks / Tea', budget: '₹', note: 'Quick breakfast stop' }
    ],
    'Bhopal': [
        { name: 'Under The Mango Tree', type: 'Multi-cuisine', budget: '₹₹₹', note: 'Nice ambience, pre-SSB dinner' },
        { name: 'Bapu Ki Kutia', type: 'North Indian Thali', budget: '₹', note: 'Unlimited thali ₹120' },
        { name: 'Cafe 24', type: 'Fast Food / Café', budget: '₹₹', note: 'Open late, good for groups' },
        { name: 'Hotel Saket', type: 'Veg & Non-Veg', budget: '₹', note: 'Filling meals under ₹150' }
    ],
    'Kapurthala': [
        { name: 'Punjabi Dhaba GT Road', type: 'Punjabi / Dal Makhni', budget: '₹', note: 'Best butter chicken in town' },
        { name: 'Hotel Satluj Dining', type: 'Multi-cuisine', budget: '₹₹', note: 'In-hotel restaurant, reliable' },
        { name: 'Amritsari Kulcha Corner', type: 'Street Food', budget: '₹', note: '₹60 kulcha-chole, unmissable' },
        { name: 'Pizza Hub', type: 'Fast Food', budget: '₹₹', note: 'Good for a quick dinner' }
    ],
    'Bengaluru': [
        { name: 'MTR Restaurant', type: 'South Indian', budget: '₹₹', note: 'Iconic. Best idli-vada in Bangalore' },
        { name: "Brahmin's Coffee Bar", type: 'Breakfast', budget: '₹', note: '₹30 idli-chutney, legendary' },
        { name: 'Meghana Foods', type: 'Biryani', budget: '₹₹', note: 'Famous Andhra biryani' },
        { name: 'Empire Restaurant', type: 'Non-Veg / Biryani', budget: '₹₹', note: '24hr, great for late dinners' }
    ],
    'Mysuru': [
        { name: 'Hotel RRR', type: 'South Indian Meals', budget: '₹', note: 'Unlimited meals ₹100' },
        { name: 'Depth N Green', type: 'Cafe / Healthy', budget: '₹₹', note: 'Good for light pre-SSB dinner' },
        { name: 'Vinayaka Mylari', type: 'Breakfast', budget: '₹', note: 'Famous dosa, must try' },
        { name: 'Hotel Siddharta', type: 'Veg & Non-Veg', budget: '₹₹', note: 'Reliable restaurant near SSB' }
    ],
    'Pune': [
        { name: 'Vaishali Restaurant', type: 'South Indian', budget: '₹₹', note: 'Iconic FC Road restaurant' },
        { name: 'Cafe Goodluck', type: 'Irani Cafe', budget: '₹', note: 'Historic cafe, bun maska ₹40' },
        { name: 'Kayani Bakery', type: 'Bakery / Snacks', budget: '₹', note: 'Famous shrewsbury biscuits' },
        { name: 'Spice Kitchen', type: 'North Indian', budget: '₹₹', note: 'Good dal makhni & roti' }
    ]
};

// ══════════════════════════════════════════════════════
//  FOOD PANEL FUNCTIONS
// ══════════════════════════════════════════════════════
window.openFoodPanel = (city) => {
    const panel = document.getElementById('foodPanel');
    const grid  = document.getElementById('foodGrid');
    const label = document.getElementById('foodCity');

    // Try to match city name loosely
    const cityKey = Object.keys(FOOD_BY_CITY).find(k => city && city.toLowerCase().includes(k.toLowerCase()));
    const options = cityKey ? FOOD_BY_CITY[cityKey] : [];
    label.textContent = city || '';

    if (options.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; color:var(--muted); text-align:center; padding:20px;">No food data yet for ${city}</div>`;
    } else {
        grid.innerHTML = options.map(f => {
            const cls = f.budget === '₹' ? 'budget-low' : f.budget === '₹₹' ? 'budget-mid' : 'budget-high';
            return `
                <div class="food-card">
                    <div class="fname">${f.name}</div>
                    <div class="ftype">${f.type}</div>
                    <span class="fprice ${cls}">${f.budget}</span>
                    <div style="font-size:11px; color:var(--muted); margin-top:6px;">${f.note}</div>
                </div>
            `;
        }).join('');
    }
    panel.classList.add('open');
};

window.closeFoodPanel = () => {
    document.getElementById('foodPanel').classList.remove('open');
};

// ══════════════════════════════════════════════════════
//  RENDER SSB DORMS
// ══════════════════════════════════════════════════════
function renderDorms() {
    const listEl = document.getElementById('list');
    const cntEl  = document.getElementById('cnt');
    listEl.innerHTML = '';
    cntEl.textContent = SSB_DORMS.length + ' SSB dorms found';

    markerCluster.clearLayers();
    markers = {};
    const newMarkers = [];

    SSB_DORMS.forEach(d => {
        const card = document.createElement('div');
        card.className = 'dorm-card';
        card.innerHTML = `
            <h4>🏨 ${d.name}</h4>
            <div class="dorm-meta">📍 ${d.area}, ${d.city} &nbsp;|&nbsp; 🎯 ${d.ssb}</div>
            <p style="font-size:12px; color:var(--muted); margin:0 0 8px;">${d.desc}</p>
            <div class="dorm-tags">
                <span class="dorm-tag dorm-price">${d.budget} ₹${d.price}/night</span>
                <span class="dorm-tag dorm-dist">🚶 ${d.distance} km to SSB</span>
                <span class="dorm-tag" style="color:#b3b3b3; border-color:#555;">${d.type}</span>
                ${d.amenities.map(a => `<span class="dorm-tag" style="color:#666; border-color:#444;">${a}</span>`).join('')}
            </div>
        `;
        card.onclick = () => {
            map.flyTo([d.lat, d.lng], 15, { duration: 0.6 });
            openFoodPanel(d.city);
        };
        listEl.appendChild(card);

        const icon = L.divIcon({
            className: '',
            html: `<div class="pm" style="border-color:#f4c542; color:#f4c542; background:#1a1a1a; font-size:18px; display:flex; align-items:center; justify-content:center;">🏨</div>`,
            iconAnchor: [30, 34], popupAnchor: [0, -34], iconSize: [60, 34]
        });

        const m = L.marker([d.lat, d.lng], { icon })
            .bindPopup(`
                <div style="font-family:'Outfit',sans-serif; min-width:200px;">
                    <b style="font-size:15px;">${d.name}</b><br>
                    <span style="color:#b3b3b3; font-size:13px;">${d.area}, ${d.city}</span><br>
                    <b style="color:#f4c542; font-size:14px;">₹${d.price}/night · ${d.type}</b><br>
                    <small style="color:#888;">🎯 ${d.ssb}</small><br>
                    <small style="color:#888;">🚶 ${d.distance} km to SSB gate</small><br>
                    <button onclick="openFoodPanel('${d.city}')"
                        style="margin-top:10px; width:100%; background:#f4c542; color:#000; border:none; padding:9px; border-radius:6px; font-weight:700; cursor:pointer; font-family:'Outfit',sans-serif;">
                        🍽️ Nearby Food & Hotels
                    </button>
                </div>
            `);
        newMarkers.push(m);
        markers[d.id] = m;
    });

    markerCluster.addLayers(newMarkers);
}

// ══════════════════════════════════════════════════════
//  SKELETON LOADER
// ══════════════════════════════════════════════════════
function showLoadingSkeleton() {
    const listEl = document.getElementById('list');
    if(!listEl) return;
    listEl.innerHTML = ''; 
    for(let i = 0; i < 4; i++) {
        listEl.innerHTML += `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-details">
                    <div class="skeleton-line" style="width: 80%;"></div>
                    <div class="skeleton-line" style="width: 50%;"></div>
                    <div class="skeleton-line" style="width: 90%; margin-top: 15px;"></div>
                </div>
            </div>
        `;
    }
}

// ══════════════════════════════════════════════════════
//  INIT MAP
// ══════════════════════════════════════════════════════
function initMap() {
    const indiaBounds = L.latLngBounds(L.latLng(6.5, 68.0), L.latLng(35.5, 97.5));

    map = L.map('map', {
        zoomControl: false,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        preferCanvas: true
    }).setView([22.9074, 79.1469], 5);

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&gl=IN&x={x}&y={y}&z={z}', {
        maxZoom: 20, minZoom: 5, noWrap: true 
    }).addTo(map);

    markerCluster = L.markerClusterGroup({
        chunkedLoading: true, 
        showCoverageOnHover: false,
        maxClusterRadius: 50
    });
    map.addLayer(markerCluster);

    setTimeout(() => { map.invalidateSize(); }, 500);

    showLoadingSkeleton(); 

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, {duration: 1.5});
        }, err => {
            console.log("Location access denied or unavailable.");
        });
    }

    const verifiedQuery = query(collection(db, "rentals"), where("verified", "==", true));
    onSnapshot(verifiedQuery, (snapshot) => {
        listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render(); 
    }, (error) => {
        console.error("Firebase Read Error: ", error);
        document.getElementById('list').innerHTML = `<div style="padding:20px; color:#ff4444; text-align:center;">Error loading data.</div>`;
    });
}

// ══════════════════════════════════════════════════════
//  RENDER LISTINGS
// ══════════════════════════════════════════════════════
function render() {
    // If in dorm mode, render dorms instead
    if (typeFilter === 'dorm') { renderDorms(); return; }

    let filtered = listings.filter(r => {
        if (r.reportCount && r.reportCount >= 3) return false;
        if (maxPrice < 100000 && r.price > maxPrice) return false; 
        const matchesType = (typeFilter === 'all' || r.type === typeFilter);
        const matchesSearch = (smartSearchQ === '' || r.name.toLowerCase().includes(smartSearchQ) || r.area.toLowerCase().includes(smartSearchQ) || r.city.toLowerCase().includes(smartSearchQ));
        return matchesType && matchesSearch; 
    });

    filtered.sort((a, b) => {
        if (sortPref === 'priceAsc') return a.price - b.price;
        if (sortPref === 'priceDesc') return b.price - a.price;
        if (sortPref === 'near') return parseFloat(a.distance || 2) - parseFloat(b.distance || 2);
        return (b.createdAt || 0) - (a.createdAt || 0); 
    });

    document.getElementById('cnt').textContent = filtered.length + ' listings found';
    const listEl = document.getElementById('list'); 
    listEl.innerHTML = '';
    
    markerCluster.clearLayers();
    markers = {}; 
    let newMarkersArray = [];

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; background: var(--card); border-radius: 12px; border: 1px dashed #555; margin-top: 10px;">
                <div style="font-size: 40px; margin-bottom: 15px;">🗺️</div>
                <h3 style="margin-bottom: 10px; font-size: 18px;">No homes found here</h3>
                <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">We don't have verified listings matching these filters yet.</p>
                <button onclick="openRequestModal()" style="background: var(--accent); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-family: 'Outfit', sans-serif;">Request a Home Here</button>
            </div>
        `;
        return; 
    }

    filtered.forEach(r => {
        const d = document.createElement('div'); d.className = 'lc'; d.id = 'card-' + r.id; 
        if(!r.distance) r.distance = (Math.random() * 3 + 0.5).toFixed(1);

        let bahColor = r.price <= 15000 ? '#3ecf8e' : r.price <= 30000 ? '#f4c542' : '#fc5c7d';
        let bahTag = `<span class="tag" style="border-color: ${bahColor}; color: ${bahColor};">` + (r.price <= 15000 ? '🟢 OR' : r.price <= 30000 ? '🟡 JCO' : '🔴 Offr') + `</span>`;
        let dateTag = r.available ? `<span class="tag" style="background: rgba(255,215,0,0.1); color: var(--gold); border-color: var(--gold);">📅 Avail: ${r.available}</span>` : `<span class="tag" style="background: rgba(62,207,142,0.1); color: #3ecf8e; border-color: #3ecf8e;">📅 Immediate</span>`;

        let thumbUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=80";
        if (r.mediaUrls && r.mediaUrls.length > 0) {
            thumbUrl = r.mediaUrls[0];
            if (thumbUrl.includes('cloudinary.com')) thumbUrl = thumbUrl.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/');
        }
        let thumbHtml = `<img src="${thumbUrl}" loading="lazy">`;

        d.innerHTML = `
            <div class="lc-flex" style="transition: 0.2s;">
                <div class="lc-thumb">${thumbHtml}</div>
                <div class="lc-details">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:15px;">${r.name}</strong>
                        <b style="color:var(--gold)">₹${r.price}</b>
                    </div>
                    <small style="color:var(--text); display:block; margin-top:2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📍 ${r.area}, ${r.city}</small>
                    <small style="color:var(--muted); display:block; margin-top:2px;">🚶 ~${r.distance} km from Cantt Gate</small>
                    <div style="margin-top: 6px; display:flex; flex-wrap:wrap; gap:5px;">
                        ${dateTag} <span class="tag">${r.type.toUpperCase()}</span> ${bahTag}
                    </div>
                </div>
            </div>
        `;
        
        const customIcon = L.divIcon({ className: '', html: `<div class="pm" style="border-color:${bahColor}; color:${bahColor}; box-shadow: 0 4px 15px rgba(0,0,0,0.6); transform: scale(1.1);"><style>.pm::after{border-top-color:${bahColor};}</style>₹${(r.price/1000).toFixed(0)}K</div>`, iconAnchor: [30, 34], popupAnchor: [0, -34], iconSize: [60, 34] });
        
        let popupBtn = `<button onclick="openDetailModal('${r.id}')" style="width:100%; background:var(--accent); color:#fff; padding:10px; border:none; border-radius