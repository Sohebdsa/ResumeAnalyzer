import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isLanding = location.pathname === '/'

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled || !isLanding ? 'rgba(10,10,11,0.92)' : 'transparent',
        borderBottom: scrolled || !isLanding ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        backdropFilter: scrolled || !isLanding ? 'blur(16px)' : 'none',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={15} color="#0a0a0b" strokeWidth={2.2} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Resumiq
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="nav-desktop">
          {[
            { label: 'Features', href: '/#features' },
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
          ].map(link => (
            <a key={link.label} href={link.href} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >{link.label}</a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-desktop">
          <Link to="/login" className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Sign in</Link>
          <Link to="/signup" className="btn-accent" style={{ padding: '8px 16px', fontSize: 13 }}>Get started</Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-mobile"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {[
            { label: 'Features', href: '/#features' },
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
          ].map(link => (
            <a key={link.label} href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 0' }}
            >{link.label}</a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Link to="/login" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link to="/signup" className="btn-accent" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Get started</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: block !important; }
        }
        @media (min-width: 721px) {
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
