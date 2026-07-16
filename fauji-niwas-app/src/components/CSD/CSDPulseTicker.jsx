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
      // Emit a sign-in prompt via DOM event or console
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
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-center items-center h-44 shadow-sm animate-pulse">
        <span className="text-xs text-slate-400 font-mono tracking-wider">Syncing Live URC Ledger...</span>
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
      className="bg-white border border-slate-200/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden shadow-md select-none text-left"
    >
      {/* Header + CSD Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-700">
          <ShoppingCart size={20} />
          <span className="font-heading font-black uppercase tracking-wider text-xs">Live URC Pulse</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Live
        </span>
      </div>

      {/* CSD Station Picker */}
      <div className="relative mb-4">
        <button
          onClick={() => setCsdOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <span>📍 {selectedCSD}</span>
          <ChevronDown size={13} className={`transition-transform ${csdOpen ? 'rotate-180' : ''}`} />
        </button>
        {csdOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {CSD_STATIONS.map(s => (
              <button
                key={s}
                onClick={() => { setSelectedCSD(s); setCsdOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                  s === selectedCSD ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
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
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-slate-900 font-heading font-bold text-base leading-tight">{pulse.cantonment}</h4>
              <span className="text-xs text-slate-400 font-medium font-mono shrink-0 ml-2">{pulse.time}</span>
            </div>
            <div className="flex gap-4 text-sm mt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock size={15} className="text-amber-700" />
                <span className="text-slate-800 font-medium text-xs">Wait: <strong>{pulse.waitTime}</strong></span>
              </div>
              <div className="h-5 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="font-medium text-xs">In Stock:</span>
                <span className={`font-bold text-xs ${(pulse.stockYes || 0) >= (pulse.stockNo || 0) ? 'text-green-600' : 'text-red-600'}`}>
                  {(pulse.stockYes || 0) >= (pulse.stockNo || 0) ? 'Yes' : 'No'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({pulse.stockYes || 0} vs {pulse.stockNo || 0})</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Voting Actions */}
      <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3 text-xs">
        {!isAuthenticated ? (
          <p className="text-center text-[11px] text-slate-500 py-1">
            🔒 <button onClick={() => alert('Please sign in via the Sign In button in the top bar.')} className="text-amber-700 font-bold underline cursor-pointer">Sign in</button> to vote &amp; report
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Speed vote */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleVoteSpeed(pulse.id, 'up', pulse.votes)}
                  disabled={!!speedVoted}
                  className={`flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                    speedVoted === 'up' ? 'text-emerald-900' : 'text-emerald-700 hover:text-emerald-900 hover:scale-[1.03]'
                  } ${speedVoted ? 'opacity-60' : ''}`}
                >
                  ▲ Fast ({pulse.votes || 0})
                </button>
                <button
                  onClick={() => handleVoteSpeed(pulse.id, 'down', pulse.downvotes)}
                  disabled={!!speedVoted}
                  className={`flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                    speedVoted === 'down' ? 'text-red-900' : 'text-red-700 hover:text-red-900 hover:scale-[1.03]'
                  } ${speedVoted ? 'opacity-60' : ''}`}
                >
                  ▼ Slow ({pulse.downvotes || 0})
                </button>
              </div>

              {/* Stock vote */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-[10px] uppercase">Stock?</span>
                <button
                  onClick={() => handleVoteStock(pulse.id, 'yes', pulse.stockYes)}
                  disabled={!!stockVoted}
                  className={`px-2 py-0.5 rounded border font-bold text-[9px] cursor-pointer transition-all ${
                    stockVoted === 'yes' ? 'bg-emerald-200 text-emerald-900 border-emerald-400' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                  }`}
                >
                  👍 Yes ({pulse.stockYes || 0})
                </button>
                <button
                  onClick={() => handleVoteStock(pulse.id, 'no', pulse.stockNo)}
                  disabled={!!stockVoted}
                  className={`px-2 py-0.5 rounded border font-bold text-[9px] cursor-pointer transition-all ${
                    stockVoted === 'no' ? 'bg-red-200 text-red-900 border-red-400' : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-300'
                  }`}
                >
                  👎 No ({pulse.stockNo || 0})
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-[9px] font-mono text-slate-400">
              <button
                onClick={() => setReportingId(reportingId === pulse.id ? null : pulse.id)}
                className="hover:text-slate-900 transition-all font-bold uppercase cursor-pointer"
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
        <div className="absolute bottom-16 left-8 bg-white border border-slate-200/80 rounded-xl p-3 shadow-lg flex gap-2 z-30">
          <button onClick={() => handleReportWait(pulse.id, 'low')} className="px-2.5 py-1 text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-md font-bold cursor-pointer">🟢 15m</button>
          <button onClick={() => handleReportWait(pulse.id, 'med')} className="px-2.5 py-1 text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-700 rounded-md font-bold cursor-pointer">🟡 30m</button>
          <button onClick={() => handleReportWait(pulse.id, 'high')} className="px-2.5 py-1 text-[9px] bg-red-500/10 border border-red-500/30 text-red-700 rounded-md font-bold cursor-pointer">🔴 1.5h</button>
        </div>
      )}
    </motion.div>
  );
}
