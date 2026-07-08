/**
 * FaujiNiwas — AI Transfer Assistant
 * Rule-based chatbot wizard. No external API required.
 * Matches rank + destination to live listings.
 */

const HRA_LIMITS = {
    'OR':      { max: 9000,  label: 'Other Rank (OR)',    icon: '🪖' },
    'NCO':     { max: 11000, label: 'NCO / Havildar',     icon: '⭐' },
    'JCO':     { max: 15000, label: 'JCO / Sub / Nb Sub', icon: '🎖️' },
    'OFFICER': { max: 28000, label: 'Officer (Lt–Col)',    icon: '🌟' },
    'SR_OFF':  { max: 40000, label: 'Senior Officer',      icon: '🏅' },
};

const CANTONMENTS = [
    'Pune','Delhi','Ambala','Secunderabad','Bengaluru','Meerut','Lucknow',
'Jalandhar','Dehradun','Chandigarh','Jodhpur','Jaipur','Mhow','Jabalpur',
'Belagavi','Kolkata','Guwahati','Pathankot','Ooty','Ranchi','Srinagar',
'Jammu','Kochi','Udhampur','Leh','Bathinda','Bikaner','Bareilly','Roorkee',
'Patna','Shillong','Vizag','Wellington','Allahabad','Prayagraj','Agra',
'Mathura','Bhopal','Hyderabad','Chennai','Mumbai','Nagpur','Vadodara'
];

const FLOW = [
    {
        id: 'start',
        msg: '👋 <b>Jai Hind!</b> I\'m your AI Transfer Assistant.<br><br>I\'ll help you find the perfect home for your next posting. Let\'s start — <b>what\'s your rank category?</b>',
        options: Object.entries(HRA_LIMITS).map(([k, v]) => ({ label: `${v.icon} ${v.label}`, value: k })),
        key: 'rank'
    },
{
    id: 'station',
    msg: '📍 Got it! Now, <b>which cantonment are you posting to?</b>',
    freeText: true,
    placeholder: 'e.g. Pune, Ambala, Secunderabad...',
    key: 'station'
},
{
    id: 'bhk',
    msg: '🏠 <b>What type of home does your family need?</b>',
    options: [
        { label: '🛏️ PG / Room (Bachelor)', value: 'PG/Room' },
        { label: '🏠 1 BHK', value: '1BHK' },
        { label: '🏡 2 BHK', value: '2BHK' },
        { label: '🏘️ 3 BHK', value: '3BHK' },
        { label: '🔍 Show All Types', value: 'any' }
    ],
    key: 'bhk'
},
{
    id: 'budget',
    msg: (state) => {
        const limit = HRA_LIMITS[state.rank]?.max || 15000;
        return `💰 Your HRA limit is approx <b>₹${limit.toLocaleString()}/month</b>.<br>Should I filter within your HRA, or search a custom range?`;
    },
    options: (state) => {
        const limit = HRA_LIMITS[state.rank]?.max || 15000;
        return [
            { label: `✅ Within HRA (up to ₹${limit.toLocaleString()})`, value: 'hra' },
            { label: '🔼 Slightly above HRA (+20%)', value: 'above' },
            { label: '🔍 Show all prices', value: 'all' }
        ];
    },
    key: 'budget'
}
];

let botState = {};
let botStep = 0;
let botOpen = false;

