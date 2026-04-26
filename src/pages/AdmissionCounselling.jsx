import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './CounsellingGuide.css'

const ADMISSION_TYPES = [
  {
    id: 'mcc_aiq',
    icon: 'account_balance',
    title: 'MCC – All India Quota (AIQ)',
    color: '#d32f2f',
    desc: 'Central counselling by MCC for 15% AIQ seats in Government colleges and 100% seats in Central Universities (AIIMS, JIPMER, ESIC, AFMC, etc.)',
    steps: [
      'Register at mcc.nic.in during Round 1 window',
      'Pay registration + security deposit fee',
      'Fill and lock choices in preference order',
      'Seat allotment result published',
      'Report to allotted college within deadline',
    ],
    tags: ['Government', 'AIIMS', 'JIPMER', 'Central Univ'],
  },
  {
    id: 'state_quota',
    icon: 'location_on',
    title: 'State Quota Counselling',
    color: '#f8bd2a',
    desc: 'State authority manages 85% seats in Government colleges and all seats in state private medical colleges. Conducted separately by each state.',
    steps: [
      'Check domicile/nativity eligibility for your state',
      'Register on state counselling portal',
      'Document verification (domicile, caste, NEET scorecard)',
      'Choice filling — prefer by rank, location, type',
      'Multiple rounds (R1, R2, Mop-Up)',
    ],
    tags: ['Government 85%', 'Private State Colleges', 'Domicile Required'],
  },
  {
    id: 'management_quota',
    icon: 'business_center',
    title: 'Management / NRI Quota',
    color: '#60a5fa',
    desc: 'Private medical colleges reserve up to 15% seats as Management Quota and 5% as NRI Quota. Higher fees but lower rank requirement. Applied directly through college or state authority.',
    steps: [
      'Check if NEET score meets minimum cutoff (350+ typically)',
      'Contact college directly OR apply via state mop-up round',
      'Management seats are filled after Merit seats',
      'Fees can range from ₹15L–₹1.5Cr per year',
      'Check MCI-approved fee schedule before paying',
    ],
    tags: ['Private Colleges', 'Higher Fees', 'Lower Rank Needed', 'NRI Option'],
  },
  {
    id: 'deemed',
    icon: 'school',
    title: 'Deemed Universities',
    color: '#4ade80',
    desc: 'Deemed universities like Manipal, SRM, Amrita run their own counselling for MBBS/BDS/MD seats after MCC round. Expensive but widely available.',
    steps: [
      'MCC manages 50% seats (AIQ) for deemed universities',
      'Remaining 50% filled by university directly',
      'Apply on university website after MCC allotment',
      'Multiple university-level rounds available',
    ],
    tags: ['Deemed Univ', 'MBBS/BDS/MD', 'Semi-Centralized'],
  },
]

export default function AdmissionCounselling() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('mcc_aiq')
  const active = ADMISSION_TYPES.find(a => a.id === activeTab)

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <p className="section-label">Admission Process</p>
          <h1 className="page-title">Admission Counselling</h1>
          <p className="page-subtitle">
            Complete guide to MBBS/BDS admission — Merit, Management & NRI quota processes.
            {user?.bestRank && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                Your Rank: #{user.bestRank.toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <Link to="/dashboard/college-predictor" className="btn-primary">
          <span className="material-icons">search</span>
          Find Colleges
        </Link>
      </div>

      {/* Rank Banner */}
      {user?.bestRank && (
        <div className="card animate-in" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary)22, var(--surface-container-low))', borderLeft: '4px solid var(--primary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '2rem' }}>insights</span>
          <div>
            <p style={{ fontWeight: 700 }}>Your NEET Rank: #{user.bestRank.toLocaleString()} · {user.ugOrPg || 'UG'}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
              {user.bestRank <= 50000
                ? '✅ Eligible for Government colleges via MCC AIQ & State Quota'
                : user.bestRank <= 200000
                  ? '✅ Eligible for State Quota & Private/Deemed colleges'
                  : '⚠️ Management/NRI quota may be your best option. Check private colleges.'}
            </p>
          </div>
        </div>
      )}

      {/* Type Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {ADMISSION_TYPES.map(a => (
          <button
            key={a.id}
            onClick={() => setActiveTab(a.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.1rem', borderRadius: '2rem', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
              border: `2px solid ${activeTab === a.id ? a.color : 'var(--outline-variant)'}`,
              background: activeTab === a.id ? `${a.color}22` : 'var(--surface-container-low)',
              color: activeTab === a.id ? a.color : 'var(--on-surface-variant)',
            }}>
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>{a.icon}</span>
            {a.title.split('–')[0].trim()}
          </button>
        ))}
      </div>

      {/* Detail Card */}
      {active && (
        <div className="card animate-in" style={{ padding: '2rem', borderLeft: `4px solid ${active.color}` }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '1rem', background: `${active.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: active.color, fontSize: '1.7rem' }}>{active.icon}</span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{active.title}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{active.desc}</p>
            </div>
          </div>

          <p className="section-label" style={{ marginBottom: '1rem' }}>Step-by-Step Process</p>
          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {active.steps.map((step, i) => (
              <li key={i} style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--on-surface)' }}>
                <span style={{ fontWeight: 600, color: active.color }}>Step {i + 1}:</span> {step}
              </li>
            ))}
          </ol>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {active.tags.map(tag => (
              <span key={tag} style={{ padding: '0.3rem 0.8rem', background: `${active.color}22`, color: active.color, borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${active.color}44` }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick CTA */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Link to="/dashboard/college-predictor" className="card animate-in" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer', background: 'var(--surface-container-low)' }}>
          <span className="material-icons" style={{ color: '#d32f2f', fontSize: '2rem' }}>account_balance</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>College Predictor</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Find colleges by rank</p>
          </div>
        </Link>
        <Link to="/dashboard/counselling-guide" className="card animate-in" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer', background: 'var(--surface-container-low)' }}>
          <span className="material-icons" style={{ color: '#4ade80', fontSize: '2rem' }}>forum</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Q&A Forum</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Ask counselling questions</p>
          </div>
        </Link>
        <Link to="/dashboard/expert-counselling" className="card animate-in" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer', background: 'var(--surface-container-low)' }}>
          <span className="material-icons" style={{ color: '#60a5fa', fontSize: '2rem' }}>support_agent</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Expert Session</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Book 1:1 counsellor</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
