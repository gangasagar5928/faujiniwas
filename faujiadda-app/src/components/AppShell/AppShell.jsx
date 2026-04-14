import { useContext } from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { ModalContext } from '../../App';
import { auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import MapView from '../Map/MapView';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AppShell.module.css';

export default function AppShell() {
  const { user } = useAuth();
  const activeView = useFilterStore((s) => s.activeView);
  const setActiveView = useFilterStore((s) => s.setActiveView);
  const comparison = useUserStore(s => s.comparison) || [];
  const ctx = useContext(ModalContext);

  const navItems = [
    { id: 'rentals', label: 'Rentals',    icon: '🏠' },
    { id: 'market',  label: 'Marketplace',icon: '🏷️' },
    { id: 'dorms',   label: 'SSB Dorms',  icon: '🏨' },
    { id: 'saved',   label: 'Saved',      icon: '⭐' },
    { id: 'transfers', label: 'Alerts',   icon: '🔔', action: () => ctx.openTransfers() },
    { id: 'profile', label: 'Profile',    icon: '👤', action: () => ctx.openProfile() },
  ];

  return (
    <div className={styles.shell}>
      {/* ── Header ── */}
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
              className={styles.profileBtn}
              onClick={() => ctx.openProfile()}
              title={user ? 'Profile' : 'Login'}
            >{user ? '👤' : '🔐'}</button>
            <button
              className={styles.postBtn}
              onClick={() => ctx.openPost()}
            >+ Post Listing</button>
          </div>
        </div>
      </header>

      {/* ── Main: Sidebar + Map ── */}
      <main className={styles.main}>
        <Sidebar />
        <div id="map-wrapper" className={styles.mapWrapper}>
          <MapView />
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
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

      {/* ── FAB: Comparison Tray ── */}
      {comparison.length === 2 && (
        <button 
          className={styles.compareFab} 
          onClick={() => ctx.openCompare()}
        >
          🔁 Compare Selected (2)
        </button>
      )}

      {/* ── FAB: Post Listing ── */}
      <button className={styles.fab} onClick={() => ctx.openPost()}>
        ✚ Post Listing
      </button>
    </div>
  );
}
