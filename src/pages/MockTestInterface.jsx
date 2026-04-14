import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import './MockTestInterface.css'

const QUESTIONS = [
  {
    id: 1,
    subject: 'Physics',
    text: 'A ball is thrown vertically upward with a velocity of 20 m/s. What is the maximum height reached by the ball? (g = 10 m/s²)',
    options: ['10 m', '20 m', '30 m', '40 m'],
    correct: 1,
  },
  {
    id: 2,
    subject: 'Chemistry',
    text: 'Which of the following is the correct electronic configuration of iron (Fe, atomic number 26)?',
    options: [
      '[Ar] 3d⁶ 4s²',
      '[Ar] 3d⁸',
      '[Ar] 4s² 3d⁶',
      '[Kr] 3d⁶ 4s²',
    ],
    correct: 0,
  },
  {
    id: 3,
    subject: 'Biology',
    text: 'Which enzyme is responsible for converting fibrinogen to fibrin during blood clotting?',
    options: ['Heparin', 'Thrombin', 'Prothrombin', 'Plasmin'],
    correct: 1,
  },
  {
    id: 4,
    subject: 'Physics',
    text: 'The dimension of electric potential is:',
    options: ['ML²T⁻³A⁻¹', 'ML²T⁻³A⁻²', 'ML³T⁻³A⁻¹', 'ML²T⁻²A⁻¹'],
    correct: 0,
  },
  {
    id: 5,
    subject: 'Biology',
    text: 'Which of the following is NOT a characteristic of mitosis?',
    options: [
      'Daughter cells are genetically identical to parent',
      'Occurs in somatic cells',
      'Results in four daughter cells',
      'One division cycle',
    ],
    correct: 2,
  },
]

const TOTAL_SECONDS = 20 * 60 // 20 min demo

