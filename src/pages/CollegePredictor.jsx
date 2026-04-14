import { useState } from 'react'
import { apiFetch } from '../utils/api'
import './CollegePredictor.css'


// Dynamic Postgres API data used instead of static mock
const STATES = ['All', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Karnataka', 'Puducherry', 'UP', 'Madhya Pradesh', 'Maharashtra', 'Kerala']
const TYPES  = ['All', 'Government', 'Private', 'AIIMS']

export default function CollegePredictor() {
  const [stateFilter, setStateFilter] = useState('All')
  const [typeFilter,  setTypeFilter]  = useState('All')
  const [rank, setRank]               = useState('')
  const [searched, setSearched]       = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [apiColleges, setApiColleges] = useState([])
  const [apiLoading, setApiLoading]   = useState(false)

  const handleSearch = async () => {
    if (!rank) return
    setSearched(true)
    setApiLoading(true)
    try {
      const result = await apiFetch('/predict/college', {
        method: 'POST',
        body: JSON.stringify({ 
          rank: Number(rank), 
          type: typeFilter !== 'All' ? typeFilter : undefined,
          state: stateFilter !== 'All' ? stateFilter : undefined 
        })
      })
      setApiColleges(result.colleges || [])
    } catch (err) {
      console.warn('College API unavailable')
      setApiColleges([])
    } finally {
      setApiLoading(false)
    }
  }

  const filtered = apiColleges

  const handleFind = () => handleSearch()

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <p className="section-label">College Finder</p>
          <h1 className="page-title">Medical College Predictor</h1>
          <p className="page-subtitle">
            Find your best-fit colleges based on rank, category, and state.
            Data sourced from MCC &amp; state counseling 2023-24.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="card college-search-card animate-in">
        <div className="college-search-inner">
          <div className="field-group" style={{ flex: 1 }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>insights</span>
              {' '}NEET Rank
            </label>
            <div className="input-icon-wrap">
              <span className="material-icons input-icon">leaderboard</span>
              <input
                className="field-input with-icon"
                type="number"
                placeholder="e.g. 3240"
                value={rank}
                onChange={e => setRank(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group" style={{ flex: 1 }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>location_on</span>
              {' '}State
            </label>
            <select className="field-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="field-group" style={{ flex: 1 }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>business</span>
              {' '}Type
            </label>
            <select className="field-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>


          <button
            className="btn-primary"
            style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
            onClick={handleFind}
          >
            <span className="material-icons">search</span>
            Find Colleges
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginTop: '1.75rem' }}>
        <div className="section-row">
          <p className="section-label">
            {apiLoading 
              ? 'Loading dynamic data from Postgres...'
              : searched
                ? `Results for Rank ${rank || 'All'} — ${filtered.length} college${filtered.length !== 1 ? 's' : ''}`
                : `Enter your rank to search across all states directly from our updated database.`}
          </p>
        </div>

        <div className="college-grid">
          {filtered.map((c, i) => (
            <div
              key={c.name + i}
              className={`college-card-full card animate-in`}
            >
              <div className="college-card-top">
                <div className="college-icon-wrap" style={{ background: `var(--surface-container-high)`, borderColor: `var(--outline)` }}>
                  <span className="material-icons college-icon" style={{ color: 'var(--primary)' }}>school</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="college-card-tags">
                    <span className="chip" style={{ fontSize: '0.65rem' }}>{c.type}</span>
                  </div>
                  <h3 className="college-card-name">{c.name}</h3>
                  <p className="college-state">
                    <span className="material-icons" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>location_on</span>
                    {c.state}
                  </p>
                </div>
              </div>

              <div className="college-details">
                <div className="college-detail">
                  <div className="detail-label">
                    <span className="material-icons" style={{ fontSize: '0.7rem' }}>leaderboard</span> Cutoff Rank
                  </div>
                  <div className="detail-val" style={{ fontSize: '0.8rem' }}>{c.maxRank || 'Unknown'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state card animate-in" style={{ marginTop: '1rem' }}>
            <span className="material-icons empty-icon">search_off</span>
            <h3>No colleges match your filters</h3>
            <p>Try adjusting the state, type, or tier filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
