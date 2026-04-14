import { useFilterStore } from '../../store/filterStore';
import styles from './FilterBar.module.css';

export default function FilterBar() {
  const {
    activeView, typeFilter, sortPref, maxPrice,
    furnishFilter, availFilter, sqftFilter, ownerFilter, termFilter, bhkFilter, petFilter,
    setTypeFilter, setSortPref, setMaxPrice,
    setFurnishFilter, setAvailFilter, setSqftFilter, setOwnerFilter, setTermFilter, setBhkFilter, setPetFilter,
    resetAdvancedFilters,
  } = useFilterStore();

  const isMarket = activeView === 'market';
  const isDorm   = activeView === 'dorms';
  const isSaved  = activeView === 'saved';

  const PillGroup = ({ options, value, onChange }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {options.map((o) => (
        <button
          key={o.v}
          className={`fb ${value === o.v ? 'active' : ''}`}
          onClick={() => onChange(o.v)}
          style={{ padding: '6px 10px', fontSize: '11px', flexGrow: 1 }}
        >
          {o.l}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.wrap}>
      {/* Quick filter row */}
      <div className={styles.row}>
        {!isMarket && !isDorm && !isSaved && (
          <>
            {['all','Flat','Room','Villa','PG'].map(t => (
              <button key={t} className={`fb ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)}>
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </>
        )}
        <select className="fb" value={sortPref} onChange={e => setSortPref(e.target.value)}>
          <option value="new">🕒 Newest</option>
          <option value="priceAsc">₹ Low→High</option>
          <option value="priceDesc">₹ High→Low</option>
        </select>
      </div>

      {/* Advanced filters (open by default for visibility) */}
      {!isDorm && !isSaved && (
        <details className={styles.adv}>
          <summary className={styles.advToggle}>✨ Advanced Filters & Amenities</summary>
          <div className={styles.advGrid}>
            {!isMarket && (
              <>
                <div>
                  <div className={styles.advLabel}>Furnishing</div>
                  <PillGroup
                    value={furnishFilter}
                    onChange={setFurnishFilter}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: 'Fully', l: 'Fully' },
                      { v: 'Semi', l: 'Semi' },
                      { v: 'Unfurnished', l: 'Unfurnished' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>Availability</div>
                  <PillGroup
                    value={availFilter}
                    onChange={setAvailFilter}
                    options={[
                      { v: 'all', l: 'Any time' },
                      { v: 'now', l: 'Now' },
                      { v: '3mo', l: 'Within 3 mo' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>Area (sq.ft)</div>
                  <PillGroup
                    value={sqftFilter}
                    onChange={setSqftFilter}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: 'lt500', l: '<500' },
                      { v: '500to1000', l: '500–1k' },
                      { v: 'gt1000', l: '>1000' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>Owner Type</div>
                  <PillGroup
                    value={ownerFilter}
                    onChange={setOwnerFilter}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: 'defence', l: '🎖️ Defence' },
                      { v: 'nobroker', l: '👤 No broker' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>Term</div>
                  <PillGroup
                    value={termFilter}
                    onChange={setTermFilter}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: 'short', l: '🧳 Short' },
                      { v: 'standard', l: '📅 Standard' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>BHK</div>
                  <PillGroup
                    value={bhkFilter}
                    onChange={setBhkFilter}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: '1', l: '1 BHK' },
                      { v: '2', l: '2 BHK' },
                      { v: '3+', l: '3+ BHK' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>Pet Friendly</div>
                  <PillGroup
                    value={petFilter}
                    onChange={setPetFilter}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: 'yes', l: '🐶 Yes' },
                      { v: 'no', l: 'No' }
                    ]}
                  />
                </div>
                <div>
                  <div className={styles.advLabel}>Max Rent: ₹{maxPrice >= 100000 ? 'Any' : maxPrice.toLocaleString()}</div>
                  <input type="range" min={5000} max={100000} step={5000}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className={styles.slider}
                  />
                </div>
              </>
            )}
            <button className={styles.resetBtn} onClick={resetAdvancedFilters}>↺ Reset</button>
          </div>
        </details>
      )}
    </div>
  );
}
