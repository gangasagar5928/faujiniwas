import { useContext } from 'react';
import { useMap } from 'react-leaflet';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import styles from './MapOverlay.module.css';

export default function MapOverlay() {
  const map = useMap();
  const ctx = useContext(ModalContext);
  const { 
    showCommuteZones, setShowCommuteZones,
    showHospitals, setShowHospitals,
    showSchools, setShowSchools
  } = useFilterStore();

  return (
    <div className={styles.overlay}>
      <button
        className={styles.btn}
        onClick={() => map.flyTo([22.5, 82.0], 5, { duration: 0.8 })}
        title="Reset view"
      >🗺️ India</button>
      <button
        className={styles.btn}
        onClick={() => {
          if (!navigator.geolocation) {
             ctx?.showToast('Geolocation not supported', 'error');
             return;
          }
          ctx?.showToast('Locating...', 'ok');
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              map.flyTo([coords.latitude, coords.longitude], 13, { duration: 0.8 });
            },
            (err) => {
              console.error("Locate error", err);
              ctx?.showToast('Enable location permissions', 'error');
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
          );
        }}
        title="Locate me"
      >📍 Locate Me</button>
    </div>
  );
}
