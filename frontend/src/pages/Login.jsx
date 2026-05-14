import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuth(s => s.login)
  const nav = useNavigate()

  const submit = async () => {
    if (!form.username || !form.password) return
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      nav('/')
    } catch {
      setError('AUTH_FAILED: invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        opacity: 0.4,
      }} />

      {/* glow */}
      <div style={{
        position: 'absolute',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{ position: 'relative', width: '340px' }}>
        {/* header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            ym//<span style={{ color: 'var(--accent)' }}>ee</span>n
          </div>
          <div style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px' }}>
            offline-first · personal os
          </div>
        </div>

        {/* form */}
        <div className="nm-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            ▸ authenticate
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              className="input"
              placeholder="username"
              value={form.username}
              autoComplete="username"
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <input
              className="input"
              placeholder="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />

            {error && (
              <div style={{ fontSize: '11px', color: 'var(--danger)', padding: '6px 10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '2px' }}>
                {error}
              </div>
            )}

            <button
              className="nm-btn-primary"
              onClick={submit}
              disabled={loading}
              style={{ marginTop: '4px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'authenticating...' : '→ enter'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '10px', color: 'var(--muted)', textAlign: 'center' }}>
          private access only
        </div>
      </div>
    </div>
  )
}
