import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property, Facility } from "../../typesNew";
import MarkerClusterGroup from "react-leaflet-cluster";

interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  facilities: Facility[];
  activeFacilityTypes: { school: boolean; hospital: boolean; station: boolean };
  onBoundsChange: (visibleIds: string[]) => void;
  activeCity?: string;
}

const CITY_COORDS: { [key: string]: [number, number] } = {
  pune: [18.5204, 73.8567],
  delhi: [28.5967, 77.1336],
  ambala: [30.3782, 76.7767],
  secunderabad: [17.4399, 78.4983],
  bhopal: [23.2599, 77.4126],
  kapurthala: [31.3833, 75.3833],
  prayagraj: [25.4358, 81.8463],
  coimbatore: [11.0168, 76.9558],
  bangalore: [12.9716, 77.5946],
  mhow: [22.5523, 75.7614],
  jabalpur: [23.1815, 79.9864],
  jodhpur: [26.2389, 73.0243],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  jalandhar: [31.3260, 75.5762],
  pathankot: [32.2643, 75.6524],
  dehradun: [30.3165, 78.0322],
  udhampur: [32.9283, 75.1424],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  ranchi: [23.3441, 85.3096],
  danapur: [25.6205, 85.0478],
  belgaum: [15.8497, 74.4977]
};

// Map controller to handle invalidating size and centering/flying to selected property
function MapController({
  selectedProperty,
  properties,
  activeCity,
}: {
  selectedProperty: Property | null;
  properties: Property[];
  activeCity?: string;
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size so it fills container properly on mount/resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  // Expose global flyTo handler on window
  useEffect(() => {
    (window as any).flyToCoordinate = (lat: number, lng: number) => {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    };
    return () => {
      delete (window as any).flyToCoordinate;
    };
  }, [map]);

  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);

  // Clear route path when selected property changes
  useEffect(() => {
    setRouteCoords(null);
  }, [selectedProperty]);

  // Expose routing controls on window
  useEffect(() => {
    (window as any).showRoutePath = (from: [number, number], to: [number, number]) => {
      setRouteCoords([from, to]);
      const bounds = L.latLngBounds([from, to]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    };
    (window as any).clearRoutePath = () => {
      setRouteCoords(null);
    };
    return () => {
      delete (window as any).showRoutePath;
      delete (window as any).clearRoutePath;
    };
  }, [map]);

  // Effect 1: Fly to selected property (only when selectedProperty is set)
  useEffect(() => {
    if (selectedProperty && selectedProperty.lat && selectedProperty.lng) {
      map.flyTo([selectedProperty.lat, selectedProperty.lng], 15, { duration: 1.2 });
    }
  }, [selectedProperty, map]);

  // Effect 2: Fit bounds on activeCity (search query) change
  useEffect(() => {
    if (!activeCity) return;
    const cleanQuery = activeCity.toLowerCase().trim();

    // Check if searched query matches predefined city coordinates
    let matchedCoords: [number, number] | null = null;
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
      if (cleanQuery.includes(city) || city.includes(cleanQuery)) {
        matchedCoords = coords;
        break;
      }
    }

    if (matchedCoords) {
      map.flyTo(matchedCoords, 13, { duration: 1.5 });
      return;
    }

    if (properties.length > 0) {
      const validProps = properties.filter((p) => p.lat && p.lng);
      if (validProps.length > 0) {
        const lats = validProps.map((p) => p.lat!);
        const lngs = validProps.map((p) => p.lng!);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        if (validProps.length === 1) {
          map.flyTo([validProps[0].lat!, validProps[0].lng!], 14, { duration: 1.2 });
        } else {
          map.fitBounds([
            [minLat, minLng],
            [maxLat, maxLng],
          ], { padding: [50, 50], maxZoom: 14 });
        }
      }
    }
  }, [activeCity, properties, map]);

  // Effect 3: Initial locate on mount — fly to user location if not yet geolocated
  useEffect(() => {
    if ((window as any).geolocated) return; // already handled by pre-mount resolution
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          (window as any).geolocated = true;
          map.setView([latitude, longitude], 13, { animate: false });
        },
        () => { /* silent — already centred on fallback */ }
      );
    }
  }, [map]);

  return (
    <>
      {routeCoords && (
        <>
          <Polyline
            positions={routeCoords}
            color="#8a2be2"
            weight={4}
            opacity={0.85}
            dashArray="6, 8"
          />
          <CircleMarker
            center={routeCoords[1]}
            radius={6}
            fillColor="#8a2be2"
            color="#fff"
            weight={2.5}
            fillOpacity={1}
          />
        </>
      )}
    </>
  );
}

// Custom icons generators
const createPropertyIcon = (price: string, isSelected: boolean) =>
  L.divIcon({
    html: `
      <div style="
        background-color: ${isSelected ? "#f59e0b" : "#10b981"};
        color: white;
        border: 2px solid white;
        border-radius: 9999px;
        padding: 4px 8px;
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        text-align: center;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        transform: translate(-50%, -100%);
      ">
        📍 ${price}
      </div>
    `,
    className: "",
    iconSize: [70, 30],
    iconAnchor: [0, 0],
  });

