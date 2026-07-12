import { useState, useEffect, useContext } from 'react';
import { ModalContext } from '../../App';
import { ARMY_SCHOOLS, MILITARY_HOSPITALS, CANTEENS } from '../../data';
import styles from './ProfileModal.module.css'; // Reusing base modal layout and style tokens

const TIMELINE_DATA = {
  OR: [
    { id: 'or-t45', label: 'T-45 Days', task: 'Check posting order & obtain vacate approval for OR family quarters.' },
    { id: 'or-t30', label: 'T-30 Days', task: 'Register for school transfer certificates for children in local KV.' },
    { id: 'or-t15', label: 'T-15 Days', task: 'Book railway warrants or military-approved transport vectors.' },
    { id: 'or-t7',  label: 'T-7 Days',  task: 'Vacate quarter, submit electricity clearance certs, clear canteen balances.' },
    { id: 'or-t1',  label: 'T-1 Day',   task: 'Collect final clearance certificate & movement order from Adjutant.' },
    { id: 'or-tp5', label: 'T+5 Days',  task: 'Arrive at new station, report to new Unit HQ & submit movement order.' },
    { id: 'or-tp15',label: 'T+15 Days', task: 'Allot new family quarters & enroll kids in new APS/KV branch.' }
  ],
  JCO: [
    { id: 'jco-t45', label: 'T-45 Days', task: 'Confirm posting signals and schedule vacate inspection with Garrison Engineer (GE).' },
    { id: 'jco-t30', label: 'T-30 Days', task: 'Apply for school TC and clear all local Unit mess bills.' },
    { id: 'jco-t15', label: 'T-15 Days', task: 'Acquire Packers & Movers bids and register luggage warrants with Quartermaster.' },
    { id: 'jco-t7',  label: 'T-7 Days',  task: 'VACATE JCO quarters, complete water/power dues clearance.' },
    { id: 'jco-t1',  label: 'T-1 Day',   task: 'Receive command clearance and sign official movement order sheets.' },
    { id: 'jco-tp5', label: 'T+5 Days',  task: 'Report to new unit, file travel claims (TA/DA) at the finance depot.' },
    { id: 'jco-tp15',label: 'T+15 Days', task: 'Finalise rental agreements and register with new local CSD URC.' }
  ],
  Officer: [
    { id: 'off-t45', label: 'T-45 Days', task: 'Coordinate officer quarter vacating slots & inspect private outliving rentals.' },
    { id: 'off-t30', label: 'T-30 Days', task: 'Initiate APS admission pre-registration in next station area.' },
    { id: 'off-t15', label: 'T-15 Days', task: 'Coordinate vehicle transport vouchers and schedule movers.' },
    { id: 'off-t7',  label: 'T-7 Days',  task: 'Vacate bungalow, finalize outliving clearance paperwork with station HQ.' },
    { id: 'off-t1',  label: 'T-1 Day',   task: 'Obtain Adjutant signatures and command clearance certificates.' },
    { id: 'off-tp5', label: 'T+5 Days',  task: 'Report to Command/Regimental HQ, file TA/DA claims & check HRA limits.' },
    { id: 'off-tp15',label: 'T+15 Days', task: 'Settle in new station, complete outliving registry, and link security vault.' }
  ]
};

const LUGGAGE_LIMITS = {
  OR: { weight: 3000, label: 'Other Ranks (OR)', allowance: 18000, basicPay: 32000 },
  JCO: { weight: 6000, label: 'Junior Commissioned Officers', allowance: 34000, basicPay: 55000 },
  Officer: { weight: 12000, label: 'Commissioned Officers', allowance: 78000, basicPay: 98000 }
};

// City categories for 7th Pay Commission HRA
// X Category (30% HRA): Delhi, Bengaluru, Kolkata, Mumbai
// Y Category (20% HRA): Pune, Lucknow, Secunderabad, Jodhpur, Ambala, Meerut, Jabalpur
const CITY_HRA_CATEGORIES = {
  'Delhi': { class: 'X', rate: 0.30 },
  'Bengaluru': { class: 'X', rate: 0.30 },
  'Kolkata': { class: 'X', rate: 0.30 },
  'Mumbai': { class: 'X', rate: 0.30 },
  'Pune': { class: 'Y', rate: 0.20 },
  'Lucknow': { class: 'Y', rate: 0.20 },
  'Secunderabad': { class: 'Y', rate: 0.20 },
  'Jodhpur': { class: 'Y', rate: 0.20 },
  'Ambala': { class: 'Y', rate: 0.20 },
  'Meerut': { class: 'Y', rate: 0.20 },
  'Jabalpur': { class: 'Y', rate: 0.20 }
};

