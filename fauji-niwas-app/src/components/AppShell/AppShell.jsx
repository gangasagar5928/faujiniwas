import { useContext, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { ModalContext } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';
import TacticalFAB from '../Navigation/TacticalFAB';
import logoLight from '../../assets/logo-light.jpg';
import logoDark from '../../assets/logo-dark.jpg';
import styles from './AppShell.module.css';

export default function AppShell() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const activeView = useFilterStore((s) => s.activeView);
  const setActiveView = useFilterStore((s) => s.setActiveView);
  const smartSearchQ = useFilterStore((s) => s.smartSearchQ);
  const setSmartSearchQ = useFilterStore((s) => s.setSmartSearchQ);
  const bhkFilter = useFilterStore((s) => s.bhkFilter);
  const setBhkFilter = useFilterStore((s) => s.setBhkFilter);
  const maxPrice = useFilterStore((s) => s.maxPrice);
  const setMaxPrice = useFilterStore((s) => s.setMaxPrice);
  const listings = useFilterStore((s) => s.listings);
  const setIsPending = useFilterStore((s) => s.setIsPending);
  const comparison = useUserStore(s => s.comparison) || [];
  const ctx = useContext(ModalContext);
  const [, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isNative = window.faujiApp;

  // Expose for chatbot and external components
  if (typeof window !== 'undefined') {
    window.__fauji_listings = listings;
  }

  // Live stats
  const rentalListings = listings.filter(l => l._collection === 'rentals');
  const avgRent = rentalListings.length
    ? Math.round(rentalListings.reduce((s, l) => s + (Number(l.price) || 0), 0) / rentalListings.length)
    : 0;
  const formatK = (n) => n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`;

  const handleFilter = (fn, val) => {
    setIsPending(true);
    startTransition(() => { fn(val); setTimeout(() => setIsPending(false), 30); });
  };

  const navTabs = [
    { id: 'rentals', label: 'Homes',       icon: '🏠' },
    { id: 'dorms',   label: 'SSB Dorms',   icon: '🏨' },
    { id: 'market',  label: 'Marketplace', icon: '🏷️' },
    { id: 'saved',   label: 'Saved',       icon: '⭐' },
  ];

  const mobileNavItems = [
    { id: 'rentals',   label: 'Homes',       icon: '🏠' },
    { id: 'market',    label: 'Marketplace', icon: '🏷️' },
    { id: 'dorms',     label: 'SSB Dorms',   icon: '🏨' },
    { id: 'saved',     label: 'Saved',       icon: '⭐' },
    { id: 'transfers', label: 'Alerts',      icon: '🔔', action: () => ctx.openTransfers() },
    { id: 'profile',   label: 'Profile',     icon: '👤', action: () => ctx.openProfile() },
  ];

  return (
    <div className={`${styles.shell} ${isNative ? 'is-native-mode' : ''}`}>

      {/* ── Ambient glow (visible in dark mode) ── */}
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbOne}`} />
        <span className={`${styles.orb} ${styles.orbTwo}`} />
        <span className={`${styles.orb} ${styles.orbThree}`} />
        <span className={styles.gridVeil} />
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP HEADER — Reference UI (white bar)
          ══════════════════════════════════════════ */}
      {!isNative && (
        <header className={`liquid-glass-nav ${styles.header}`}>
          <div className={styles.hdrTop}>

            {/* Logo — light.jpg in light mode, dark.jpg in dark mode */}
            <a href="/" className={styles.logoWrap} title="Back to home">
              <img src={logoLight} alt="FaujiNiwas" className={`${styles.logoImg} ${styles.logoImgLight}`} />
              <img src={logoDark}  alt="FaujiNiwas" className={`${styles.logoImg} ${styles.logoImgDark}`} />
            </a>

            {/* Search */}
            <div className={`liquid-glass-chip ${styles.searchWrap}`}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search cantonment, area or city"
                className={styles.searchInput}
                value={smartSearchQ}
                onChange={e => setSmartSearchQ(e.target.value)}
                autoComplete="off"
              />
              {smartSearchQ && (
                <button className={styles.searchClear} onClick={() => setSmartSearchQ('')}>✕</button>
              )}
            </div>

            {/* Filter controls */}
            <div className={styles.filterGroup}>
              <div className={styles.filterDropdown}>
                <select
                  value={bhkFilter}
                  onChange={e => handleFilter(setBhkFilter, e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Filter by BHK ▾</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3+">3+ BHK</option>
                </select>
              </div>

              <div className={styles.filterDropdown}>
                <select
                  value={maxPrice}
                  onChange={e => handleFilter(setMaxPrice, e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value={100000}>Filter by Budget ▾</option>
                  <option value={10000}>Under ₹10K</option>
                  <option value={15000}>Under ₹15K</option>
                  <option value={20000}>Under ₹20K</option>
                  <option value={30000}>Under ₹30K</option>
                  <option value={50000}>Under ₹50K</option>
                </select>
              </div>

              <motion.button
                className={styles.contractBtn}
                onClick={() => ctx.openAccessibility?.()}
                title="Accessibility, Font & Contrast"
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <span style={{ fontSize: '13px' }}>♿</span>
                Contrast &amp; Font
              </motion.button>

              <motion.button
                className={`${styles.filterIconBtn} ${showAdvanced ? styles.filterIconActive : ''}`}
                onClick={() => setShowAdvanced(v => !v)}
                title="More filters"
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Auth / Admin */}
            <div className={styles.authGroup}>
              {authLoading === false && user && (isAdmin || ctx.isAdmin) && (
                <motion.button className={styles.adminBtn} onClick={() => ctx.openAdmin()} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                  🛡️ Admin
                </motion.button>
              )}
              <motion.button className={styles.signInBtn} onClick={() => ctx.openProfile()} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                {user ? '👤 Profile' : 'Sign In / Sign Up'}
              </motion.button>
              <motion.button className={styles.postBtnHdr} onClick={() => ctx.openPost()} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                + Post
              </motion.button>
            </div>
          </div>
        </header>
      )}

      {/* ══════════════════════════════════════════
          MAIN: Sidebar + Map
          ══════════════════════════════════════════ */}
      <main className={styles.main}>

        {/* Desktop Sidebar — collapsible */}
        {!isNative && (
          <aside className={`liquid-glass-deep ${styles.desktopSidebar} ${sidebarCollapsed ? styles.desktopSidebarCollapsed : ''}`}>
            {/* Nav tabs (Homes | SSB Dorms | Marketplace | Saved) */}
            <div className={`liquid-glass-chip ${styles.navTabsBar}`}>
              {navTabs.map(tab => (
                <motion.button
                  key={tab.id}
                  className={activeView === tab.id ? styles.navTabActive : styles.navTab}
                  onClick={() => setActiveView(tab.id)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <span className={styles.navTabIcon}>{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>
            {/* Listing cards */}
            <div className={styles.sidebarList}>
              <Sidebar />
            </div>

            {/* Collapse toggle — right edge of sidebar */}
            <motion.button
              className={`liquid-glass-chip ${styles.collapseBtn}`}
              onClick={() => setSidebarCollapsed(v => !v)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              {sidebarCollapsed ? '›' : '‹'}
            </motion.button>
          </aside>
        )}

        {/* Map */}
        <div id="map-wrapper" className={styles.mapWrapper}>
          {/* Stats bar — desktop, top of map */}
          {!isNative && (
            <div className={`liquid-glass-float ${styles.mapStatsBar}`}>
              <div className={styles.mapStat}>
                <span className={styles.mapStatIcon}>🏠</span>
                <div>
                  <div className={styles.mapStatLabel}>Total listings</div>
                  <div className={styles.mapStatValue}>{rentalListings.length.toLocaleString()}</div>
                </div>
              </div>
              <div className={styles.mapStatDivider} />
              <div className={styles.mapStat}>
                <span className={styles.mapStatIcon} style={{ fontSize: '15px', fontWeight: 800 }}>₹</span>
                <div>
                  <div className={styles.mapStatLabel}>Average rent</div>
                  <div className={styles.mapStatValue}>{avgRent > 0 ? formatK(avgRent) : '—'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Chat FAB — bottom right of map (toggle on click) */}
          {!isNative && (
            <motion.button
              className={styles.chatFab}
              onClick={() => {
                if (typeof window.toggleChatbot === 'function') {
                  window.toggleChatbot();
                } else if (typeof window.openFaujiChatbot === 'function') {
                  window.openFaujiChatbot();
                } else if (ctx.openChat) {
                  ctx.openChat();
                }
              }}
              title="Military AI Assistant"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </motion.button>
          )}

          <MapView />
        </div>
      </main>

      {/* Mobile bottom nav */}
      {!isNative && (
        <nav className={`liquid-glass-nav ${styles.bottomNav}`}>
          {mobileNavItems.map(item => (
            <motion.button
              key={item.id}
              className={activeView === item.id ? styles.bnBtnActive : styles.bnBtn}
              onClick={() => item.action ? item.action() : setActiveView(item.id)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      )}

      {isNative && <TacticalFAB />}

      {!isNative && comparison.length === 2 && (
        <motion.button className={styles.compareFab} onClick={() => ctx.openCompare()} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
          🔁 Compare Selected (2)
        </motion.button>
      )}

      {!isNative && (
        <motion.button className={styles.fab} onClick={() => ctx.openPost()} whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
          ✚ Post Listing
        </motion.button>
      )}
    </div>
  );
}
