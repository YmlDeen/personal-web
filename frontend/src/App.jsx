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

  const mobileNav = [
    { to: '/',        short: 'HOME',   icon: '⌂' },
    { to: '/tasks',   short: 'TASKS',  icon: '◉' },
    { to: '/habits',  short: 'HABITS', icon: '◈' },
    { to: '/finance', short: 'FIN',    icon: '◫' },
    { to: '/notes',   short: 'NOTES',  icon: '◈' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
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
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch', zIndex: 200,
        }}>
          {mobileNav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              style={({ isActive }) => ({
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '3px',
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--dim)',
                fontSize: '8px', letterSpacing: '0.08em',
                borderTop: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{n.icon}</span>
              <span style={{ textTransform: 'uppercase' }}>{n.short}</span>
            </NavLink>
          ))}
          <button onClick={logout} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '3px',
            background: 'none', border: 'none', borderTop: '2px solid transparent',
            color: 'var(--dim)', cursor: 'pointer',
            fontSize: '8px', letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>⏻</span>
            <span style={{ textTransform: 'uppercase' }}>OUT</span>
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
              </Routes>
            </Layout>
          </Guard>
        } />
      </Routes>
    </BrowserRouter>
  )
}
