import { useMemo } from 'react';
import { useFilterStore } from '../../store/filterStore';
import styles from './Sidebar.module.css';

export default function StationPulse({ items }) {
  const count = items.length;
  const activeView = useFilterStore(s => s.activeView);
  const smartSearchQ = useFilterStore(s => s.smartSearchQ);

  const stats = useMemo(() => {
    if (!count) return null;
    const verified = items.filter(i => i.verified).length;
    const recent = items.filter(i => (i.createdAt || 0) > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
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
    <div className="glass-tactical" style={{
      margin: '12px 16px',
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid rgba(255,153,51,0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="bg-mesh" style={{position:'absolute', inset:0, opacity:0.3, zIndex:0}} />
      
      <div style={{position:'relative', zIndex:1}}>
        <div style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>
          <span className="live-dot" style={{width:6, height:6}} />
          Station Intelligence Pulse
        </div>
        
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <div className="hover-scan" style={{background:'rgba(255,255,255,0.03)', padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Market Demand</div>
            <div style={{fontSize:13, fontWeight:800, color: stats.demand.includes('High') ? '#f43f5e' : 'var(--text)'}}>{stats.demand}</div>
          </div>
          <div className="hover-scan" style={{background:'rgba(255,255,255,0.03)', padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Signal Grade</div>
            <div style={{fontSize:13, fontWeight:800}}>{stats.verifiedPct}% Verified</div>
          </div>
          <div className="hover-scan" style={{background:'rgba(255,255,255,0.03)', padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Direct Handover</div>
            <div style={{fontSize:13, fontWeight:800, color:'var(--gold)'}}>{stats.directPct}% Fauji</div>
          </div>
          <div className="hover-scan" style={{background:'rgba(255,255,255,0.03)', padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:10, color:'var(--muted)'}}>Fresh Signals</div>
            <div style={{fontSize:13, fontWeight:800, color:'#22c55e'}}>{stats.recent} New Items</div>
          </div>
        </div>
        
        {smartSearchQ && (
          <div style={{marginTop:10, fontSize:10, color:'var(--muted)', background:'rgba(0,0,0,0.2)', padding:'4px 8px', borderRadius:4, borderLeft:'2px solid var(--accent)'}}>
            ⚡ Searching target: "{smartSearchQ}"
          </div>
        )}
      </div>
    </div>
  );
}
