import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuth from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import Links from './pages/Links'
import Logs from './pages/Logs'
import Habits from './pages/Habits'
import Finance from './pages/Finance'
import Journal from './pages/Journal'
import Card from './pages/Card'
import Search from './pages/Search'

function Guard({ children }) {
  const user = useAuth(s => s.user)
  return user ? children : <Navigate to="/login" replace />
}

const NAV = [
  { to: '/',        label: 'Dashboard', short: 'HOME',    key: '01', icon: '⌂' },
  { to: '/notes',   label: 'Notes',     short: 'NOTES',   key: '02', icon: '◈' },
  { to: '/tasks',   label: 'Tasks',     short: 'TASKS',   key: '03', icon: '◉' },
  { to: '/links',   label: 'Links',     short: 'LINKS',   key: '04', icon: '◎' },
  { to: '/habits',  label: 'Habits',    short: 'HABITS',  key: '05', icon: '◈' },
  { to: '/finance', label: 'Finance',   short: 'FIN',     key: '06', icon: '◫' },
  { to: '/logs',    label: 'Logs',      short: 'LOGS',    key: '07', icon: '◌' },
  { to: '/journal', label: 'Journal',   short: 'JRNL',    key: '08', icon: '◇' },
]

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

function Layout({ children }) {
  const logout   = useAuth(s => s.logout)
  const isMobile = useIsMobile()
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(s => !s) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const mobileNav = [
    { to: '/',        short: 'HOME',   icon: '⌂' },
    { to: '/tasks',   short: 'TASKS',  icon: '◉' },
    { to: '/habits',  short: 'HABITS', icon: '◈' },
    { to: '/journal', short: 'JRNL',   icon: '◇' },
    { to: '/notes',   short: 'NOTES',  icon: '◈' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {showSearch && <Search onClose={() => setShowSearch(false)} />}

      {!isMobile && (
        <aside style={{
          width: '200px', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '24px 0',
          flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
          background: 'var(--surface)', zIndex: 100,
        }}>
          <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              yml<span style={{ color: 'var(--accent)' }}>.</span>space
            </div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
              personal os
            </div>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowSearch(true)} style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '7px 10px', color: 'var(--dim)', cursor: 'pointer',
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span>⌕ search</span>
              <span style={{ fontSize: '9px', opacity: 0.5 }}>⌘K</span>
            </button>
          </div>
          <nav style={{ flex: 1, padding: '16px 0' }}>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 20px', textDecoration: 'none',
                  fontSize: '12px', letterSpacing: '0.05em',
                  color: isActive ? 'var(--text)' : 'var(--dim)',
                  background: isActive ? 'rgba(124,106,247,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.15s',
                })}
              >
                <span style={{ fontSize: '10px', color: 'var(--dim)' }}>{n.key}</span>
                <span style={{ textTransform: 'uppercase' }}>{n.label}</span>
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <button onClick={logout} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--dim)', fontSize: '11px', letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: 0,
              fontFamily: 'JetBrains Mono, monospace',
            }}>↳ logout</button>
          </div>
        </aside>
      )}

      <main style={{ marginLeft: isMobile ? 0 : '200px', flex: 1, minHeight: '100vh', paddingBottom: isMobile ? '60px' : 0 }}>
        {children}
      </main>

      {isMobile && (
        <nav className="mobile-nav">
          {mobileNav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
              <span className="mobile-nav-icon">{n.icon}</span>
              <span className="mobile-nav-label">{n.short}</span>
            </NavLink>
          ))}
          <button className="mobile-nav-item mobile-nav-logout" onClick={() => setShowSearch(true)}>
            <span className="mobile-nav-icon">⌕</span>
            <span className="mobile-nav-label">SEARCH</span>
          </button>
          <button className="mobile-nav-item mobile-nav-logout" onClick={logout}>
            <span className="mobile-nav-icon">⏻</span>
            <span className="mobile-nav-label">OUT</span>
          </button>
        </nav>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Guard>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/links" element={<Links />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/card" element={<Card />} />
              </Routes>
            </Layout>
          </Guard>
        } />
      </Routes>
    </BrowserRouter>
  )
}