function createChatbotUI() {
    if (document.getElementById('fauji-chatbot')) return;

    const el = document.createElement('div');
    el.id = 'fauji-chatbot';
    el.innerHTML = `
    <style>
    #fauji-chatbot {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999;
    font-family: 'Outfit', sans-serif;
    }
    @media (max-width: 768px) {
        #fauji-chatbot { bottom: 90px; right: 16px; }
        #cb-window { bottom: 74px; right: 0; max-height: 60vh; }
    }
    #cb-bubble {
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #FF9933, #FFD700);
    box-shadow: 0 8px 32px rgba(255,153,51,0.45), 0 0 0 0 rgba(255,153,51,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; cursor: pointer;
    border: none; outline: none;
    animation: cbPulse 2.5s ease-in-out infinite;
    transition: transform 0.2s ease;
    }
    #cb-bubble:hover { transform: scale(1.1); }
    @keyframes cbPulse {
        0%,100% { box-shadow: 0 8px 32px rgba(255,153,51,0.45), 0 0 0 0 rgba(255,153,51,0.3); }
        50%      { box-shadow: 0 8px 32px rgba(255,153,51,0.45), 0 0 0 12px rgba(255,153,51,0); }
    }
    #cb-badge {
    position: absolute; top: -4px; right: -4px;
    background: #f43f5e; color: #fff; font-size: 10px;
    font-weight: 700; width: 18px; height: 18px;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    border: 2px solid #0B0F1A;
    }
    #cb-window {
    position: absolute; bottom: 74px; right: 0;
    width: 340px; max-width: 95vw;
    background: #111827;
    border: 1px solid rgba(255,153,51,0.2);
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,153,51,0.08);
    display: none; flex-direction: column; overflow: hidden;
    animation: cbSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes cbSlideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    #cb-header {
    background: linear-gradient(135deg, rgba(255,153,51,0.15), rgba(255,215,0,0.08));
    border-bottom: 1px solid rgba(255,153,51,0.15);
    padding: 14px 16px;
    display: flex; align-items: center; gap: 10px;
    }
    #cb-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #FF9933, #FFD700);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    }
    #cb-header-text { flex: 1; }
    #cb-header-text b { display: block; font-size: 13px; color: #F1F1EE; }
    #cb-header-text span { font-size: 11px; color: #22c55e; }
    #cb-close {
    background: none; border: none; color: #8892A4;
    font-size: 18px; cursor: pointer; padding: 4px;
    transition: color 0.2s;
    }
    #cb-close:hover { color: #F1F1EE; }
    #cb-messages {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
    max-height: 320px; scrollbar-width: thin;
    scrollbar-color: rgba(255,153,51,0.3) transparent;
    }
    .cb-msg {
        max-width: 88%; font-size: 13px; line-height: 1.5;
        padding: 10px 13px; border-radius: 14px;
        animation: cbFadeIn 0.25s ease;
    }
    @keyframes cbFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .cb-msg.bot {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.07);
        color: #F1F1EE; align-self: flex-start;
        border-bottom-left-radius: 4px;
    }
    .cb-msg.user {
        background: linear-gradient(135deg, rgba(255,153,51,0.25), rgba(255,215,0,0.15));
        border: 1px solid rgba(255,153,51,0.3);
        color: #FFD700; align-self: flex-end; text-align: right;
        border-bottom-right-radius: 4px;
    }
    #cb-options {
    padding: 10px 14px 14px;
    display: flex; flex-direction: column; gap: 7px;
    }
    .cb-opt {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,153,51,0.2);
        color: #F1F1EE; padding: 9px 13px;
        border-radius: 10px; font-size: 13px; font-weight: 600;
        cursor: pointer; text-align: left; font-family: 'Outfit', sans-serif;
        transition: all 0.18s ease;
    }
    .cb-opt:hover {
        background: rgba(255,153,51,0.12);
        border-color: rgba(255,153,51,0.5);
        transform: translateX(3px);
    }
    #cb-input-row {
    display: none; padding: 10px 14px;
    gap: 8px; background: rgba(255,255,255,0.02);
    border-top: 1px solid rgba(255,255,255,0.06);
    }
    #cb-input {
    flex: 1; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,153,51,0.25); border-radius: 8px;
    color: #F1F1EE; padding: 8px 12px; font-size: 13px;
    font-family: 'Outfit', sans-serif; outline: none;
    }
    #cb-input:focus { border-color: rgba(255,153,51,0.6); }
    #cb-send {
    background: #FF9933; color: #0B0F1A; border: none;
    border-radius: 8px; padding: 8px 12px; cursor: pointer;
    font-size: 16px; transition: transform 0.15s;
    }
    #cb-send:hover { transform: scale(1.08); }
    #cb-results {
    padding: 0 14px 14px;
    display: flex; flex-direction: column; gap: 8px;
    }
    .cb-listing-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,153,51,0.15);
        border-radius: 12px; padding: 11px 13px;
        cursor: pointer; transition: all 0.18s;
    }
    .cb-listing-card:hover {
        border-color: rgba(255,153,51,0.4);
        background: rgba(255,153,51,0.07);
    }
    .cb-listing-card b { display: block; font-size: 13px; color: #F1F1EE; }
    .cb-listing-card span { font-size: 11px; color: #8892A4; }
    .cb-listing-card .cb-price { color: #FF9933; font-weight: 700; font-size: 14px; }
    #cb-restart {
    margin: 0 14px 14px;
    background: none; border: 1px solid rgba(255,255,255,0.1);
    color: #8892A4; border-radius: 8px; padding: 8px;
    font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
    }
    #cb-restart:hover { border-color: rgba(255,153,51,0.3); color: #FF9933; }
    @media (max-width: 400px) {
        #cb-window { width: 310px; }
    }
    </style>

    <div style="position:relative;">
    <button id="cb-bubble" onclick="window.toggleChatbot()" aria-label="Open AI Transfer Assistant">🤖</button>
    <div id="cb-badge">AI</div>
    </div>

    <div id="cb-window">
    <div id="cb-header">
    <div id="cb-avatar">🤖</div>
    <div id="cb-header-text">
    <b>AI Transfer Assistant</b>
    <span>● Online — FaujiNiwas</span>
    </div>
    <button id="cb-close" onclick="window.toggleChatbot()" aria-label="Close">✕</button>
    </div>
    <div id="cb-messages"></div>
    <div id="cb-options"></div>
    <div id="cb-input-row">
    <input id="cb-input" type="text" placeholder="Type your posting station..." autocomplete="off">
    <button id="cb-send" onclick="window.cbSubmitText()">➤</button>
    </div>
    <div id="cb-results"></div>
    <button id="cb-restart" style="display:none" onclick="window.cbRestart()">↺ Start Over</button>
    </div>
    `;

    document.body.appendChild(el);

    // ── Draggable Logic ──
    const bubble = document.getElementById('cb-bubble');
    const container = document.getElementById('fauji-chatbot');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    function startDrag(e) {
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        const rect = container.getBoundingClientRect();
        initialX = window.innerWidth - rect.right;
        initialY = window.innerHeight - rect.bottom;
        isDragging = true;
        bubble.style.animation = 'none'; // Stop pulse while dragging
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        let currentX, currentY;
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        const dx = startX - currentX;
        const dy = startY - currentY;

        const newRight = Math.max(10, Math.min(window.innerWidth - 70, initialX + dx));
        const newBottom = Math.max(10, Math.min(window.innerHeight - 70, initialY + dy));

        container.style.right = newRight + 'px';
        container.style.bottom = newBottom + 'px';
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        bubble.style.animation = 'cbPulse 2.5s ease-in-out infinite';
    }

    bubble.addEventListener('mousedown', startDrag);
    bubble.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    // Allow enter key in text input
    document.getElementById('cb-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') window.cbSubmitText();
    });

        // ── Live autocomplete suggestions ──
        const cbInput = document.getElementById('cb-input');
        const suggestBox = document.createElement('div');
        suggestBox.id = 'cb-suggest';
        suggestBox.style.cssText = `
        position:absolute; bottom:100%; left:0; right:0;
        background:#1a2540; border:1px solid rgba(255,153,51,0.25);
        border-radius:10px; overflow:hidden; margin-bottom:4px;
        display:none; flex-direction:column; z-index:10;
        box-shadow:0 -8px 24px rgba(0,0,0,0.4);
        `;
        cbInput?.parentElement?.style && (cbInput.parentElement.style.position = 'relative');
        cbInput?.parentElement?.appendChild(suggestBox);

        cbInput?.addEventListener('input', () => {
            const val = cbInput.value.trim().toLowerCase();
            suggestBox.innerHTML = '';
            if (val.length < 2) { suggestBox.style.display = 'none'; return; }
            const matches = CANTONMENTS.filter(c => c.toLowerCase().startsWith(val) || c.toLowerCase().includes(val)).slice(0, 5);
            if (!matches.length) { suggestBox.style.display = 'none'; return; }
            suggestBox.style.display = 'flex';
            matches.forEach(m => {
                const item = document.createElement('button');
                item.style.cssText = `background:none;border:none;border-bottom:1px solid rgba(255,255,255,0.05);color:#f1f1ee;padding:9px 13px;font-size:13px;cursor:pointer;text-align:left;font-family:'Outfit',sans-serif;transition:background .15s;`;
                item.innerHTML = `📍 ${m}`;
                item.onmouseenter = () => item.style.background = 'rgba(255,153,51,0.1)';
                item.onmouseleave = () => item.style.background = 'none';
                item.onclick = () => {
                    cbInput.value = m;
                    suggestBox.style.display = 'none';
                    window.cbSubmitText();
                };
                suggestBox.appendChild(item);
            });
        });

        document.addEventListener('click', e => {
            if (!e.target.closest('#cb-input-row')) suggestBox.style.display = 'none';
        });

            // ── Safe Toggle ──
            window.toggleChatbot = () => {
                botOpen = !botOpen;
                const win = document.getElementById('cb-window');
                win.style.display = botOpen ? 'flex' : 'none';
                if (botOpen && botStep === 0) window.cbStart();
            };

                window.cbStart = () => {
                    botState = {}; botStep = 0;
                    document.getElementById('cb-messages').innerHTML = '';
                    document.getElementById('cb-results').innerHTML = '';
                    document.getElementById('cb-restart').style.display = 'none';
                    cbShowStep();
                };

                window.cbRestart = () => { window.cbStart(); };
};

