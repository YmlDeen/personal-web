import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
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

const NAV_SIDEBAR = [
  { to: '/',        label: 'Dashboard', icon: '⌂', end: true },
  { to: '/tasks',   label: 'Tasks',     icon: '◉' },
  { to: '/notes',   label: 'Notes',     icon: '◈' },
  { to: '/finance', label: 'Finance',   icon: '◫' },
  { to: '/links',   label: 'Links',     icon: '◎' },
]

const NAV_TABS = [
  { to: '/',        label: 'Home',    icon: '⌂', end: true },
  { to: '/tasks',   label: 'Tasks',   icon: '◉' },
  { to: '/links',   label: 'Links',   icon: '◎' },
  { to: '/finance', label: 'Finance', icon: '◫' },
  { to: '/notes',   label: 'Notes',   icon: '◈' },
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

function BottomTabBar({ onSearch }) {
  const logout = useAuth(s => s.logout)
  const { dark, toggle } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const MORE_ITEMS = [
    { label: 'Search', icon: '⌕', action: () => { setMoreOpen(false); onSearch() } },
    { label: dark ? 'Light' : 'Dark', icon: dark ? '☀' : '☽', action: () => { setMoreOpen(false); setTimeout(() => toggle(), 50) } },
    { label: 'Logout', icon: '⏻', danger: true, action: () => { setMoreOpen(false); logout() } },
  ]

  return (
    <>
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 399,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        bottom: '64px',
        right: '8px',
        zIndex: 400,
        opacity: moreOpen ? 1 : 0,
        transform: moreOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
        pointerEvents: moreOpen ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.4,0.64,1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px 10px',
        background: 'var(--nm-bg)',
        boxShadow: 'var(--nm-raised)',
        borderRadius: '18px',
        minWidth: '155px',
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-7px',
          right: '18px',
          width: '14px',
          height: '14px',
          background: 'var(--nm-bg)',
          boxShadow: '3px 3px 6px var(--nm-shadow-d)',
          transform: 'rotate(45deg)',
          borderRadius: '2px',
        }} />
        {MORE_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              if (item.action) { item.action(); return }
              navigate(item.to)
              setMoreOpen(false)
            }}
            style={{
              width: '100%',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-raised-sm)',
              border: 'none',
              borderRadius: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              color: item.danger ? 'var(--nm-danger)' : 'var(--nm-dim)',
              transition: 'box-shadow 0.15s, color 0.15s',
              fontFamily: 'var(--nm-mono)',
              textAlign: 'left',
            }}
            onPointerDown={e => e.currentTarget.style.boxShadow = 'var(--nm-inset-sm)'}
            onPointerUp={e => e.currentTarget.style.boxShadow = 'var(--nm-raised-sm)'}
            onPointerLeave={e => e.currentTarget.style.boxShadow = 'var(--nm-raised-sm)'}
          >
            <span style={{ fontSize: '15px', lineHeight: 1, width: '18px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}
      </div>

      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '64px',
        background: 'var(--nm-bg)',
        boxShadow: '-2px -4px 16px var(--nm-shadow-d), 2px 4px 10px var(--nm-shadow-l)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV_TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '6px 0',
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'var(--nm-bg)',
                  boxShadow: isActive ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: isActive ? 'var(--nm-accent)' : 'var(--nm-dim)',
                  transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}>
                  {tab.icon}
                </div>
                <span style={{
                  fontFamily: 'var(--nm-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--nm-accent)' : 'var(--nm-dim)',
                  fontWeight: isActive ? 700 : 400,
                  transition: 'color 0.2s',
                }}>
                  {tab.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setMoreOpen(o => !o)}
          style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '3px', padding: '6px 0',
          }}
        >
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--nm-bg)',
            boxShadow: moreOpen ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            color: moreOpen ? 'var(--nm-accent)' : 'var(--nm-dim)',
            transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
            transform: moreOpen ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1)',
          }}>✦</div>
          <span style={{
            fontFamily: 'var(--nm-mono)', fontSize: '8px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: moreOpen ? 'var(--nm-accent)' : 'var(--nm-dim)',
            fontWeight: moreOpen ? 700 : 400, transition: 'color 0.2s',
          }}>More</span>
        </button>
      </nav>
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
          Ym//eeN
        </div>
      </div>
      <div style={{ padding: '12px 16px 8px' }}>
        <button onClick={onSearch} style={{
          width: '100%', background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)',
          border: 'none', borderRadius: '10px', padding: '8px 12px',
          color: 'var(--nm-dim)', cursor: 'pointer', fontFamily: 'var(--nm-mono)',
          fontSize: '11px', letterSpacing: '0.05em',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>⌕ search</span>
          <span style={{ fontSize: '9px', opacity: 0.5 }}>⌘K</span>
        </button>
      </div>
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_SIDEBAR.map(n => (
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
          background: 'var(--nm-bg)', boxShadow: 'var(--nm-raised-sm)', border: 'none',
          borderRadius: '10px', padding: '8px 12px', color: 'var(--nm-dim)', cursor: 'pointer',
          fontFamily: 'var(--nm-mono)', fontSize: '10px', letterSpacing: '0.08em',
          textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>{dark ? '☀' : '☽'}</span>
          <span>{dark ? 'light mode' : 'dark mode'}</span>
        </button>
        <button onClick={logout} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--nm-dim)', fontFamily: 'var(--nm-mono)', fontSize: '10px',
          letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 0', textAlign: 'left',
        }}>↳ logout</button>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  const isMobile = useIsMobile()
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(s => !s) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--nm-bg)' }}>
      {showSearch && <Search onClose={() => setShowSearch(false)} />}
      {!isMobile && <Sidebar onSearch={() => setShowSearch(true)} />}
      <main className="app-main">{children}</main>
      {isMobile && <BottomTabBar onSearch={() => setShowSearch(true)} />}
    </div>
  )
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('nm-theme') === 'dark')

  useEffect(() => {
    if (dark) { document.documentElement.classList.add('dark'); localStorage.setItem('nm-theme', 'dark') }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('nm-theme', 'light') }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
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