const createFacilityIcon = (type: "school" | "hospital" | "station") => {
  let color = "#3b82f6"; // blue for school
  let emoji = "🏫";
  if (type === "hospital") {
    color = "#ef4444"; // red for hospital
    emoji = "🏥";
  } else if (type === "station") {
    color = "#6366f1"; // indigo for station
    emoji = "🛒";
  }

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transform: translate(-16px, -16px);
      ">
        ${emoji}
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [0, 0],
  });
};

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: 2.5px solid white;
        border-radius: 9999px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);
        transform: translate(-18px, -18px);
      ">
        ${count}
      </div>
    `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [0, 0],
  });
};

function ViewportListener({
  properties,
  onBoundsChange,
  onZoomChange,
}: {
  properties: Property[];
  onBoundsChange: (visibleIds: string[]) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      updateVisibleProperties();
    },
    zoomend: () => {
      updateVisibleProperties();
      onZoomChange(map.getZoom());
    },
  });

  const updateVisibleProperties = () => {
    const bounds = map.getBounds();
    const visibleIds = properties
      .filter((p) => p.lat && p.lng && bounds.contains([p.lat, p.lng]))
      .map((p) => p.id);
    onBoundsChange(visibleIds);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateVisibleProperties();
    }, 400);
    return () => clearTimeout(timer);
  }, [properties]);

  return null;
}

function MyLocationButton() {
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          (window as any).geolocated = true;
          if (typeof (window as any).flyToCoordinate === "function") {
            (window as any).flyToCoordinate(latitude, longitude);
          }
        },
        (error) => {
          console.error("Geolocation failed", error);
          alert(`Location services error: ${error.message || "Please ensure GPS is enabled and browser has permission."}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleLocate();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="absolute bottom-6 right-[168px] z-[2000] w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-2xl border border-slate-200/80 transition-all hover:scale-[1.05] active:scale-95 cursor-pointer pointer-events-auto"
      title="Go to My Location"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
      </svg>
    </button>
  );
}

export default function Map({
  properties,
  selectedProperty,
  onSelectProperty,
  facilities,
  activeFacilityTypes,
  onBoundsChange,
  activeCity,
}: MapProps) {
  const [currentZoom, setCurrentZoom] = React.useState(13);

  // Resolve user location BEFORE mounting the map so MapContainer starts there
  // Fallback: Delhi Cantonment if denied/timeout (2.5s)
  const FALLBACK: [number, number] = [28.5947, 77.1708]; // Delhi Cantt
  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);
  const [initialZoom] = useState(13);

  useEffect(() => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; setInitialCenter(FALLBACK); }
    }, 2500);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!done) {
            done = true;
            clearTimeout(timer);
            (window as any).geolocated = true;
            setInitialCenter([pos.coords.latitude, pos.coords.longitude]);
          }
        },
        () => {
          if (!done) { done = true; clearTimeout(timer); setInitialCenter(FALLBACK); }
        },
        { timeout: 2000, maximumAge: 60000 }
      );
    } else {
      clearTimeout(timer);
      setInitialCenter(FALLBACK);
    }
    return () => { done = true; clearTimeout(timer); };
  }, []);

  // Don't render map until we have a center — show slim loader
  if (!initialCenter) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900" style={{ zIndex: 1 }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60 text-xs font-semibold tracking-wide">Locating you…</span>
        </div>
      </div>
    );
  }

  // Show facilities pin only when zoomed in (zoom >= 8)
  const isZoomedInForFacilities = currentZoom >= 8;
  const visibleFacilities = facilities.filter((fac) => {
    if (!isZoomedInForFacilities) return false;
    return activeFacilityTypes[fac.type] && fac.lat && fac.lng;
  });

  const indiaBounds: L.LatLngBoundsExpression = [
    [6.0, 68.0],
    [38.0, 98.0]
  ];

  return (
    <div className="w-full h-full relative" style={{ zIndex: 1 }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        zoomControl={false}
        maxBounds={indiaBounds}
        maxBoundsViscosity={0.6}
        minZoom={5}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
          maxZoom={20}
          minZoom={5}
          attribution="&copy; Google Maps"
          bounds={indiaBounds}
        />

        <MapController selectedProperty={selectedProperty} properties={properties} activeCity={activeCity} />
        
        <ViewportListener 
          properties={properties} 
          onBoundsChange={onBoundsChange} 
          onZoomChange={setCurrentZoom} 
        />

        {/* Dynamic Facility Markers */}
        {visibleFacilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.lat!, fac.lng!]}
            icon={createFacilityIcon(fac.type)}
          >
            <Popup>
              <div style={{ color: '#1e293b', padding: '4px', fontSize: '11px', fontFamily: 'sans-serif', minWidth: '140px' }}>
                <p style={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px', color: '#0f172a' }}>{fac.name}</p>
                <p style={{ fontSize: '10px', color: '#475569' }}>{fac.details}</p>
                <p style={{ fontSize: '10px', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>Commute: {fac.distance}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Clustered Property Price Pill Markers */}
        <MarkerClusterGroup 
          iconCreateFunction={createClusterCustomIcon}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          spiderfyOnMaxZoom={true}
          removeOutsideVisibleBounds={true}
          disableClusteringAtZoom={11}
          maxClusterRadius={60}
        >
          {properties
            .filter((p) => p.lat && p.lng)
            .map((prop) => {
              const isSelected = selectedProperty?.id === prop.id;
              const priceText = `₹${Math.round(prop.rent / 1000)}K`;

              return (
                <Marker
                  key={prop.id}
                  position={[prop.lat!, prop.lng!]}
                  icon={createPropertyIcon(priceText, isSelected)}
                  eventHandlers={{
                    click: () => onSelectProperty(prop),
                  }}
                />
              );
            })}
        </MarkerClusterGroup>
      </MapContainer>
      <MyLocationButton />
    </div>
  );
}