function cbAddMsg(text, who = 'bot') {
    const msgs = document.getElementById('cb-messages');
    const div = document.createElement('div');
    div.className = `cb-msg ${who}`;
    if (who === 'user') {
        // User messages: use textContent to prevent XSS from free-text input
        div.textContent = text;
    } else {
        // Bot messages: controlled HTML from our code, safe to render
        div.innerHTML = text;
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function cbShowStep() {
    const step = FLOW[botStep];
    if (!step) { cbShowResults(); return; }

    const msg = typeof step.msg === 'function' ? step.msg(botState) : step.msg;
    cbAddMsg(msg, 'bot');

    const optsEl = document.getElementById('cb-options');
    const inputRow = document.getElementById('cb-input-row');
    optsEl.innerHTML = '';
    inputRow.style.display = 'none';

    if (step.freeText) {
        inputRow.style.display = 'flex';
        const inp = document.getElementById('cb-input');
        inp.placeholder = step.placeholder || 'Type here...';
        inp.value = '';
        setTimeout(() => inp.focus(), 100);
    } else {
        const options = typeof step.options === 'function' ? step.options(botState) : step.options;
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'cb-opt';
            btn.textContent = opt.label;
            btn.onclick = () => cbSelectOption(opt.label, opt.value, step.key);
            optsEl.appendChild(btn);
        });
    }
}

