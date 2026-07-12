import { useContext, useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { ModalContext } from '../../App';
import { useFilterStore } from '../../store/filterStore';
import styles from './MapOverlay.module.css';

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
      
      {/* 📍 NEARBY FACILITIES Widget (Glassmorphic) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-5 pointer-events-auto">
        {!isFacilitiesOpen ? (
          <button 
            onClick={() => setIsFacilitiesOpen(true)}
            className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <span className="text-xl">📍</span>
          </button>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 min-w-[220px] md:min-w-[240px] text-left">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                Nearby Facilities
              </div>
              <button onClick={() => setIsFacilitiesOpen(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { id: 'commute', label: 'Station Commute Zone', active: showCommuteZones, setter: setShowCommuteZones, icon: '🚆' },
                { id: 'schools', label: 'Army Schools', active: showSchools, setter: setShowSchools, icon: '🏫' },
                { id: 'hospitals', label: 'Military Hospitals', active: showHospitals, setter: setShowHospitals, icon: '🏥' }
              ].map(facility => (
                <button 
                  key={facility.id}
                  onClick={() => facility.setter(!facility.active)}
                  className={`w-full text-left border px-3 py-2 rounded-xl flex items-center gap-3 cursor-pointer transition-colors shadow-sm select-none text-[11px] font-medium ${
                    facility.active 
                      ? 'bg-white/20 border-white/30 text-white' 
                      : 'bg-black/20 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/10">
                     <span className="text-sm opacity-80">{facility.icon}</span>
                  </div>
                  <span>{facility.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Utility Controller */}
      <div className="absolute bottom-[110px] right-16 z-[500] flex items-center gap-3 select-none pointer-events-auto">
        
        {/* Zoom Control Pill */}
        <div className="flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg divide-y divide-white/20">
          <button onClick={() => map.zoomIn()} className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-bold cursor-pointer transition-colors">➕</button>
          <button onClick={() => map.zoomOut()} className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-bold cursor-pointer transition-colors">➖</button>
        </div>
        
        {/* Target Locate Control */}
        <button 
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
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white/70 hover:text-white hover:bg-white/10 shadow-lg cursor-pointer transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </button>

      </div>
    </div>
  );
}
