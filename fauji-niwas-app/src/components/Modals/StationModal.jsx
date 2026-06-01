import { useContext, useMemo } from 'react';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import { ARMY_SCHOOLS, MILITARY_HOSPITALS } from '../../data';
import styles from './StationModal.module.css';

const STATIONS = [
  { id: 'delhi-cantt', name: 'Delhi Cantonment', city: 'Delhi', lat: 28.5961, lng: 77.1587, banner: '/delhi_cantt_banner.png', desc: 'The heart of military life in the capital, known for its wide boulevards and elite residential areas.' },
  { id: 'pune-cantt', name: 'Pune Cantonment', city: 'Pune', lat: 18.5204, lng: 73.8567, banner: '/pune_cantt_banner.png', desc: 'A blend of colonial heritage and modern amenities, offering some of the best housing options for defence personnel.' },
  { id: 'meerut-cantt', name: 'Meerut Cantonment', city: 'Meerut', lat: 28.9845, lng: 77.7064, banner: '/meerut_cantt_banner.png', desc: 'One of the largest and oldest cantonments, featuring historic parks and proximity to major training centres.' },
  { id: 'ambala-cantt', name: 'Ambala Cantonment', city: 'Ambala', lat: 30.3782, lng: 76.7767, banner: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&q=80&w=1200', desc: 'A key strategic hub with easy connectivity to the hills and the national capital.' },
  { id: 'bengaluru-cantt', name: 'Bengaluru Cantonment', city: 'Bengaluru', lat: 12.9882, lng: 77.6101, banner: 'https://images.unsplash.com/photo-1596760405808-47999b4317bc?auto=format&fit=crop&q=80&w=1200', desc: 'Lush greenery combined with the tech city vibe, popular for its vibrant atmosphere and amenities.' }
];

export default function StationModal({ stationId, onClose }) {
  const ctx = useContext(ModalContext);
  const listings = useFilterStore(s => s.listings);
  const station = STATIONS.find(s => s.id === stationId);

  const stats = useMemo(() => {
    if (!station) return null;
    const cityListings = listings.filter(l => l.city?.toLowerCase() === station.city.toLowerCase());
    const avgRent = cityListings.length > 0 
      ? Math.round(cityListings.reduce((acc, l) => acc + (l.price || 0), 0) / cityListings.length) 
      : 0;
    
    return {
      count: cityListings.length,
      avgRent,
      schools: ARMY_SCHOOLS[station.city] || [],
      hospitals: MILITARY_HOSPITALS[station.city] || []
    };
  }, [station, listings]);

  if (!station) return null;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.container}>
        <div className={styles.bannerWrap}>
          <img src={station.banner} alt={station.name} className={styles.banner} />
          <div className={styles.overlay}>
            <h2 className={styles.name}>{station.name}</h2>
            <p className={styles.blurb}>{station.desc}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statVal}>{stats.count}</div>
              <div className={styles.statLab}>Live Listings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statVal}>₹{(stats.avgRent/1000).toFixed(1)}k</div>
              <div className={styles.statLab}>Avg. Monthly Rent</div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>🎖️ Station Overview</h4>
            <div className={styles.tactical}>
              <div className={styles.tactItem}>
                <span className={styles.tactIco}>🏥</span>
                <div>
                  <div className={styles.tactName}>Military Hospital (MH)</div>
                  <div className={styles.tactVal}>{stats.hospitals[0]?.name || 'Nearby in Cantonment'}</div>
                </div>
              </div>
              <div className={styles.tactItem}>
                <span className={styles.tactIco}>🏫</span>
                <div>
                  <div className={styles.tactName}>Army Public School (APS)</div>
                  <div className={styles.tactVal}>{stats.schools[0]?.name || 'Nearby in Cantonment'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className="bp" onClick={() => {
              // Focus map on station
              if (window.appMap) {
                window.appMap.setCenter({ lat: station.lat, lng: station.lng });
                window.appMap.setZoom(14);
              }
              onClose();
              ctx.showToast(`Exploring ${station.name} 🗺️`, 'ok');
            }}>
              Explore Station Map 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