window.cbSubmitText = () => {
    const inp = document.getElementById('cb-input');
    const val = inp.value.trim();
    if (!val) return;
    const step = FLOW[botStep];
    if (!step) return;

    // Must be at least 3 chars to search
    if (val.length < 3) {
        cbAddMsg('⚠️ Please type at least 3 letters of your cantonment name.', 'bot');
        inp.value = '';
        return;
    }

    // Strict fuzzy match — canton name must START with input OR input must be a substring of canton
    const lower = val.toLowerCase();
    const matched = CANTONMENTS.find(c => c.toLowerCase().startsWith(lower))
    || CANTONMENTS.find(c => c.toLowerCase().includes(lower));

    if (!matched) {
        cbAddMsg(`❌ <b>"${val}"</b> is not a recognised cantonment in our database.<br><br>Try: <i>Pune, Ambala, Bengaluru, Delhi, Secunderabad, Lucknow…</i>`, 'bot');
        inp.value = '';
        return;
    }

    cbSelectOption(matched, matched, step.key);
};

function cbSelectOption(label, value, key) {
    cbAddMsg(label, 'user');
    botState[key] = value;
    document.getElementById('cb-options').innerHTML = '';
    document.getElementById('cb-input-row').style.display = 'none';
    botStep++;

    setTimeout(() => cbShowStep(), 400);
}

