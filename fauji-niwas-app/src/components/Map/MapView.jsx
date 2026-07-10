import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS, ARMY_SCHOOLS, MILITARY_HOSPITALS, CANTEENS, CITY_ALIASES } from '../../data';
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

// Tactical Map FlyTo Micro-animation
function MapAnimator({ activeCantt, draftCoords }) {
  const map = useMap();
  const activeLat = activeCantt?.lat;
  const activeLng = activeCantt?.lng;
  const draftLat = draftCoords?.lat;
  const draftLng = draftCoords?.lng;

  useEffect(() => {
    if (activeLat && activeLng && !Number.isNaN(parseFloat(activeLat)) && !Number.isNaN(parseFloat(activeLng))) {
      map.flyTo([activeLat, activeLng], 13, { duration: 1.4 });
    } else if (draftLat && draftLng && !Number.isNaN(parseFloat(draftLat)) && !Number.isNaN(parseFloat(draftLng))) {
      map.flyTo([draftLat, draftLng], map.getZoom(), { duration: 1.4 });
    }
  }, [map, activeLat, activeLng, draftLat, draftLng]);
  return null;
}

// Custom cluster icon using bundled Leaflet L
const createClusterCustomIcon = (cluster) => L.divIcon({
  html: `<div class="mc-cluster">${cluster.getChildCount()}</div>`,
  className: '',
  iconSize: [36, 36],
});

// Upgraded Tactical Icons — pulsing and high-contrast
// Icons use standard emojis for reliability, wrapped in custom tactical styling
const MH_ICON = L.divIcon({ 
  html: '<div class="tactical-marker pulsing" style="--col:#ef4444">🏥</div>', 
  className: '', iconSize: [32, 32], iconAnchor: [16, 16] 
});
const SCHOOL_ICON = L.divIcon({ 
  html: '<div class="tactical-marker pulsing" style="--col:#3b82f6">🏫</div>', 
  className: '', iconSize: [32, 32], iconAnchor: [16, 16] 
});
const CANTEEN_ICON = L.divIcon({ 
  html: '<div class="tactical-marker pulsing" style="--col:#FF9933">🛒</div>', 
  className: '', iconSize: [32, 32], iconAnchor: [16, 16] 
});

// Tactical Scanning Grid Overlay
function ScanningGrid() {
  const map = useMap();
  useEffect(() => {
    const update = () => {}; 
    map.on('move', update);
    return () => map.off('move', update);
  }, [map]);

  return (
    <div className={styles.scanningOverlay}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 153, 51, 0.05)" strokeWidth="1"/>
            <circle cx="0" cy="0" r="1.5" fill="rgba(255, 153, 51, 0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className={styles.scanLine} />
      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />
    </div>
  );
}

// Logic to check zoom visibility
function AutoPoiLayers({ activeCity, showCommuteZones, showHospitals, showSchools, showCanteens, activeCantt }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => map.off('zoomend', onZoom);
  }, [map]);

  const showPoi = zoom > 9; // Automatically highlight POIs when zoomed in

  return (
    <>
      {activeCantt && activeCantt.lat && activeCantt.lng && !Number.isNaN(parseFloat(activeCantt.lat)) && !Number.isNaN(parseFloat(activeCantt.lng)) && showCommuteZones && (
          <Circle
            center={[activeCantt.lat, activeCantt.lng]}
            radius={5000}
            pathOptions={{
              color: 'var(--accent)',
              fillColor: 'var(--accent)',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '8, 12'
            }}
          >
            <Circle
              center={[activeCantt.lat, activeCantt.lng]}
              radius={80}
              pathOptions={{ color: 'var(--accent)', fillColor: 'var(--accent)', fillOpacity: 0.9 }}
            />
          </Circle>
        )}

      {showPoi && activeCity && (
        <>
          {showHospitals && MILITARY_HOSPITALS[activeCity]?.filter(h => h.lat && h.lng && !Number.isNaN(parseFloat(h.lat)) && !Number.isNaN(parseFloat(h.lng))).map((h, i) => (
            <Marker key={`mh-${i}`} position={[h.lat, h.lng]} icon={MH_ICON}>
              <Popup><div className={styles.popup}>🏥 {h.name}</div></Popup>
            </Marker>
          ))}

          {showSchools && ARMY_SCHOOLS[activeCity]?.filter(s => s.lat && s.lng && !Number.isNaN(parseFloat(s.lat)) && !Number.isNaN(parseFloat(s.lng))).map((s, i) => (
            <Marker key={`sch-${i}`} position={[s.lat, s.lng]} icon={SCHOOL_ICON}>
              <Popup><div className={styles.popup}>🏫 {s.name}</div></Popup>
            </Marker>
          ))}

          {showCanteens && CANTEENS[activeCity]?.filter(c => c.lat && c.lng && !Number.isNaN(parseFloat(c.lat)) && !Number.isNaN(parseFloat(c.lng))).map((c, i) => (
            <Marker key={`cnt-${i}`} position={[c.lat, c.lng]} icon={CANTEEN_ICON}>
              <Popup><div className={styles.popup}>🛒 {c.name}</div></Popup>
            </Marker>
          ))}
        </>
      )}
    </>
  );
}

