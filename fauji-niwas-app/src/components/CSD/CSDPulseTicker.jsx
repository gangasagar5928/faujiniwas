import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingCart, ArrowUp, Check } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, getDocs } from 'firebase/firestore';

const DEFAULT_PULSE_DATA = [
  { cantonment: 'Pune (Southern Command)', waitTime: '45 mins', liquorQuota: 'High', groceries: 'Stocked', votes: 12, time: 'Just now' },
  { cantonment: 'Delhi (Base Hospital URC)', waitTime: '15 mins', liquorQuota: 'Low', groceries: 'Stocked', votes: 8, time: '2m ago' },
  { cantonment: 'Ambala Cantt', waitTime: '1.5 hrs', liquorQuota: 'Depleted', groceries: 'Low', votes: 5, time: '5m ago' },
  { cantonment: 'Secunderabad Cantt', waitTime: '30 mins', liquorQuota: 'High', groceries: 'Restocking', votes: 9, time: '12m ago' }
];

export default function CSDPulseTicker() {
  const [pulseData, setPulseData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reportingId, setReportingId] = useState(null);

  // Real-time Firestore sync & Auto-seed
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'csd_pulse'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed default items if collection is empty
        for (const item of DEFAULT_PULSE_DATA) {
          try {
            await addDoc(collection(db, 'csd_pulse'), item);
          } catch (e) {
            console.error('Failed to seed csd_pulse:', e);
          }
        }
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPulseData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Slide rotation timer
  useEffect(() => {
    if (pulseData.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pulseData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [pulseData]);

  if (pulseData.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-center items-center h-44 shadow-sm animate-pulse">
        <span className="text-xs text-slate-400 font-mono tracking-wider">Syncing Live URC Ledger...</span>
      </div>
    );
  }

  const pulse = pulseData[currentIndex] || pulseData[0];

  const handleVote = async (itemId, currentVotes) => {
    try {
      const itemRef = doc(db, 'csd_pulse', itemId);
      await updateDoc(itemRef, {
        votes: (currentVotes || 0) + 1,
        time: 'Upvoted just now'
      });
    } catch (e) {
      console.warn('[CSDPulse] Failed to upvote:', e);
    }
  };

  const handleReportWait = async (itemId, waitLevel) => {
    try {
      const itemRef = doc(db, 'csd_pulse', itemId);
      const waitTimeStr = waitLevel === 'low' ? '15 mins' : waitLevel === 'med' ? '30 mins' : '1.5 hrs';
      await updateDoc(itemRef, {
        waitTime: waitTimeStr,
        time: 'Reported just now'
      });
      setReportingId(null);
    } catch (e) {
      console.warn('[CSDPulse] Failed to report wait:', e);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border border-slate-200/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden shadow-md select-none text-left"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-700">
          <ShoppingCart size={20} />
          <span className="font-heading font-black uppercase tracking-wider text-xs">Live URC Pulse</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Live Ticker
        </span>
      </div>

      <div className="h-24 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pulse.id}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-slate-900 font-heading font-bold text-lg">{pulse.cantonment}</h4>
              <span className="text-xs text-slate-400 font-medium font-mono">{pulse.time}</span>
            </div>
            
            <div className="flex gap-4 text-sm mt-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock size={15} className="text-amber-700" />
                <span className="text-slate-800 font-medium">Wait Time: <strong className="font-bold">{pulse.waitTime}</strong></span>
              </div>
              <div className="h-5 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="font-medium">Liquor:</span>
                <span className={pulse.liquorQuota === 'High' ? 'text-green-600 font-bold' : pulse.liquorQuota === 'Low' ? 'text-amber-600 font-bold' : 'text-red-600 font-bold'}>
                  {pulse.liquorQuota}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="flex gap-3">
          <button 
            onClick={() => handleVote(pulse.id, pulse.votes)}
            className="text-amber-700 hover:text-amber-900 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
          >
            ▲ Upvote Line Speed ({pulse.votes || 0})
          </button>
          
          <button 
            onClick={() => setReportingId(reportingId === pulse.id ? null : pulse.id)}
            className="text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
          >
            ✍️ Report Wait
          </button>
        </div>

        <span className="text-slate-400 flex items-center gap-1 font-medium text-[9px] font-mono">
          ⚠️ Crowdsourced by military families
        </span>
      </div>

      {/* Floating Status Reporter Menu */}
      {reportingId === pulse.id && (
        <div className="absolute bottom-16 left-8 bg-white border border-slate-200/80 rounded-xl p-3 shadow-lg flex gap-2 z-30 animate-cardFloat">
          <button 
            onClick={() => handleReportWait(pulse.id, 'low')}
            className="px-2.5 py-1 text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-md font-bold cursor-pointer"
          >
            🟢 15m (Low)
          </button>
          <button 
            onClick={() => handleReportWait(pulse.id, 'med')}
            className="px-2.5 py-1 text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-700 rounded-md font-bold cursor-pointer"
          >
            🟡 30m (Med)
          </button>
          <button 
            onClick={() => handleReportWait(pulse.id, 'high')}
            className="px-2.5 py-1 text-[9px] bg-red-500/10 border border-red-500/30 text-red-700 rounded-md font-bold cursor-pointer"
          >
            🔴 1.5h (High)
          </button>
        </div>
      )}

    </motion.div>
  );
}
