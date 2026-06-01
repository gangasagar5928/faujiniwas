import { useContext } from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { ModalContext } from '../../App';
import { auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';
import TacticalFAB from '../Navigation/TacticalFAB';
import styles from './AppShell.module.css';

export default function AppShell() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const activeView = useFilterStore((s) => s.activeView);
  const setActiveView = useFilterStore((s) => s.setActiveView);
  const comparison = useUserStore(s => s.comparison) || [];
  const ctx = useContext(ModalContext);

  const isNative = window.faujiApp;
  const viewSignal = {
    rentals: {
      eyebrow: 'Housing Finder',
      title: 'Scan verified rentals around the cantonment belt.',
      copy: 'Jump between listings, live map pins, and owner trust signals without losing track of your search.',
    },
    market: {
      eyebrow: 'Posting-Out Exchange',
      title: 'Marketplace movement is active right now.',
      copy: 'Vehicles, furniture, and appliances are surfacing from real defence relocations instead of generic classifieds.',
    },
    dorms: {
      eyebrow: 'SSB Movement Board',
      title: 'Dorm scouting is streamlined for the next reporting day.',
      copy: 'Shortlist board-adjacent stays, food options, and nearby support points from one surface.',
    },
    saved: {
      eyebrow: 'Shortlist Locker',
      title: 'Your saved options are ready for final comparison.',
      copy: 'Use the shortlist as a calm staging area before the next family move or unit transfer.',
    },
  }[activeView] || {
    eyebrow: 'Services',
    title: 'Defence housing data is live.',
    copy: 'Browse, compare, and act without losing context.',
  };

  const navItems = [
    { id: 'rentals', label: 'Rentals',    icon: '🏠' },
    { id: 'market',  label: 'Marketplace',icon: '🏷️' },
    { id: 'dorms',   label: 'SSB Dorms',  icon: '🏨' },
    { id: 'saved',   label: 'Saved',      icon: '⭐' },
    { id: 'transfers', label: 'Alerts',   icon: '🔔', action: () => ctx.openTransfers() },
    { id: 'profile', label: 'Profile',    icon: '👤', action: () => ctx.openProfile() },
  ];

  return (
    <div className={`${styles.shell} ${isNative ? 'is-native-mode' : ''}`}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbOne}`} />
        <span className={`${styles.orb} ${styles.orbTwo}`} />
        <span className={`${styles.orb} ${styles.orbThree}`} />
        <span className={styles.gridVeil} />
      </div>

      {/* ── Header ── */}
      {!isNative && (
        <header className={styles.header}>
          <div className={styles.hdrTop}>
            <a href="/" className={styles.logo} title="Back to home">
              Fauji<span>Niwas</span>
            </a>

            {/* Desktop nav */}
            <nav className={styles.desktopNav}>
              {['rentals','market','dorms','saved'].map(v => (
                <button
                  key={v}
                  className={activeView === v ? styles.navBtnActive : styles.navBtn}
                  onClick={() => setActiveView(v)}
                >
                  {v === 'rentals' ? '🏠 Rentals' : v === 'market' ? '🏷️ Marketplace' : v === 'dorms' ? '🏨 SSB Dorms' : '⭐ Saved'}
                </button>
              ))}
            </nav>

            <div className={styles.hdrActions}>
              <button
                className={styles.pill + ' ' + styles.pillStation}
                onClick={() => ctx.openTransfers()}
                title="Browse popular stations"
              >🏰 Explore Stations</button>
              <button
                className={styles.pill + ' ' + styles.pillAlert}
                onClick={() => ctx.openTransfers()}
                title="Movement alerts"
              >🔔 Movement Alerts</button>
              <button
                className={styles.pill + ' ' + styles.pillCab}
                onClick={() => ctx.openTransfers()}
                title="Shared cab board"
              >🚗 Shared Cab</button>
              <button
                className={styles.pill}
                onClick={() => ctx.openRelocation()}
                title="Command Center Relocation Suite"
                style={{ background: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37', fontWeight: 'bold' }}
              >📋 Relocation Suite</button>
              <button
                className={styles.profileBtn}
                onClick={() => ctx.openProfile()}
                title={user ? 'Profile' : 'Login'}
              >{user ? '👤' : '🔐'}</button>
              
              {/* Restrict Admin button to verified personnel */}
              {authLoading === false && user && (isAdmin || ctx.isAdmin) && (
                <button
                  className={styles.pill + ' ' + styles.pillAdmin}
                  onClick={() => ctx.openAdmin()}
                  title="Command Center"
                >🛡️ Admin</button>
              )}

              <button
                className={styles.postBtn}
                onClick={() => ctx.openPost()}
              >+ Post Listing</button>
            </div>
          </div>
        </header>
      )}

      {/* ── Main: Sidebar + Map ── */}
      <main className={styles.main}>
        {!isNative && <Sidebar />}
        <div id="map-wrapper" className={styles.mapWrapper}>
          {!isNative && (
            <div className={styles.signalCard}>
              <div className={styles.signalContent}>
                <div className={styles.signalEyebrow}>
                  <span className={styles.signalDot} />
                  {viewSignal.eyebrow}
                </div>
                <strong>{viewSignal.title}</strong>
                <p>{viewSignal.copy}</p>
              </div>
              <div className={styles.signalPrism} aria-hidden="true">
                <span className={`${styles.signalPlate} ${styles.signalPlateBase}`} />
                <span className={`${styles.signalPlate} ${styles.signalPlateMid}`} />
                <span className={`${styles.signalPlate} ${styles.signalPlateTop}`} />
                <span className={styles.signalRing} />
                <span className={styles.signalRingAlt} />
                <span className={styles.signalCore} />
              </div>
            </div>
          )}
          <MapView />
        </div>
      </main>

      {/* ── Mobile Bottom Nav (PWA only) ── */}
      {!isNative && (
        <nav className={styles.bottomNav}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={activeView === item.id ? styles.bnBtnActive : styles.bnBtn}
              onClick={() => item.action ? item.action() : setActiveView(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── Tactical FAB (App only) ── */}
      {isNative && (
        <TacticalFAB />
      )}

      {/* ── FAB: Comparison Tray (PWA only) ── */}
      {!isNative && comparison.length === 2 && (
        <button 
          className={styles.compareFab} 
          onClick={() => ctx.openCompare()}
        >
          🔁 Compare Selected (2)
        </button>
      )}

      {/* ── FAB: Post Listing (PWA only) ── */}
      {!isNative && (
        <button className={styles.fab} onClick={() => ctx.openPost()}>
          ✚ Post Listing
        </button>
      )}
    </div>
  );
}
