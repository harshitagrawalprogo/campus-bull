import './CounsellingGuide.css'

const ARTICLES = [
  {
    id: 1,
    category: 'Counselling 101',
    title: 'Understanding MCC NEET-UG Counselling Process',
    desc: 'A complete walkthrough of the Medical Counselling Committee (MCC) process — from registration to seat allotment. Learn the exact steps, timelines, and documents required.',
    readTime: '8 min',
    views: '24.5k',
    featured: true,
  },
  {
    id: 2,
    category: 'State Counselling',
    title: 'State vs AIQ: Which is better for you?',
    desc: 'Understand the strategic difference between All India Quota seats and State Quota, and how to maximize your chances at your preferred college.',
    readTime: '6 min',
    views: '18.2k',
    featured: false,
  },
  {
    id: 3,
    category: 'Choice Filling',
    title: 'The Art of Choice Filling: Rank-Optimized Strategy',
    desc: 'Most students fill choices randomly. This guide teaches you a data-driven method to fill 500+ choices for maximum seat security.',
    readTime: '12 min',
    views: '31.7k',
    featured: false,
  },
  {
    id: 4,
    category: 'AIIMS & JIPMER',
    title: 'AIIMS Counselling: Everything You Must Know',
    desc: 'AIIMS has its own separate counselling portal. Understand the registration process, document verification, and reporting requirements for AIIMS seats.',
    readTime: '7 min',
    views: '15.9k',
    featured: false,
  },
  {
    id: 5,
    category: 'Documents',
    title: 'Complete Document Checklist for NEET Counselling',
    desc: 'From domicile certificates to migration certificates — never miss a document again. Download our printable checklist.',
    readTime: '4 min',
    views: '42.1k',
    featured: false,
  },
  {
    id: 6,
    category: 'Seat Allotment',
    title: 'What Happens After Seat Allotment?',
    desc: 'A step-by-step guide to reporting, fee payment, and joining procedures after you receive your seat allotment letter.',
    readTime: '5 min',
    views: '19.3k',
    featured: false,
  },
]

const FAQS = [
  { q: 'Can I participate in both AIQ and state counselling?', a: 'Yes. AIQ and state counselling are separate. You can participate in both to maximize your chances.' },
  { q: 'What happens if I upgrade my seat?', a: 'If you get an upgrade, you must pay the new fee difference and surrender the previous seat. Your previous fees are adjusted.' },
  { q: 'Is there a fee for NEET counselling registration?', a: 'Yes. MCC charges a non-refundable registration fee (₹1,000 for General, ₹500 for SC/ST) plus a security deposit.' },
]

export default function CounsellingGuide() {
  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <p className="section-label">Resource Library</p>
          <h1 className="page-title">NEET Counselling Guide</h1>
          <p className="page-subtitle">Comprehensive guides, strategies, and document checklists for NEET-UG counselling.</p>
        </div>
      </div>

      {/* Featured */}
      {ARTICLES.filter(a => a.featured).map(a => (
        <div key={a.id} className="featured-article card animate-in">
          <div className="featured-badge">
            <span className="material-icons" style={{ fontSize: '0.875rem' }}>star</span>
            Featured Guide
          </div>
          <h2 className="featured-title">{a.title}</h2>
          <p className="featured-desc">{a.desc}</p>
          <div className="featured-meta">
            <span><span className="material-icons" style={{ fontSize: '0.9rem' }}>schedule</span>{a.readTime} read</span>
            <span><span className="material-icons" style={{ fontSize: '0.9rem' }}>visibility</span>{a.views} views</span>
          </div>
          <button className="btn-primary" style={{ marginTop: '1rem' }}>
            <span className="material-icons">menu_book</span>
            Read Full Guide
          </button>
        </div>
      ))}

      {/* Article grid */}
      <div style={{ marginTop: '2rem' }}>
        <p className="section-label">All Articles</p>
        <div className="article-grid">
          {ARTICLES.filter(a => !a.featured).map(a => (
            <article key={a.id} className="article-card card animate-in">
              <span className="chip" style={{ fontSize: '0.7rem', marginBottom: '0.75rem', display: 'inline-flex' }}>{a.category}</span>
              <h3 className="article-title">{a.title}</h3>
              <p className="article-desc">{a.desc}</p>
              <div className="article-meta">
                <span><span className="material-icons" style={{ fontSize: '0.85rem', verticalAlign: 'middle' }}>schedule</span> {a.readTime}</span>
                <span><span className="material-icons" style={{ fontSize: '0.85rem', verticalAlign: 'middle' }}>visibility</span> {a.views}</span>
                <a href="#" className="article-link">Read →</a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: '2.5rem' }}>
        <p className="section-label">Frequently Asked Questions</p>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <details key={i} className="faq-item card animate-in">
              <summary className="faq-q">
                <span>{f.q}</span>
                <span className="material-icons faq-arrow">expand_more</span>
              </summary>
              <p className="faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
