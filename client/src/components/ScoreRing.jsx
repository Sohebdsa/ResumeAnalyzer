import { useEffect, useRef } from 'react'

/**
 * Animated SVG circular score ring.
 * Props: score (0-100), size, strokeWidth, label
 */
export default function ScoreRing({ score = 0, size = 160, strokeWidth = 10, label = 'ATS Score', animate = true }) {
  const circleRef = useRef(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#c6f135'
    if (s >= 60) return '#f5a623'
    return '#ff5555'
  }
  const color = getColor(score)

  useEffect(() => {
    if (!animate || !circleRef.current) return
    circleRef.current.style.strokeDashoffset = circumference
    const timer = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = `stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)`
        circleRef.current.style.strokeDashoffset = offset
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [score, circumference, offset, animate])

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      {/* Center text */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.22, color: 'var(--text-primary)', lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.08, color: 'var(--text-secondary)', marginTop: 4, letterSpacing: '0.04em' }}>
          {label}
        </div>
      </div>
    </div>
  )
}
