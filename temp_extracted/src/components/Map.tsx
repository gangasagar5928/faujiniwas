import React, { useState, useRef, useEffect } from "react";
import { Property, Facility } from "../types";
import { MapPin, Navigation, Compass, Plus, Minus, School, Cross, Shield, Train, Accessibility } from "lucide-react";

interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  facilities: Facility[];
  activeFacilityTypes: { school: boolean; hospital: boolean; station: boolean };
}

export default function Map({
  properties,
  selectedProperty,
  onSelectProperty,
  facilities,
  activeFacilityTypes,
}: MapProps) {
  // Map zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Filter facilities based on active toggles
  const visibleFacilities = facilities.filter(
    (fac) => activeFacilityTypes[fac.type]
  );

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const resetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Center on selected property when it changes
  useEffect(() => {
    if (selectedProperty && mapContainerRef.current) {
      const containerWidth = mapContainerRef.current.clientWidth;
      const containerHeight = mapContainerRef.current.clientHeight;

      // Calculate target pan to center the property coord
      // coord x, y are percentages (0 - 100)
      const targetX = (selectedProperty.coord.x / 100) * containerWidth;
      const targetY = (selectedProperty.coord.y / 100) * containerHeight;

      // Center of container
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      setZoom(1.5);
      setPan({
        x: centerX - targetX * 1.5,
        y: centerY - targetY * 1.5,
      });
    }
  }, [selectedProperty]);

  return (
    <div
      ref={mapContainerRef}
      id="map-container"
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing bg-[#9fc4a9] overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background SVG Map representing Patna and Danapur area */}
      <svg
        className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
        viewBox="0 0 1000 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Land Background Grid / Color Blocks */}
        <rect width="1000" height="800" fill="#a4cca5" />

        {/* Forest / Green Cantonment Area Blocks */}
        <path d="M 0,150 L 350,150 L 350,550 L 0,550 Z" fill="#9bc09c" opacity="0.8" />
        <path d="M 350,300 L 700,300 L 700,750 L 350,750 Z" fill="#93b794" opacity="0.7" />
        {/* Danapur Cantonment forest */}
        <path d="M 100,250 C 200,250 250,350 200,450 C 150,550 50,450 100,250 Z" fill="#8cb28e" />

        {/* River Ganga (Large flowing waterbody at the top, blue-ish/teal) */}
        <path
          d="M -50,120 C 150,100 250,130 400,160 C 550,190 650,220 800,300 C 950,380 1050,350 1100,350 L 1100,200 C 1050,200 950,250 800,180 C 650,100 550,80 400,60 C 250,40 150,20 -50,50 Z"
          fill="#85b8cb"
        />

        {/* River Sona / Tributary */}
        <path
          d="M 500,180 C 530,220 550,280 580,310 C 600,330 630,340 750,350 C 850,360 950,340 1100,330 L 1100,340 C 950,350 850,370 750,360 C 630,350 590,340 570,320 C 540,290 520,230 490,180 Z"
          fill="#81b2c4"
          stroke="#81b2c4"
          strokeWidth="8"
        />

        {/* Roads Grid (Golden/Grey-Yellow lines) */}
        {/* Major East-West Highway */}
        <path d="M -50,500 L 1100,500" stroke="#f6eccd" strokeWidth="12" opacity="0.9" />
        <path d="M -50,500 L 1100,500" stroke="#dfcb8d" strokeWidth="6" opacity="0.8" />

        {/* Cantonment Ring Road */}
        <path d="M 100,450 C 100,280 300,280 400,380 C 500,480 300,600 100,450 Z" stroke="#ebd69f" strokeWidth="8" opacity="0.8" fill="none" />
        <path d="M 100,450 C 100,280 300,280 400,380 C 500,480 300,600 100,450 Z" stroke="#c0a656" strokeWidth="4" opacity="0.7" fill="none" />

        {/* Danapur - Patna Main Road */}
        <path d="M 150,380 L 380,450 L 580,460 L 720,530 L 900,580 L 1100,600" stroke="#ebd69f" strokeWidth="10" fill="none" opacity="0.9" />
        <path d="M 150,380 L 380,450 L 580,460 L 720,530 L 900,580 L 1100,600" stroke="#c0a656" strokeWidth="5" fill="none" opacity="0.8" />

        {/* Bridges across Ganga */}
        {/* Bridge 1 */}
        <line x1="280" y1="120" x2="310" y2="180" stroke="#c0c0c0" strokeWidth="14" />
        <line x1="280" y1="120" x2="310" y2="180" stroke="#f5ebd0" strokeWidth="6" />

        {/* Bridge 2 (Digha Bridge) */}
        <line x1="565" y1="175" x2="585" y2="280" stroke="#b0b0b0" strokeWidth="16" />
        <line x1="565" y1="175" x2="585" y2="280" stroke="#ebd69f" strokeWidth="8" />

        {/* Additional Cross roads */}
        <path d="M 220,310 L 220,680" stroke="#f5ebd0" strokeWidth="5" fill="none" opacity="0.8" />
        <path d="M 380,200 L 380,720" stroke="#f5ebd0" strokeWidth="6" fill="none" opacity="0.8" />
        <path d="M 580,310 L 580,780" stroke="#f5ebd0" strokeWidth="6" fill="none" opacity="0.8" />
        <path d="M 720,400 L 720,780" stroke="#f5ebd0" strokeWidth="5" fill="none" opacity="0.8" />
        <path d="M 850,320 L 850,750" stroke="#f5ebd0" strokeWidth="5" fill="none" opacity="0.8" />

        {/* Urban Outline Grid / Block Detail Lines */}
        <path d="M 680,480 L 800,480 L 800,580 L 680,580 Z" stroke="#c2dfc3" strokeWidth="2" strokeDasharray="4,4" fill="#adcbad" opacity="0.4" />
        <path d="M 450,550 L 550,550 L 550,650 L 450,650 Z" stroke="#c2dfc3" strokeWidth="2" strokeDasharray="4,4" fill="#adcbad" opacity="0.4" />
        <path d="M 120,530 L 250,530 L 250,650 L 120,650 Z" stroke="#c2dfc3" strokeWidth="2" strokeDasharray="4,4" fill="#adcbad" opacity="0.4" />

        {/* Text Labels on Map */}
        {/* Ganga River Label */}
        <text x="450" y="110" fill="#2d6a7d" fontSize="24" fontFamily="serif" fontWeight="bold" fontStyle="italic" letterSpacing="4" opacity="0.6">GANGA</text>
        <text x="568" y="358" fill="#2d6a7d" fontSize="14" fontFamily="sans-serif" fontWeight="bold" opacity="0.7" transform="rotate(22, 568, 358)">Patna Water Canal</text>

        {/* City/Sector Labels */}
        <text x="360" y="360" fill="#1b3a1c" fontSize="20" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1" opacity="0.8">Danapur</text>
        <text x="610" y="355" fill="#152815" fontSize="22" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1" opacity="0.8">Patna</text>
        <text x="180" y="470" fill="#224d23" fontSize="16" fontFamily="sans-serif" fontWeight="bold" opacity="0.7">Danapur Cantt Area</text>
        <text x="500" y="520" fill="#224d23" fontSize="15" fontFamily="sans-serif" fontWeight="semibold" opacity="0.6">Patna Cantonment Zone</text>
        <text x="710" y="620" fill="#1e3e1f" fontSize="14" fontFamily="sans-serif" opacity="0.5">Phulwari Sharif</text>
        <text x="240" y="600" fill="#1e3e1f" fontSize="14" fontFamily="sans-serif" opacity="0.5">Khagaul Block</text>

        {/* Small decorative trees/structures on map */}
        <circle cx="150" cy="320" r="15" fill="#719c73" opacity="0.4" />
        <circle cx="165" cy="335" r="12" fill="#719c73" opacity="0.4" />
        <circle cx="280" cy="400" r="18" fill="#719c73" opacity="0.5" />
        <circle cx="430" cy="580" r="22" fill="#719c73" opacity="0.3" />
        <circle cx="750" cy="450" r="16" fill="#719c73" opacity="0.4" />
      </svg>

      {/* Layer 2: Interactive Property Price Pins & Facility Pins */}
      {/* Absolute overlay container mapping percentage coordinates */}
      <div className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
        <div
          className="absolute inset-0 pointer-events-auto transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: "1000px",
            height: "800px",
          }}
        >
          {/* Active Facility Pins (toggled on from sidebar) */}
          {visibleFacilities.map((fac) => {
            const isSchool = fac.type === "school";
            const isHospital = fac.type === "hospital";
            const isStation = fac.type === "station";

            let iconColorClass = "bg-blue-600";
            if (isHospital) iconColorClass = "bg-red-500";
            if (isStation) iconColorClass = "bg-indigo-600";

            return (
              <div
                key={fac.id}
                className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${fac.coord.x}%`, top: `${fac.coord.y}%` }}
              >
                {/* Visual Pin matching image */}
                <div
                  className={`w-9 h-9 ${iconColorClass} text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/80 transform hover:scale-125 transition-transform duration-200`}
                >
                  {isSchool && <School size={16} />}
                  {isHospital && <Cross size={16} className="rotate-0 text-white" fill="white" />}
                  {isStation && <Train size={16} />}
                </div>

                {/* Pulsing ring for high visibility */}
                <div className={`absolute -inset-1 rounded-full ${iconColorClass} opacity-30 animate-ping -z-10`} />

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900/90 backdrop-blur-md text-white text-xs p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl border border-white/20 z-50">
                  <p className="font-bold border-b border-white/10 pb-1 mb-1">{fac.name}</p>
                  <p className="text-[10px] opacity-80">{fac.details}</p>
                  <p className="text-[9px] text-green-300 font-semibold mt-1">Commute: {fac.distance}</p>
                </div>
              </div>
            );
          })}

          {/* Property Pins (Green price labels matching image) */}
          {properties.map((prop) => {
            const isSelected = selectedProperty?.id === prop.id;
            const priceInK = `₹${Math.round(prop.rent / 1000)}K`;

            // If accessibilityMode is active, only highlight wheelchair accessible/ground floor/safe ones
            const isAccessible = accessibilityMode ? prop.type === "PG/Room" || prop.rent < 15000 : true;

            return (
              <div
                key={prop.id}
                id={`pin-${prop.id}`}
                className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 ${
                  isSelected ? "z-30 scale-125" : ""
                } ${isAccessible ? "opacity-100" : "opacity-40"}`}
                style={{ left: `${prop.coord.x}%`, top: `${prop.coord.y}%` }}
                onClick={() => onSelectProperty(prop)}
              >
                {/* Styled Pin as in the FaujiNiwas mockup (Green with pricing pill) */}
                <div
                  className={`px-3 py-1.5 rounded-full shadow-lg font-bold text-xs flex items-center justify-center gap-1.5 border-2 transition-all duration-300 ${
                    isSelected
                      ? "bg-amber-500 text-white border-white scale-110"
                      : "bg-emerald-600/90 backdrop-blur-sm text-white border-white/80 hover:bg-emerald-500"
                  }`}
                >
                  <MapPin size={12} className={isSelected ? "text-white" : "text-emerald-200"} fill="currentColor" />
                  <span>{priceInK}</span>
                </div>

                {/* Mini triangle pointer under the pill */}
                <div
                  className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] mx-auto -mt-0.5 ${
                    isSelected ? "border-t-amber-500" : "border-t-emerald-600/90"
                  }`}
                />

                {/* Pulsing Highlight Circle around selected pin */}
                {isSelected && (
                  <div className="absolute -inset-2.5 rounded-full border-2 border-dashed border-amber-500 animate-spin -z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 3: Controls Float Panel (Bottom Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-40">
        {/* Zoom In & Out Controls */}
        <div className="flex flex-col rounded-xl overflow-hidden bg-slate-900/75 backdrop-blur-md border border-white/10 shadow-2xl">
          <button
            onClick={zoomIn}
            className="p-3 text-white hover:bg-white/10 active:bg-white/20 transition-all duration-200 border-b border-white/10"
            title="Zoom In"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={zoomOut}
            className="p-3 text-white hover:bg-white/10 active:bg-white/20 transition-all duration-200"
            title="Zoom Out"
          >
            <Minus size={18} />
          </button>
        </div>

        {/* Accessibility Toggle */}
        <button
          onClick={() => setAccessibilityMode(!accessibilityMode)}
          className={`p-3 rounded-xl shadow-2xl transition-all duration-300 border backdrop-blur-md flex items-center justify-center ${
            accessibilityMode
              ? "bg-blue-600 border-blue-400 text-white animate-pulse"
              : "bg-slate-900/75 border-white/10 text-white hover:bg-slate-800"
          }`}
          title="Toggle Easy Commute / Ground Floor Listings Only"
        >
          <Accessibility size={18} />
        </button>

        {/* Re-center / Navigation Target */}
        <button
          onClick={resetMap}
          className="p-3 rounded-xl bg-slate-900/75 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800 shadow-2xl flex items-center justify-center transition-all duration-200"
          title="Reset Map Pan & Zoom"
        >
          <Compass size={18} className="hover:animate-spin" />
        </button>
      </div>

      {/* Accessible Mode Toast indicator */}
      {accessibilityMode && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-blue-400 shadow-2xl flex items-center gap-2 z-40">
          <Accessibility size={14} />
          <span>Showing Easy-Access / Ground Floor & Transit-ready Listings</span>
        </div>
      )}
    </div>
  );
}
