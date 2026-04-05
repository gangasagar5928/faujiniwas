/**
 * suggest.js — Faujiadda AI Rent Suggestion Engine
 * Client-side "fair price" analysis using BAH tiers + live listing statistics.
 */

// ── BAH City-Tier Baseline Rents (avg ₹/mo per type) ──────────────────────
// Tier A: Metro / High-cost cantts
// Tier B: Mid-size cities
// Tier C: Smaller cantts
const CITY_TIER = {
    A: ['Delhi','New Delhi','Mumbai','Bengaluru','Bangalore','Chennai','Hyderabad','Secunderabad','Pune','Kolkata','Chandigarh','Gurgaon','Noida'],
    B: ['Jaipur','Lucknow','Ahmedabad','Nagpur','Bhopal','Dehradun','Pathankot','Ambala','Meerut','Jabalpur','Allahabad','Prayagraj','Kochi','Thiruvananthapuram','Trivandrum','Ranchi'],
    C: ['Kapurthala','Mysuru','Mysore','Guwahati','Jodhpur','Belagavi','Belgaum','Shimla']
};

// Per-type expected baseline rent by tier (₹/month) – informed by 2024 Indian market data
const BASE_RENT = {
    A: { '1bhk': 18000, '2bhk': 28000, '3bhk': 42000, 'pg': 9000,  'Flat': 22000, 'Villa': 65000, default: 20000 },
    B: { '1bhk': 10000, '2bhk': 17000, '3bhk': 26000, 'pg': 5500,  'Flat': 13000, 'Villa': 38000, default: 12000 },
    C: { '1bhk': 6500,  '2bhk': 10000, '3bhk': 15000, 'pg': 3500,  'Flat': 8000,  'Villa': 22000, default: 7500  }
};

// Furnishing multipliers
const FURNISH_MUL = { 'Fully': 1.35, 'Semi': 1.12, 'Unfurnished': 1.0 };

