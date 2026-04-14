import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS, ARMY_SCHOOLS, MILITARY_HOSPITALS } from '../../data';
import RentalMarker from './RentalMarker';
import DormMarker from './DormMarker';
import MapOverlay from './MapOverlay';
import 'leaflet/dist/leaflet.css';
import styles from './MapView.module.css';

// Fix: invalidate Leaflet size when container dimensions change
function SizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    const ids = [100, 300, 700, 1500, 3000].map(t =>
      setTimeout(() => map.invalidateSize(), t)
    );
    const onResize = () => {
      clearTimeout(window._fj_mapResizeTimer);
      window._fj_mapResizeTimer = setTimeout(() => map.invalidateSize(), 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      ids.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);
  return null;
}

// Custom cluster icon using bundled Leaflet L
const createClusterCustomIcon = (cluster) => L.divIcon({
  html: `<div class="mc-cluster">${cluster.getChildCount()}</div>`,
  className: '',
  iconSize: [36, 36],
});

export default function MapView() {
  const activeView = useFilterStore((s) => s.activeView);
  const { showCommuteZones, showHospitals, showSchools } = useFilterStore();
  const allState = useFilterStore((s) => s);
  const filtered = getFilteredListings(allState);

  // Tactical Icons
  const mhIcon = L.divIcon({ html: '<div class="tactical-icon" style="background:#ef4444">🏥</div>', className: '', iconSize: [28, 28] });
  const schoolIcon = L.divIcon({ html: '<div class="tactical-icon" style="background:#3b82f6">🏫</div>', className: '', iconSize: [28, 28] });

  // Logic to find active Cantt centroid
  let activeCantt = null;
  if (showCommuteZones || showHospitals || showSchools) {
    const searchCity = allState.smartSearchQ;
    const citiesInView = [...new Set(filtered.slice(0, 5).map(l => l.city))];
    const cityCandidates = searchCity ? [searchCity, ...citiesInView] : citiesInView;
    
    for (const city of cityCandidates) {
      const formattedCity = city?.charAt(0).toUpperCase() + city?.slice(1).toLowerCase();
      if (ARMY_SCHOOLS[formattedCity]) {
        activeCantt = ARMY_SCHOOLS[formattedCity][0]; // centroid
        break;
      }
    }
  }

  // Active City for Tactical markers
  const activeCity = activeCantt ? (activeCantt.city || Object.keys(ARMY_SCHOOLS).find(c => ARMY_SCHOOLS[c].includes(activeCantt))) : null;


  const clusterKey = activeView; // remount cluster when view switches

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        zoomControl={false}
        maxBounds={[[6.5, 68.0], [35.5, 97.5]]}
        maxBoundsViscosity={1.0}
        preferCanvas={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
          maxZoom={20}
          minZoom={4}
          noWrap={true}
          attribution='&copy; Google Maps'
        />
        <SizeInvalidator />

        <MarkerClusterGroup
          key={clusterKey}
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={50}
          iconCreateFunction={createClusterCustomIcon}
        >
          {activeView === 'dorms'
            ? SSB_DORMS.map(d => <DormMarker key={d.id} dorm={d} />)
            : filtered.map(r => <RentalMarker key={r.id} listing={r} />)
          }
        </MarkerClusterGroup>

        {activeCantt && showCommuteZones && (
          <Circle
            center={[activeCantt.lat, activeCantt.lng]}
            radius={5000}
            pathOptions={{
              color: 'var(--accent)',
              fillColor: 'var(--accent)',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '5, 10'
            }}
          >
            <Circle
              center={[activeCantt.lat, activeCantt.lng]}
              radius={100}
              pathOptions={{ color: 'var(--accent)', fillColor: 'var(--accent)', fillOpacity: 0.8 }}
            />
          </Circle>
        )}

        {showHospitals && activeCantt && MILITARY_HOSPITALS[activeCantt.city || 'Pune']?.map((h, i) => (
          <Marker key={`mh-${i}`} position={[h.lat, h.lng]} icon={mhIcon}>
            <Popup><div style={{fontSize:12,fontWeight:700}}>🏥 {h.name}</div></Popup>
          </Marker>
        ))}

        {showSchools && activeCantt && ARMY_SCHOOLS[activeCantt.city || 'Pune']?.map((s, i) => (
          <Marker key={`sch-${i}`} position={[s.lat, s.lng]} icon={schoolIcon}>
            <Popup><div style={{fontSize:12,fontWeight:700}}>🏫 {s.name}</div></Popup>
          </Marker>
        ))}

        <MapOverlay />
      </MapContainer>
    </div>
  );
}
