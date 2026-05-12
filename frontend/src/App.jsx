import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState, createContext, useContext } from 'react'
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

export const ThemeContext = createContext({ dark: false, toggle: () => {} })

function Guard({ children }) {
  const user = useAuth(s => s.user)
  return user ? children : <Navigate to="/login" replace />
}

const NAV = [
  { to: '/',        label: 'Dashboard', icon: '⌂',  end: true },
  { to: '/tasks',   label: 'Tasks',     icon: '◉' },
  { to: '/notes',   label: 'Notes',     icon: '◈' },
  { to: '/habits',  label: 'Habits',    icon: '◆' },
  { to: '/journal', label: 'Journal',   icon: '◇' },
  { to: '/finance', label: 'Finance',   icon: '◫' },
  { to: '/links',   label: 'Links',     icon: '◎' },
  { to: '/logs',    label: 'Logs',      icon: '◌' },
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
  const { dark, toggle } = useContext(ThemeContext)

  const items = [
    { to: '/',        label: 'Home',   icon: '⌂', color: 'var(--nm-accent)' },
    { to: '/tasks',   label: 'Tasks',  icon: '◉', color: 'var(--nm-accent2)' },
    { to: '/notes',   label: 'Notes',  icon: '◈', color: 'var(--nm-accent)' },
    { to: '/habits',  label: 'Habits', icon: '◆', color: 'var(--nm-success)' },
    { to: '/journal', label: 'Jrnl',   icon: '◇', color: 'var(--nm-success)' },
    { to: '/finance', label: 'Fin',    icon: '◫', color: 'var(--nm-warn)' },
    { to: '/links',   label: 'Links',  icon: '◎', color: 'var(--nm-warn)' },
    { label: 'Search', icon: '⌕', color: 'var(--nm-accent)', action: () => { setOpen(false); onSearch() } },
    { label: dark ? 'Light' : 'Dark', icon: dark ? '☀' : '☽', color: 'var(--nm-dim)', action: () => { toggle(); setOpen(false) } },
    { label: 'Out', icon: '⏻', color: 'var(--nm-danger)', action: () => { setOpen(false); logout() } },
  ]

  const count = items.length
  const radius = 100

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 299,
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
        }} />
      )}

      <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 300 }}>
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
                width: '50px', height: '50px', borderRadius: '50%',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-raised-sm)',
                border: 'none',
                color: item.color, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '1px',
                transition: 'all 0.2s',
                fontFamily: 'var(--nm-mono)',
              }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: '7px', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.8 }}>{item.label}</span>
              </button>
            </div>
          )
        })}

        <button onClick={() => setOpen(o => !o)} style={{
          width: '54px', height: '54px', borderRadius: '50%',
          background: 'var(--nm-bg)',
          boxShadow: open ? 'var(--nm-inset)' : 'var(--nm-raised)',
          border: 'none',
          color: 'var(--nm-accent)', cursor: 'pointer', zIndex: 302, position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
          transform: open ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1)',
        }}>
          ✦
        </button>
      </div>
    </>
  )
}

function Sidebar({ onSearch }) {
  const logout = useAuth(s => s.logout)
  const { dark, toggle } = useContext(ThemeContext)

  return (
    <aside className="nm-sidebar">
      <div className="nm-sidebar-brand">
        <div style={{ fontFamily: 'var(--nm-font)', fontSize: '17px', fontWeight: 900, color: 'var(--nm-text)', letterSpacing: '-0.02em' }}>
          ym//<span style={{ color: 'var(--nm-accent)' }}>een</span>
        </div>
        <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
          personal os
        </div>
      </div>

      <div style={{ padding: '12px 16px 8px' }}>
        <button onClick={onSearch} style={{
          width: '100%',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-inset-sm)',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 12px',
          color: 'var(--nm-dim)',
          cursor: 'pointer',
          fontFamily: 'var(--nm-mono)',
          fontSize: '11px',
          letterSpacing: '0.05em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>⌕ search</span>
          <span style={{ fontSize: '9px', opacity: 0.5 }}>⌘K</span>
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => `nm-nav-link${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--nm-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={toggle} style={{
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-raised-sm)',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 12px',
          color: 'var(--nm-dim)',
          cursor: 'pointer',
          fontFamily: 'var(--nm-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'box-shadow 0.15s',
        }}>
          <span>{dark ? '☀' : '☽'}</span>
          <span>{dark ? 'light mode' : 'dark mode'}</span>
        </button>
        <button onClick={logout} style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--nm-dim)',
          fontFamily: 'var(--nm-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 0',
          textAlign: 'left',
        }}>↳ logout</button>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  const isMobile = useIsMobile()
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(s => !s) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--nm-bg)' }}>
      {showSearch && <Search onClose={() => setShowSearch(false)} />}

      {!isMobile && <Sidebar onSearch={() => setShowSearch(true)} />}

      <main className="app-main">
        {children}
      </main>

      {isMobile && <FABMenu onSearch={() => setShowSearch(true)} />}
    </div>
  )
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('nm-theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('nm-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('nm-theme', 'light')
    }
  }, [dark])

  const toggle = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
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
    </ThemeContext.Provider>
  )
}