export default function MockTestInterface() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [startTime, setStartTime] = useState(null)

  const tick = useCallback(() => {
    setTimeLeft(t => {
      if (t <= 1) { setSubmitted(true); return 0 }
      return t - 1
    })
  }, [])

  useEffect(() => {
    if (!started || submitted) return
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [started, submitted, tick])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const pct = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100

  const handleAnswer = (optIdx) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [currentQ]: optIdx }))
  }

  const handleMark = () => setMarked(m => ({ ...m, [currentQ]: !m[currentQ] }))

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the test?')) return
    setSubmitted(true)
    if (user) {
      setSaving(true)
      try {
        const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : TOTAL_SECONDS - timeLeft
        await apiFetch(`/tests/${id}/attempt`, {
          method: 'POST',
          body: JSON.stringify({
            score: Math.max(0, score),
            totalMarks: QUESTIONS.length * 4,
            timeTaken,
            answers
          })
        })
      } catch (err) {
        console.warn('Could not save result:', err.message)
      } finally {
        setSaving(false)
      }
    }
  }

  const score = Object.entries(answers).reduce((acc, [qi, ai]) => {
    return acc + (QUESTIONS[Number(qi)].correct === ai ? 4 : -1)
  }, 0)

  const qStatus = (i) => {
    if (submitted) return QUESTIONS[i].correct === answers[i] ? 'correct' : answers[i] !== undefined ? 'wrong' : 'unattempted'
    if (marked[i]) return 'marked'
    if (answers[i] !== undefined) return 'answered'
    if (i === currentQ) return 'current'
    return 'unattempted'
  }

  if (!started) {
    return (
      <div className="page-container">
        <div className="test-begin-card card animate-in">
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)' }}>quiz</span>
          <h1 className="page-title" style={{ textAlign: 'center' }}>NEET Full Syllabus Test {id}</h1>
          <div className="test-begin-meta">
            <div className="test-begin-stat"><span className="material-icons">quiz</span> 5 Questions (Demo)</div>
            <div className="test-begin-stat"><span className="material-icons">schedule</span> 20 Minutes</div>
            <div className="test-begin-stat"><span className="material-icons">stars</span> +4 / -1 Marking</div>
          </div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', textAlign: 'center', maxWidth: 440, lineHeight: 1.6 }}>
            This is a 5-question demo test. In the full version, you'll get 200 questions across Physics, Chemistry, and Biology.
          </p>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }} onClick={() => { setStarted(true); setStartTime(Date.now()) }}>
            <span className="material-icons">play_arrow</span>
            Begin Test
          </button>
          <button className="btn-ghost" onClick={() => navigate('/mock-tests')}>← Back to Tests</button>
        </div>
      </div>
    )
  }

  if (submitted) {
    const attempted = Object.keys(answers).length
    const correct = Object.entries(answers).filter(([qi, ai]) => QUESTIONS[Number(qi)].correct === ai).length
    return (
      <div className="page-container">
        <div className="result-screen animate-in">
          <div className="result-hero card">
            <div className="result-emoji">{score >= 0 ? '🎉' : '📚'}</div>
            <h2 className="page-title">Test Completed!</h2>
            <div className="result-score gradient-text">{score} / {QUESTIONS.length * 4}</div>
            <div className="result-grid">
              <div className="result-item"><div className="result-val" style={{ color: '#4ade80' }}>{correct}</div><div className="result-label">Correct</div></div>
              <div className="result-item"><div className="result-val" style={{ color: 'var(--primary)' }}>{attempted - correct}</div><div className="result-label">Wrong</div></div>
              <div className="result-item"><div className="result-val">{QUESTIONS.length - attempted}</div><div className="result-label">Skipped</div></div>
              <div className="result-item"><div className="result-val" style={{ color: 'var(--secondary)' }}>{Math.round((correct / QUESTIONS.length) * 100)}%</div><div className="result-label">Accuracy</div></div>
            </div>
          </div>
          <div className="result-questions">
            {QUESTIONS.map((q, i) => (
              <div key={q.id} className={`result-q card ${answers[i] === q.correct ? 'card-correct' : 'card-wrong'}`}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Q{i + 1} · {q.subject}</div>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{q.text}</p>
                {q.options.map((o, oi) => (
                  <div key={oi} className={`result-option ${oi === q.correct ? 'opt-correct' : oi === answers[i] ? 'opt-wrong' : ''}`}>
                    {oi === q.correct && <span className="material-icons" style={{ fontSize: '0.9rem', color: '#4ade80' }}>check</span>}
                    {oi === answers[i] && oi !== q.correct && <span className="material-icons" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>close</span>}
                    {o}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => navigate('/mock-tests')}>
            <span className="material-icons">arrow_back</span>
            Back to Tests
          </button>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[currentQ]

  return (
    <div className="test-interface">
      {/* Top Bar */}
      <div className="test-topbar glass">
        <div className="test-top-left">
          <span className="material-icons" style={{ color: 'var(--primary)' }}>quiz</span>
          <span className="test-name">NEET Full Syllabus Test {id}</span>
        </div>
        <div className="timer-wrap">
          <div className="progress-bar timer-bar">
            <div className="progress-fill red" style={{ width: `${100 - pct}%` }} />
          </div>
          <div className={`timer-display ${timeLeft < 300 ? 'urgent' : ''}`}>
            <span className="material-icons" style={{ fontSize: '1rem' }}>schedule</span>
            {fmt(timeLeft)}
          </div>
        </div>
        <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }} onClick={handleSubmit}>
          Submit
        </button>
      </div>

      {/* Body */}
      <div className="test-body">
        {/* Sidebar — Q navigator */}
        <aside className="test-sidebar glass">
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Questions</p>
          <div className="q-grid">
            {QUESTIONS.map((_, i) => (
              <button
                key={i}
                className={`q-btn q-${qStatus(i)}`}
                onClick={() => setCurrentQ(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="q-legend">
            {[['q-answered','Answered'],['q-marked','Marked'],['q-unattempted','Not Visited']].map(([cls, lbl]) => (
              <div key={cls} className="q-legend-item">
                <span className={`q-legend-dot ${cls}`} />
                <span>{lbl}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main question area */}
        <div className="test-main">
          <div className="question-card card animate-in">
            <div className="q-meta">
              <span className="chip">{q.subject}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Q {currentQ + 1} / {QUESTIONS.length}</span>
              <button
                className={`btn-ghost mark-btn ${marked[currentQ] ? 'marked' : ''}`}
                onClick={handleMark}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', marginLeft: 'auto' }}
              >
                <span className="material-icons" style={{ fontSize: '0.9rem' }}>bookmark</span>
                {marked[currentQ] ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            <p className="q-text">{q.text}</p>

            <div className="q-options">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  className={`q-option ${answers[currentQ] === oi ? 'selected' : ''}`}
                  onClick={() => handleAnswer(oi)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="q-nav-row">
            <button
              className="btn-secondary"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(q => q - 1)}
            >
              <span className="material-icons">chevron_left</span>
              Previous
            </button>
            <button
              className="btn-ghost"
              onClick={() => setAnswers(a => { const n = {...a}; delete n[currentQ]; return n })}
            >
              Clear
            </button>
            <button
              className="btn-secondary"
              disabled={currentQ === QUESTIONS.length - 1}
              onClick={() => setCurrentQ(q => q + 1)}
            >
              Next
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