export default function MapView() {
  const activeView = useFilterStore((s) => s.activeView);
  const { listings, showCommuteZones, showHospitals, showSchools, showCanteens, isPending } = useFilterStore();
  const allState = useFilterStore((s) => s);
  const filtered = getFilteredListings(allState);

  // Safety: If no listings yet, show the pitch data if we are in rentals view
  const displayListings = filtered.length > 0 ? filtered : [];

  // Logic to find active Cantt centroid
  let activeCantt = null;
  const searchCity = allState.smartSearchQ;
  const citiesInView = [...new Set(filtered.slice(0, 5).map(l => l.city))];
  const cityCandidates = searchCity ? [searchCity, ...citiesInView] : citiesInView;
  
  for (const city of cityCandidates) {
    if (!city) continue;
    let formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const lowerCity = city.toLowerCase();
    
    // 1. Resolve alias
    if (CITY_ALIASES[lowerCity]) {
      const resolved = CITY_ALIASES[lowerCity];
      formattedCity = resolved.charAt(0).toUpperCase() + resolved.slice(1).toLowerCase();
    }
    
    // 2. Check ARMY_SCHOOLS
    if (ARMY_SCHOOLS[formattedCity]) {
      activeCantt = ARMY_SCHOOLS[formattedCity][0]; // centroid
      break;
    }
    
    // 3. Check SSB_DORMS
    const dormMatch = SSB_DORMS.find(d => d.city?.toLowerCase() === lowerCity || d.city?.toLowerCase() === formattedCity.toLowerCase());
    if (dormMatch && dormMatch.lat && dormMatch.lng && !Number.isNaN(parseFloat(dormMatch.lat)) && !Number.isNaN(parseFloat(dormMatch.lng))) {
      activeCantt = { lat: dormMatch.lat, lng: dormMatch.lng, city: dormMatch.city };
      break;
    }
    
    // 4. Check dynamic listings fallback
    const listingMatch = filtered.find(l => l.city?.toLowerCase() === lowerCity);
    if (listingMatch && listingMatch.lat && listingMatch.lng && !Number.isNaN(parseFloat(listingMatch.lat)) && !Number.isNaN(parseFloat(listingMatch.lng))) {
      activeCantt = { lat: listingMatch.lat, lng: listingMatch.lng, city: listingMatch.city };
      break;
    }
  }

  // Active City for Tactical markers
  const activeCity = activeCantt ? (activeCantt.city || Object.keys(ARMY_SCHOOLS).find(c => {
    return ARMY_SCHOOLS[c].some(s => s.lat === activeCantt.lat && s.lng === activeCantt.lng);
  })) : null;


  const clusterKey = activeView; // remount cluster when view switches

  return (
    <div className={`${styles.mapContainer} ${isPending ? styles.isPending : ''}`}>
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
        <MapAnimator activeCantt={activeCantt} draftCoords={allState.draftCoords} />
        <ScanningGrid />

        <MarkerClusterGroup
          key={clusterKey}
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={50}
          iconCreateFunction={createClusterCustomIcon}
        >
          {activeView === 'dorms'
            ? SSB_DORMS.filter(d => d && d.lat && d.lng && !Number.isNaN(parseFloat(d.lat)) && !Number.isNaN(parseFloat(d.lng))).map(d => <DormMarker key={d.id} dorm={d} />)
            : displayListings.filter(r => r && r.lat && r.lng && !Number.isNaN(parseFloat(r.lat)) && !Number.isNaN(parseFloat(r.lng))).map(r => <RentalMarker key={r.id} listing={r} />)
          }
        </MarkerClusterGroup>

        <AutoPoiLayers 
          activeCity={activeCity}
          showCommuteZones={showCommuteZones}
          showHospitals={showHospitals}
          showSchools={showSchools}
          showCanteens={showCanteens}
          activeCantt={activeCantt}
        />

        <MapOverlay />
      </MapContainer>
    </div>
  );
}
