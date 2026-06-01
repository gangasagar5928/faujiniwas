import { useTransition } from 'react';
import { useFilterStore } from '../../store/filterStore';
import styles from './FilterBar.module.css';

const PillGroup = ({ options, value, onChange, disabled }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
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

export default function FilterBar() {
  const [isPendingLocal, startTransition] = useTransition();
  const {
    activeView, typeFilter, sortPref, maxPrice,
    furnishFilter, availFilter, sqftFilter, ownerFilter, termFilter, bhkFilter, petFilter, categoryFilter,
    setTypeFilter, setSortPref, setMaxPrice,
    setFurnishFilter, setAvailFilter, setSqftFilter, setOwnerFilter, setTermFilter, setBhkFilter, setPetFilter, setCategoryFilter,
    resetAdvancedFilters,
    setIsPending,
  } = useFilterStore();

  const isMarket = activeView === 'market';
  const isDorm   = activeView === 'dorms';
  const isSaved  = activeView === 'saved';

  const handleAction = (fn, val) => {
    setIsPending(true);
    startTransition(() => {
      fn(val);
      // We don't have a reliable way to know when Zustand's set is 'done' processing the filter function 
      // but startTransition helps React prioritize this.
      setTimeout(() => setIsPending(false), 30);
    });
  };

  return (
    <div className={styles.wrap}>
      {/* Quick filter row */}
      <div className={styles.row}>
        {!isMarket && !isDorm && !isSaved && (
          <>
            {['all','Flat','Room','Villa','PG'].map(t => (
              <button key={t} className={`fb ${typeFilter === t ? 'active' : ''}`}
                onClick={() => handleAction(setTypeFilter, t)}>
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </>
        )}
        <select className="fb" value={sortPref} onChange={e => handleAction(setSortPref, e.target.value)}>
          <option value="new">🕒 Newest</option>
          <option value="priceAsc">₹ Low→High</option>
          <option value="priceDesc">₹ High→Low</option>
        </select>
      </div>

      {/* Advanced filters (open by default for visibility) */}
      {!isDorm && !isSaved && (
        <details className={styles.adv}>
          <summary className={styles.advToggle}>
            ✨ Advanced Filters & Amenities
            {isPendingLocal && <span className={styles.transitionLoader}>●</span>}
          </summary>
          <div className={styles.advGrid}>
            {!isMarket && (
              <>
                <div>
                  <div className={styles.advLabel}>Furnishing</div>
                  <PillGroup
                    value={furnishFilter}
                    onChange={(v) => handleAction(setFurnishFilter, v)}
                    disabled={isPendingLocal}
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
                    onChange={(v) => handleAction(setAvailFilter, v)}
                    disabled={isPendingLocal}
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
                    onChange={(v) => handleAction(setSqftFilter, v)}
                    disabled={isPendingLocal}
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
                    onChange={(v) => handleAction(setOwnerFilter, v)}
                    disabled={isPendingLocal}
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
                    onChange={(v) => handleAction(setTermFilter, v)}
                    disabled={isPendingLocal}
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
                    onChange={(v) => handleAction(setBhkFilter, v)}
                    disabled={isPendingLocal}
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
                    onChange={(v) => handleAction(setPetFilter, v)}
                    disabled={isPendingLocal}
                    options={[
                      { v: 'all', l: 'Any' },
                      { v: 'yes', l: '🐶 Yes' },
                      { v: 'no', l: 'No' }
                    ]}
                  />
                </div>
              </>
            )}
            {isMarket && (
              <div>
                <div className={styles.advLabel}>Category</div>
                <PillGroup
                  value={categoryFilter}
                  onChange={(v) => handleAction(setCategoryFilter, v)}
                  disabled={isPendingLocal}
                  options={[
                    { v: 'all', l: 'All Items' },
                    { v: 'Furniture', l: 'Furniture' },
                    { v: 'Electronics', l: 'Electronics' },
                    { v: 'Vehicles', l: 'Vehicles' },
                    { v: 'Household', l: 'Household' },
                    { v: 'Kit/Gear', l: 'Kit/Gear' }
                  ]}
                />
              </div>
            )}
            <div>
              <div className={styles.advLabel}>{isMarket ? 'Max Price' : 'Max Rent'}: ₹{maxPrice >= 100000 ? 'Any' : maxPrice.toLocaleString()}</div>
              <input type="range" min={isMarket ? 100 : 5000} max={100000} step={isMarket ? 100 : 5000}
                value={maxPrice}
                onChange={e => handleAction(setMaxPrice, e.target.value)}
                className={styles.slider}
              />
            </div>
            <button className={styles.resetBtn} onClick={() => handleAction(resetAdvancedFilters)}>↺ Reset</button>
          </div>
        </details>
      )}
    </div>
  );
}
