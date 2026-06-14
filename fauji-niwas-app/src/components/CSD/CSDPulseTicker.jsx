import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingCart } from 'lucide-react';

const MOCK_PULSE_DATA = [
  { id: 1, cantonment: 'Pune (Southern Command)', waitTime: '45 mins', liquorQuota: 'High', groceries: 'Stocked', time: 'Just now' },
  { id: 2, cantonment: 'Delhi (Base Hospital URC)', waitTime: '15 mins', liquorQuota: 'Low', groceries: 'Stocked', time: '2m ago' },
  { id: 3, cantonment: 'Ambala Cantt', waitTime: '1.5 hrs', liquorQuota: 'Depleted', groceries: 'Low', time: '5m ago' },
  { id: 4, cantonment: 'Secunderabad Cantt', waitTime: '30 mins', liquorQuota: 'High', groceries: 'Restocking', time: '12m ago' }
];

export default function CSDPulseTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_PULSE_DATA.length);
    }, 4000); // Rotate every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const pulse = MOCK_PULSE_DATA[currentIndex];

  return (
    <motion.div 
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-[#111111]/10 rounded-[2rem] p-8 flex flex-col relative overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#c9a84c]">
          <ShoppingCart size={20} />
          <span className="font-heading font-black uppercase tracking-wider text-xs">Live URC Pulse</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#777777] font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Ticker
        </span>
      </div>

      <div className="h-24 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pulse.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-[#111111] font-heading font-bold text-lg">{pulse.cantonment}</h4>
              <span className="text-xs text-[#777777]">{pulse.time}</span>
            </div>
            
            <div className="flex gap-4 text-sm mt-1">
              <div className="flex items-center gap-1.5 text-[#555555]">
                <Clock size={16} className="text-[#c9a84c]" />
                <span className="text-[#111111] font-medium">Wait: <strong className="font-bold">{pulse.waitTime}</strong></span>
              </div>
              <div className="h-5 w-px bg-[#111111]/10"></div>
              <div className="flex items-center gap-1.5 text-[#555555]">
                <span className="font-medium">Liquor:</span>
                <span className={pulse.liquorQuota === 'High' ? 'text-green-600 font-semibold' : pulse.liquorQuota === 'Low' ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {pulse.liquorQuota}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 pt-4 border-t border-[#111111]/10 flex justify-between items-center text-xs">
        <button 
          onClick={() => alert("Line speed report submitted to URC Ledger.")}
          className="text-[#c9a84c] hover:text-[#111111] transition-all flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]"
        >
          ▲ Upvote Line Speed
        </button>
        <span className="text-[#777777] flex items-center gap-1 font-medium">
          ⚠️ Crowdsourced
        </span>
      </div>
    </motion.div>
  );
}
