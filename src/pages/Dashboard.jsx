import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import './Dashboard.css'

// Static news (can be replaced with API later)
const QA_LIST = [
  {
    id: 1, 
    q: 'How are state quotas determined for NRI students?',
    a: 'NRI students must check individual state policies. Typically, 15% seats in deemed universities are reserved for NRI candidates.',
    date: '1h ago', admin: 'Dr. Sharma'
  },
  {
    id: 2, 
    q: 'Is the new choice filling rule applicable to Round 2?',
    a: 'Yes, as per MCC 2024 guidelines, fresh choice filling is mandatory for all upgraded seats in Round 2.',
    date: '3h ago', admin: 'Admin Panel'
  },
  {
    id: 3, 
    q: 'What happens if I miss the reporting deadline for my allotted college?',
    a: 'Your allotment will be cancelled and your security deposit may be forfeited depending on the round. Always report on time.',
    date: '1d ago', admin: 'Directorate'
  },
  {
    id: 4, 
    q: 'Can I apply for AIQ and State counselling simultaneously?',
    a: 'Yes! Most students do both. Just ensure you coordinate the deadlines and reporting requirements carefully.',
    date: '2d ago', admin: 'Counsellor Amit'
  }
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MONTH_NAME = 'April 2025'
const TOTAL_DAYS = 30
const START_DAY = 2
const TODAY = new Date().getDate()

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentAttempts, setRecentAttempts] = useState([])
  const [tooltip, setTooltip] = useState(null)
  const [hoveredDay, setHoveredDay] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!user) { setLoadingStats(false); return }
    Promise.all([
      apiFetch('/user/stats').catch(() => null),
      apiFetch('/user/attempts').catch(() => []),
    ]).then(([s, a]) => {
      setStats(s)
      setRecentAttempts(a || [])
    }).finally(() => setLoadingStats(false))
  }, [user])

  // Build streak days from recent attempts (last 30 days)
  const STREAK_DAYS = new Set(
    recentAttempts.map(a => new Date(a.createdAt).getDate())
  )
  if (STREAK_DAYS.size === 0) {
    // Fallback decorative streak for new users
    ;[1,2,4,5,7,8,9,11,12].forEach(d => STREAK_DAYS.add(d))
  }

  const streakCount = [...STREAK_DAYS].filter(d => d <= TODAY).length

  const STAT_CARDS = [
    {
      label: 'Mock Tests Taken',
      value: loadingStats ? '—' : (stats?.testsTaken ?? user?.testsTaken ?? 0).toString(),
      icon: 'quiz',
      delta: stats?.weeklyAttempts ? `+${stats.weeklyAttempts} this week` : 'Start testing!',
      color: '#d32f2f'
    },
    {
      label: 'Avg Score',
      value: loadingStats ? '—' : `${Math.round(stats?.avgScore ?? user?.avgScore ?? 0)}%`,
      icon: 'analytics',
      delta: stats?.avgScore > 70 ? '🔥 Above average!' : 'Keep improving',
      color: '#f8bd2a'
    },
    {
      label: 'Best Rank',
      value: loadingStats ? '—' : (stats?.bestRank ? `#${stats.bestRank.toLocaleString()}` : 'TBD'),
      icon: 'insights',
      delta: 'Use Rank Predictor',
      color: '#60a5fa'
    },
    {
      label: 'Study Streak',
      value: loadingStats ? '—' : `${stats?.streak ?? user?.streak ?? streakCount}d`,
      icon: 'local_fire_department',
      delta: streakCount > 5 ? 'Personal best! 🎉' : 'Build your streak!',
      color: '#4ade80'
    },
  ]

  const RECOMMENDATIONS = [
    { name: 'AIIMS New Delhi',  rank: '#1 India',  match: stats?.avgScore > 85 ? 92 : 45, color: '#d32f2f' },
    { name: 'KGMU Lucknow',    rank: '#4 India',  match: stats?.avgScore > 70 ? 78 : 62, color: '#f8bd2a' },
    { name: 'NIT-MAMC Delhi',  rank: '#2 Delhi',  match: stats?.avgScore > 75 ? 85 : 55, color: '#4ade80' },
  ]

  // Calendar
  const blanks = Array(START_DAY).fill(null)
  const dayCells = [...blanks, ...Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)]

  const handleDayEnter = (e, day) => {
    if (!day) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ day, top: rect.top - 8, left: rect.left + rect.width / 2 })
    setHoveredDay(day)
  }
  const handleDayLeave = () => { setTooltip(null); setHoveredDay(null) }

  const firstName = user?.name?.split(' ')[0] || 'Student'

  return (
    <div className="page-container">
      {/* Welcome header */}
      <div className="dash-header animate-in">
        <div>
          <p className="welcome-sub">{getGreeting()},</p>
          <h1 className="welcome-name">{firstName} <span className="wave">👋</span></h1>
          <p className="welcome-meta">
            {user?.branch || 'NEET Aspirant'}&nbsp;·&nbsp;
            {user?.targetYear ? `Target ${user.targetYear}` : 'Campus Bull'}&nbsp;·&nbsp;
            <span style={{ color: user?.isPro ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
              {user?.isPro ? '⭐ PRO Member' : user ? 'Free Plan' : 'Guest'}
            </span>
          </p>
        </div>
        <div className="dash-actions">
          <Link to="/mock-tests" className="btn-primary">
            <span className="material-icons">play_arrow</span>
            Start Mock Test
          </Link>
          <Link to="/rank-predictor" className="btn-secondary">
            <span className="material-icons">insights</span>
            Predict Rank
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card animate-in" style={{ '--stat-color': s.color }}>
            <div className="stat-icon-row">
              <span className="material-icons stat-icon" style={{ color: s.color }}>{s.icon}</span>
              <span className="stat-delta">{s.delta}</span>
            </div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="dash-main-grid">
        {/* Left: News + Calendar */}
        <div className="dash-col-left">
          <section className="animate-in">
            <div className="section-row">
              <p className="section-label">Q/A Forum Verified by Admins</p>
              <Link to="/counselling-guide" className="view-all">Ask Question →</Link>
            </div>
            <div className="news-list" style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {QA_LIST.map(qa => (
                <article key={qa.id} className="news-card animate-in" style={{ padding: '1rem', background: 'var(--surface-container-low)' }}>
                  <div className="news-top" style={{ marginBottom: '0.5rem' }}>
                    <span className="material-icons news-tag-icon" style={{ color: 'var(--primary)' }}>help_outline</span>
                    <span className="news-time">Asked by student • {qa.date}</span>
                  </div>
                  <h3 className="news-title" style={{ fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>Q: {qa.q}</h3>
                  <div style={{ padding: '0.75rem', background: 'var(--surface-container-highest)', borderRadius: '0.5rem', borderLeft: '3px solid #4ade80' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="material-icons" style={{ fontSize: '0.9rem', color: '#4ade80' }}>verified</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4ade80' }}>Ans: {qa.admin}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>{qa.a}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Recent Attempts */}
          {recentAttempts.length > 0 && (
            <section className="animate-in" style={{ marginTop: '1.75rem' }}>
              <p className="section-label">Recent Test Results</p>
              <div className="card" style={{ padding: '1rem' }}>
                {recentAttempts.slice(0, 4).map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{a.test?.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: a.score / a.totalMarks >= 0.7 ? '#4ade80' : '#f8bd2a', fontSize: '1rem' }}>
                        {Math.round((a.score / a.totalMarks) * 100)}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{a.score}/{a.totalMarks}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Monthly Tracker */}
          <section className="animate-in" style={{ marginTop: '1.75rem' }}>
            <p className="section-label">Monthly Tracker</p>
            <div className="card cal-card">
              <div className="cal-header">
                <div className="cal-month-row">
                  <span className="material-icons cal-icon">calendar_month</span>
                  <span className="cal-month">{MONTH_NAME}</span>
                </div>
                <span className="badge badge-red">
                  <span className="material-icons" style={{ fontSize: '0.75rem' }}>local_fire_department</span>
                  {streakCount} day streak
                </span>
              </div>
              <div className="cal-grid">
                {DAYS.map(d => (
                  <div key={d} className="cal-day-label">{d}</div>
                ))}
                {dayCells.map((day, idx) => {
                  if (!day) return <div key={`blank-${idx}`} className="cal-cell blank" />
                  const isActive = STREAK_DAYS.has(day)
                  const isToday = day === TODAY
                  const isFuture = day > TODAY
                  const isHovered = hoveredDay === day
                  return (
                    <div
                      key={day}
                      className={`cal-cell ${isActive ? 'active' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''} ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={e => handleDayEnter(e, day)}
                      onMouseLeave={handleDayLeave}
                    >
                      <span className="cal-day-num">{day}</span>
                      {isActive && !isFuture && <span className="cal-pip" />}
                    </div>
                  )
                })}
              </div>
              <p className="cal-foot">
                <span className="material-icons" style={{ fontSize: '0.85rem' }}>check_circle</span>
                {STREAK_DAYS.size} days studied&nbsp;·&nbsp;{Math.round((STREAK_DAYS.size / TOTAL_DAYS) * 100)}% completion
              </p>
            </div>
          </section>
        </div>

        {/* Right: Recommendations + CTA */}
        <div className="dash-col-right">
          <section className="animate-in">
            <p className="section-label">Top Recommendations</p>
            <div className="reco-list">
              {RECOMMENDATIONS.map(r => (
                <div key={r.name} className="reco-card card">
                  <div className="reco-top">
                    <div>
                      <div className="reco-name">{r.name}</div>
                      <div className="reco-rank">
                        <span className="material-icons" style={{ fontSize: '0.8rem', color: '#f8bd2a' }}>star</span>
                        {r.rank}
                      </div>
                    </div>
                    <div className="reco-match" style={{ color: r.color }}>{r.match}%</div>
                  </div>
                  <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                    <div className="progress-fill" style={{ width: `${r.match}%`, background: `linear-gradient(90deg, ${r.color}88, ${r.color})` }} />
                  </div>
                  <div className="reco-foot">Match Probability</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Card */}
          <div className="cta-card animate-in">
            <span className="material-icons cta-icon-mat">calendar_today</span>
            <h3 className="cta-title">Expert Consultation</h3>
            <p className="cta-desc">Book a 1:1 session with a senior counselor today.</p>
            <Link to="/expert-counselling" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <span className="material-icons">event</span>
              Book Session
            </Link>
          </div>

          {/* Quick Links */}
          <div className="quick-links animate-in">
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Quick Access</p>
            <div className="quick-grid">
              {[
                { to: '/rank-predictor',    icon: 'insights',         label: 'Rank Predictor', color: '#d32f2f' },
                { to: '/mock-tests',        icon: 'quiz',             label: 'Mock Tests',     color: '#f8bd2a' },
                { to: '/college-predictor', icon: 'account_balance',  label: 'College Finder', color: '#4ade80' },
                { to: '/counselling-guide', icon: 'menu_book',        label: 'Counselling',    color: '#60a5fa' },
                { to: '/profile',           icon: 'manage_accounts',  label: 'My Profile',     color: '#a78bfa' },
              ].map(q => (
                <Link key={q.to} to={q.to} className="quick-item">
                  <span className="material-icons" style={{ color: q.color, fontSize: '1.5rem' }}>{q.icon}</span>
                  <span>{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Tooltip */}
      {tooltip && (
        <div className="cal-tooltip" style={{ position: 'fixed', top: tooltip.top - 52, left: tooltip.left, transform: 'translateX(-50%)', zIndex: 999, pointerEvents: 'none' }}>
          <div className="cal-tooltip-title">April {tooltip.day}, 2025</div>
          {STREAK_DAYS.has(tooltip.day) && tooltip.day <= TODAY ? (
            <div className="cal-tooltip-streak">
              <span className="material-icons" style={{ fontSize: '0.85rem', color: '#f97316' }}>local_fire_department</span>
              Day {[...STREAK_DAYS].filter(d => d <= tooltip.day).length} of streak!
            </div>
          ) : tooltip.day > TODAY ? (
            <div className="cal-tooltip-future">Upcoming 📅</div>
          ) : (
            <div className="cal-tooltip-missed">Missed day</div>
          )}
        </div>
      )}
    </div>
  )
}