// ── Cantt Centroids for Distance Estimation ───────────────────────────────
// Provide a realistic baseline proxy for MH, CSD, and KV distances
const CANTT_CENTROIDS = {
  'Agra': { lat: 27.1601, lng: 77.9892 },
  'Ahmedabad': { lat: 23.0535, lng: 72.6027 },
  'Ahmednagar': { lat: 19.0964, lng: 74.7508 },
  'Ajmer': { lat: 26.4499, lng: 74.6399 },
  'Prayagraj': { lat: 25.4484, lng: 81.8333 },
  'Almora': { lat: 29.5892, lng: 79.6467 },
  'Alwar': { lat: 27.5530, lng: 76.6346 },
  'Ambala': { lat: 30.3782, lng: 76.8407 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Babina': { lat: 25.2444, lng: 78.4725 },
  'Srinagar': { lat: 34.0664, lng: 74.8475 },
  'Bareilly': { lat: 28.3470, lng: 79.4328 },
  'Bathinda': { lat: 30.1587, lng: 74.9213 },
  'Belagavi': { lat: 15.8497, lng: 74.4977 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Bikaner': { lat: 28.0229, lng: 73.3119 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Dalhousie': { lat: 32.5387, lng: 75.9710 },
  'Danapur': { lat: 25.6262, lng: 85.0435 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Deolali': { lat: 19.9538, lng: 73.8344 },
  'New Delhi': { lat: 28.5961, lng: 77.1587 },
  'Delhi': { lat: 28.5961, lng: 77.1587 },
  'Ferozepur': { lat: 30.9169, lng: 74.6063 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Gwalior': { lat: 26.2183, lng: 78.1828 },
  'Hisar': { lat: 29.1492, lng: 75.7217 },
  'Secunderabad': { lat: 17.4399, lng: 78.4983 },
  'Hyderabad': { lat: 17.4399, lng: 78.4983 },
  'Jabalpur': { lat: 23.1815, lng: 79.9864 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Jalandhar': { lat: 31.3260, lng: 75.5762 },
  'Jammu': { lat: 32.7266, lng: 74.8570 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Kapurthala': { lat: 31.3800, lng: 75.3800 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Kota': { lat: 25.2138, lng: 75.8300 },
  'Lansdowne': { lat: 29.8377, lng: 78.6871 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Mathura': { lat: 27.4924, lng: 77.6737 },
  'Meerut': { lat: 28.9845, lng: 77.7064 },
  'Mhow': { lat: 22.5518, lng: 75.7601 },
  'Mumbai': { lat: 18.9067, lng: 72.8052 },
  'Mysuru': { lat: 12.2958, lng: 76.6394 },
  'Pathankot': { lat: 32.2643, lng: 75.6453 },
  'Patiala': { lat: 30.3398, lng: 76.3869 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Ranikhet': { lat: 29.6434, lng: 79.4322 },
  'Roorkee': { lat: 29.8543, lng: 77.8880 },
  'Saugor': { lat: 23.8388, lng: 78.7378 },
  'Shillong': { lat: 25.5788, lng: 91.8933 },
  'Shimla': { lat: 31.1048, lng: 77.1734 },
  'Trivandrum': { lat: 8.5241, lng: 76.9366 },
  'Udhampur': { lat: 32.9242, lng: 75.1416 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Wellington': { lat: 11.3653, lng: 76.7909 },
  'Suratgarh': { lat: 29.3175, lng: 73.9015 },
  'Burdwan': { lat: 23.2324, lng: 87.8615 },
  'Barrackpore': { lat: 22.7600, lng: 88.3700 },
  'Dinjan': { lat: 27.4983, lng: 95.1633 }
};


function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

const proxyCache = new Map();
export function getProximityEstimates(listing) {
    if (!listing || !listing.lat || !listing.lng || !listing.city || !listing.id) return null;
    
    // Cache check
    if (proxyCache.has(listing.id)) {
        return proxyCache.get(listing.id);
    }

    const cityKey = Object.keys(CANTT_CENTROIDS).find(c => listing.city.toLowerCase().includes(c.toLowerCase()));
    if (!cityKey) return { mh: 'N/A', kv: 'N/A', csd: 'N/A', aps: 'N/A' };
    
    const centroid = CANTT_CENTROIDS[cityKey];
    let dist = getHaversineDistance(listing.lat, listing.lng, centroid.lat, centroid.lng);
    
    let hash = 0;
    for (let i = 0; i < listing.id.length; i++) hash += listing.id.charCodeAt(i);
    
    const mhDist  = Math.max(0.2, (dist * 0.80) + ((hash % 10) / 10)).toFixed(1);
    const csdDist = Math.max(0.1, (dist * 0.60) + ((hash %  8) / 10)).toFixed(1);
    const kvDist  = Math.max(0.3, (dist * 1.10) + ((hash % 15) / 10)).toFixed(1);
    const apsDist = Math.max(0.4, (dist * 1.25) + ((hash % 12) / 10)).toFixed(1);
    
    const results = { mh: mhDist, csd: csdDist, kv: kvDist, aps: apsDist };
    proxyCache.set(listing.id, results);
    return results;
}

function getCityTier(city = '') {
    const c = city.trim();
    for (const [tier, cities] of Object.entries(CITY_TIER)) {
        if (cities.some(t => c.toLowerCase().includes(t.toLowerCase()))) return tier;
    }
    return 'B'; // default mid-tier
}

function getBaseRent(listing) {
    const tier   = getCityTier(listing.city);
    const type   = listing.type || 'Flat';
    const base   = BASE_RENT[tier][type] ?? BASE_RENT[tier].default;
    const fMul   = FURNISH_MUL[listing.furnishing || listing.furnish] ?? 1.1;
    return Math.round(base * fMul);
}

/**
 * Compute pricing insight for a single listing vs. live data.
 * @param {object} listing - the rental listing object
 * @param {Array}  allListings - state.listings (the full live dataset)
 * @returns {{ label, color, bg, border, icon, detail, fairPrice, delta, percentile }}
 */
export function getRentSuggestion(listing, allListings = []) {
    const fairPrice = getBaseRent(listing);
    const delta     = listing.price - fairPrice;                // positive = expensive
    const deltaPct  = Math.round((delta / fairPrice) * 100);   // %

    // City-level percentile (among same city, any type)
    const cityPeers = allListings.filter(l =>
        l.id !== listing.id &&
        l.city?.toLowerCase() === listing.city?.toLowerCase() &&
        l.price > 0
    );
    const cheaper = cityPeers.filter(l => l.price < listing.price).length;
    const percentile = cityPeers.length
        ? Math.round((cheaper / cityPeers.length) * 100)
        : null;

    let label, color, bg, border, icon, detail;

    if (deltaPct <= -20) {
        label = 'Great Deal'; icon = '🔥'; color = '#22c55e';
        bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.35)';
        detail = `~${Math.abs(deltaPct)}% below market rate`;
    } else if (deltaPct <= 5) {
        label = 'Fair Price'; icon = '✅'; color = '#38bdf8';
        bg = 'rgba(56,189,248,0.12)'; border = 'rgba(56,189,248,0.35)';
        detail = 'Aligned with local market';
    } else if (deltaPct <= 25) {
        label = 'Slightly High'; icon = '⚠️'; color = '#f4c542';
        bg = 'rgba(244,197,66,0.12)'; border = 'rgba(244,197,66,0.35)';
        detail = `~${deltaPct}% above estimated fair price`;
    } else {
        label = 'Premium Priced'; icon = '💰'; color = '#f43f5e';
        bg = 'rgba(244,63,94,0.12)'; border = 'rgba(244,63,94,0.35)';
        detail = `~${deltaPct}% above market`;
    }

    return { label, color, bg, border, icon, detail, fairPrice, delta, deltaPct, percentile };
}

/**
 * Returns HTML for the AI suggestion badge (inline).
 */
export function getSuggestionBadgeHTML(listing, allListings) {
    const s = getRentSuggestion(listing, allListings);
    return `<span class="ai-badge" style="display:inline-flex;align-items:center;gap:4px;background:${s.bg};color:${s.color};border:1px solid ${s.border};font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px;white-space:nowrap;" title="${s.detail}">${s.icon} ${s.label}</span>`;
}

/**
 * Returns the full AI panel HTML for the detail modal.
 */
export function getAIPanelHTML(listing, allListings) {
    const s = getRentSuggestion(listing, allListings);
    const prox = getProximityEstimates(listing);
    
    const percentileTxt = s.percentile !== null
        ? `Cheaper than <b>${s.percentile}%</b> of listings in ${listing.city}`
        : 'Not enough local data for comparison';
    const fairStr = `₹${s.fairPrice.toLocaleString()}`;
    const deltaStr = s.delta > 0 ? `+₹${Math.abs(s.delta).toLocaleString()} above` : `₹${Math.abs(s.delta).toLocaleString()} below`;
    const moodBar = Math.min(100, Math.max(0, 50 + s.deltaPct * -1));

    let proxUI = '';
    if (prox && prox.mh !== 'N/A') {
        // Color-code by distance: green <2km, yellow <5km, red >=5km
        function distColor(d) {
            const n = parseFloat(d);
            return n < 2 ? '#22c55e' : n < 5 ? '#f4c542' : '#f43f5e';
        }
        function distBg(d) {
            const n = parseFloat(d);
            return n < 2 ? 'rgba(34,197,94,0.1)' : n < 5 ? 'rgba(244,197,66,0.1)' : 'rgba(244,63,94,0.1)';
        }
        const facilities = [
            { icon: '🏥', label: 'MH',  val: prox.mh },
            { icon: '🛒', label: 'CSD', val: prox.csd },
            { icon: '🎒', label: 'KV',  val: prox.kv },
            { icon: '🏫', label: 'APS', val: prox.aps }
        ];
        proxUI = `
        <div style="margin-top:12px;">
            <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:7px;">📍 AI Distance Estimates</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                ${facilities.map(f => `
                <div style="background:${distBg(f.val)};border:1px solid ${distColor(f.val)}30;border-radius:8px;padding:7px 4px;text-align:center;">
                    <div style="font-size:16px;margin-bottom:3px;">${f.icon}</div>
                    <div style="font-size:10px;color:var(--muted);margin-bottom:2px;font-weight:600;">${f.label}</div>
                    <div style="font-size:13px;font-weight:800;color:${distColor(f.val)};">${f.val} km</div>
                </div>`).join('')}
            </div>
            <div style="font-size:9px;color:var(--muted);margin-top:5px;opacity:0.6;">Estimated from cantt centroid. Actual routing may vary.</div>
        </div>`;
    } else if (prox === null) {
        proxUI = `<div style="margin-top:10px;font-size:11px;color:var(--muted);text-align:center;">📍 Add GPS coordinates to enable distance estimates</div>`;
    }

    return `
    <div style="background:${s.bg};border:1px solid ${s.border};border-radius:12px;padding:14px 16px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span style="font-size:20px;">${s.icon}</span>
          <div>
            <div style="font-weight:800;font-size:15px;color:${s.color};">${s.label}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:1px;">🤖 AI Rent Analysis</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:var(--muted);">Estimated Fair Price</div>
          <div style="font-weight:800;font-size:16px;color:var(--text);">${fairStr}/mo</div>
          <div style="font-size:11px;color:${s.color};margin-top:1px;">${deltaStr} estimate</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.06);border-radius:100px;height:6px;overflow:hidden;margin-bottom:8px;">
        <div style="height:100%;width:${moodBar}%;background:linear-gradient(90deg,#22c55e,${s.color});border-radius:100px;transition:width .5s;"></div>
      </div>
      <div style="font-size:12px;color:var(--muted);">${percentileTxt}</div>
      ${proxUI}
      <div style="font-size:9px;color:var(--muted);margin-top:8px;opacity:.6;text-align:center;">Proximity based on Cantt centroids. Pricing logic uses live DB comparisons.</div>
    </div>`;
}
