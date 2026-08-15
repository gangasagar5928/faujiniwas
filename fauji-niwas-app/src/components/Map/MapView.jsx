import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useFilterStore, getFilteredListings } from '../../store/filterStore';
import { SSB_DORMS, ARMY_SCHOOLS, MILITARY_HOSPITALS, CANTEENS, CITY_ALIASES } from '../../data';
import RentalMarker from './RentalMarker';
import DormMarker from './DormMarker';
import 'leaflet/dist/leaflet.css';
import styles from './MapView.module.css';

class MapErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('Map rendering error caught safely:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100%', height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b1325', color: '#94a3b8', padding: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 32 }}>📍</span>
          <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>Tactical Map re-stabilizing…</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: 12, padding: '8px 18px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Reload Tactical Map</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fix: invalidate Leaflet size and handle external zoom/recenter events
function MapController({ activeCantt }) {
  const map = useMap();
  useEffect(() => {
    const ids = [100, 300, 700, 1500, 3000].map(t =>
      setTimeout(() => {
        try { map.invalidateSize(); } catch(e) {}
      }, t)
    );
    const onResize = () => {
      clearTimeout(window._fj_mapResizeTimer);
      window._fj_mapResizeTimer = setTimeout(() => {
        try { map.invalidateSize(); } catch(e) {}
      }, 200);
    };
    window.addEventListener('resize', onResize);
    
    // Zoom & Recenter handlers
    const zoomIn = () => { try { map.zoomIn(); } catch(e) {} };
    const zoomOut = () => { try { map.zoomOut(); } catch(e) {} };
    const recenter = () => {
      try {
        const lat = Number(activeCantt?.lat);
        const lng = Number(activeCantt?.lng);
        if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
          map.panTo([lat, lng]);
        } else {
          map.panTo([22.5, 82.0]);
        }
      } catch(e) {}
    };
    
    window.addEventListener('map-zoom-in', zoomIn);
    window.addEventListener('map-zoom-out', zoomOut);
    window.addEventListener('map-recenter', recenter);
    
    return () => {
      ids.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('map-zoom-in', zoomIn);
      window.removeEventListener('map-zoom-out', zoomOut);
      window.removeEventListener('map-recenter', recenter);
    };
  }, [map, activeCantt]);
  return null;
}

// Tactical Map FlyTo Micro-animation
function MapAnimator({ activeCantt, draftCoords }) {
  const map = useMap();
  const activeLat = Number(activeCantt?.lat);
  const activeLng = Number(activeCantt?.lng);
  const draftLat = Number(draftCoords?.lat);
  const draftLng = Number(draftCoords?.lng);

  useEffect(() => {
    try {
      if (!isNaN(activeLat) && !isNaN(activeLng) && isFinite(activeLat) && isFinite(activeLng) && activeLat !== 0 && activeLng !== 0) {
        map.flyTo([activeLat, activeLng], 13, { duration: 1.4 });
      } else if (!isNaN(draftLat) && !isNaN(draftLng) && isFinite(draftLat) && isFinite(draftLng) && draftLat !== 0 && draftLng !== 0) {
        map.flyTo([draftLat, draftLng], map.getZoom() || 13, { duration: 1.4 });
      }
    } catch(e) {
      console.warn('MapAnimator warning:', e);
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
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    try { setZoom(map.getZoom() || 13); } catch(e) {}
    const onZoom = () => { try { setZoom(map.getZoom()); } catch(e) {} };
    map.on('zoomend', onZoom);
    return () => map.off('zoomend', onZoom);
  }, [map]);

  const showPoi = zoom > 9;
  const canttLat = Number(activeCantt?.lat);
  const canttLng = Number(activeCantt?.lng);
  const hasValidCantt = !isNaN(canttLat) && !isNaN(canttLng) && isFinite(canttLat) && isFinite(canttLng) && canttLat !== 0 && canttLng !== 0;

  return (
    <>
      {hasValidCantt && showCommuteZones && (
        <Circle
          center={[canttLat, canttLng]}
          radius={5000}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#ffffff',
            fillOpacity: 0.15,
            weight: 1
          }}
        >
          <Circle
            center={[canttLat, canttLng]}
            radius={80}
            pathOptions={{ color: 'var(--accent)', fillColor: 'var(--accent)', fillOpacity: 0.9 }}
          />
        </Circle>
      )}

      {showPoi && (
        <>
          {showHospitals && (MILITARY_HOSPITALS || [])
            .filter(h => h && !isNaN(Number(h.lat)) && !isNaN(Number(h.lng)))
            .map((h, i) => (
              <Marker key={`mh-${i}`} position={[Number(h.lat), Number(h.lng)]} icon={MH_ICON}>
                <Popup><div className={styles.popup}>🏥 {h.name}</div></Popup>
              </Marker>
            ))}

          {showSchools && (ARMY_SCHOOLS || [])
            .filter(s => s && !isNaN(Number(s.lat)) && !isNaN(Number(s.lng)))
            .map((s, i) => (
              <Marker key={`sch-${i}`} position={[Number(s.lat), Number(s.lng)]} icon={SCHOOL_ICON}>
                <Popup><div className={styles.popup}>🏫 {s.name}</div></Popup>
              </Marker>
            ))}

          {showCanteens && (CANTEENS || [])
            .filter(c => c && !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)))
            .map((c, i) => (
              <Marker key={`canteen-${i}`} position={[Number(c.lat), Number(c.lng)]} icon={CANTEEN_ICON}>
                <Popup><div className={styles.popup}>🛒 {c.name}</div></Popup>
              </Marker>
            ))}
        </>
      )}
    </>
  );
}

