import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, FileBarChart2, Upload, Loader2, AlertCircle, FileText } from 'lucide-react'
import ScoreRing from '../components/ScoreRing'
import { api } from '../services/api'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2)  return 'Just now'
  if (mins < 60) return `${mins} minutes ago`
  if (hrs  < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function ReportsPage() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchResumes()
  }, [])

  async function fetchResumes() {
    try {
      setLoading(true)
      const { resumes: list } = await api.listResumes()
      setResumes(list || [])
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + r.score, 0) / resumes.length)
    : 0
  const passRate = resumes.length
    ? Math.round(resumes.filter(r => r.atsPass).length / resumes.length * 100)
    : 0

  const stats = [
    { label: 'Average Score', value: resumes.length ? `${avgScore}%` : '—' },
    { label: 'ATS Pass Rate', value: resumes.length ? `${passRate}%` : '—' },
    { label: 'Total Resumes', value: resumes.length },
  ]

  return (
    <div style={{ padding: '36px 40px', flex: 1 }}>
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="tag"><FileBarChart2 size={10} />All Reports</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 6 }}>
            Analysis History
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} analyzed in total.
          </p>
        </div>
        <Link to="/analyze" className="btn-accent" style={{ gap: 8 }}>
          <Upload size={14} />
          New Analysis
        </Link>
      </div>

      {/* Summary bar */}
      <div className="animate-fade-up delay-100" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32,
      }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12, color: 'var(--text-muted)' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading reports…</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px', background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 10 }}>
          <AlertCircle size={16} color="#ff5555" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#ff8080', fontFamily: 'var(--font-mono)' }}>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && resumes.length === 0 && (
        <div className="card animate-fade-up delay-200" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={20} color="var(--text-muted)" />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>No resume reports found</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Go to the <Link to="/analyze" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Analyze page</Link> to upload and analyze your resume.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && resumes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {resumes.map((resume, i) => (
            <Link
              key={resume.id}
              to={`/report/${resume.id}`}
              className="card animate-fade-up"
              style={{
                padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: 20,
                textDecoration: 'none',
                animationDelay: `${0.2 + i * 0.07}s`,
              }}
            >
              <ScoreRing score={resume.score} size={60} strokeWidth={5} label="" animate={false} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
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

              <div style={{ display: 'flex', gap: 28 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>{resume.keywords}%</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Keywords</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: resume.improvements > 5 ? '#f5a623' : 'var(--text-primary)' }}>{resume.improvements}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Fixes</p>
                </div>
              </div>

              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