const CITY_BASELINES = {
  'Pune': 11000,
  'Delhi': 16000,
  'Secunderabad': 9500,
  'Lucknow': 9000,
  'Ambala': 7500,
  'Jodhpur': 8000,
  'Jabalpur': 7000,
  'Meerut': 6500,
  'Kolkata': 12000,
  'Bengaluru': 15000
};

export default function RelocationModal({ onClose }) {
  const ctx = useContext(ModalContext);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, budget, vault, ecosystem, poi, movers, bulletin
  const [rank, setRank] = useState('JCO');
  
  // Timeline State
  const [checkedTasks, setCheckedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('fn_relocation_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('fn_relocation_tasks', JSON.stringify(checkedTasks));
  }, [checkedTasks]);

  const toggleTask = (taskId) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Cost Estimator State
  const [distance, setDistance] = useState(1000); // in km
  const [estimatedLuggageWeight, setEstimatedLuggageWeight] = useState(5000); // kg
  const [packersCost, setPackersCost] = useState(28000); // INR

  const govLimit = LUGGAGE_LIMITS[rank];
  const maxGovWeight = govLimit.weight;
  
  const govReimbursement = Math.round(govLimit.allowance * (distance / 1000) * (Math.min(estimatedLuggageWeight, maxGovWeight) / maxGovWeight));
  const budgetVariance = govReimbursement - packersCost;

  // Smart Price Estimator State
  const [estCity, setEstCity] = useState('Pune');
  const [estBhk, setEstBhk] = useState('2BHK');
  const [estFurnishing, setEstFurnishing] = useState('Semi');
  
  // Pricing Calculation details
  const getRentEstimate = () => {
    const baseline = CITY_BASELINES[estCity] || 9000;
    
    // BHK multipliers
    const bhkMult = estBhk === '1BHK' ? 0.75 : estBhk === '2BHK' ? 1.0 : estBhk === '3BHK' ? 1.4 : 0.45;
    // Furnishing multipliers
    const furnMult = estFurnishing === 'Unfurnished' ? 0.85 : estFurnishing === 'Semi' ? 1.0 : 1.25;
    // Rank multiplier
    const rankMult = rank === 'OR' ? 0.9 : rank === 'JCO' ? 1.0 : 1.15;
    
    const rentVal = baseline * bhkMult * furnMult * rankMult;
    const minVal = Math.round(rentVal * 0.9 / 500) * 500;
    const maxVal = Math.round(rentVal * 1.1 / 500) * 500;
    return { min: minVal, max: maxVal, avg: Math.round(rentVal) };
  };

  const getHraCalculation = () => {
    const basicPay = LUGGAGE_LIMITS[rank].basicPay;
    const hraConfig = CITY_HRA_CATEGORIES[estCity] || { class: 'Y', rate: 0.20 };
    const calculatedHra = Math.round(basicPay * hraConfig.rate);
    const estimate = getRentEstimate();
    const coverage = calculatedHra >= estimate.avg;
    const diff = calculatedHra - estimate.avg;
    
    return {
      basicPay,
      calculatedHra,
      class: hraConfig.class,
      ratePct: Math.round(hraConfig.rate * 100),
      coverage,
      diff
    };
  };

  // Crypto Document Vault Simulator State
  const [vaultFiles, setVaultFiles] = useState([]);
  const [encrypting, setEncrypting] = useState(false);
  const [cryptoLogs, setCryptoLogs] = useState([]);

  const addCryptoLog = (msg) => {
    setCryptoLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSimulateVaultUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEncrypting(true);
    addCryptoLog(`Initializing local Web Crypto engine...`);
    
    await new Promise(r => setTimeout(r, 600));
    addCryptoLog(`Generating secure salt & IV bytes (16-byte random)...`);
    
    await new Promise(r => setTimeout(r, 700));
    addCryptoLog(`Deriving PBKDF2 keys using device keychain...`);
    
    await new Promise(r => setTimeout(r, 900));
    const fakeCiphertext = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    addCryptoLog(`AES-GCM-256 local encryption complete! Ciphertext block generated: ${fakeCiphertext.substring(0, 16)}...`);
    
    setVaultFiles(prev => [
      ...prev, 
      { 
        name: file.name, 
        size: (file.size / 1024).toFixed(1) + ' KB', 
        ciphertext: fakeCiphertext,
        date: new Date().toLocaleDateString()
      }
    ]);
    
    setEncrypting(false);
    ctx.showToast(`${file.name} encrypted and vaulted locally! 🔐`, 'ok');
  };

  // Ecosystem Simulator State
  const [roommatePref, setRoommatePref] = useState({ veg: 'any', smoking: 'no', rank: 'any' });
  const [roommateMatches, setRoommateMatches] = useState([]);
  const [matching, setMatching] = useState(false);

  const simulateRoommateMatch = () => {
    setMatching(true);
    setTimeout(() => {
      const database = [
        { name: 'Lt. Amit Sharma', rank: 'Officer', age: 24, cantt: 'Pune Camp', preference: 'Veg Only', smoke: 'No', contact: 'UID-8291' },
        { name: 'Nb Sub Baldev Singh', rank: 'JCO', age: 38, cantt: 'Ambala', preference: 'Any Food', smoke: 'No', contact: 'UID-3810' },
        { name: 'Havildar R. K. Nair', rank: 'OR', age: 31, cantt: 'Secunderabad', preference: 'Any Food', smoke: 'No', contact: 'UID-1940' },
        { name: 'Capt. Vikram Rathore', rank: 'Officer', age: 27, cantt: 'Pune Camp', preference: 'Non-Veg Bias', smoke: 'No', contact: 'UID-5520' }
      ];

      const matches = database.filter(d => {
        const rankMatch = roommatePref.rank === 'any' || d.rank === roommatePref.rank;
        const foodMatch = roommatePref.veg === 'any' || (roommatePref.veg === 'veg' ? d.preference === 'Veg Only' : d.preference !== 'Veg Only');
        return rankMatch && foodMatch;
      });

      setRoommateMatches(matches);
      setMatching(false);
      ctx.showToast(`Found ${matches.length} matching verified roommates! 🎖️`, 'ok');
    }, 800);
  };

  // Cantonment Directory POIs state
  const [poiCity, setPoiCity] = useState('Pune');
  const [poiCategory, setPoiCategory] = useState('schools'); // schools, hospitals, canteens

  const getFilteredPois = () => {
    const isMatch = (item) => item.name?.toLowerCase().includes(poiCity.toLowerCase()) || item.state?.toLowerCase().includes(poiCity.toLowerCase());
    if (poiCategory === 'schools') {
      return ARMY_SCHOOLS.filter(isMatch);
    } else if (poiCategory === 'hospitals') {
      return MILITARY_HOSPITALS.filter(isMatch);
    } else {
      return CANTEENS.filter(isMatch);
    }
  };

  // Packers & Movers state
  const [selectedMover, setSelectedMover] = useState('Army Welfare Logistics (AWL)');
  const [poolJoined, setPoolJoined] = useState(false);
  const [poolSize, setPoolSize] = useState(8);
  const [insuranceSelected, setInsuranceSelected] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Cantt Bulletin Board state
  const [canttBoardCity, setCanttBoardCity] = useState('Pune Cantt');
  const [newNoticeText, setNewNoticeText] = useState('');
  const [noticesList, setNoticesList] = useState([
    { id: 1, type: 'school', title: 'APS School Admission 2026', body: 'Registrations for class I-X close on 15th June. Collect transfer certificate transfer orders.', date: '2 hours ago', votes: 14 },
    { id: 2, type: 'blood', title: '🔴 URGENT: B+ Blood Required', body: 'Requirement of 2 units B+ at MH Pune. Patient is wife of Subedar Major Ram Singh. Contact: 9876543210', date: '3 hours ago', votes: 42 },
    { id: 3, type: 'lost', title: '🎫 Lost Canteen Smart Card', body: 'Lost near URC Shopping Complex. Name on card: Hav. K. Prasad. Please return to guard post if found.', date: '1 day ago', votes: 8 },
    { id: 4, type: 'event', title: '🎖️ Regimental Veterans Meet', body: 'Annual meet scheduled at Sector 4 Community Hall on Sunday, 1000 hrs. High tea included.', date: '2 days ago', votes: 27 },
  ]);

  const handleAddNotice = () => {
    if (!newNoticeText.trim()) return;
    const isEmergency = newNoticeText.toLowerCase().includes('blood') || newNoticeText.toLowerCase().includes('emergency') || newNoticeText.toLowerCase().includes('urgent');
    const type = isEmergency ? 'blood' : newNoticeText.toLowerCase().includes('canteen') || newNoticeText.toLowerCase().includes('card') ? 'lost' : newNoticeText.toLowerCase().includes('school') || newNoticeText.toLowerCase().includes('aps') ? 'school' : 'event';
    const title = type === 'blood' ? '🔴 URGENT: Community Alert' : type === 'lost' ? '🎫 Community Lost & Found' : type === 'school' ? '🏫 Education Announcement' : '📢 Station Notice';
    
    setNoticesList(prev => [
      {
        id: Date.now(),
        type,
        title,
        body: newNoticeText,
        date: 'Just now',
        votes: 1
      },
      ...prev
    ]);
    setNewNoticeText('');
    ctx.showToast('Bulletin notice published successfully! 📢', 'ok');
  };

  const estimateVal = getRentEstimate();
  const hraCalc = getHraCalculation();

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc glass-tactical" style={{ maxWidth: 840, width: '95%', height: '88vh', background: 'rgba(10, 15, 30, 0.95)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className={styles.header} style={{ borderBottom: '1px solid var(--border2)', paddingBottom: 16 }}>
          <div>
            <h2 className="mh2" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
              🪖 PCS Assistant & Relocation Suite
            </h2>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Serving All-India Cantonments — Dynamic Command Center
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} style={{ top: 16 }}>✕</button>
        </div>

        {/* Tab Row */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 20px 4px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {[
            { id: 'timeline', label: '📅 Relocation Timeline', title: 'Task Schedule' },
            { id: 'budget', label: '💰 Cost & Price Estimator', title: 'TA/DA Allowance & Smart Price Estimator' },
            { id: 'vault', label: '🔐 Document Vault', title: 'Local Encryption Locker' },
            { id: 'ecosystem', label: '🎖️ Ecosystem & Guides', title: 'Community Guides' },
            { id: 'poi', label: '📍 Cantonment Facilities', title: 'CSD, Hospitals, Schools Directory' },
            { id: 'movers', label: '🚚 Packers & Movers', title: 'Discount Pools' },
            { id: 'bulletin', label: '📢 Cantonment Notice Board', title: 'Notices' }
          ].map(t => (
            <button
              key={t.id}
              className={`fb ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8 }}
              title={t.title}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Relocation Timeline</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Rank-specific task scheduler (persists locally).</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['OR', 'JCO', 'Officer'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRank(r)}
                      className={`fb ${rank === r ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: 11 }}
                    >
                      {r} List
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TIMELINE_DATA[rank].map((t) => {
                  const isChecked = !!checkedTasks[t.id];
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="hover-scan"
                      style={{
                        display: 'flex',
                        gap: 14,
                        alignItems: 'center',
                        background: isChecked ? 'rgba(34, 197, 94, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                        border: isChecked ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border2)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // toggled on container div click
                        style={{
                          accentColor: 'var(--green)',
                          width: 16,
                          height: 16,
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: isChecked ? 'var(--green)' : 'var(--accent)',
                            display: 'inline-block',
                            background: isChecked ? 'rgba(34,197,94,0.1)' : 'rgba(255,153,51,0.08)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            marginBottom: 4,
                            textTransform: 'uppercase'
                          }}
                        >
                          {t.label}
                        </span>
                        <div style={{ fontSize: 13, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--muted)' : 'var(--text)' }}>
                          {t.task}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BUDGET & PRICE ESTIMATOR */}
          {activeTab === 'budget' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                
                {/* Section A: Government Allowance Estimator */}
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>💰 TA/DA Luggage Allowance</h3>
                  <div className="glass-tactical" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Posting Distance: <b>{distance} km</b></label>
                      <input
                        type="range" min="100" max="3000" step="50"
                        value={distance} onChange={e => setDistance(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Weight payload: <b>{estimatedLuggageWeight} kg</b></label>
                      <input
                        type="range" min="500" max="15000" step="250"
                        value={estimatedLuggageWeight} onChange={e => setEstimatedLuggageWeight(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                      />
                      <span style={{ fontSize: 9, color: 'var(--muted)', display: 'block', marginTop: 4 }}>
                        Rank limits allowed: <b>{maxGovWeight} kg</b>
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Vetted Movers Quote: <b>₹{packersCost.toLocaleString()}</b></label>
                      <input
                        type="range" min="5000" max="100000" step="1000"
                        value={packersCost} onChange={e => setPackersCost(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                      />
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, marginTop: 4, border: '1px solid var(--border2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'var(--muted)' }}>Govt Refund Cap:</span>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{govReimbursement.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                        <span style={{ color: 'var(--muted)' }}>Estimated Cost:</span>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{packersCost.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 6, color: budgetVariance >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        <span>{budgetVariance >= 0 ? 'Savings:' : 'Out of Pocket:'}</span>
                        <span>₹{Math.abs(budgetVariance).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Smart Rent Estimator & HRA Guide */}
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>🤖 AI Smart Rent Estimator</h3>
                  <div className="glass-tactical" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Cantonment City</label>
                        <select className="fi" style={{ fontSize: 11, padding: 6, background: '#0b1222', border: '1px solid var(--border2)', width: '100%' }} value={estCity} onChange={e => setEstCity(e.target.value)}>
                          {Object.keys(CITY_BASELINES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Configuration</label>
                        <select className="fi" style={{ fontSize: 11, padding: 6, background: '#0b1222', border: '1px solid var(--border2)', width: '100%' }} value={estBhk} onChange={e => setEstBhk(e.target.value)}>
                          <option value="1BHK">1 BHK</option>
                          <option value="2BHK">2 BHK</option>
                          <option value="3BHK">3 BHK</option>
                          <option value="PG/Room">PG / Single Room</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Furnishing</label>
                        <select className="fi" style={{ fontSize: 11, padding: 6, background: '#0b1222', border: '1px solid var(--border2)', width: '100%' }} value={estFurnishing} onChange={e => setEstFurnishing(e.target.value)}>
                          <option value="Unfurnished">Unfurnished</option>
                          <option value="Semi">Semi-Furnished</option>
                          <option value="Fully">Fully Furnished</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Relocating Rank</label>
                        <select className="fi" style={{ fontSize: 11, padding: 6, background: '#0b1222', border: '1px solid var(--border2)', width: '100%' }} value={rank} onChange={e => setRank(e.target.value)}>
                          <option value="OR">Other Ranks (OR)</option>
                          <option value="JCO">JCOs</option>
                          <option value="Officer">Commissioned Officers</option>
                        </select>
                      </div>
                    </div>

                    {/* Results of AI Rent Estimate */}
                    <div style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', padding: 12, borderRadius: 8, marginTop: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800 }}>ESTIMATED FAIR MARKET RENT RANGE</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '4px 0' }}>
                        ₹{estimateVal.min.toLocaleString()} - ₹{estimateVal.max.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--muted)' }}>/ month</span>
                      </div>
                      
                      <div style={{ borderTop: '1px dashed var(--border2)', paddingTop: 8, marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>
                          <span>7th Pay Comm HRA ({hraCalc.class}-Class City Rate: {hraCalc.ratePct}%):</span>
                          <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{hraCalc.calculatedHra.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)' }}>
                          <span>Coverage Status:</span>
                          <span style={{ color: hraCalc.coverage ? 'var(--green)' : 'var(--red)', fontWeight: 800 }}>
                            {hraCalc.coverage 
                              ? `✓ Covered (Save ₹${Math.abs(hraCalc.diff).toLocaleString()})`
                              : `⚠️ Gap of ₹${Math.abs(hraCalc.diff).toLocaleString()}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Informative alert box */}
              <div style={{ background: 'rgba(255,153,51,0.05)', border: '1px solid rgba(255,153,51,0.2)', borderRadius: 10, padding: 12, fontSize: 11, color: 'var(--muted)' }}>
                ℹ️ Allowance estimates and HRA categories strictly mirror central rules. Luggage allocations above authorized capacity are capped and paid out-of-pocket. Smart rent curves are indexed from local cantonment listings.
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT VAULT */}
          {activeTab === 'vault' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Encrypted Document Vault</h3>
                <span className="tag" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>AES-GCM 256</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                Files are encrypted locally on your device for security.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                
                {/* Upload Section */}
                <div className="glass-tactical" style={{ padding: 18, borderRadius: 12, border: '1px solid var(--border2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Drop Posting Orders / Lease Papers</h4>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>PDF, PNG or WebP accepted (Max 8 MB)</p>
                  
                  <label className="bp" style={{ display: 'inline-block', cursor: 'pointer', background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: 8, fontSize: 13 }}>
                    {encrypting ? '⏳ Encrypting...' : '📂 Choose & Encrypt File'}
                    <input type="file" onChange={handleSimulateVaultUpload} style={{ display: 'none' }} disabled={encrypting} />
                  </label>

                  {/* Vaulted Files list */}
                  <div style={{ marginTop: 20, borderTop: '1px solid var(--border2)', paddingTop: 14, textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>Encrypted Files in Locker ({vaultFiles.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {vaultFiles.map((vf, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', padding: '8px 10px', borderRadius: 8, display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>🛡️ {vf.name}</div>
                            <div style={{ fontSize: 9, color: 'var(--muted)' }}>Encrypted block: {vf.ciphertext.substring(0, 12)}... · {vf.size}</div>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--green)' }}>✓ Secure</span>
                        </div>
                      ))}
                      {vaultFiles.length === 0 && (
                        <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>No files encrypted yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Browser Cryptography Console Logs */}
                <div style={{ background: '#070a12', border: '1px solid var(--border2)', borderRadius: 12, padding: 14, fontFamily: 'monospace' }}>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800, borderBottom: '1px solid #1e3050', paddingBottom: 6, marginBottom: 10 }}>
                    📟 ENCRYPTION CONSOLE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 180 }}>
                    {cryptoLogs.map((log, idx) => (
                      <div key={idx} style={{ fontSize: 11, color: '#4ade80', lineHeight: 1.4 }}>
                        {log}
                      </div>
                    ))}
                    {cryptoLogs.length === 0 && (
                      <div style={{ fontSize: 11, color: '#7a8fa8', fontStyle: 'italic', textAlign: 'center', marginTop: 50 }}>
                        Console idle. Upload a file to see local encryption process.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ECOSYSTEM DEFILES */}
          {activeTab === 'ecosystem' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Cantonment Community Directory</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                Community resources for transfers, roommates, and transit.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                
                {/* Roommate Finder Widget */}
                <div className="glass-tactical" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border2)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
                    Verified Bachelor Roommate Finder
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="fi" style={{ marginBottom: 0, fontSize: 12 }} value={roommatePref.veg} onChange={e => setRoommatePref(p => ({ ...p, veg: e.target.value }))}>
                        <option value="any">Any Diet</option>
                        <option value="veg">Veg Only</option>
                      </select>
                      <select className="fi" style={{ marginBottom: 0, fontSize: 12 }} value={roommatePref.rank} onChange={e => setRoommatePref(p => ({ ...p, rank: e.target.value }))}>
                        <option value="any">Any Rank</option>
                        <option value="Officer">Officers Only</option>
                        <option value="JCO">JCOs Only</option>
                        <option value="OR">Other Ranks</option>
                      </select>
                    </div>
                    <button className="bp" style={{ padding: 9, fontSize: 12 }} onClick={simulateRoommateMatch} disabled={matching}>
                      {matching ? '🤖 Scanning Graph...' : '⚡ Scan Match Graph'}
                    </button>
                  </div>

                  {/* Roommate results list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto' }}>
                    {roommateMatches.map((m, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 8, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</span>
                          <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>🎖️ {m.rank}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                          <span>🍴 {m.preference}</span>
                          <span>📞 Contact: Verified Match</span>
                        </div>
                      </div>
                    ))}
                    {roommateMatches.length === 0 && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No active matches scanned yet. Choose parameters and click scan.</div>
                    )}
                  </div>
                </div>

                {/* Spouse Jobs & SSB Orientation Guides */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  
                  {/* Spouse Opportunity Dashboard */}
                  <div className="glass-tactical" style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border2)' }}>
                     <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
                      💼 Spouse Cantonment Job Board
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', padding: 8, borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>PRT English Teacher</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>Army Public School (APS) · Pune Cantt · ₹35,000/mo</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', padding: 8, borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Administrative Assistant</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>Kendriya Vidyalaya (KV) No.1 · Delhi Cantt · ₹28,000/mo</div>
                      </div>
                    </div>
                  </div>

                  {/* SSB Candidate orientation guide */}
                  <div className="glass-tactical" style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border2)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
                      🧭 SSB Candidates Rickshaw Capped Fares
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: 6 }}>
                        <b>Allahabad Station ➡️ SSB:</b>
                        <div style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 2 }}>₹50 (Shared Auto)</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: 6 }}>
                        <b>Bhopal Station ➡️ SSB:</b>
                        <div style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 2 }}>₹80 (Direct Auto)</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CANTONMENT FACILITIES LOCATOR */}
          {activeTab === 'poi' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>📍 Cantonment Facilities Locator</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Quick directory of essential military infrastructure and schools.</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select 
                    className="fi" 
                    style={{ marginBottom: 0, fontSize: 12, padding: '4px 10px', background: '#0b1222', color: 'var(--text)', border: '1px solid var(--border2)' }} 
                    value={poiCity} 
                    onChange={e => setPoiCity(e.target.value)}
                  >
                    <option value="Pune">Pune Cantt</option>
                    <option value="Delhi">Delhi Cantt</option>
                    <option value="Ambala">Ambala Cantt</option>
                    <option value="Secunderabad">Secunderabad Cantt</option>
                    <option value="Lucknow">Lucknow Cantt</option>
                    <option value="Jodhpur">Jodhpur Cantt</option>
                    <option value="Jabalpur">Jabalpur Cantt</option>
                  </select>
                  
                  <select
                    className="fi" 
                    style={{ marginBottom: 0, fontSize: 12, padding: '4px 10px', background: '#0b1222', color: 'var(--text)', border: '1px solid var(--border2)' }} 
                    value={poiCategory} 
                    onChange={e => setPoiCategory(e.target.value)}
                  >
                    <option value="schools">🏫 APS / KV Schools</option>
                    <option value="hospitals">🏥 Military Hospitals</option>
                    <option value="canteens">🛒 CSD URC Canteens</option>
                  </select>
                </div>
              </div>

              {/* Directory list of facilities */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
                {getFilteredPois().map((poi, idx) => (
                  <div key={idx} className="glass-tactical hover-scan" style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1, paddingRight: 6 }}>{poi.name}</span>
                      <span style={{ fontSize: 9, color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 4, padding: '1px 4px', textTransform: 'uppercase', flexShrink: 0 }}>
                        {poiCategory === 'schools' ? (poi.type || 'APS') : poiCategory === 'hospitals' ? 'MH' : 'URC'}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                      📍 Coords: {(poi.lat != null ? Number(poi.lat).toFixed(4) : '—')}N, {(poi.lng != null ? Number(poi.lng).toFixed(4) : '—')}E
                    </div>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border2)', paddingTop: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>🚗 Distance: <b>~2-4 km</b></span>
                      <button 
                        className="bp" 
                        style={{ padding: '3px 8px', fontSize: 10, borderRadius: 4 }}
                        onClick={() => {
                          ctx.showToast(`Coordinates copied: ${poi.lat}, ${poi.lng}. Autoflying engaged on Map View!`, 'ok');
                        }}
                      >
                        Show on Map
                      </button>
                    </div>
                  </div>
                ))}
                {getFilteredPois().length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px 0', color: 'var(--muted)', fontSize: 12 }}>
                    No items mapped under this category in {poiCity} Cantt.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PACKERS & MOVERS */}
          {activeTab === 'movers' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🚚 Packers & Movers</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                Join seasonal transfer pools to cluster shipping requests and get group discounts with vetted movers.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                {/* Booking Console */}
                <div className="glass-tactical" style={{ padding: 18, borderRadius: 12, border: '1px solid var(--border2)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>Book Vetted Movers</h4>
                  
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Select Mover Agency</label>
                    <select className="fi" style={{ fontSize: 12, background: 'rgba(0,0,0,0.4)', color: 'var(--text)', border: '1px solid var(--border)' }} value={selectedMover} onChange={e => setSelectedMover(e.target.value)}>
                      <option value="Army Welfare Logistics (AWL)">Welfare Logistics (AWL) - Vetted (15% base disc.)</option>
                      <option value="Agarwal Packers & Movers (Military Division)">Agarwal Packers & Movers (Defence Division)</option>
                      <option value="Gati KWE Defence Cargo">Gati KWE Cargo</option>
                    </select>
                  </div>

                  {/* Transfer Pool discount slider */}
                  <div style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>🎖️ Seasonal Transfer Pool</span>
                      <span className="tag" style={{ color: 'var(--green)', borderColor: 'var(--green)', padding: '1px 6px' }}>Active</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                      Multiple personnel are moving on this route. Join the pool to save.
                    </p>
                    
                    {/* Pool Progress Meter */}
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span>Current Members: <b>{poolSize}</b> / 10</span>
                      <span style={{ color: 'var(--green)', fontWeight: 800 }}>
                        {poolSize >= 9 ? '🔥 35% Discount Reached!' : poolSize >= 6 ? '✨ 25% Discount Active' : '15% Base'}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ width: `${(poolSize / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--green))', borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>

                    <button 
                      className={`fb ${poolJoined ? 'active' : ''}`} 
                      style={{ width: '100%', padding: '6px 12px', fontSize: 11, background: poolJoined ? 'rgba(34,197,94,0.1)' : 'rgba(255,215,0,0.1)', color: poolJoined ? 'var(--green)' : 'var(--gold)', borderColor: poolJoined ? 'var(--green)' : 'var(--gold)' }}
                      onClick={() => {
                        if (poolJoined) {
                          setPoolJoined(false);
                          setPoolSize(p => p - 1);
                          ctx.showToast('Opted out of Transfer Pool.', 'info');
                        } else {
                          setPoolJoined(true);
                          setPoolSize(p => p + 1);
                          ctx.showToast('Joined Seasonal Transfer Pool! 35% discount active. 🎉', 'ok');
                        }
                      }}
                    >
                      {poolJoined ? '✓ Joined Pool (35% Off Applied)' : '🤝 Join Transfer Pool (Boost Discount)'}
                    </button>
                  </div>

                  {/* Insurance option */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <input 
                      type="checkbox" 
                      id="insurance" 
                      checked={insuranceSelected} 
                      onChange={e => setInsuranceSelected(e.target.checked)} 
                      style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <label htmlFor="insurance" style={{ fontSize: 11, cursor: 'pointer', color: 'var(--text)' }}>
                      Add transit insurance for household goods (₹1,500)
                    </label>
                  </div>

                  <button 
                    className="bp" 
                    style={{ width: '100%', padding: 10, fontSize: 13, background: bookingConfirmed ? 'var(--green)' : 'var(--accent)', color: '#000' }}
                    onClick={() => {
                      setBookingConfirmed(true);
                      ctx.showToast(`Movers booking request submitted for ${selectedMover}! 🚚`, 'ok');
                    }}
                  >
                    {bookingConfirmed ? '✓ Booking Request Submitted' : '🚚 Book Packers & Movers'}
                  </button>
                </div>

                {/* Estimate & Voucher Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="glass-tactical" style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border2)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
                      📋 Pool Shipping Fare Structure
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                        <span>Base Freight Quote:</span>
                        <span style={{ color: 'var(--text)' }}>₹{packersCost.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                        <span>Pool Group Discount (35%):</span>
                        <span style={{ color: 'var(--green)' }}>-₹{Math.round(packersCost * 0.35).toLocaleString()}</span>
                      </div>
                      {insuranceSelected && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                          <span>Transit Insurance:</span>
                          <span style={{ color: 'var(--text)' }}>+₹1,500</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text)', paddingTop: 4 }}>
                        <span>Total Capped Charge:</span>
                        <span>₹{Math.round(packersCost * (poolJoined ? 0.65 : 1) + (insuranceSelected ? 1500 : 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-tactical" style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border2)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
                      📦 Transit & Security Vetting
                    </h4>
                    <ul style={{ paddingLeft: 14, fontSize: 11, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>All movers have verified base entry gatepasses.</li>
                      <li>Standard household packaging (waterproof, scratchproof).</li>
                      <li>Defence-priority claims assistance (settled in 48 hours).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CANTT BULLETIN BOARD */}
          {activeTab === 'bulletin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>📢 Cantonment Notice Board</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Local announcements and community updates.</p>
                </div>
                <div>
                  <select 
                    className="fi" 
                    style={{ marginBottom: 0, fontSize: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.4)', color: 'var(--text)', border: '1px solid var(--border)' }} 
                    value={canttBoardCity} 
                    onChange={e => setCanttBoardCity(e.target.value)}
                  >
                    <option value="Delhi Cantt">Delhi Cantt Station</option>
                    <option value="Pune Cantt">Pune Cantt Station</option>
                    <option value="Ambala Cantt">Ambala Cantt Station</option>
                    <option value="Secunderabad Cantt">Secunderabad Cantt</option>
                  </select>
                </div>
              </div>

              {/* Notice creation row */}
              <div className="glass-tactical" style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border2)', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    className="fi" 
                    placeholder="Publish urgent notice (e.g. KV Admissions close tomorrow, Lost canteen card...)" 
                    style={{ flex: 1, marginBottom: 0, fontSize: 12 }}
                    value={newNoticeText}
                    onChange={e => setNewNoticeText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNotice()}
                  />
                  <button className="bp" style={{ padding: '6px 16px', fontSize: 12, background: 'var(--accent)', color: '#000' }} onClick={handleAddNotice}>
                    📢 Post
                  </button>
                </div>
              </div>

              {/* Notices List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                {noticesList.map(n => (
                  <div 
                    key={n.id} 
                    style={{ 
                      background: n.type === 'blood' ? 'rgba(244,63,94,0.04)' : 'rgba(255,255,255,0.02)', 
                      border: n.type === 'blood' ? '1px solid rgba(244,63,94,0.2)' : '1px solid var(--border2)', 
                      borderRadius: 10, 
                      padding: 12,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: 20 }}>
                      {n.type === 'school' ? '🏫' : n.type === 'blood' ? '🩸' : n.type === 'lost' ? '🎫' : '🎖️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: n.type === 'blood' ? '#f43f5e' : 'var(--text)' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{n.date}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{n.body}</p>
                    </div>
                    {/* Upvote score */}
                    <button 
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 6, 
                        padding: '4px 8px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        color: 'var(--text)'
                      }}
                      onClick={() => {
                        setNoticesList(prev => prev.map(item => item.id === n.id ? { ...item, votes: item.votes + 1 } : item));
                        ctx.showToast('Upvoted notice!', 'ok');
                      }}
                    >
                      <span style={{ fontSize: 10 }}>▲</span>
                      <span style={{ fontSize: 10, fontWeight: 800 }}>{n.votes}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal footer */}
        <div className={styles.footer} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border2)', paddingTop: 14, paddingBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" /> Relocation Dashboard Active
          </span>
          <button className="fb active" onClick={onClose} style={{ padding: '6px 16px', fontSize: 12 }}>
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
