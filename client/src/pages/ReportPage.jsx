import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, RefreshCw, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Sparkles, Loader2, AlertCircle, Wand2, Copy,
  Check, FileText, BrainCircuit, PenTool, ExternalLink, Zap
} from 'lucide-react'
import ScoreRing from '../components/ScoreRing'
import { api } from '../services/api'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  return new Date(dateStr).toLocaleDateString()
}

const ScoreBar = ({ label, score, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{score}%</span>
    </div>
    <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${score}%`, background: color || 'var(--accent)', borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
    </div>
  </div>
)

const SuggestionIcon = ({ type }) => {
  if (type === 'error')   return <XCircle size={15} color="#ff5555" />
  if (type === 'warning') return <AlertTriangle size={15} color="#f5a623" />
  return <CheckCircle size={15} color="var(--accent)" />
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: copied ? 'rgba(198,241,53,0.15)' : 'var(--bg-elevated)',
        border: `1px solid ${copied ? 'rgba(198,241,53,0.4)' : 'var(--border)'}`,
        borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: copied ? 'var(--accent)' : 'var(--text-secondary)',
        transition: 'all 0.2s',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ── Rewrite Tab ───────────────────────────────────────────────────────────────
function RewriteTab({ id }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [openSections, setOpenSections] = useState({ experience: true, improvements: true })
  const navigate = useNavigate()

  const toggle = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }))

  const handleRewrite = async () => {
    setStatus('loading')
    setError(null)
    try {
      const res = await api.rewriteResume(id)
      setData(res)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  if (status === 'idle') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: 20, textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
      }}>
        <Wand2 size={32} color="var(--accent)" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-primary)', fontWeight: 400 }}>
        Full AI Resume Rewrite
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', maxWidth: 480, lineHeight: 1.7 }}>
        Gemini will rewrite your entire resume — every bullet point, summary, and project description — 
        with strong action verbs, quantified metrics, and ATS-optimized language.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        {['Quantified metrics', 'Action verbs', 'ATS keywords', 'Impact-focused bullets'].map(f => (
          <span key={f} style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 12px', borderRadius: 99,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
          }}>{f}</span>
        ))}
      </div>
      <button
        className="btn-accent"
        onClick={handleRewrite}
        style={{ marginTop: 12, gap: 10, padding: '12px 28px', fontSize: 14 }}
      >
        <Wand2 size={16} />
        Rewrite with Gemini AI
      </button>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Takes 15–30 seconds · Results are cached for instant retrieval
      </p>
    </div>
  )

  if (status === 'loading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: 16, textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Wand2 size={24} color="var(--accent)" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>Rewriting your resume…</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Gemini is analyzing each section and crafting optimized content
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, width: '100%', maxWidth: 360 }}>
        {['Analyzing all experience bullets…', 'Adding quantified metrics…', 'Optimizing for ATS systems…', 'Polishing summary & skills…'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Loader2 size={12} color="var(--accent)" style={{ animation: `spin 1s linear infinite`, animationDelay: `${i * 0.2}s`, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (status === 'error') return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 20, background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 10 }}>
        <AlertCircle size={16} color="#ff5555" />
        <div>
          <p style={{ fontSize: 13, color: '#ff8080', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>{error}</p>
          <button className="btn-ghost" onClick={handleRewrite} style={{ fontSize: 12, gap: 7 }}>
            <RefreshCw size={13} />Try again
          </button>
        </div>
      </div>
    </div>
  )

  const { contact, rewrite } = data

  const buildFullResumeText = () => {
    const lines = []
    if (contact?.name) lines.push(contact.name)
    if (contact?.email || contact?.phone) lines.push([contact.email, contact.phone, contact.location].filter(Boolean).join(' | '))
    if (contact?.linkedin || contact?.github) lines.push([contact.linkedin, contact.github, contact.website].filter(Boolean).join(' | '))
    lines.push('')
    if (rewrite?.summary) { lines.push('PROFESSIONAL SUMMARY'); lines.push(rewrite.summary); lines.push('') }
    if (rewrite?.experience?.length) {
      lines.push('EXPERIENCE')
      rewrite.experience.forEach(exp => {
        lines.push(`${exp.title} | ${exp.company} | ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`)
        if (exp.location) lines.push(exp.location)
        exp.bullets?.forEach(b => lines.push(`• ${b}`))
        lines.push('')
      })
    }
    if (rewrite?.education?.length) {
      lines.push('EDUCATION')
      rewrite.education.forEach(edu => {
        lines.push(`${edu.degree} | ${edu.institution} | ${edu.graduationDate}`)
        if (edu.gpa) lines.push(`GPA: ${edu.gpa}`)
        edu.highlights?.forEach(h => lines.push(`• ${h}`))
        lines.push('')
      })
    }
    if (rewrite?.skills) {
      lines.push('SKILLS')
      const s = rewrite.skills
      if (s.technical?.length) lines.push(`Technical: ${s.technical.join(', ')}`)
      if (s.languages?.length) lines.push(`Languages: ${s.languages.join(', ')}`)
      if (s.tools?.length) lines.push(`Tools: ${s.tools.join(', ')}`)
      lines.push('')
    }
    if (rewrite?.projects?.length) {
      lines.push('PROJECTS')
      rewrite.projects.forEach(p => {
        lines.push(`${p.name}${p.technologies?.length ? ` | ${p.technologies.join(', ')}` : ''}`)
        if (p.description) lines.push(p.description)
        p.bullets?.forEach(b => lines.push(`• ${b}`))
        lines.push('')
      })
    }
    return lines.join('\n')
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="tag tag-accent"><Sparkles size={10} />AI Rewritten</span>
          {data.cached && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>cached result</span>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <CopyButton text={buildFullResumeText()} />
          <button className="btn-ghost" onClick={handleRewrite} style={{ fontSize: 12, gap: 7 }}>
            <RefreshCw size={13} />Regenerate
          </button>
          <button
            className="btn-accent"
            onClick={() => {
              // Stash the already-fetched rewrite data so Builder reads it instantly
              sessionStorage.setItem(`rewrite_${id}`, JSON.stringify(data))
              navigate(`/builder?from=${id}`)
            }}
            style={{ fontSize: 12, gap: 7 }}
          >
            <PenTool size={13} />Accept & Open in Builder
          </button>
        </div>
      </div>

      {/* Key changes */}
      {rewrite?.keyChanges?.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.2)' }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            <Zap size={10} style={{ display: 'inline', marginRight: 5 }} />Key Improvements Made
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rewrite.keyChanges.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {rewrite?.summary && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Professional Summary</p>
            <CopyButton text={rewrite.summary} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>{rewrite.summary}</p>
        </div>
      )}

      {/* Experience */}
      {rewrite?.experience?.length > 0 && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <button
            onClick={() => toggle('experience')}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, marginBottom: openSections.experience ? 16 : 0 }}
          >
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Experience ({rewrite.experience.length} roles)
            </p>
            {openSections.experience ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
          </button>
          {openSections.experience && rewrite.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < rewrite.experience.length - 1 ? 20 : 0, paddingBottom: i < rewrite.experience.length - 1 ? 20 : 0, borderBottom: i < rewrite.experience.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{exp.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
                </div>
                <CopyButton text={exp.bullets?.join('\n• ') || ''} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {exp.bullets?.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--accent)', flexShrink: 0, marginTop: 7 }} />
                    <span style={{
                      fontSize: 12, fontFamily: 'var(--font-mono)', color: b.includes('≈') ? 'var(--text-secondary)' : 'var(--text-secondary)',
                      lineHeight: 1.7,
                    }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {rewrite?.education?.length > 0 && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <button
            onClick={() => toggle('education')}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, marginBottom: openSections.education ? 16 : 0 }}
          >
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Education</p>
            {openSections.education ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
          </button>
          {openSections.education && rewrite.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: i < rewrite.education.length - 1 ? 16 : 0 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{edu.degree}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
              {edu.highlights?.map((h, hi) => (
                <div key={hi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--accent)', flexShrink: 0, marginTop: 7 }} />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{h}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {rewrite?.skills && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <button
            onClick={() => toggle('skills')}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, marginBottom: openSections.skills ? 14 : 0 }}
          >
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills</p>
            {openSections.skills ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
          </button>
          {openSections.skills && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(rewrite.skills).filter(([, v]) => v?.length).map(([cat, items]) => (
                <div key={cat}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'capitalize', letterSpacing: '0.05em' }}>{cat}: </span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{items.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {rewrite?.projects?.length > 0 && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <button
            onClick={() => toggle('projects')}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, marginBottom: openSections.projects ? 16 : 0 }}
          >
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projects ({rewrite.projects.length})</p>
            {openSections.projects ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
          </button>
          {openSections.projects && rewrite.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: i < rewrite.projects.length - 1 ? 16 : 0, paddingBottom: i < rewrite.projects.length - 1 ? 16 : 0, borderBottom: i < rewrite.projects.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</p>
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'flex' }}><ExternalLink size={12} /></a>}
                </div>
                <CopyButton text={`${p.name}\n${p.description}\n${p.bullets?.join('\n• ')}`} />
              </div>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{p.description}</p>
              {p.technologies?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {p.technologies.map(t => (
                    <span key={t} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 99, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>
                  ))}
                </div>
              )}
              {p.bullets?.map((b, bi) => (
                <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--accent)', flexShrink: 0, marginTop: 7 }} />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Before/After improvements */}
      {rewrite?.improvements?.length > 0 && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <button
            onClick={() => toggle('improvements')}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, marginBottom: openSections.improvements ? 16 : 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="tag tag-accent"><Sparkles size={10} />Before / After Comparisons</span>
            </div>
            {openSections.improvements ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
          </button>
          {openSections.improvements && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rewrite.improvements.map((imp, i) => (
                <div key={i}>
                  <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{imp.section}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: 14, background: 'rgba(255,85,85,0.04)', border: '1px solid rgba(255,85,85,0.12)', borderRadius: 8 }}>
                      <p style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#ff5555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Before</p>
                      <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{imp.before}</p>
                    </div>
                    <div style={{ padding: 14, background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.15)', borderRadius: 8 }}>
                      <p style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>After</p>
                      <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1.6 }}>{imp.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: 8 }}>
        ≈ marks denote estimated metrics added by AI. Verify before submitting.
      </p>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Main Report Page ──────────────────────────────────────────────────────────
export default function ReportPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [diffOpen, setDiffOpen] = useState(false)
  const [tab, setTab] = useState('analysis') // 'analysis' | 'rewrite'

  useEffect(() => {
    fetchReport()
  }, [id])

  async function fetchReport() {
    try {
      setLoading(true)
      const data = await api.getReport(id)
      setReport(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>Loading analysis report…</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ padding: '36px 40px', flex: 1 }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--font-mono)' }}>
        <ArrowLeft size={14} />Back to dashboard
      </Link>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 20, background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 10 }}>
        <AlertCircle size={16} color="#ff5555" />
        <p style={{ fontSize: 13, color: '#ff8080', fontFamily: 'var(--font-mono)' }}>{error}</p>
      </div>
    </div>
  )

  const r = report

  return (
    <div style={{ flex: 1 }}>
      {/* Top header area */}
      <div style={{ padding: '36px 40px 0' }}>
        <Link to="/" className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
          marginBottom: 24, fontFamily: 'var(--font-mono)', transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={14} />Back to dashboard
        </Link>

        {/* Title row */}
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="tag tag-accent"><Sparkles size={10} />Analysis Complete</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4 }}>
              {r.name}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {r.file} · {timeAgo(r.analyzedAt)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={fetchReport} style={{ fontSize: 12, gap: 7 }}>
              <RefreshCw size={13} />Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
          {[
            { key: 'analysis', label: 'Analysis', icon: BrainCircuit },
            { key: 'rewrite', label: 'AI Rewrite', icon: Wand2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 13,
                color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${tab === key ? 'var(--accent)' : 'transparent'}`,
                transition: 'all 0.2s',
                marginBottom: -1,
              }}
            >
              <Icon size={14} color={tab === key ? 'var(--accent)' : 'var(--text-muted)'} />
              {label}
              {key === 'rewrite' && (
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 99,
                  background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.3)',
                  color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                }}>NEW</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'analysis' && (
        <div style={{ padding: '28px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 20 }}>
            {/* Left: Score + Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Main Score */}
              <div className="card animate-fade-up delay-100" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <ScoreRing score={r.overallScore} size={160} strokeWidth={10} label="Overall Score" />
                <div style={{ width: '100%' }}>
                  <ScoreBar label="ATS Compatibility"  score={r.atsScore}         color="var(--accent)" />
                  <ScoreBar label="Keyword Match"       score={r.keywordScore}     color="#f5a623" />
                  <ScoreBar label="Readability"         score={r.readabilityScore} color="#60a5fa" />
                </div>
              </div>

              {/* Sections Detected */}
              <div className="card animate-fade-up delay-200" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Sections Detected
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(r.sections || {}).map(([section, found]) => (
                    <div key={section} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 99, flexShrink: 0, background: found ? 'var(--accent)' : '#ff5555' }} />
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: found ? 'var(--text-secondary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick CTA */}
              <button
                className="btn-accent animate-fade-up delay-300"
                onClick={() => setTab('rewrite')}
                style={{ width: '100%', justifyContent: 'center', gap: 10, padding: '14px', fontSize: 13 }}
              >
                <Wand2 size={15} />
                Fix my entire resume with AI
              </button>
            </div>

            {/* Right: Keywords + Suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Keywords */}
              <div className="card animate-fade-up delay-200" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Keyword Analysis
                </p>
                {r.keywords?.matched?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                      ✓ Matched ({r.keywords.matched.length})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {r.keywords.matched.map(kw => (
                        <span key={kw} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '3px 9px', background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.25)', color: 'var(--accent)', borderRadius: 99 }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {r.keywords?.missing?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, color: '#ff5555', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                      ✗ Missing ({r.keywords.missing.length})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {r.keywords.missing.map(kw => (
                        <span key={kw} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '3px 9px', background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)', color: '#ff8080', borderRadius: 99 }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="card animate-fade-up delay-300" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  AI Suggestions ({(r.suggestions || []).length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(r.suggestions || []).map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${s.type === 'error' ? 'rgba(255,85,85,0.15)' : s.type === 'warning' ? 'rgba(245,166,35,0.15)' : 'rgba(198,241,53,0.12)'}`,
                      borderRadius: 8,
                    }}>
                      <div style={{ flexShrink: 0, marginTop: 1 }}><SuggestionIcon type={s.type} /></div>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Rewrite Diff Viewer (legacy single section) */}
          {r.improvements?.before && (
            <div className="card animate-fade-up delay-400" style={{ padding: '20px 22px', marginBottom: 20 }}>
              <button
                onClick={() => setDiffOpen(!diffOpen)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="tag tag-accent"><Sparkles size={10} />Quick AI Rewrite Preview</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    one example improvement
                  </span>
                </div>
                {diffOpen ? <ChevronUp size={15} color="var(--text-secondary)" /> : <ChevronDown size={15} color="var(--text-secondary)" />}
              </button>

              {diffOpen && (
                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#ff5555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Before</p>
                    <div style={{ padding: 16, background: 'rgba(255,85,85,0.04)', border: '1px solid rgba(255,85,85,0.12)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {r.improvements.before}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>After (AI Rewrite)</p>
                    <div style={{ padding: 16, background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.15)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                      {r.improvements.after}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA to full rewrite */}
          <div className="animate-fade-up delay-400" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(198,241,53,0.2)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>Want a fully rewritten resume?</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Gemini will rewrite every bullet, summary, and project with metrics and strong action verbs.
              </p>
            </div>
            <button className="btn-accent" onClick={() => setTab('rewrite')} style={{ flexShrink: 0, gap: 8, fontSize: 13 }}>
              <Wand2 size={14} />Full AI Rewrite
            </button>
          </div>
        </div>
      )}

      {tab === 'rewrite' && <RewriteTab id={id} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
