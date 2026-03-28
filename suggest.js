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
    const percentileTxt = s.percentile !== null
        ? `Cheaper than <b>${s.percentile}%</b> of listings in ${listing.city}`
        : 'Not enough local data for comparison';
    const fairStr = `₹${s.fairPrice.toLocaleString()}`;
    const deltaStr = s.delta > 0 ? `+₹${Math.abs(s.delta).toLocaleString()} above` : `₹${Math.abs(s.delta).toLocaleString()} below`;
    const moodBar = Math.min(100, Math.max(0, 50 + s.deltaPct * -1));

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
      <div style="font-size:11px;color:var(--muted);margin-top:4px;opacity:.7;">Based on BAH tiers, city, furnishing & local listings. For reference only.</div>
    </div>`;
}
