import React, { useMemo, useState, useEffect } from "react";
import "../landing-template.css";

const features = [
  ["⌂", "Verified & trusted stays", "Listings reviewed for service-community needs."],
  ["⌖", "62+ defence stations", "Find accommodation around covered stations."],
  ["✓", "Secure bookings", "A clearer, verification-led booking journey."],
  ["♧", "Family-friendly options", "Plan transit stays with family requirements in mind."],
  ["▦", "Flexible booking", "Short-term and longer-stay options."],
  ["₹", "Transparent pricing", "Clear pricing without surprise platform charges."],
  ["▤", "HRA & TA/DA guidance", "Practical guidance for common travel entitlements."],
  ["◇", "Station discovery", "Explore supported locations on a map."],
  ["♧", "URC updates", "A dedicated place for circulars and announcements."],
  ["◉", "Dedicated support", "Help when you need assistance with a stay."],
  ["☆", "Community feedback", "Ratings and reviews from the defence community."],
  ["▣", "Mobile-friendly", "A responsive experience across devices."]
];

const comparisons = [
  ["Accommodation discovery", "Scattered listings and references", "Defence-focused discovery in one place"],
  ["Location coverage", "Often limited or fragmented", "Coverage across 62+ stations*"],
  ["Booking journey", "Calls and manual coordination", "A guided online booking flow"],
  ["HRA information", "Rules can be difficult to interpret", "A simple city-category estimator"],
  ["Updates", "Multiple sources to track", "A central URC updates section"],
  ["Support", "Varies by provider", "A clear support channel"]
];

