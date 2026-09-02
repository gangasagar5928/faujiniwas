import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFilterStore } from '../../store/filterStore';
import styles from './Sidebar.module.css';

export default function StationPulse({ items }) {
  const count = items.length;
  const activeView = useFilterStore(s => s.activeView);
  const smartSearchQ = useFilterStore(s => s.smartSearchQ);

  const stats = useMemo(() => {
    if (!count) return null;
    const now = Date.now();
    const verified = items.filter(i => i.verified).length;
    const recent = items.filter(i => (i.createdAt || 0) > now - 7 * 24 * 60 * 60 * 1000).length;
    const direct = items.filter(i => i.ownerType === 'defence').length;

    // Virtual "Demand" signal
    let demand = 'Moderate';
    if (count < 10) demand = 'Low';
    if (count > 50 || recent > 5) demand = 'Critical High';

    return {
      verifiedPct: Math.round((verified/count)*100),
      recent,
      directPct: Math.round((direct/count)*100),
      demand
    };
  }, [items, count]);

  if (!count || activeView === 'saved') return null;

  return (
    <motion.div
      className="liquid-glass-deep"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        margin: '12px 16px',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,153,51,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{position:'relative', zIndex:1}}>
        <div style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>
          <span className="live-dot" style={{width:6, height:6}} />
          Station Intelligence Pulse
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <motion.div whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className="liquid-glass-chip" style={{padding:8, borderRadius:8}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Market Demand</div>
            <div style={{fontSize:13, fontWeight:800, color: stats.demand.includes('High') ? 'var(--red)' : 'var(--text)'}}>{stats.demand}</div>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className="liquid-glass-chip" style={{padding:8, borderRadius:8}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Signal Grade</div>
            <div style={{fontSize:13, fontWeight:800}}>{stats.verifiedPct}% Verified</div>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className="liquid-glass-chip" style={{padding:8, borderRadius:8}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Direct Handover</div>
            <div style={{fontSize:13, fontWeight:800, color:'var(--gold)'}}>{stats.directPct}% Fauji</div>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className="liquid-glass-chip" style={{padding:8, borderRadius:8}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Fresh Signals</div>
            <div style={{fontSize:13, fontWeight:800, color:'var(--green)'}}>{stats.recent} New Items</div>
          </motion.div>
        </div>

        {smartSearchQ && (
          <div style={{marginTop:10, fontSize:10, color:'var(--muted)', padding:'4px 8px', borderRadius:4, borderLeft:'2px solid var(--accent)'}}>
            ⚡ Searching target: "{smartSearchQ}"
          </div>
        )}
      </div>
    </motion.div>
  );
}
