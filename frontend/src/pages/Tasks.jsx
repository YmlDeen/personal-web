import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')

  const load = () => api.get('/tasks').then(r => setTasks(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!title.trim()) return
    await api.post('/tasks', { title, status: 'pending' })
    setTitle('')
    load()
  }

  const toggle = async t => {
    await api.put(`/tasks/${t.id}`, { status: t.status === 'done' ? 'pending' : 'done' })
    load()
  }

  const del = async id => { await api.delete(`/tasks/${id}`); load() }

  const pending = tasks.filter(t => t.status !== 'done')
  const done    = tasks.filter(t => t.status === 'done')

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      {/* header */}
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {pending.length} pending · {done.length} done
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Tasks<span style={{ color: 'var(--accent2)' }}>.</span>
        </h1>
      </div>

      {/* input */}
      <div className="fade-up fade-up-1" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          className="input"
          placeholder="new task..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={add}>+ add</button>
      </div>

      {/* pending */}
      {pending.length > 0 && (
        <div className="fade-up fade-up-2" style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            ▸ pending
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pending.map((t, i) => (
              <div key={t.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${i * 0.04}s` }}>
                <div
                  onClick={() => toggle(t)}
                  style={{
                    width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer',
                    border: '1px solid var(--muted)', borderRadius: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--muted)'}
                />
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{t.title}</span>
                <button className="btn btn-danger" onClick={() => del(t.id)}>del</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* done */}
      {done.length > 0 && (
        <div className="fade-up fade-up-3">
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            ▸ completed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {done.map(t => (
              <div key={t.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                <div
                  onClick={() => toggle(t)}
                  style={{
                    width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer',
                    border: '1px solid var(--accent2)', borderRadius: '2px', background: 'var(--accent2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000',
                  }}
                >✓</div>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--dim)', textDecoration: 'line-through' }}>{t.title}</span>
                <button className="btn btn-danger" onClick={() => del(t.id)}>del</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
          no tasks yet
        </div>
      )}
    </div>
  )
}
