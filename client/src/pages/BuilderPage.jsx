import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  PenTool, Eye, CheckCircle, Download, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Plus, Trash2, RefreshCw, Wand2,
  FileText, ArrowLeft, Sparkles, ExternalLink
} from 'lucide-react'
import { api } from '../services/api'

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'modern', name: 'Modern', accent: '#c6f135', bg: '#0a0a0b', text: '#e8e8e8', desc: 'Clean dark layout with lime accents. Great for tech roles.' },
  { id: 'classic', name: 'Classic / ATS', accent: '#2563eb', bg: '#ffffff', text: '#1a1a1a', desc: 'Single-column, white background. Maximum ATS compatibility.' },
  { id: 'minimal', name: 'Minimal', accent: '#6366f1', bg: '#fafaf9', text: '#1c1917', desc: 'Ultra-clean with generous white space. Ideal for senior positions.' },
  { id: 'warm', name: 'Warm Professional', accent: '#d97706', bg: '#fffbeb', text: '#1c1917', desc: 'Warm tones. Perfect for creative or business roles.' },
  { id: 'dark', name: 'Dark Executive', accent: '#818cf8', bg: '#0f172a', text: '#e2e8f0', desc: 'Deep navy with indigo accents. Sophisticated and striking.' },
]

// ── Generate printable HTML for the resume ────────────────────────────────────
function buildResumeHTML(data, templateId) {
  const t = TEMPLATES.find(x => x.id === templateId) || TEMPLATES[0]
  const { contact, summary, experience, education, skills, projects, certifications } = data

  const skillsList = [
    ...(skills?.technical || []),
    ...(skills?.languages || []),
    ...(skills?.tools || []),
  ].filter(Boolean)

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100vw; height: 100vh;
      overflow: hidden;
      background: #e0e0e0;
      display: flex; align-items: flex-start; justify-content: center;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      padding: 5px 0;
    }
    .page {
      width: 210mm;
      max-height: calc(100vh - 30px);
      background: ${t.bg}; color: ${t.text};
      font-size: 8pt; line-height: 1.45;
      padding: 5mm 16mm 12mm;
      overflow-y: auto; overflow-x: hidden;
      border: 2px solid ${t.accent};
      box-shadow: 0 0 0 5px ${t.accent}18, 0 10px 40px rgba(0,0,0,0.2);
      scrollbar-width: thin;
      scrollbar-color: ${t.accent}44 transparent;
    }
    .page::-webkit-scrollbar { width: 5px; }
    .page::-webkit-scrollbar-track { background: transparent; }
    .page::-webkit-scrollbar-thumb { background: ${t.accent}66; border-radius: 99px; }
    @media print {
      html, body { background: transparent; width: auto; height: auto; display: block; overflow: visible; padding: 0; }
      .page { border: 1.5pt solid ${t.accent}; box-shadow: none; width: 100%; max-height: none; padding: 5mm 14mm 12mm; overflow: visible; }
    }
    h1 { font-size: 16pt; font-weight: 700; letter-spacing: -0.3px; color: ${t.text}; margin-bottom: 2px; text-align: center; }
    .contact-block { text-align: center; margin-bottom: 7px; }
    .contact-line { font-size: 7.5pt; color: ${t.text}; opacity: 0.6; }
    .contact-sep { opacity: 0.3; margin: 0 4px; }
    .accent { color: ${t.accent}; }
    .divider { border: none; border-top: 1px solid ${t.accent}44; margin: 5px 0; }
    .section-title { font-size: 6.5pt; text-transform: uppercase; letter-spacing: 2.5px; color: ${t.accent}; font-weight: 700; margin: 9px 0 3px; border-bottom: 1px solid ${t.accent}; padding-bottom: 2px; }
    .role-title { font-size: 8.5pt; font-weight: 600; color: ${t.text}; }
    .role-meta { font-size: 7.5pt; opacity: 0.58; margin-bottom: 2px; }
    ul { padding-left: 12px; margin-top: 1px; }
    li { margin-bottom: 1px; font-size: 7.5pt; line-height: 1.38; }
    .exp-block { margin-bottom: 7px; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px; }
    .skill-pill { background: ${t.accent}20; border: 1px solid ${t.accent}3a; color: ${t.text}; padding: 1px 6px; border-radius: 99px; font-size: 7pt; }
    .project-block { margin-bottom: 7px; }
    .project-name { font-weight: 600; font-size: 8.5pt; }
    .tech-tag { display: inline-block; background: ${t.accent}18; color: ${t.accent}; padding: 1px 4px; border-radius: 3px; font-size: 7pt; margin-right: 2px; }
    .summary { font-size: 8pt; line-height: 1.6; opacity: 0.78; margin-top: 2px; }
    .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
    .edu-block { margin-bottom: 5px; }
  `

  const expHtml = (experience || []).map(exp => `
    <div style="margin-bottom: 14px;">
      <div class="role-title">${exp.title || ''}</div>
      <div class="role-meta">${exp.company || ''}${exp.location ? ` · ${exp.location}` : ''} &nbsp;|&nbsp; ${exp.startDate || ''} – ${exp.current ? 'Present' : (exp.endDate || '')}</div>
      <ul>${(exp.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  `).join('')

  const eduHtml = (education || []).map(edu => `
    <div style="margin-bottom: 10px;">
      <div class="edu-row">
        <span class="role-title">${edu.degree || ''}</span>
        <span style="font-size:9pt;opacity:0.7;">${edu.graduationDate || ''}</span>
      </div>
      <div class="role-meta">${edu.institution || ''}${edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
      ${(edu.highlights || []).map(h => `<div style="font-size:9pt;opacity:0.75;">• ${h}</div>`).join('')}
    </div>
  `).join('')

  const projHtml = (projects || []).map(p => `
    <div style="margin-bottom: 12px;">
      <span class="project-name">${p.name || ''}</span>
      ${p.url ? ` &nbsp;<a href="${p.url}" style="color:${t.accent};font-size:9pt;">${p.url}</a>` : ''}
      <div style="margin: 3px 0;">${(p.technologies || []).map(t2 => `<span class="tech-tag">${t2}</span>`).join('')}</div>
      <div style="font-size:9.5pt;opacity:0.85;margin-bottom:4px;">${p.description || ''}</div>
      <ul>${(p.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  `).join('')

  const certHtml = (certifications || []).map(c => `
    <div style="font-size:9.5pt;margin-bottom:4px;"><strong>${c.name}</strong> — ${c.issuer}${c.date ? `, ${c.date}` : ''}</div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${contact?.name || 'Resume'}</title>
<style>${css}</style>
</head>
<body>
  <div class="page">
    <h1>${contact?.name || 'Your Name'}</h1>
    <div class="contact-block">
      <span class="contact-line">${[contact?.email, contact?.phone, contact?.location].filter(Boolean).join('<span class="contact-sep">·</span>')}</span>
      ${[contact?.linkedin, contact?.github, contact?.website].filter(Boolean).length ? `<br/><span class="contact-line accent">${[contact?.linkedin, contact?.github, contact?.website].filter(Boolean).join('<span class="contact-sep">·</span>')}</span>` : ''}
    </div>

    ${summary ? `<div class="section-title">Professional Summary</div><p class="summary">${summary}</p>` : ''}
    ${expHtml ? `<div class="section-title">Experience</div>${expHtml}` : ''}
    ${skillsList.length ? `<div class="section-title">Skills</div><div class="skills-grid">${skillsList.map(s => `<span class="skill-pill">${s}</span>`).join('')}</div>` : ''}
    ${projHtml ? `<div class="section-title">Projects</div>${projHtml}` : ''}
    ${eduHtml ? `<div class="section-title">Education</div>${eduHtml}` : ''}
    ${certHtml ? `<div class="section-title">Certifications</div>${certHtml}` : ''}
  </div>
</body>
</html>`
}


// ── Editable bullet list ───────────────────────────────────────────────────────
function BulletList({ bullets, onChange }) {
  const add = () => onChange([...bullets, ''])
  const update = (i, v) => { const n = [...bullets]; n[i] = v; onChange(n) }
  const remove = (i) => onChange(bullets.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <div style={{ paddingTop: 9, color: 'var(--accent)', fontSize: 14, flexShrink: 0 }}>•</div>
          <input
            className="input-base"
            value={b}
            onChange={e => update(i, e.target.value)}
            style={{ fontSize: 12, padding: '7px 10px', flex: 1, fontFamily: 'var(--font-mono)' }}
          />
          <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', transition: 'color 0.2s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff5555'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed var(--border)', borderRadius: 6, cursor: 'pointer', padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <Plus size={12} /> Add bullet
      </button>
    </div>
  )
}

// ── Section accordion ─────────────────────────────────────────────────────────
function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 18px' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {open ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
      </button>
      {open && <div style={{ padding: '0 18px 18px' }}>{children}</div>}
    </div>
  )
}

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({ t, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(t.id)}
      style={{
        cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(198,241,53,0.5)' : 'var(--border)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        background: selected ? 'rgba(198,241,53,0.04)' : 'var(--bg-surface)',
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {/* Mini preview */}
      <div style={{ padding: 10, background: t.bg, aspectRatio: '3/2' }}>
        <div style={{ height: 8, background: t.accent, borderRadius: 3, width: '60%', marginBottom: 4 }} />
        <div style={{ height: 4, background: `${t.text}33`, borderRadius: 3, width: '40%', marginBottom: 8 }} />
        {[70, 85, 55, 75, 50].map((w, i) => (
          <div key={i} style={{ height: 3, background: `${t.text}22`, borderRadius: 3, width: `${w}%`, marginBottom: 3 }} />
        ))}
        <div style={{ height: 4, background: t.accent, opacity: 0.5, borderRadius: 3, width: '30%', margin: '6px 0 3px' }} />
        {[80, 60].map((w, i) => (
          <div key={i} style={{ height: 3, background: `${t.text}22`, borderRadius: 3, width: `${w}%`, marginBottom: 3 }} />
        ))}
      </div>
      <div style={{ padding: '10px 12px', borderTop: `1px solid ${selected ? 'rgba(198,241,53,0.2)' : 'var(--border)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)' }}>{t.name}</span>
          {selected && <CheckCircle size={13} color="var(--accent)" />}
        </div>
        <div style={{ width: 20, height: 3, borderRadius: 99, background: t.accent, marginBottom: 4 }} />
      </div>
    </div>
  )
}

// ── Main Builder Page ─────────────────────────────────────────────────────────
export default function BuilderPage() {
  const [searchParams] = useSearchParams()
  const fromId = searchParams.get('from')

  const [template, setTemplate] = useState('modern')
  const [loadState, setLoadState] = useState('idle') // idle | loading | error | ready
  const [loadError, setLoadError] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const previewRef = useRef(null)

  // Resume data state
  const [resumeData, setResumeData] = useState({
    contact: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], languages: [], tools: [], soft: [] },
    projects: [],
    certifications: [],
  })

  // Load resume data on mount
  useEffect(() => {
    if (fromId) {
      loadFromRewrite(fromId)
    } else {
      loadLatest()
    }
  }, [fromId])

  async function loadFromRewrite(id) {
    setLoadState('loading')
    try {
      // Check if RewriteTab already pre-fetched the data and stashed it
      const cached = sessionStorage.getItem(`rewrite_${id}`)
      if (cached) {
        sessionStorage.removeItem(`rewrite_${id}`) // consume it
        const { contact, rewrite } = JSON.parse(cached)
        setResumeData({
          contact: contact || {},
          summary: rewrite.summary || '',
          experience: rewrite.experience || [],
          education: rewrite.education || [],
          skills: rewrite.skills || { technical: [], languages: [], tools: [], soft: [] },
          projects: rewrite.projects || [],
          certifications: rewrite.certifications || [],
        })
        setLoadState('ready')
        return
      }
      // Fallback: fetch from API (e.g. direct URL navigation)
      const { contact, rewrite } = await api.rewriteResume(id)
      setResumeData({
        contact: contact || {},
        summary: rewrite.summary || '',
        experience: rewrite.experience || [],
        education: rewrite.education || [],
        skills: rewrite.skills || { technical: [], languages: [], tools: [], soft: [] },
        projects: rewrite.projects || [],
        certifications: rewrite.certifications || [],
      })
      setLoadState('ready')
    } catch (err) {
      setLoadError(err.message)
      setLoadState('error')
    }
  }

  async function loadLatest() {
    setLoadState('loading')
    try {
      const { resumes } = await api.listResumes()
      if (!resumes || resumes.length === 0) {
        setLoadState('empty')
        return
      }
      const latest = resumes[0]
      // Get report first to get extractedData
      const report = await api.getReport(latest.id)
      const extracted = report.extractedData || {}
      setResumeData({
        contact: extracted.contact || {},
        summary: extracted.summary || '',
        experience: extracted.experience || [],
        education: extracted.education || [],
        skills: extracted.skills || { technical: [], languages: [], tools: [], soft: [] },
        projects: extracted.projects || [],
        certifications: extracted.certifications || [],
      })
      setLoadState('ready')
    } catch (err) {
      setLoadError(err.message)
      setLoadState('error')
    }
  }

  const set = (path, value) => {
    setResumeData(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const setContact = (field, value) => set(`contact.${field}`, value)
  const setExperience = (idx, field, value) => {
    const exp = [...resumeData.experience]
    exp[idx] = { ...exp[idx], [field]: value }
    set('experience', exp)
  }
  const setEducation = (idx, field, value) => {
    const edu = [...resumeData.education]
    edu[idx] = { ...edu[idx], [field]: value }
    set('education', edu)
  }
  const setProject = (idx, field, value) => {
    const proj = [...resumeData.projects]
    proj[idx] = { ...proj[idx], [field]: value }
    set('projects', proj)
  }

  const handleExport = () => {
    const html = buildResumeHTML(resumeData, template)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resumeData.contact?.name?.replace(/\s+/g, '_') || 'resume'}_${template}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePreview = () => {
    const html = buildResumeHTML(resumeData, template)
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
  }

  // ── Empty / error states ──────────────────────────────────────────────────
  if (loadState === 'empty') return (
    <div style={{ padding: '36px 40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FileText size={24} color="var(--text-muted)" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)', fontWeight: 400 }}>No analyzed resumes yet</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', maxWidth: 400, lineHeight: 1.7 }}>
        Upload and analyze a resume first. The builder will auto-populate from your latest analysis.
      </p>
      <Link to="/analyze" className="btn-accent" style={{ gap: 8, marginTop: 8 }}>
        <Sparkles size={14} />Analyze a resume
      </Link>
    </div>
  )

  if (loadState === 'error') return (
    <div style={{ padding: '36px 40px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 20, background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 10 }}>
        <AlertCircle size={16} color="#ff5555" />
        <div>
          <p style={{ fontSize: 13, color: '#ff8080', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>{loadError}</p>
          <button className="btn-ghost" onClick={loadLatest} style={{ fontSize: 12, gap: 7 }}>
            <RefreshCw size={13} />Retry
          </button>
        </div>
      </div>
    </div>
  )

  if (loadState === 'loading') return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--text-muted)' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent)" />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {fromId ? 'Loading AI-rewritten data…' : 'Loading your resume data…'}
      </span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // ── Main builder UI ───────────────────────────────────────────────────────
  return (
    <div style={{ padding: '36px 40px', flex: 1 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="tag"><PenTool size={10} />Resume Builder</span>
            {fromId && <span className="tag tag-accent"><Wand2 size={10} />AI Rewritten</span>}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4 }}>
            Build your resume
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {fromId ? 'Editing AI-rewritten resume. Make any final changes before exporting.' : 'Pre-filled from your latest analysis. Edit and export when ready.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={handlePreview} style={{ fontSize: 13, gap: 8 }}>
            <Eye size={14} />Preview
          </button>
          <button className="btn-accent" onClick={handleExport} style={{ fontSize: 13, gap: 8 }}>
            <Download size={14} />Export HTML
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left: Template picker */}
        <div style={{ position: 'sticky', top: 24 }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Template
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TEMPLATES.map(t => (
              <TemplateCard key={t.id} t={t} selected={template === t.id} onSelect={setTemplate} />
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
              Click <strong style={{ color: 'var(--text-secondary)' }}>Preview</strong> to see how the resume looks, then <strong style={{ color: 'var(--text-secondary)' }}>Export HTML</strong> to download. Open the file in any browser and use <kbd style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontSize: 10 }}>Ctrl+P</kbd> → Save as PDF.
            </p>
          </div>
        </div>

        {/* Right: Editable sections */}
        <div>
          {/* Contact */}
          <Section title="Contact Information" defaultOpen>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { field: 'name', label: 'Full Name' },
                { field: 'email', label: 'Email' },
                { field: 'phone', label: 'Phone' },
                { field: 'location', label: 'Location' },
                { field: 'linkedin', label: 'LinkedIn URL' },
                { field: 'github', label: 'GitHub URL' },
                { field: 'website', label: 'Website' },
              ].map(({ field, label }) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                  <input
                    className="input-base"
                    value={resumeData.contact?.[field] || ''}
                    onChange={e => setContact(field, e.target.value)}
                    style={{ fontSize: 12, padding: '8px 10px' }}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Summary */}
          <Section title="Professional Summary" defaultOpen>
            <textarea
              className="input-base"
              rows={4}
              value={resumeData.summary || ''}
              onChange={e => set('summary', e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7 }}
            />
          </Section>

          {/* Experience */}
          <Section title={`Experience (${resumeData.experience?.length || 0} roles)`} defaultOpen>
            {(resumeData.experience || []).map((exp, i) => (
              <div key={i} style={{
                marginBottom: 20, paddingBottom: 20,
                borderBottom: i < resumeData.experience.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>Role {i + 1}</span>
                  <button
                    onClick={() => set('experience', resumeData.experience.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  ><Trash2 size={13} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[
                    { field: 'title', label: 'Job Title' },
                    { field: 'company', label: 'Company' },
                    { field: 'location', label: 'Location' },
                    { field: 'startDate', label: 'Start Date' },
                    { field: 'endDate', label: 'End Date' },
                  ].map(({ field, label }) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                      <input
                        className="input-base"
                        value={exp[field] || ''}
                        onChange={e => setExperience(i, field, e.target.value)}
                        style={{ fontSize: 12, padding: '7px 10px' }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={!!exp.current} onChange={e => setExperience(i, 'current', e.target.checked)} />
                      Current role
                    </label>
                  </div>
                </div>
                <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Bullets</label>
                <BulletList bullets={exp.bullets || []} onChange={v => setExperience(i, 'bullets', v)} />
              </div>
            ))}
            <button
              onClick={() => set('experience', [...(resumeData.experience || []), { title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }])}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, cursor: 'pointer', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={14} />Add role
            </button>
          </Section>

          {/* Skills */}
          <Section title="Skills">
            {['technical', 'languages', 'tools', 'soft'].map(cat => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'capitalize', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>{cat}</label>
                <input
                  className="input-base"
                  placeholder={`Comma-separated (e.g. React, TypeScript, Node.js)`}
                  value={(resumeData.skills?.[cat] || []).join(', ')}
                  onChange={e => set(`skills.${cat}`, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  style={{ fontSize: 12, padding: '8px 10px', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            ))}
          </Section>

          {/* Projects */}
          <Section title={`Projects (${resumeData.projects?.length || 0})`}>
            {(resumeData.projects || []).map((p, i) => (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < resumeData.projects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>Project {i + 1}</span>
                  <button onClick={() => set('projects', resumeData.projects.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[{ field: 'name', label: 'Project Name' }, { field: 'url', label: 'URL (optional)' }].map(({ field, label }) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                      <input className="input-base" value={p[field] || ''} onChange={e => setProject(i, field, e.target.value)} style={{ fontSize: 12, padding: '7px 10px' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                  <textarea className="input-base" rows={2} value={p.description || ''} onChange={e => setProject(i, 'description', e.target.value)} style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technologies (comma-separated)</label>
                  <input className="input-base" value={(p.technologies || []).join(', ')} onChange={e => setProject(i, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} style={{ fontSize: 12, padding: '7px 10px', fontFamily: 'var(--font-mono)' }} />
                </div>
                <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Bullets</label>
                <BulletList bullets={p.bullets || []} onChange={v => setProject(i, 'bullets', v)} />
              </div>
            ))}
            <button
              onClick={() => set('projects', [...(resumeData.projects || []), { name: '', description: '', technologies: [], url: '', bullets: [''] }])}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, cursor: 'pointer', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={14} />Add project
            </button>
          </Section>

          {/* Education */}
          <Section title={`Education (${resumeData.education?.length || 0})`}>
            {(resumeData.education || []).map((edu, i) => (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < resumeData.education.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>Degree {i + 1}</span>
                  <button onClick={() => set('education', resumeData.education.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { field: 'degree', label: 'Degree' },
                    { field: 'institution', label: 'Institution' },
                    { field: 'graduationDate', label: 'Graduation Date' },
                    { field: 'gpa', label: 'GPA (optional)' },
                  ].map(({ field, label }) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                      <input className="input-base" value={edu[field] || ''} onChange={e => setEducation(i, field, e.target.value)} style={{ fontSize: 12, padding: '7px 10px' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => set('education', [...(resumeData.education || []), { degree: '', institution: '', graduationDate: '', gpa: '' }])}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, cursor: 'pointer', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={14} />Add education
            </button>
          </Section>

          {/* Export CTA */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button className="btn-ghost" onClick={handlePreview} style={{ flex: 1, justifyContent: 'center', gap: 8, fontSize: 13 }}>
              <Eye size={14} />Preview in new tab
            </button>
            <button className="btn-accent" onClick={handleExport} style={{ flex: 1, justifyContent: 'center', gap: 8, fontSize: 13 }}>
              <Download size={14} />Export as HTML
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: 10 }}>
            Open the exported file in any browser → <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontSize: 10 }}>Ctrl+P</kbd> → Save as PDF
          </p>
        </div>
      </div>
    </div>
  )
}
