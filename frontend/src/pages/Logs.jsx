import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [msg, setMsg] = useState('')

  const load = () => api.get('/logs').then(r => setLogs(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!msg.trim()) return
    await api.post('/logs', { message: msg })
    setMsg('')
    load()
  }

  const fmt = ts => {
    if (!ts) return ''
    return ts.replace('T', ' ').slice(0, 19)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      {/* header */}
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {logs.length} entries
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Logs<span style={{ color: 'var(--success)' }}>.</span>
        </h1>
      </div>

      {/* input */}
      <div className="fade-up fade-up-1" style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        <input
          className="nm-input"
          placeholder="log entry..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{ flex: 1 }}
        />
        <button className="nm-btn btn-primary" onClick={add}>+ log</button>
      </div>

      {/* timeline */}
      <div className="fade-up fade-up-2" style={{ position: 'relative', paddingLeft: '20px' }}>
        {/* vertical line */}
        {logs.length > 0 && (
          <div style={{
            position: 'absolute', left: '5px', top: '8px', bottom: '8px',
            width: '1px', background: 'var(--border)',
          }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {logs.length === 0 && (
            <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center', marginLeft: '-20px' }}>
              no logs yet
            </div>
          )}
          {logs.map((l, i) => (
            <div key={l.id} className="fade-up" style={{ animationDelay: `${i * 0.03}s`, display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '16px', position: 'relative' }}>
              {/* dot */}
              <div style={{
                position: 'absolute', left: '-18px', top: '5px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: i === 0 ? 'var(--success)' : 'var(--muted)',
                border: '1px solid var(--bg)',
                boxShadow: i === 0 ? '0 0 6px var(--success)' : 'none',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>{l.message}</div>
                <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '2px', letterSpacing: '0.05em' }}>
                  {fmt(l.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
