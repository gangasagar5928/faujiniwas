import { useContext, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMap } from 'react-leaflet';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import styles from './MapOverlay.module.css';

const springTransition = { type: 'spring', stiffness: 500, damping: 28 };

export default function MapOverlay() {
  const map = useMap();
  const ctx = useContext(ModalContext);
  const {
    showCommuteZones, showHospitals, showSchools, showCanteens,
    setShowCommuteZones, setShowHospitals, setShowSchools, setShowCanteens
  } = useFilterStore();

  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(window.innerWidth >= 768);
  const [clickCount, setClickCount] = useState(0);
  const [gatekeeperAlert, setGatekeeperAlert] = useState(false);
  const [blackoutMode, setBlackoutMode] = useState(false);
  const [heading, setHeading] = useState(142);
  const compassInterval = useRef(null);

  useEffect(() => {
    // Some mock logic to prevent errors
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[500] overflow-hidden">

      {/* NEARBY FACILITIES Widget */}
      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-5 pointer-events-auto">
        {!isFacilitiesOpen ? (
          <motion.button
            onClick={() => setIsFacilitiesOpen(true)}
            className="liquid-glass-float"
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}
          >
            <span style={{ fontSize: 20 }}>📍</span>
          </motion.button>
        ) : (
          <motion.div
            className="liquid-glass-deep"
            initial={{ opacity: 0, scale: 0.92, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{ borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220, textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Nearby Facilities
              </div>
              <button onClick={() => setIsFacilitiesOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'commute', label: 'Station Commute Zone', active: showCommuteZones, setter: setShowCommuteZones, icon: '🚆' },
                { id: 'schools', label: 'Army Schools', active: showSchools, setter: setShowSchools, icon: '🏫' },
                { id: 'hospitals', label: 'Military Hospitals', active: showHospitals, setter: setShowHospitals, icon: '🏥' }
              ].map(facility => (
                <motion.button
                  key={facility.id}
                  onClick={() => facility.setter(!facility.active)}
                  className="liquid-glass-chip fluid-press"
                  whileTap={{ scale: 0.95 }}
                  transition={springTransition}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none',
                    fontSize: 11, fontWeight: 500,
                    color: facility.active ? 'var(--text)' : 'var(--muted)',
                    borderColor: facility.active ? 'var(--accent)' : undefined,
                    background: facility.active ? 'rgba(255,153,51,0.12)' : undefined,
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border2)' }}>
                    <span style={{ fontSize: 14, opacity: 0.8 }}>{facility.icon}</span>
                  </div>
                  <span>{facility.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Utility Controller */}
      <div className="absolute bottom-[110px] right-16 z-[500] flex items-center gap-3 select-none pointer-events-auto">

        {/* Zoom Control Pill */}
        <motion.div
          className="liquid-glass-chip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 12 }}
        >
          <motion.button whileTap={{ scale: 0.88 }} transition={springTransition} onClick={() => map.zoomIn()} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}>➕</motion.button>
          <div style={{ height: 1, background: 'var(--border2)' }} />
          <motion.button whileTap={{ scale: 0.88 }} transition={springTransition} onClick={() => map.zoomOut()} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}>➖</motion.button>
        </motion.div>

        {/* Target Locate Control */}
        <motion.button
          onClick={() => {
            if (!navigator.geolocation) {
                ctx?.showToast('Geolocation not supported', 'error');
                return;
            }
            ctx?.showToast('Scanning local area...', 'ok');
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => {
                map.flyTo([coords.latitude, coords.longitude], 13, { duration: 1.0 });
              },
              (err) => {
                ctx?.showToast('Enable location permissions', 'error');
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          }}
          className="liquid-glass-chip"
          whileTap={{ scale: 0.88 }}
          transition={springTransition}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </motion.button>

      </div>
    </div>
  );
}
