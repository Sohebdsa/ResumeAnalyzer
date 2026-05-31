import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, TrendingUp, Clock, BarChart2, ChevronRight, Sparkles, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react'
import ScoreRing from '../components/ScoreRing'
import { api } from '../services/api'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2)  return 'Just now'
  if (mins < 60) return `${mins} minutes ago`
  if (hrs  < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function Dashboard() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    fetchResumes()
  }, [])

  async function fetchResumes() {
    try {
      setLoading(true)
      const { resumes } = await api.listResumes()
      setResumes(resumes)
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + r.score, 0) / resumes.length)
    : 0
  const passCount = resumes.filter(r => r.atsPass).length

  const statCards = [
    { label: 'Resumes Analyzed',  value: resumes.length || '—', icon: FileText,   sub: 'Total in database' },
    { label: 'Avg ATS Score',     value: resumes.length ? `${avgScore}%` : '—', icon: BarChart2,  sub: 'Across all resumes' },
    { label: 'ATS Pass Rate',     value: resumes.length ? `${Math.round(passCount / resumes.length * 100)}%` : '—', icon: TrendingUp, sub: `${passCount} of ${resumes.length} pass` },
    { label: 'Last Analysis',     value: resumes.length ? timeAgo(resumes[0].uploadedAt) : '—', icon: Clock, sub: resumes[0]?.file || 'No analyses yet' },
  ]

  return (
    <div style={{ padding: '36px 40px', flex: 1 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="tag tag-accent"><Sparkles size={10} />AI-Powered</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 6 }}>
          Your Resume Intelligence
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Analyze, score, and optimize your resumes for every job application.
        </p>
      </div>

      {/* Quick Upload CTA */}
      <div className="animate-fade-up delay-100" style={{ marginBottom: 36 }}>
        <Link to="/analyze" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(198,241,53,0.25)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          transition: 'all 0.22s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(198,241,53,0.1)'; e.currentTarget.style.borderColor = 'rgba(198,241,53,0.45)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderColor = 'rgba(198,241,53,0.25)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} color="#0a0a0b" />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                Analyze a new resume
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Drop a PDF or DOCX — get your ATS score in seconds
              </p>
            </div>
          </div>
          <ArrowUpRight size={18} color="var(--accent)" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="animate-fade-up delay-200" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {statCards.map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{stat.label}</span>
              <div style={{ width: 28, height: 28, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={13} color="var(--text-secondary)" strokeWidth={1.8} />
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>{stat.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Resume List */}
      <div className="animate-fade-up delay-300">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Recent Analyses
          </h2>
          <Link to="/reports" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: 'var(--text-muted)' }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading from database…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px', background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 10 }}>
            <AlertCircle size={16} color="#ff5555" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#ff8080', fontFamily: 'var(--font-mono)' }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && resumes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={20} color="var(--text-muted)" />
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>No resumes analyzed yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <Link to="/analyze" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Upload your first resume</Link> to get started.
            </p>
          </div>
        )}

        {/* Resume Cards */}
        {!loading && !error && resumes.slice(0, 5).map((resume, i) => (
          <Link
            key={resume.id}
            to={`/report/${resume.id}`}
            className="card animate-fade-up"
            style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20,
              textDecoration: 'none', marginBottom: 10,
              animationDelay: `${0.3 + i * 0.08}s`,
            }}
            onMouseEnter={() => setHoveredCard(resume.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <ScoreRing score={resume.score} size={64} strokeWidth={5} label="" animate={false} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)' }}>{resume.name}</p>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 99,
                  background: resume.atsPass ? 'rgba(198,241,53,0.12)' : 'rgba(255,85,85,0.1)',
                  border: `1px solid ${resume.atsPass ? 'rgba(198,241,53,0.3)' : 'rgba(255,85,85,0.25)'}`,
                  color: resume.atsPass ? 'var(--accent)' : '#ff5555',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {resume.atsPass ? 'ATS Pass' : 'ATS Fail'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {resume.file} · {timeAgo(resume.uploadedAt)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>{resume.keywords}%</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Keywords</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: resume.improvements > 5 ? '#f5a623' : 'var(--text-primary)' }}>{resume.improvements}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Fixes</p>
              </div>
            </div>
            <ChevronRight size={16} color={hoveredCard === resume.id ? 'var(--accent)' : 'var(--text-muted)'} style={{ transition: 'color 0.2s' }} />
          </Link>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
