import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, BrainCircuit, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'
import FileDropzone from '../components/FileDropzone'
import { api } from '../services/api'

const jobDescExample = `Paste the job description here for accurate keyword matching...

Example:
We're looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js...`

const PIPELINE_STEPS = [
  'Uploading file to server…',
  'Extracting text from document…',
  'Parsing resume structure with Gemini Flash…',
  'Running ATS analysis with Gemini Pro…',
  'Scoring keyword alignment…',
  'Generating improvement suggestions…',
  'Saving results to database…',
]

export default function AnalyzePage() {
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [showJobDesc, setShowJobDesc] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)
  const [resumeId, setResumeId] = useState(null)
  const pollRef = useRef(null)
  const navigate = useNavigate()

  // Poll status after upload
  useEffect(() => {
    if (!resumeId) return

    pollRef.current = setInterval(async () => {
      try {
        const { status, errorMessage } = await api.pollStatus(resumeId)

        if (status === 'parsing') setStep(2)
        if (status === 'analyzing') setStep(4)
        if (status === 'done') {
          clearInterval(pollRef.current)
          setStep(PIPELINE_STEPS.length)
          setTimeout(() => navigate(`/report/${resumeId}`), 600)
        }
        if (status === 'error') {
          clearInterval(pollRef.current)
          setAnalyzing(false)
          setError(errorMessage || 'Analysis failed. Please try again.')
        }
      } catch (err) {
        // Network error during polling — keep retrying
      }
    }, 2000)

    return () => clearInterval(pollRef.current)
  }, [resumeId, navigate])

  const handleAnalyze = async () => {
    if (!file) return
    setError(null)
    setAnalyzing(true)
    setStep(0)

    try {
      setStep(1)
      const { resumeId: id } = await api.uploadResume(file, jobTitle, jobDesc)
      setResumeId(id)
      setStep(2)
    } catch (err) {
      setAnalyzing(false)
      setError(err.message || 'Upload failed. Is the server running?')
    }
  }

  const completedSteps = step
  const currentLabel = PIPELINE_STEPS[Math.min(step, PIPELINE_STEPS.length - 1)]

  return (
    <div style={{ padding: '36px 40px', flex: 1, maxWidth: 780, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="tag tag-accent"><Sparkles size={10} />New Analysis</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 6 }}>
          Analyze your resume
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Upload your resume and get a detailed ATS score, keyword analysis, and AI-powered improvement suggestions.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="animate-fade-up" style={{
          marginBottom: 20, padding: '12px 16px',
          background: 'rgba(255,85,85,0.08)',
          border: '1px solid rgba(255,85,85,0.25)',
          borderRadius: 8,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <XCircle size={15} color="#ff5555" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#ff8080', fontFamily: 'var(--font-mono)' }}>{error}</p>
        </div>
      )}

      {/* Drop Zone */}
      <div className="animate-fade-up delay-100" style={{ marginBottom: 20, opacity: analyzing ? 0.5 : 1, pointerEvents: analyzing ? 'none' : 'auto' }}>
        <FileDropzone onFileAccepted={setFile} />
      </div>

      {/* Job Title */}
      <div className="animate-fade-up delay-150" style={{ marginBottom: 12, opacity: analyzing ? 0.5 : 1, pointerEvents: analyzing ? 'none' : 'auto' }}>
        <input
          className="input-base"
          placeholder="Job title (optional, e.g. Senior Software Engineer)"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
        />
      </div>

      {/* Optional Job Description */}
      <div className="animate-fade-up delay-200" style={{ marginBottom: 32, opacity: analyzing ? 0.5 : 1, pointerEvents: analyzing ? 'none' : 'auto' }}>
        <button
          onClick={() => setShowJobDesc(!showJobDesc)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--text-secondary)', padding: '8px 0', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {showJobDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Add job description (optional — improves keyword matching accuracy)
        </button>

        {showJobDesc && (
          <div style={{ marginTop: 10 }}>
            <textarea
              className="input-base"
              rows={7}
              placeholder={jobDescExample}
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7 }}
            />
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="animate-fade-up delay-300">
        <button
          className="btn-accent"
          onClick={handleAnalyze}
          disabled={!file || analyzing}
          style={{
            width: '100%', justifyContent: 'center',
            padding: '14px 24px', fontSize: 14,
            opacity: !file ? 0.4 : 1,
            cursor: !file || analyzing ? 'not-allowed' : 'pointer',
            gap: 10,
          }}
        >
          {analyzing ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              {currentLabel}
            </>
          ) : (
            <>
              <BrainCircuit size={16} />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Pipeline Steps */}
      {analyzing && (
        <div className="animate-fade-up" style={{ marginTop: 28 }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
              Processing Pipeline
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PIPELINE_STEPS.map((s, i) => {
                const done = i < completedSteps
                const active = i === completedSteps
                const pending = i > completedSteps
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                      background: done ? 'var(--accent-dim)' : active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                      border: `1px solid ${done || active ? 'rgba(198,241,53,0.4)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                    }}>
                      {done ? (
                        <CheckCircle size={12} color="var(--accent)" />
                      ) : active ? (
                        <Loader2 size={11} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                      ) : null}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                      color: done ? 'var(--accent)' : active ? 'var(--text-primary)' : 'var(--text-muted)',
                      transition: 'color 0.3s',
                    }}>
                      {s}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