const samplePulses = [
  { type: "URC circular", title: "Circular No. 45/2026", detail: "Sample policy update", time: "Demo item" },
  { type: "HRA guidance", title: "HRA revision notes", detail: "Guidance update placeholder", time: "Demo item" },
  { type: "Station directory", title: "Station list", detail: "Coverage information placeholder", time: "Demo item" },
  { type: "General notice", title: "Veteran instructions", detail: "Notice placeholder", time: "Demo item" }
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 7th CPC Calculator state
  const [category, setCategory] = useState("X");
  const [basic, setBasic] = useState("35400");
  const [da, setDa] = useState("50");
  const [calculated, setCalculated] = useState(true);

  // Baseline 7th CPC HRA rates
  const rates = { X: 24, Y: 16, Z: 8 };
  const rate = rates[category];
  const monthly = useMemo(() => {
    const pay = Number(basic);
    const daValue = Number(da);
    if (!Number.isFinite(pay) || pay <= 0) return 0;
    // 7th CPC revised rates when DA crosses 50%: X = 30%, Y = 20%, Z = 10%
    const applicableRate = daValue >= 50 ? ({ X: 30, Y: 20, Z: 10 }[category]) : rate;
    const computed = (pay * applicableRate) / 100;
    const minHra = category === 'X' ? 5400 : category === 'Y' ? 3600 : 1800;
    return Math.max(minHra, computed);
  }, [basic, da, category, rate]);

  useEffect(() => {
    document.documentElement.classList.remove('app-shell', 'light-theme');
    document.body.classList.remove('app-shell', 'light-theme');
    document.documentElement.classList.add('dark', 'dark-theme');
    document.body.classList.add('dark', 'dark-theme');
    document.documentElement.style.backgroundColor = '#10110f';
    document.body.style.backgroundColor = '#10110f';
    document.documentElement.style.colorScheme = 'dark';
    try { localStorage.setItem('fn_theme', 'dark'); } catch { /* noop */ }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = '#10110f';
    window.__APP_READY__ = true;
    window.dispatchEvent(new Event('app-ready'));
  }, []);

  const handleLaunchApp = (station = '') => {
    setIsRedirecting(true);
    const targetUrl = station && typeof station === 'string' && station.trim().length > 0 
      ? `/app?search=${encodeURIComponent(station.trim())}` 
      : '/app';

    try { sessionStorage.setItem('fn_redirect', 'true'); } catch { /* noop */ }
    window.location.href = targetUrl;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleLaunchApp(searchQuery);
  };

  return (
    <div className="landing-canvas" id="landing-root">
            {/* ── Glassmorphic Header ── */}
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#home" aria-label="Fauji Niwas home">
            <span className="brand-mark">
              <img 
                src="/logo-dark.jpg" 
                alt="FN" 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = 'FN'; }}
              />
            </span>
            <span>
              <strong>Fauji Niwas</strong>
              <small>STAY · SERVE · BELONG</small>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#home" className="active">Home</a>
            <a href="#features">Features</a>
            <a href="#calculator">Calculator</a>
            <a href="#pulses">URC Pulses</a>
            <a href="#about">About</a>
            <a href="#policy">Policy</a>
          </nav>
          <button 
            type="button"
            className="nav-cta" 
            onClick={() => handleLaunchApp()}
            aria-label="Find a stay"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Find a Stay
          </button>
        </div>
      </header>

      <div className="landing-container">

      {/* ── Main Content ── */}
      <main>
        
        {/* ── Hero ── */}
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" /> A stay that understands service
            </p>
            <h1>
              A place to pause.<br />
              <em>A place to belong.</em>
            </h1>
            <p className="hero-sub">
              Discover comfortable, verified transit accommodation around defence stations — built around the needs of the Armed Forces community.
            </p>
            <form className="station-search" id="search" onSubmit={handleSearchSubmit}>
              <span aria-hidden="true">⌖</span>
              <input 
                aria-label="Search station" 
                placeholder="Search a station — e.g. Delhi Cantt, Pune…" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                Explore stays <span>→</span>
              </button>
            </form>
            <div className="hero-proof">
              <span>✓ Verification-led listings</span>
              <span>⌖ Station-focused</span>
              <span>♡ Built for the community</span>
            </div>
          </div>
          <div className="hero-visual" role="img" aria-label="Atmospheric image showing a service member at dusk">
            <div className="image-note">
              <span>FAUJI NIWAS</span>
              <p>Because every journey deserves a place to rest.</p>
            </div>
          </div>
          <div className="hero-bottom">
            <span>01 / A BETTER TRANSIT STAY</span>
            <span>MADE WITH RESPECT FOR THOSE WHO SERVE</span>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section" id="features">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE PLATFORM</p>
              <h2>Everything in one place.</h2>
            </div>
            <p className="section-intro">
              Twelve practical tools and touchpoints designed to make transit accommodation easier to discover and manage.
            </p>
          </div>
          <div className="feature-grid">
            {features.map(([icon, title, desc], i) => (
              <article 
                className="feature" 
                key={title} 
                onClick={() => handleLaunchApp()}
                title="Open Fauji Niwas App"
              >
                <span className="feature-number">{String(i + 1).padStart(2, "0")}</span>
                <span className="feature-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Difference / Why Us ── */}
        <section className="section difference" id="difference">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE DIFFERENCE</p>
              <h2>Not another listing page.</h2>
            </div>
            <p className="section-intro">
              A focused experience for service personnel and families, bringing discovery, useful guidance and updates together.
            </p>
          </div>
          <div className="comparison-wrap">
            <table className="comparison">
              <thead>
                <tr>
                  <th>What matters</th>
                  <th>Typical experience</th>
                  <th>Fauji Niwas approach</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fine-print">
            *Coverage figures and service availability should be updated against the live station directory before publication. Comparison describes the intended product experience, not a claim about every provider.
          </p>
        </section>

        {/* ── HRA Calculator ── */}
        <section className="section calculator-section" id="calculator">
          <div className="calculator-copy">
            <p className="eyebrow">PAY &amp; ENTITLEMENTS</p>
            <h2>Make HRA easier to understand.</h2>
            <p>
              Estimate monthly House Rent Allowance using your basic pay and the selected city category.
            </p>
            <div className="calculator-disclaimer">
              An indicative calculator — not an official entitlement determination. Confirm city classification, admissibility and current rates with the applicable government order / unit administration.
            </div>
          </div>
          <div className="calculator-card">
            <div className="calc-top">
              <span className="calc-icon">₹</span>
              <div>
                <h3>7th CPC HRA estimator</h3>
                <p>Enter your details to see an indicative estimate.</p>
              </div>
            </div>
            <label className="field-label">City classification</label>
            <div className="category-options">
              {["X", "Y", "Z"].map((c) => (
                <button 
                  type="button" 
                  key={c} 
                  className={category === c ? "category active" : "category"} 
                  onClick={() => { setCategory(c); setCalculated(true); }}
                >
                  <strong>{c}</strong>
                  <small>{c === "X" ? "Higher HRA (30%)" : c === "Y" ? "Mid HRA (20%)" : "Other stations (10%)"}</small>
                </button>
              ))}
            </div>
            <div className="calc-fields">
              <label>
                <span>Basic pay (₹ / month)</span>
                <input 
                  type="number" 
                  min="1" 
                  placeholder="e.g. 35400" 
                  value={basic} 
                  onChange={(e) => { setBasic(e.target.value); setCalculated(true); }} 
                />
              </label>
              <label>
                <span>DA rate (%)</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="Enter current DA" 
                  value={da} 
                  onChange={(e) => { setDa(e.target.value); setCalculated(true); }} 
                />
              </label>
            </div>
            <button 
              type="button"
              className="calculate-button" 
              onClick={() => setCalculated(true)}
            >
              Calculate estimate <span>→</span>
            </button>
            {calculated && (
              <div className="calc-result" aria-live="polite">
                <span>Estimated monthly HRA</span>
                <strong>
                  {monthly > 0 ? `₹${Math.round(monthly).toLocaleString("en-IN")}` : "Enter valid basic pay"}
                </strong>
                <small>
                  Applied rate: {Number(da) >= 50 ? ({ X: 30, Y: 20, Z: 10 }[category]) : rate}% for category {category} (7th CPC)
                </small>
              </div>
            )}
          </div>
        </section>

        {/* ── URC Pulses ── */}
        <section className="section pulses-section" id="pulses">
          <div className="section-heading">
            <div>
              <p className="eyebrow">INFORMATION DESK</p>
              <h2>URC pulses.</h2>
            </div>
            <span className="demo-status"><i /> Latest updates &amp; policies</span>
          </div>
          <div className="pulse-grid">
            {samplePulses.map((p, i) => (
              <article 
                className="pulse" 
                key={p.type} 
                onClick={() => handleLaunchApp()}
                title="View in Fauji Niwas App"
              >
                <span className="pulse-index">0{i + 1}</span>
                <div>
                  <small>{p.type}</small>
                  <h3>{p.title}</h3>
                  <p>{p.detail}</p>
                </div>
                <span className="pulse-arrow">↗</span>
              </article>
            ))}
          </div>
          <p className="fine-print">
            Official circulars and announcements from verified defence administration and community desks.
          </p>
        </section>

        {/* ── About the Real Founders ── */}
        <section className="section about-section" id="about">
          <div className="about-copy">
            <p className="eyebrow">WHY WE ARE BUILDING THIS</p>
            <h2>Service deserves thoughtful support.</h2>
            <p>
              Fauji Niwas is being built to make transit accommodation information easier to find, compare and use. The aim is simple: less friction while planning a stay, and more clarity for the people who serve.
            </p>
            <p className="about-signoff">Built with respect. For those who serve.</p>
          </div>
          <div className="founders">
            <article className="founder">
              <div className="founder-avatar">
                <img 
                  src="/aman.png" 
                  alt="Aman Kumar Singh" 
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = 'AS'; }} 
                />
              </div>
              <div>
                <span>FOUNDER</span>
                <h3>Aman Kumar Singh</h3>
                <p>Product &amp; Lead Development · GCET AKTU</p>
                <a 
                  href="https://linkedin.com/in/gangasagar5928" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: 'var(--gold)', fontSize: '10px', marginTop: '4px', display: 'inline-block' }}
                >
                  LinkedIn ↗
                </a>
              </div>
            </article>
            <article className="founder">
              <div className="founder-avatar">
                <img 
                  src="/anurag.png" 
                  alt="Anurag Kumar Singh" 
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = 'AK'; }} 
                />
              </div>
              <div>
                <span>CO-FOUNDER</span>
                <h3>Anurag Kumar Singh</h3>
                <p>Operations &amp; Armed Forces Liaison</p>
                <a 
                  href="https://www.linkedin.com/in/anurag-singh-a126843a3" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: 'var(--gold)', fontSize: '10px', marginTop: '4px', display: 'inline-block' }}
                >
                  LinkedIn ↗
                </a>
              </div>
            </article>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="footer" id="policy">
        <div className="footer-main">
          <a className="brand" href="#home">
            <span className="brand-mark">
              <img 
                src="/logo-dark.jpg" 
                alt="FN" 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = 'FN'; }}
              />
            </span>
            <span>
              <strong>Fauji Niwas</strong>
              <small>STAY · SERVE · BELONG</small>
            </span>
          </a>
          <p>Making the journey to a comfortable stay simpler.</p>
          <div className="footer-links">
            <a href="/privacy.html">Privacy</a>
            <a href="/terms.html">Terms</a>
            <a href="mailto:faujiniwashq@gmail.com">Contact</a>
            <a href="https://github.com/gangasagar5928/faujiniwas" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Fauji Niwas</span>
          <span>Independent project · Built with respect for the Armed Forces community</span>
        </div>
      </footer>
      </div>
    </div>
  );
}
