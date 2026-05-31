import { Check, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PricingCard({ plan, price, period = '/mo', features, cta, highlighted = false, badge }) {
  return (
    <div style={{
      position: 'relative',
      background: highlighted ? 'var(--bg-elevated)' : 'var(--bg-surface)',
      border: `1px solid ${highlighted ? 'rgba(198,241,53,0.35)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '32px 28px',
      transition: 'all 0.25s',
      boxShadow: highlighted ? '0 0 60px rgba(198,241,53,0.08)' : 'none',
    }}
    onMouseEnter={e => {
      if (!highlighted) {
        e.currentTarget.style.borderColor = 'var(--border-bright)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }
    }}
    onMouseLeave={e => {
      if (!highlighted) {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }
    }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent)',
          color: '#0a0a0b',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: 99,
          whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}

      {/* Plan name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {highlighted && (
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(198,241,53,0.25)', borderRadius: 7, padding: '4px 6px' }}>
            <Zap size={13} color="var(--accent)" />
          </div>
        )}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {plan}
        </span>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--text-primary)', lineHeight: 1 }}>
            {price === 0 ? 'Free' : `$${price}`}
          </span>
          {price !== 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{period}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32 }}>
        {features.map((feat, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 99, flexShrink: 0, marginTop: 1,
              background: highlighted ? 'var(--accent-dim)' : 'var(--bg-base)',
              border: `1px solid ${highlighted ? 'rgba(198,241,53,0.3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={10} color={highlighted ? 'var(--accent)' : 'var(--text-secondary)'} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to="/signup"
        className={highlighted ? 'btn-accent' : 'btn-ghost'}
        style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
      >
        {cta || 'Get started'}
      </Link>
    </div>
  )
}
