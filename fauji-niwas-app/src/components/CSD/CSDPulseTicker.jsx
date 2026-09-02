import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingCart, ChevronDown } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { auth } from '../../firebase';

const CSD_STATIONS = [
  'Pune (Southern Command)',
  'Delhi (Base Hospital URC)',
  'Ambala Cantt',
  'Secunderabad Cantt',
  'Lucknow (Central Command)',
  'Jalandhar Cantt',
  'Bareilly Cantt',
  'Jaipur (SW Command)',
  'Meerut Cantt',
  'Bhopal (MP)',
];

const DEFAULT_PULSE_DATA = [
  { cantonment: 'Pune (Southern Command)', waitTime: '45 mins', liquorQuota: 'High', groceries: 'Stocked', votes: 12, downvotes: 2, stockYes: 15, stockNo: 3, time: 'Just now' },
  { cantonment: 'Delhi (Base Hospital URC)', waitTime: '15 mins', liquorQuota: 'Low', groceries: 'Stocked', votes: 8, downvotes: 1, stockYes: 10, stockNo: 1, time: '2m ago' },
  { cantonment: 'Ambala Cantt', waitTime: '1.5 hrs', liquorQuota: 'Depleted', groceries: 'Low', votes: 5, downvotes: 4, stockYes: 2, stockNo: 8, time: '5m ago' },
  { cantonment: 'Secunderabad Cantt', waitTime: '30 mins', liquorQuota: 'High', groceries: 'Restocking', votes: 9, downvotes: 2, stockYes: 12, stockNo: 4, time: '12m ago' },
];

