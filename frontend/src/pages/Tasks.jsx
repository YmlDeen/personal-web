import { useEffect, useState } from 'react'
import api from '../api/client'

const PRIORITY = { high: { label: 'high', color: 'var(--danger)' }, medium: { label: 'med', color: 'var(--warn)' }, low: { label: 'low', color: 'var(--dim)' } }
const REPEAT_ICON = { daily: '↻d', weekly: '↻w', monthly: '↻m' }

function priorityOrder(p) { return p === 'high' ? 0 : p === 'medium' ? 1 : 2 }

function formatDue(due) {
  if (!due) return null
  const d = new Date(due)
  const today = new Date(new Date().toDateString())
  const diff = Math.round((d - today) / 86400000)
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: 'var(--danger)' }
  if (diff === 0) return { text: 'today', color: 'var(--warn)' }
  if (diff === 1) return { text: 'tomorrow', color: 'var(--accent2)' }
  return { text: `${diff}d left`, color: 'var(--dim)' }
}

function TaskRow({ t, onToggle, onDel }) {
  const p = PRIORITY[t.priority] || PRIORITY.medium
  const due = formatDue(t.due_date)
  const done = t.status === 'done'
  return (
    <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', opacity: done ? 0.45 : 1, transition: 'opacity 0.2s' }}>
      <div onClick={() => onToggle(t)} style={{
        width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer',
        border: `1px solid ${done ? 'var(--accent2)' : 'var(--muted)'}`,
        borderRadius: '2px', background: done ? 'var(--accent2)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', transition: 'all 0.15s',
      }}>{done ? '✓' : ''}</div>
      <span style={{ flex: 1, fontSize: '13px', color: done ? 'var(--dim)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', overflowWrap: 'anywhere' }}>{t.title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {t.repeat && <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '0.04em' }}>{REPEAT_ICON[t.repeat]}</span>}
        {due && <span style={{ fontSize: '10px', color: due.color, letterSpacing: '0.04em' }}>{due.text}</span>}
        <span style={{ fontSize: '9px', color: p.color, border: `1px solid ${p.color}`, borderRadius: '3px', padding: '1px 5px', letterSpacing: '0.06em', opacity: 0.85 }}>{p.label}</span>
        <button className="btn btn-danger" onClick={() => onDel(t.id)}>del</button>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', repeat: '' })
  const [open, setOpen] = useState(false)

  const load = () => api.get('/tasks').then(r => setTasks(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.title.trim()) return
    await api.post('/tasks', { title: form.title, priority: form.priority, due_date: form.due_date || null, repeat: form.repeat || null })
    setForm({ title: '', priority: 'medium', due_date: '', repeat: '' })
    setOpen(false)
    load()
  }

  const toggle = async t => {
    await api.put(`/tasks/${t.id}`, { status: t.status === 'done' ? 'todo' : 'done' })
    load()
  }

  const del = async id => { await api.delete(`/tasks/${id}`); load() }

  const pending = tasks.filter(t => t.status !== 'done').sort((a, b) => {
    const po = priorityOrder(a.priority) - priorityOrder(b.priority)
    if (po !== 0) return po
    if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return 0
  })
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {pending.length} pending · {done.length} done
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
            Tasks<span style={{ color: 'var(--accent2)' }}>.</span>
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>
          {open ? '✕ close' : '+ add task'}
        </button>
      </div>

      {open && (
        <div className="card fade-up" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input className="input" placeholder="task title..." value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()} autoFocus />
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ flex: 1 }}>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
              <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={{ flex: 1 }} />
            </div>
            <select className="input" value={form.repeat} onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}>
              <option value="">no repeat</option>
              <option value="daily">↻ daily</option>
              <option value="weekly">↻ weekly</option>
              <option value="monthly">↻ monthly</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={add}>↑ save</button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>cancel</button>
            </div>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="fade-up fade-up-2" style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>▸ pending</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pending.map(t => <TaskRow key={t.id} t={t} onToggle={toggle} onDel={del} />)}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="fade-up fade-up-3">
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>▸ completed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {done.map(t => <TaskRow key={t.id} t={t} onToggle={toggle} onDel={del} />)}
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
