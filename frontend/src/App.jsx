import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import Links from './pages/Links'
import Logs from './pages/Logs'

function Guard({ children }) {
  const user = useAuth(s => s.user)
  return user ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  const logout = useAuth(s => s.logout)
  const nav = [
    { to: '/', label: 'Dashboard' },
    { to: '/notes', label: 'Notes' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/links', label: 'Links' },
    { to: '/logs', label: 'Logs' },
  ]
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-4 py-3 flex gap-4 items-center">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) =>
            isActive ? 'text-indigo-400 font-semibold' : 'text-gray-400 hover:text-white'
          }>
            {n.label}
          </NavLink>
        ))}
        <button className="ml-auto text-gray-400 hover:text-white text-sm" onClick={logout}>
          Logout
        </button>
      </nav>
      <main>{children}</main>
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
                <Route path="/logs" element={<Logs />} />
              </Routes>
            </Layout>
          </Guard>
        } />
      </Routes>
    </BrowserRouter>
  )
}
