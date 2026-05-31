import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

export default function FileDropzone({ onFileAccepted, accept = '.pdf,.doc,.docx' }) {
  const [file, setFile] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    onFileAccepted?.(f)
  }, [onFileAccepted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  })

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    onFileAccepted?.(null)
  }

  return (
    <div
      {...getRootProps()}
      style={{
        position: 'relative',
        border: `1.5px dashed ${isDragActive ? 'var(--accent)' : file ? 'rgba(198,241,53,0.4)' : 'var(--border-bright)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '48px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s',
        background: isDragActive ? 'var(--accent-dim)' : file ? 'rgba(198,241,53,0.04)' : 'var(--bg-elevated)',
        outline: 'none',
      }}
    >
      <input {...getInputProps()} />

      {/* Pulse ring when dragging */}
      {isDragActive && (
        <div style={{
          position: 'absolute',
          inset: -6,
          borderRadius: 26,
          border: '1.5px solid var(--accent)',
          opacity: 0.5,
          animation: 'pulse-ring 1.2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {file ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52,
            background: 'var(--accent-dim)',
            border: '1px solid rgba(198,241,53,0.3)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={24} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              {file.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <span
            onClick={removeFile}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
              padding: '4px 10px', borderRadius: 99,
              border: '1px solid var(--border)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#ff5555'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <X size={12} />
            Remove
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s',
          }}>
            <Upload size={22} color={isDragActive ? 'var(--accent)' : 'var(--text-secondary)'} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              or <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>browse files</span> — PDF, DOC, DOCX supported
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['PDF', 'DOC', 'DOCX'].map(ext => (
              <span key={ext} className="tag" style={{ fontSize: 10 }}>{ext}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