function BoundsHandler({ properties, onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    if (!onBoundsChange) return;

    const updateBounds = () => {
      try {
        const bounds = map.getBounds();
        if (!bounds || typeof bounds.contains !== 'function') return;
        const visibleIds = (properties || [])
          .filter(p => {
            const lat = Number(p?.lat);
            const lng = Number(p?.lng);
            if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return false;
            try {
              return bounds.contains([lat, lng]);
            } catch(e) {
              return false;
            }
          })
          .map(p => p.id);
        onBoundsChange(visibleIds);
      } catch (err) {
        console.warn('BoundsHandler warning:', err);
      }
    };

    updateBounds();

    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map, properties, onBoundsChange]);

  return null;
}

export default function MapView({
  properties = null,
  onBoundsChange = null,
  selectedProperty = null,
  onSelectProperty = null
}) {
  const activeView = useFilterStore((s) => s.activeView);
  const { listings, showCommuteZones, showHospitals, showSchools, showCanteens, isPending } = useFilterStore();
  const allState = useFilterStore((s) => s);
  
  const displayListings = (properties && properties.length > 0) ? properties : getFilteredListings(allState);

  // Logic to find active Cantt centroid safely
  let activeCantt = null;
  const searchCity = allState.smartSearchQ;
  const citiesInView = [...new Set((displayListings || []).slice(0, 5).map(l => l?.city).filter(Boolean))];
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
    
    // 2. Check ARMY_SCHOOLS array for matching city/name
    const schoolMatch = (ARMY_SCHOOLS || []).find(s => 
      s && (s.name?.toLowerCase().includes(lowerCity) || s.city?.toLowerCase() === lowerCity) &&
      !isNaN(Number(s.lat)) && !isNaN(Number(s.lng))
    );
    if (schoolMatch) {
      activeCantt = { lat: Number(schoolMatch.lat), lng: Number(schoolMatch.lng), city: formattedCity };
      break;
    }
    
    // 3. Check SSB_DORMS
    const dormMatch = (SSB_DORMS || []).find(d => d && (d.city?.toLowerCase() === lowerCity || d.city?.toLowerCase() === formattedCity.toLowerCase()) && !isNaN(Number(d.lat)) && !isNaN(Number(d.lng)));
    if (dormMatch) {
      activeCantt = { lat: Number(dormMatch.lat), lng: Number(dormMatch.lng), city: dormMatch.city };
      break;
    }
    
    // 4. Check dynamic listings fallback
    const listingMatch = (displayListings || []).find(l => l && l.city?.toLowerCase() === lowerCity && !isNaN(Number(l.lat)) && !isNaN(Number(l.lng)));
    if (listingMatch) {
      activeCantt = { lat: Number(listingMatch.lat), lng: Number(listingMatch.lng), city: listingMatch.city };
      break;
    }
  }

  const activeCity = activeCantt ? (activeCantt.city || searchCity || 'Pune') : null;
  const clusterKey = activeView;

  const validDorms = (SSB_DORMS || []).filter(d => {
    if (!d) return false;
    const lat = Number(d.lat);
    const lng = Number(d.lng);
    return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0;
  });

  const validListings = (displayListings || []).filter(r => {
    if (!r) return false;
    const lat = Number(r.lat);
    const lng = Number(r.lng);
    return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0;
  });

  return (
    <MapErrorBoundary>
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
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
            minZoom={3}
            noWrap={true}
            attribution="&copy; Google Maps"
          />
          <MapController activeCantt={activeCantt} />
          <MapAnimator activeCantt={activeCantt} draftCoords={allState.draftCoords} />
          <ScanningGrid />
          <BoundsHandler properties={displayListings} onBoundsChange={onBoundsChange} />

          <MarkerClusterGroup
            key={clusterKey}
            chunkedLoading
            showCoverageOnHover={false}
            disableClusteringAtZoom={11}
            maxClusterRadius={40}
            iconCreateFunction={createClusterCustomIcon}
          >
            {activeView === 'dorms'
              ? validDorms.map(d => <DormMarker key={d.id} dorm={d} />)
              : validListings.map(r => <RentalMarker key={r.id} listing={r} />)
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
        </MapContainer>
      </div>
    </MapErrorBoundary>
  );
}
