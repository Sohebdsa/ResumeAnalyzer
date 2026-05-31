import { Link } from 'react-router-dom'
import { FileText, Github, Twitter, Linkedin } from 'lucide-react'

const footerLinks = {
  Product: ['Features', 'How it works', 'Pricing', 'Changelog'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Templates'],
  Company: ['About', 'Careers', 'Privacy Policy', 'Terms of Service'],
}

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      paddingTop: 60,
      paddingBottom: 40,
      marginTop: 100,
    }}>
      <div className="container">
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 60 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={14} color="#0a0a0b" strokeWidth={2.2} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>Resumiq</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 260 }}>
              AI-powered resume intelligence for modern professionals. Get past ATS, land more interviews.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 34, height: 34,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                {group}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 Resumiq. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Powered by <span style={{ color: 'var(--accent)' }}>Gemini 2.5</span>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