export default function CSDPulseTicker() {
  const [pulseData, setPulseData] = useState(DEFAULT_PULSE_DATA);
  const [selectedCSD, setSelectedCSD] = useState(CSD_STATIONS[0]);
  const [csdOpen, setCsdOpen] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [voted, setVoted] = useState({});

  const user = auth.currentUser;

  // Real-time Firestore sync & Auto-seed
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(collection(db, 'csd_pulse'), async (snapshot) => {
        if (snapshot.empty) {
          for (const item of DEFAULT_PULSE_DATA) {
            try { await addDoc(collection(db, 'csd_pulse'), item); } catch (_) {}
          }
        } else {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setPulseData(data);
        }
      }, () => setPulseData(DEFAULT_PULSE_DATA));
    } catch (_) { setPulseData(DEFAULT_PULSE_DATA); }
    return () => unsubscribe();
  }, []);

  // Get pulse entry for selected CSD (fuzzy match by cantonment name)
  const pulse = pulseData.find(p =>
    p.cantonment?.toLowerCase().includes(selectedCSD.split(' ')[0].toLowerCase())
  ) || pulseData[0];

  const requireAuth = (action) => {
    if (!user && !localStorage.getItem('fn_mock_user')) {
      alert('Sign in to vote and contribute to URC Pulse.');
      return false;
    }
    return true;
  };

  const handleVoteSpeed = async (itemId, type, currentVal) => {
    if (!requireAuth()) return;
    const key = `${itemId}_speed`;
    if (voted[key]) return;
    try {
      const itemRef = doc(db, 'csd_pulse', itemId);
      await updateDoc(itemRef, {
        [type === 'up' ? 'votes' : 'downvotes']: (currentVal || 0) + 1,
        time: type === 'up' ? 'Upvoted just now' : 'Downvoted just now',
      });
      setVoted(v => ({ ...v, [key]: type }));
    } catch (_) {}
  };

  const handleVoteStock = async (itemId, type, currentVal) => {
    if (!requireAuth()) return;
    const key = `${itemId}_stock`;
    if (voted[key]) return;
    try {
      const itemRef = doc(db, 'csd_pulse', itemId);
      await updateDoc(itemRef, {
        [type === 'yes' ? 'stockYes' : 'stockNo']: (currentVal || 0) + 1,
        time: 'Stock updated just now',
      });
      setVoted(v => ({ ...v, [key]: type }));
    } catch (_) {}
  };

  const handleReportWait = async (itemId, waitLevel) => {
    if (!requireAuth()) return;
    try {
      const itemRef = doc(db, 'csd_pulse', itemId);
      const waitTimeStr = waitLevel === 'low' ? '15 mins' : waitLevel === 'med' ? '30 mins' : '1.5 hrs';
      await updateDoc(itemRef, { waitTime: waitTimeStr, time: 'Reported just now' });
      setReportingId(null);
    } catch (_) {}
  };

  if (pulseData.length === 0) {
    return (
      <div className="liquid-glass rounded-[2rem] p-8 flex flex-col justify-center items-center h-44 animate-pulse" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <span className="font-mono tracking-wider" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Syncing Live URC Ledger...</span>
      </div>
    );
  }

  const isAuthenticated = !!(user || localStorage.getItem('fn_mock_user'));
  const speedVoted = voted[`${pulse.id}_speed`];
  const stockVoted = voted[`${pulse.id}_stock`];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="liquid-glass rounded-[2rem] p-8 flex flex-col relative overflow-hidden select-none text-left"
      style={{ border: '1px solid var(--border2)' }}
    >
      {/* Header + CSD Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2" style={{ color: 'var(--gold)' }}>
          <ShoppingCart size={20} />
          <span className="font-heading font-black uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>Live URC Pulse</span>
        </div>
        <span className="flex items-center gap-1.5 font-semibold" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--red)' }}></span>
          Live
        </span>
      </div>

      {/* CSD Station Picker */}
      <div className="relative mb-4">
        <button
          onClick={() => setCsdOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text)' }}
        >
          <span>📍 {selectedCSD}</span>
          <ChevronDown size={13} className={`transition-transform ${csdOpen ? 'rotate-180' : ''}`} />
        </button>
        {csdOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto liquid-glass" style={{ border: '1px solid var(--border2)' }}>
            {CSD_STATIONS.map(s => (
              <button
                key={s}
                onClick={() => { setSelectedCSD(s); setCsdOpen(false); }}
                className="w-full text-left px-4 py-2 transition-colors cursor-pointer"
                style={{
                  fontSize: '0.75rem',
                  color: s === selectedCSD ? 'var(--gold)' : 'var(--text)',
                  fontWeight: s === selectedCSD ? 700 : 400,
                  background: s === selectedCSD ? 'rgba(212,175,55,0.08)' : 'transparent',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pulse Data Display */}
      <div className="h-24 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pulse.id || selectedCSD}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="absolute inset-0 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <h4 className="font-heading font-bold leading-tight" style={{ fontSize: '1rem', color: 'var(--text)' }}>{pulse.cantonment}</h4>
              <span className="font-medium font-mono shrink-0 ml-2" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{pulse.time}</span>
            </div>
            <div className="flex gap-4 mt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={15} style={{ color: 'var(--gold)' }} />
                <span className="font-medium" style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Wait: <strong>{pulse.waitTime}</strong></span>
              </div>
              <div className="h-5 w-px" style={{ background: 'var(--border)' }}></div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>In Stock:</span>
                <span className="font-bold" style={{
                  fontSize: '0.75rem',
                  color: (pulse.stockYes || 0) >= (pulse.stockNo || 0) ? 'var(--green)' : 'var(--red)',
                }}>
                  {(pulse.stockYes || 0) >= (pulse.stockNo || 0) ? 'Yes' : 'No'}
                </span>
                <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--muted)' }}>({pulse.stockYes || 0} vs {pulse.stockNo || 0})</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Voting Actions */}
      <div className="mt-2 pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)' }}>
        {!isAuthenticated ? (
          <p className="text-center py-1" style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>
            🔒 <button onClick={() => alert('Please sign in via the Sign In button in the top bar.')} className="font-bold underline cursor-pointer" style={{ color: 'var(--gold)' }}>Sign in</button> to vote &amp; report
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Speed vote */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleVoteSpeed(pulse.id, 'up', pulse.votes)}
                  disabled={!!speedVoted}
                  className="flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer transition-all"
                  style={{
                    fontSize: '0.625rem',
                    color: speedVoted === 'up' ? 'var(--green)' : 'var(--green)',
                    opacity: speedVoted ? 0.6 : 1,
                  }}
                >
                  ▲ Fast ({pulse.votes || 0})
                </button>
                <button
                  onClick={() => handleVoteSpeed(pulse.id, 'down', pulse.downvotes)}
                  disabled={!!speedVoted}
                  className="flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer transition-all"
                  style={{
                    fontSize: '0.625rem',
                    color: speedVoted === 'down' ? 'var(--red)' : 'var(--red)',
                    opacity: speedVoted ? 0.6 : 1,
                  }}
                >
                  ▼ Slow ({pulse.downvotes || 0})
                </button>
              </div>

              {/* Stock vote */}
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase" style={{ fontSize: '0.625rem', color: 'var(--muted)' }}>Stock?</span>
                <button
                  onClick={() => handleVoteStock(pulse.id, 'yes', pulse.stockYes)}
                  disabled={!!stockVoted}
                  className="px-2 py-0.5 rounded border font-bold cursor-pointer transition-all"
                  style={{
                    fontSize: '0.5625rem',
                    background: stockVoted === 'yes' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.05)',
                    color: 'var(--green)',
                    borderColor: stockVoted === 'yes' ? 'var(--green)' : 'rgba(34,197,94,0.3)',
                  }}
                >
                  👍 Yes ({pulse.stockYes || 0})
                </button>
                <button
                  onClick={() => handleVoteStock(pulse.id, 'no', pulse.stockNo)}
                  disabled={!!stockVoted}
                  className="px-2 py-0.5 rounded border font-bold cursor-pointer transition-all"
                  style={{
                    fontSize: '0.5625rem',
                    background: stockVoted === 'no' ? 'rgba(244,63,94,0.2)' : 'rgba(244,63,94,0.05)',
                    color: 'var(--red)',
                    borderColor: stockVoted === 'no' ? 'var(--red)' : 'rgba(244,63,94,0.3)',
                  }}
                >
                  👎 No ({pulse.stockNo || 0})
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 font-mono" style={{ fontSize: '0.5625rem', color: 'var(--muted)' }}>
              <button
                onClick={() => setReportingId(reportingId === pulse.id ? null : pulse.id)}
                className="transition-all font-bold uppercase cursor-pointer"
                style={{ color: 'var(--muted)' }}
              >
                ✍️ Report Wait Time
              </button>
              <span>⚠️ Crowdsourced · verified families only</span>
            </div>
          </>
        )}
      </div>

      {/* Floating Status Reporter */}
      {reportingId === pulse.id && (
        <div className="absolute bottom-16 left-8 rounded-xl p-3 shadow-lg flex gap-2 z-30 liquid-glass" style={{ border: '1px solid var(--border2)' }}>
          <button onClick={() => handleReportWait(pulse.id, 'low')} className="px-2.5 py-1 rounded-md font-bold cursor-pointer" style={{ fontSize: '0.5625rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--green)' }}>🟢 15m</button>
          <button onClick={() => handleReportWait(pulse.id, 'med')} className="px-2.5 py-1 rounded-md font-bold cursor-pointer" style={{ fontSize: '0.5625rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--gold)' }}>🟡 30m</button>
          <button onClick={() => handleReportWait(pulse.id, 'high')} className="px-2.5 py-1 rounded-md font-bold cursor-pointer" style={{ fontSize: '0.5625rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--red)' }}>🔴 1.5h</button>
        </div>
      )}
    </motion.div>
  );
}
