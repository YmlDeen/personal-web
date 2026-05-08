import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
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
  { to: '/',        label: 'Home',    icon: '⌂',  key: '01' },
  { to: '/', label: 'Home', icon: '⌂', color: 'var(--accent)' },
    { to: '/tasks',   label: 'Tasks',   icon: '◉',  key: '02' },
  { to: '/notes',   label: 'Notes',   icon: '◈',  key: '03' },
  { to: '/habits',  label: 'Habits',  icon: '◆',  key: '04' },
  { to: '/journal', label: 'Journal', icon: '◇',  key: '05' },
  { to: '/finance', label: 'Finance', icon: '◫',  key: '06' },
  { to: '/links',   label: 'Links',   icon: '◎',  key: '07' },
  { to: '/logs',    label: 'Logs',    icon: '◌',  key: '08' },
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

function FABMenu({ onSearch }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = useAuth(s => s.logout)

  const items = [
    { to: '/', label: 'Home', icon: '⌂', color: 'var(--accent)' },
    { to: '/tasks',   label: 'Tasks',   icon: '◉', color: 'var(--accent2)' },
    { to: '/notes',   label: 'Notes',   icon: '◈', color: 'var(--accent)' },
    { to: '/habits',  label: 'Habits',  icon: '◆', color: 'var(--success)' },
    { to: '/journal', label: 'Jrnl',    icon: '◇', color: 'var(--success)' },
    { to: '/finance', label: 'Fin',     icon: '◫', color: 'var(--warn)' },
    { to: '/links',   label: 'Links',   icon: '◎', color: 'var(--warn)' },
    { label: 'Search', icon: '⌕', color: 'var(--accent)', action: () => { setOpen(false); onSearch() } },
    { label: 'Out',    icon: '⏻', color: 'var(--danger)', action: () => { setOpen(false); logout() } },
  ]

  // place items in circle
  const count = items.length
  const radius = 95

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 299,
          background: 'rgba(8,8,16,0.6)', backdropFilter: 'blur(4px)',
        }} />
      )}

      <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 300 }}>
        {items.map((item, i) => {
          const angle = (180 / (count - 1)) * i + 180
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <div key={i} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: open
                ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                : 'translate(-50%, -50%) scale(0)',
              opacity: open ? 1 : 0,
              transition: `all 0.35s cubic-bezier(0.34,1.56,0.64,1)`,
              transitionDelay: open ? `${i * 0.03}s` : '0s',
              zIndex: 301,
            }}>
              <button onClick={() => {
                if (item.action) { item.action(); return }
                navigate(item.to)
                setOpen(false)
              }} style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(8,8,16,0.9)',
                border: `1px solid ${item.color}44`,
                color: item.color, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '1px', boxShadow: `0 0 16px ${item.color}22`,
                transition: 'all 0.2s',
                fontFamily: 'JetBrains Mono, monospace',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${item.color}22`; e.currentTarget.style.borderColor = item.color }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,8,16,0.9)'; e.currentTarget.style.borderColor = `${item.color}44` }}
              >
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: '7px', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7 }}>{item.label}</span>
              </button>
            </div>
          )
        })}

        {/* FAB button */}
        <button onClick={() => setOpen(o => !o)} style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: open ? 'rgba(124,106,247,0.2)' : 'rgba(124,106,247,0.15)',
          border: `1px solid ${open ? 'var(--accent)' : 'rgba(124,106,247,0.4)'}`,
          color: 'var(--accent)', cursor: 'pointer', zIndex: 302, position: 'relative',
          boxShadow: open ? '0 0 32px rgba(124,106,247,0.4)' : '0 0 16px rgba(124,106,247,0.2)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
          transform: open ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1)',
        }}>
          ✦
        </button>
      </div>
    </>
  )
}

function Layout({ children }) {
  const logout = useAuth(s => s.logout)
  const isMobile = useIsMobile()
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(s => !s) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

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
              ym//<span style={{ color: 'var(--accent)' }}>een</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>// runs on mobile, ships to prod</div>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowSearch(true)} style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '7px 10px', color: 'var(--dim)', cursor: 'pointer',
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>⌕ search</span><span style={{ fontSize: '9px', opacity: 0.5 }}>⌘K</span>
            </button>
          </div>
          <nav style={{ flex: 1, padding: '16px 0' }}>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 20px', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.05em',
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
              textTransform: 'uppercase', padding: 0, fontFamily: 'JetBrains Mono, monospace',
            }}>↳ logout</button>
          </div>
        </aside>
      )}

      <main style={{ marginLeft: isMobile ? 0 : '200px', flex: 1, minHeight: '100vh', paddingBottom: isMobile ? '120px' : 0 }}>
        {children}
      </main>

      {isMobile && <FABMenu onSearch={() => setShowSearch(true)} />}
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
