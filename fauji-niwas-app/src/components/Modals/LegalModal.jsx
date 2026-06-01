import React from 'react';
import styles from './LegalModal.module.css';

export default function LegalModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc" style={{ maxWidth: 650, width: '95%' }}>
        <div className={styles.header}>
          <h2 className="mh2">⚖️ Legal & Privacy</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <section className={styles.section}>
            <h3>1. Privacy Policy</h3>
            <p>Your privacy is our priority. Fauji Niwas collects minimal data (phone number, rank, and station) solely to provide housing matches within the defence community.</p>
            <ul>
              <li><strong>Data Storage:</strong> All data is stored securely in Google Firebase.</li>
              <li><strong>Phon Numbers:</strong> Your number is only shown to verified users or upon your explicit contact.</li>
              <li><strong>Deletion:</strong> You can permanently delete your account and all associated data via the 'Danger Zone' in your profile.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>2. Terms of Use</h3>
            <p>By using Fauji Niwas, you agree to the following terms:</p>
            <ul>
              <li><strong>Eligibility:</strong> Only serving/retired defence personnel and their families are permitted to post listings.</li>
              <li><strong>Verified Badge:</strong> The "Verified Fauji" badge is granted after manual review of a military ID. Misuse will lead to permanent bans.</li>
              <li><strong>No Liability:</strong> Fauji Niwas is a matching platform. We do not verify property ownership or hold responsibility for transactions.</li>
              <li><strong>Broker Policy:</strong> Brokers must identify themselves clearly. Creating fake civilian accounts is prohibited.</li>
            </ul>
          </section>

          <p style={{fontSize:11, color:'var(--muted)', textAlign:'center', marginTop:20}}>
            Last Updated: April 2026 · Fauji Niwas Digital Core
          </p>
        </div>
      </div>
    </div>
  );
}
