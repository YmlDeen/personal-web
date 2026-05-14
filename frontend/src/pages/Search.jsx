import { useState } from 'react'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'

const PRIORITY = { high: 'var(--danger)', medium: 'var(--warn)', low: 'var(--dim)' }

export default function Search({ onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const search = async (val) => {
    setQ(val)
    if (val.trim().length < 2) { setResults(null); return }
    setLoading(true)
    const [notes, tasks, links] = await Promise.all([
      api.get('/notes').then(r => r.data),
      api.get('/tasks').then(r => r.data),
      api.get('/links').then(r => r.data),
    ])
    const kw = val.toLowerCase()
    setResults({
      notes: notes.filter(n => n.title.toLowerCase().includes(kw) || n.content?.toLowerCase().includes(kw)),
      tasks: tasks.filter(t => t.title.toLowerCase().includes(kw)),
      links: links.filter(l => l.title.toLowerCase().includes(kw) || l.url.toLowerCase().includes(kw)),
    })
    setLoading(false)
  }

  const go = (path) => { navigate(path); onClose() }
  const total = results ? results.notes.length + results.tasks.length + results.links.length : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '80px', padding: '80px 16px 0',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            autoFocus
            className="nm-input"
            placeholder="search notes, tasks, links..."
            value={q}
            onChange={e => search(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onClose()}
            style={{ width: '100%', fontSize: '16px', padding: '14px 16px', paddingRight: '48px' }}
          />
          <button onClick={onClose} style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: '18px',
          }}>✕</button>
        </div>

        {loading && <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: '12px', padding: '24px' }}>searching...</div>}

        {results && !loading && (
          <div className="nm-card" style={{ padding: '8px', maxHeight: '60vh', overflowY: 'auto' }}>
            {total === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--dim)', fontSize: '12px' }}>no results for "{q}"</div>
            )}

            {results.notes.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px' }}>notes ({results.notes.length})</div>
                {results.notes.map(n => (
                  <div key={n.id} onClick={() => go('/notes')} style={{
                    padding: '10px 12px', cursor: 'pointer', borderRadius: '8px',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{n.title}</div>
                    {n.content && <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{n.content.slice(0, 80)}</div>}
                  </div>
                ))}
              </div>
            )}

            {results.tasks.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px' }}>tasks ({results.tasks.length})</div>
                {results.tasks.map(t => (
                  <div key={t.id} onClick={() => go('/tasks')} style={{
                    padding: '10px 12px', cursor: 'pointer', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '13px', color: t.status === 'done' ? 'var(--dim)' : 'var(--text)', flex: 1, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</span>
                    <span style={{ fontSize: '9px', color: PRIORITY[t.priority] || 'var(--dim)', border: `1px solid ${PRIORITY[t.priority] || 'var(--dim)'}`, borderRadius: '3px', padding: '1px 5px' }}>{t.priority}</span>
                  </div>
                ))}
              </div>
            )}

            {results.links.length > 0 && (
              <div>
                <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px' }}>links ({results.links.length})</div>
                {results.links.map(l => (
                  <div key={l.id} onClick={() => go('/links')} style={{
                    padding: '10px 12px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{l.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px' }}>{l.url}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.06em' }}>
          ESC to close · type 2+ chars to search
        </div>
      </div>
    </div>
  )
}
