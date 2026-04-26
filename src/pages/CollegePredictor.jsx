import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import './CollegePredictor.css'

const STATES = ['All', 'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Tripura', 'UP', 'Uttarakhand', 'West Bengal']
const TYPES  = ['All', 'Government', 'Private', 'AIIMS', 'Deemed']

export default function CollegePredictor() {
  const { user } = useAuth()

  // Derive defaults from user profile
  const profileRank = user?.bestRank || ''
  const profileCategory = user?.category || 'G'
  const profileCourse = user?.ugOrPg || 'UG'

  const [courseType,      setCourseType]       = useState(profileCourse)
  const [stateFilter,     setStateFilter]     = useState('All')
  const [typeFilter,      setTypeFilter]       = useState('All')
  const [counsellingType, setCounsellingType]  = useState('All')
  const [category,        setCategory]         = useState(profileCategory)
  const [collegeSearch,   setCollegeSearch]    = useState('')
  const [collegeOptions,  setCollegeOptions]   = useState([])
  const [budget,          setBudget]           = useState('')
  const [limit,           setLimit]            = useState('20')
  const [rank,            setRank]             = useState(profileRank)
  const [searched,        setSearched]         = useState(false)
  const [apiColleges,     setApiColleges]      = useState([])
  const [apiLoading,      setApiLoading]       = useState(false)

  // Sync profile values if user loads later
  useEffect(() => {
    if (user?.bestRank && !rank) setRank(user.bestRank)
    if (user?.category && category === 'G') setCategory(user.category)
    if (user?.ugOrPg && courseType === 'UG') setCourseType(user.ugOrPg)
  }, [user])

  // Fetch college names for dropdown
  useEffect(() => {
    async function fetchColleges() {
      try {
        const query = new URLSearchParams()
        if (counsellingType !== 'All' && counsellingType !== 'MCC') query.append('counsellingType', counsellingType)
        if (stateFilter !== 'All') query.append('state', stateFilter)
        const res = await apiFetch(`/predict/colleges?${query.toString()}`)
        if (Array.isArray(res)) setCollegeOptions(res)
      } catch (err) {
        console.warn('Failed to fetch college names', err)
      }
    }
    fetchColleges()
  }, [stateFilter, counsellingType])

  const handleSearch = async () => {
    if (!rank) { alert('Please enter your NEET rank'); return }
    setSearched(true)
    setApiLoading(true)
    try {
      const result = await apiFetch('/predict/college', {
        method: 'POST',
        body: JSON.stringify({
          rank: Number(rank),
          courseType: courseType,
          type: typeFilter !== 'All' ? typeFilter : undefined,
          state: (counsellingType === 'State' && stateFilter !== 'All') ? stateFilter : undefined,
          counsellingType: counsellingType !== 'All' ? counsellingType : undefined,
          category: category,
          collegeName: collegeSearch.trim() || undefined,
          budget: budget ? Number(budget) : undefined,
          limit: limit
        })
      })
      setApiColleges(result.colleges || [])
    } catch (err) {
      console.warn('College API error:', err)
      setApiColleges([])
    } finally {
      setApiLoading(false)
    }
  }

  const exportCSV = () => {
    if (!apiColleges.length) return
    const headers = ['College Name', 'State', 'Institution Type', 'Seat Category', 'Round', 'Year', 'Cutoff Rank']
    const rows = apiColleges.map(c => [
      `"${c.name}"`, `"${c.state}"`, `"${c.type}"`,
      `"${c.category}"`, `"${c.round}"`, `"${c.year}"`, `"${c.maxRank || 'N/A'}"`
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `college_predictions_rank${rank}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const rankLocked = !!user?.bestRank
  const categoryFromProfile = !!user?.category
  const courseLocked = !!user?.ugOrPg

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <p className="section-label">College Finder</p>
          <h1 className="page-title">Medical College Predictor</h1>
          <p className="page-subtitle">
            Find best-fit colleges based on your rank, category &amp; state. Data from MCC &amp; state counselling 2023–24.
          </p>
        </div>
      </div>

      {/* Profile Banner */}
      {user?.bestRank && (
        <div className="card animate-in" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', background: 'linear-gradient(135deg, var(--primary)15, var(--surface-container-low))', borderLeft: '4px solid var(--primary)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="material-icons" style={{ color: 'var(--primary)' }}>lock</span>
          <p style={{ fontSize: '0.88rem' }}>
            <strong>Rank locked from your profile:</strong> #{user.bestRank.toLocaleString()}
            {user.category && <span> · Category: <strong>{user.category}</strong></span>}
            {user.ugOrPg && <span> · {user.ugOrPg}</span>}
            {' '}<a href="/dashboard/profile" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Update in Profile →</a>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card college-search-card animate-in">
        <div className="college-search-inner">

          {/* Rank — locked if profile has it */}
          <div className="field-group" style={{ flex: '1 1 160px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>insights</span>
              {' '}NEET Rank {rankLocked && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>● From Profile</span>}
            </label>
            <div className="input-icon-wrap">
              <span className="material-icons input-icon">{rankLocked ? 'lock' : 'leaderboard'}</span>
              <input
                className="field-input with-icon"
                type="number"
                placeholder="e.g. 32400"
                value={rank}
                onChange={e => !rankLocked && setRank(e.target.value)}
                readOnly={rankLocked}
                style={{ opacity: rankLocked ? 0.8 : 1, cursor: rankLocked ? 'not-allowed' : 'text' }}
              />
            </div>
          </div>

          {/* Category — from profile */}
          <div className="field-group" style={{ flex: '1 1 140px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>people</span>
              {' '}Category {categoryFromProfile && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>● Profile</span>}
            </label>
            <select className="field-select" value={category} onChange={e => !categoryFromProfile && setCategory(e.target.value)} disabled={categoryFromProfile} style={{ opacity: categoryFromProfile ? 0.8 : 1, cursor: categoryFromProfile ? 'not-allowed' : 'pointer' }}>
              {['G', 'EWS', 'SC', 'ST', 'OBC', 'OBC-NCL'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Course Type (UG/PG) — locked from profile */}
          <div className="field-group" style={{ flex: '1 1 120px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>school</span>
              {' '}Course {courseLocked && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>● Profile</span>}
            </label>
            <select className="field-select" value={courseType} onChange={e => !courseLocked && setCourseType(e.target.value)} disabled={courseLocked} style={{ opacity: courseLocked ? 0.8 : 1, cursor: courseLocked ? 'not-allowed' : 'pointer' }}>
              <option value="UG">UG (MBBS/BDS)</option>
              <option value="PG">PG (MD/MS)</option>
            </select>
          </div>

          {/* Counselling Type */}
          <div className="field-group" style={{ flex: '1 1 160px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>account_balance</span>
              {' '}Counselling
            </label>
            <select className="field-select" value={counsellingType} onChange={e => {
              setCounsellingType(e.target.value)
              if (e.target.value === 'MCC') setStateFilter('All')
            }}>
              <option value="All">All</option>
              <option value="MCC">MCC (All India)</option>
              <option value="State">State Quota</option>
            </select>
          </div>

          {/* State — only active when State counselling selected */}
          <div className="field-group" style={{ flex: '1 1 160px', opacity: counsellingType === 'State' ? 1 : 0.45, pointerEvents: counsellingType === 'State' ? 'auto' : 'none' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>location_on</span>
              {' '}State
            </label>
            <select className="field-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)} disabled={counsellingType !== 'State'}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* College Name */}
          <div className="field-group" style={{ flex: '1 1 220px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>school</span>
              {' '}College Name
            </label>
            <select className="field-select" value={collegeSearch} onChange={e => setCollegeSearch(e.target.value)}>
              <option value="">All Colleges</option>
              {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Institution Type */}
          <div className="field-group" style={{ flex: '1 1 140px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>business</span>
              {' '}Inst. Type
            </label>
            <select className="field-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Budget */}
          <div className="field-group" style={{ flex: '1 1 160px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>currency_rupee</span>
              {' '}Budget (Max ₹)
            </label>
            <input
              className="field-input"
              type="number"
              placeholder="e.g. 1500000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
          </div>

          {/* Limit */}
          <div className="field-group" style={{ flex: '1 1 120px' }}>
            <label className="field-label">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>format_list_numbered</span>
              {' '}Show
            </label>
            <select className="field-select" value={limit} onChange={e => setLimit(e.target.value)}>
              {['10', '20', '100', '1000'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button
            className="btn-primary"
            style={{ flex: '1 1 100%', justifyContent: 'center', marginTop: '0.5rem' }}
            onClick={handleSearch}
            disabled={apiLoading}
          >
            <span className="material-icons">{apiLoading ? 'hourglass_empty' : 'search'}</span>
            {apiLoading ? 'Searching...' : 'Find Colleges'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginTop: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <p className="section-label">
            {apiLoading
              ? 'Searching database...'
              : searched
                ? `${apiColleges.length} result${apiColleges.length !== 1 ? 's' : ''} for Rank #${rank}${category !== 'All' ? ` · ${category}` : ''}`
                : 'Enter your rank and click Find Colleges'}
          </p>
          {searched && apiColleges.length > 0 && (
            <button className="btn-secondary" onClick={exportCSV} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="material-icons" style={{ fontSize: '1.1rem' }}>download</span>
              Download CSV
            </button>
          )}
        </div>

        {apiLoading && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', display: 'block', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>refresh</span>
            <p>Querying database...</p>
          </div>
        )}

        {!apiLoading && searched && apiColleges.length === 0 && (
          <div className="empty-state card animate-in">
            <span className="material-icons empty-icon">search_off</span>
            <h3>No colleges match your filters</h3>
            <p>Try adjusting category, counselling type, or increasing rank range.</p>
          </div>
        )}

        {!apiLoading && apiColleges.length > 0 && (
          <div className="table-responsive animate-in">
            <table className="colleges-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>College Name</th>
                  <th>State</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Round</th>
                  <th>Year</th>
                  <th>Cutoff Rank</th>
                </tr>
              </thead>
              <tbody>
                {apiColleges.map((c, i) => (
                  <tr key={c.name + i} style={{ background: c.maxRank && c.maxRank >= Number(rank) ? 'rgba(74,222,128,0.04)' : undefined }}>
                    <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.name}</td>
                    <td>{c.state}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', background: c.type === 'Government' ? '#4ade8022' : c.type === 'AIIMS' ? '#d32f2f22' : '#60a5fa22', color: c.type === 'Government' ? '#4ade80' : c.type === 'AIIMS' ? '#d32f2f' : '#60a5fa' }}>
                        {c.type}
                      </span>
                    </td>
                    <td>{c.category}</td>
                    <td>{c.round}</td>
                    <td>{c.year}</td>
                    <td style={{ fontWeight: 700, color: c.maxRank && c.maxRank >= Number(rank) ? '#4ade80' : 'var(--on-surface)' }}>
                      {c.maxRank ? c.maxRank.toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
