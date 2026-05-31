import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, FileBarChart2, PenTool, FileText, Settings } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/' },
  { icon: Upload,          label: 'Analyze',    to: '/analyze' },
  { icon: FileBarChart2,  label: 'Reports',    to: '/reports' },
  { icon: PenTool,         label: 'Builder',    to: '/builder' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 30, height: 30,
          background: 'var(--accent)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FileText size={15} color="#0a0a0b" strokeWidth={2.2} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Resumiq
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 10px', marginBottom: 8 }}>
          WORKSPACE
        </p>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              transition: 'all 0.18s',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} color={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 10px' }}>
        <div className="divider" style={{ marginBottom: 12 }} />
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'color 0.18s',
          })}
        >
          <Settings size={15} strokeWidth={1.8} />
          Settings
        </NavLink>

        <div style={{
          margin: '12px 2px 0',
          padding: '10px 12px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
            Powered by
          </p>
          <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </aside>
  )
}