function cbShowResults() {
    const optsEl = document.getElementById('cb-options');
    optsEl.innerHTML = '';
    document.getElementById('cb-input-row').style.display = 'none';

    cbAddMsg('🔍 <b>Searching listings…</b>', 'bot');

    setTimeout(() => {
        // Get listings from state (app.html) or pitch_data (index.html)
        let allListings = [];
        if (window.state?.listings?.length) {
            allListings = window.state.listings;
        } else if (typeof PITCH_LISTINGS !== 'undefined') {
            allListings = PITCH_LISTINGS;
        }

        // Filter logic
        const station = botState.station || '';
        const bhk = botState.bhk || 'any';
        const rank = botState.rank || 'JCO';
        const budgetMode = botState.budget || 'hra';
        const limit = HRA_LIMITS[rank]?.max || 15000;

        let maxPrice = limit;
        if (budgetMode === 'above') maxPrice = Math.round(limit * 1.2);
        if (budgetMode === 'all') maxPrice = 999999;

        let results = allListings.filter(l => {
            const cityLower = (l.city || '').toLowerCase();
            const stationLower = station.toLowerCase();
            // Strict match: city must start with station OR station must start with city (handles Allahabad/Prayagraj)
            const cityMatch = !station
            || cityLower === stationLower
            || cityLower.startsWith(stationLower)
            || stationLower.startsWith(cityLower)
            || cityLower.includes(stationLower)
            || (l.area || '').toLowerCase().includes(stationLower);
            const bhkMatch = bhk === 'any' || l.type === bhk;
            const priceMatch = l.price <= maxPrice;
            return cityMatch && bhkMatch && priceMatch;
        });

        // Sort by verified first, then newest
        results = results
        .sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);

        const resEl = document.getElementById('cb-results');
        resEl.innerHTML = '';

        if (!results.length) {
            cbAddMsg(`😔 No listings found in <b>${station}</b> matching your criteria yet. Try a broader search or check back soon.`, 'bot');
            document.getElementById('cb-restart').style.display = 'block';
            return;
        }

        cbAddMsg(`✅ Found <b>${results.length} listing${results.length > 1 ? 's' : ''}</b> for <b>${HRA_LIMITS[rank]?.label || rank}</b> in <b>${station}</b>:`, 'bot');

        results.forEach(l => {
            const card = document.createElement('div');
            card.className = 'cb-listing-card';
            card.innerHTML = `
            <b>${l.name || l.type + ' ' + l.city}</b>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span>📍 ${l.area || 'Cantt Area'}, ${l.city}${l.verified ? ' · ✅ Verified' : ''}</span>
            <span class="cb-price">₹${(l.price||0).toLocaleString()}/mo</span>
            </div>
            ${l.distance ? `<span>🚗 ${l.distance} km from gate</span>` : ''}`;
            card.onclick = () => {
                // If on app.html, open the detail modal via global API
                if (window.openDetailModal && l.id) {
                    if (window.toggleChatbot) window.toggleChatbot();
                    window.openDetailModal(l.id);
                } else {
                    // On index.html, navigate to app with listing param
                    window.location.href = `/app?listing=${l.id}`;
                }
            };
            resEl.appendChild(card);
        });

        document.getElementById('cb-restart').style.display = 'block';
    }, 800);
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotUI);
} else {
    createChatbotUI();
}
