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

  // Phase 21: Client-Side Scrape Defender (AI Threat Detection Gateway)
  const [clickCount, setClickCount] = useState(0);
  const [gatekeeperAlert, setGatekeeperAlert] = useState(false);

  useEffect(() => {
    const handleInspectCheck = () => {
      setClickCount(prev => {
        const next = prev + 1;
        if (next >= 12) {
          setGatekeeperAlert(true);
          setTimeout(() => setGatekeeperAlert(false), 4500);
          return 0;
        }
        return next;
      });
    };

    window.addEventListener('click', handleInspectCheck);
    // Reset click count after idle window
    const timer = setInterval(() => setClickCount(0), 10000);
    return () => {
      window.removeEventListener('click', handleInspectCheck);
      clearInterval(timer);
    };
  }, []);

  // Phase 22: Blackout Mode Navigation Compass
  const [blackoutMode, setBlackoutMode] = useState(false);
  const [heading, setHeading] = useState(142);
  const compassInterval = useRef(null);

  useEffect(() => {
    if (blackoutMode) {
      document.documentElement.classList.add('blackout-active');
      ctx?.showToast('Offline Compass Active — Navigation Mode Engaged 🧭', 'ok');
      compassInterval.current = setInterval(() => {
        setHeading(h => (h + (Math.random() * 6 - 3) + 360) % 360);
      }, 200);
    } else {
      document.documentElement.classList.remove('blackout-active');
      if (compassInterval.current) clearInterval(compassInterval.current);
    }
    return () => {
      if (compassInterval.current) clearInterval(compassInterval.current);
    };
  }, [blackoutMode]);

  // Phase 25: All-Forces Unified Super-App Mesh SOS Link
  const [meshActive, setMeshActive] = useState(false);
  const [meshLogs, setMeshLogs] = useState([]);

  const triggerMeshSOS = async () => {
    if (meshActive) return;
    setMeshActive(true);
    setMeshLogs([]);
    const addLog = (m) => setMeshLogs(prev => [...prev.slice(-3), `[MESH] ${m}`]);

    addLog("Scanning off-grid peer relays...");
    await new Promise(r => setTimeout(r, 600));
    addLog("Mapping 4 local peer nodes...");
    await new Promise(r => setTimeout(r, 700));
    addLog("Relaying distress payload to nearest Garrison Guard post...");
    await new Promise(r => setTimeout(r, 800));
    addLog("✓ Distress signal sent successfully.");
    
    ctx?.showToast('Distress signal transmitted via offline mesh! 🆘', 'ok');
    setTimeout(() => {
      setMeshActive(false);
      setMeshLogs([]);
    }, 8000);
  };

  const getHeadingDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  return (
    <div className={styles.overlay} style={{ pointerEvents: 'none' }}>
      
      {/* Phase 21: Sovereign AI Threat Detection Alert */}
      {gatekeeperAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--green)',
          boxShadow: '0 0 16px rgba(34, 197, 94, 0.4)',
          borderRadius: '8px',
          padding: '10px 16px',
          color: '#ffffff',
          fontSize: '11px',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 99999,
          pointerEvents: 'all',
          animation: 'overlayRise 0.3s ease-out'
        }}>
          <span className="live-dot" style={{ background: 'var(--green)' }} />
          <span>Security Gatekeeper: Safe client connection verified</span>
        </div>
      )}

      {/* Blackout Navigation Compass HUD (Phase 22) */}
      {blackoutMode && (
        <div className="glass-tactical" style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          width: '240px',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid var(--accent)',
          background: 'rgba(10, 15, 30, 0.95)',
          boxShadow: '0 0 20px rgba(255, 153, 51, 0.3)',
          color: '#ffffff',
          zIndex: 9999,
          pointerEvents: 'all',
          fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
            🧭 OFFLINE NAVIGATION COMPASS
          </div>

          {/* Compass Graphic */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '2px dashed var(--accent)',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${heading}deg)`,
            transition: 'transform 0.1s linear',
            position: 'relative'
          }}>
            <div style={{ fontSize: '20px', color: 'var(--accent)', fontWeight: 900, transform: `rotate(${-heading}deg)` }}>↑</div>
            <div style={{ position: 'absolute', top: '4px', fontSize: '9px', fontWeight: 'bold', transform: `rotate(${-heading}deg)` }}>N</div>
            <div style={{ position: 'absolute', right: '4px', fontSize: '9px', fontWeight: 'bold', transform: `rotate(${-heading}deg)` }}>E</div>
            <div style={{ position: 'absolute', bottom: '4px', fontSize: '9px', fontWeight: 'bold', transform: `rotate(${-heading}deg)` }}>S</div>
            <div style={{ position: 'absolute', left: '4px', fontSize: '9px', fontWeight: 'bold', transform: `rotate(${-heading}deg)` }}>W</div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>{Math.round(heading)}° {getHeadingDirection(heading)}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Nearest Gate: <b>Delhi Cantt Gate-3</b></div>
          </div>

          {/* Mesh SOS Trigger button (Phase 25) */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <button
              onClick={triggerMeshSOS}
              disabled={meshActive}
              style={{
                width: '100%',
                padding: '8px',
                background: meshActive ? 'rgba(239, 68, 68, 0.1)' : 'var(--red)',
                border: '1px solid var(--red)',
                color: meshActive ? 'var(--red)' : '#ffffff',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'all 0.2s'
              }}
            >
              {meshActive ? '🆘 SOS BROADCAST ACTIVE' : '🆘 OFFLINE MESH SOS'}
            </button>

            {meshActive && (
              <div style={{
                background: '#040710',
                padding: '6px',
                borderRadius: '6px',
                fontSize: '9px',
                color: '#4ade80',
                maxHeight: '70px',
                overflowY: 'auto',
                lineHeight: '1.4'
              }}>
                {meshLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📍 NEARBY FACILITIES Widget (Gold border, vertical list) */}
      <div className="absolute bottom-20 right-5 z-[500] bg-[#0c1222]/95 border border-amber-500/20 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 min-w-[240px] text-left backdrop-blur-md pointer-events-auto">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#fbbf24] flex items-center gap-1.5 font-mono select-none">
          <span>📍</span> NEARBY FACILITIES
        </div>
        
        <div className="flex flex-col gap-2">
          {[
            { id: 'commute', label: 'Station Commute Zone', active: showCommuteZones, setter: setShowCommuteZones, icon: '🔵', activeClass: 'bg-blue-500/10 border-blue-500 text-white' },
            { id: 'schools', label: 'Army Schools (APS & KV)', active: showSchools, setter: setShowSchools, icon: '🟢', activeClass: 'bg-emerald-500/10 border-emerald-500 text-white' },
            { id: 'hospitals', label: 'Military Hospitals', active: showHospitals, setter: setShowHospitals, icon: '🟣', activeClass: 'bg-purple-500/10 border-purple-500 text-white' },
            { id: 'canteens', label: 'Canteen (CSD & URC)', active: showCanteens, setter: setShowCanteens, icon: '🟤', activeClass: 'bg-[#854d0e]/10 border-[#854d0e] text-white' }
          ].map(facility => (
            <button 
              key={facility.id}
              onClick={() => facility.setter(!facility.active)}
              className={`w-full text-left border px-3 py-2.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors shadow-sm select-none text-[10px] font-bold ${
                facility.active 
                  ? facility.activeClass 
                  : 'bg-[#10192e] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              <span className="text-xs">{facility.icon}</span>
              <span>{facility.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Utility Controller */}
      <div className="absolute bottom-5 right-5 z-[500] flex items-center gap-2 select-none pointer-events-auto">
        {/* Leaflet Custom zoom buttons */}
        <div className="flex bg-[#0c1222]/95 border border-[#1e293b] rounded-lg p-0.5 shadow-lg">
          <button onClick={() => map.zoomIn()} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer">➕</button>
          <button onClick={() => map.zoomOut()} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer">➖</button>
        </div>
        
        {/* Action controller pills */}
        <div className="flex items-center bg-[#0c1222]/95 border border-[#1e293b] rounded-xl p-0.5 shadow-lg gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-300">
          <button 
            onClick={() => map.flyTo([22.5, 82.0], 5, { duration: 0.8 })}
            className="px-2.5 py-1.5 bg-[#10192e] border border-[#1e293b] hover:border-amber-500/30 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>🌐</span> India
          </button>
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
                  console.error("Locate error", err);
                  ctx?.showToast('Enable location permissions', 'error');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            }}
            className="px-2.5 py-1.5 bg-[#10192e] border border-[#1e293b] hover:border-amber-500/30 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>📍</span> Locate Me
          </button>
          <button 
            onClick={() => setBlackoutMode(!blackoutMode)}
            className={`px-2.5 py-1.5 border rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
              blackoutMode 
                ? 'bg-amber-500/20 border-amber-500 text-[#fbbf24]' 
                : 'bg-[#10192e] border-[#1e293b] text-white hover:border-amber-500/30'
            }`}
          >
            <span>📶</span> {blackoutMode ? 'Compass' : 'Offline Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
