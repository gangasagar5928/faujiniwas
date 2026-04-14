import { useContext } from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useUserStore } from '../../store/userStore';
import { ModalContext } from '../../App';
import styles from './ProfileModal.module.css'; // Use shared base styles

export default function CompareModal({ onClose }) {
  const listings = useFilterStore(s => s.listings);
  const comparisonIds = useUserStore(s => s.comparison) || [];
  const ctx = useContext(ModalContext);

  const selectedListings = comparisonIds.map(id => listings.find(l => l.id === id)).filter(Boolean);

  if (selectedListings.length < 2) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="mc" style={{maxWidth: 400, textAlign:'center'}}>
          <div className={styles.header}>
            <h2 className="mh2">🔁 Comparison</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div className={styles.body}>
            <p style={{marginBottom: 20}}>Please select two properties to compare.</p>
            <button className="bp" onClick={onClose}>Continue Browsing</button>
          </div>
        </div>
      </div>
    );
  }

  const [l1, l2] = selectedListings;

  const Row = ({ label, v1, v2, better = null }) => (
    <div style={{display:'flex', borderBottom:'1px solid var(--border2)', padding:'10px 0'}}>
      <div style={{flex: 1, textAlign:'center', fontSize:13, fontWeight: better === 1 ? 700 : 400, color: better === 1 ? 'var(--accent)' : 'inherit'}}>{v1}</div>
      <div style={{width: 80, textAlign:'center', fontSize:11, color:'var(--muted)', fontWeight:600}}>{label}</div>
      <div style={{flex: 1, textAlign:'center', fontSize:13, fontWeight: better === 2 ? 700 : 400, color: better === 2 ? 'var(--accent)' : 'inherit'}}>{v2}</div>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{maxWidth: 600, width:'95%'}}>
        <div className={styles.header}>
          <h2 className="mh2">🔁 Compare Properties</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body} style={{maxHeight: '70vh', overflowY:'auto'}}>
          
          <div style={{display:'flex', gap:10, marginBottom:20}}>
            {[l1, l2].map(l => (
              <div key={l.id} style={{flex:1}}>
                <img src={l.mediaUrls?.[0]} style={{width:'100%', height:80, objectFit:'cover', borderRadius:8}} alt="" />
                <div style={{fontSize:13, fontWeight:700, marginTop:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.name}</div>
              </div>
            ))}
          </div>

          <Row label="PRICE" 
            v1={`₹${l1.price.toLocaleString()}`} 
            v2={`₹${l2.price.toLocaleString()}`} 
            better={l1.price < l2.price ? 1 : l2.price < l1.price ? 2 : null} 
          />
          <Row label="BHK" v1={l1.bhk || '1'} v2={l2.bhk || '1'} />
          <Row label="AREA" v1={l1.sqft || '—'} v2={l2.sqft || '—'} better={parseInt(l1.sqft) > parseInt(l2.sqft) ? 1 : 2} />
          <Row label="FURNISH" v1={l1.furnishing || '—'} v2={l2.furnishing || '—'} />
          <Row label="DIST" v1={l1.distance+' km'} v2={l2.distance+' km'} better={parseFloat(l1.distance) < parseFloat(l2.distance) ? 1 : 2} />
          <Row label="PETS" v1={l1.petFriendly ? '✅' : '❌'} v2={l2.petFriendly ? '✅' : '❌'} />
          <Row label="OWNER" v1={l1.ownerType} v2={l2.ownerType} />

          <div style={{display:'flex', gap:10, marginTop:24}}>
            <button className="bp" style={{flex:1}} onClick={() => { onClose(); ctx.openDetail(l1.id); }}>View Left</button>
            <button className="bp" style={{flex:1}} onClick={() => { onClose(); ctx.openDetail(l2.id); }}>View Right</button>
          </div>

        </div>
      </div>
    </div>
  );
}
