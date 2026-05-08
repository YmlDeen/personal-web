import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const todayStr = () => new Date().toISOString().split('T')[0]
const timeStr = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
const AWS_EXPIRE = new Date('2026-08-21T00:00:00+07:00')

const GREET = () => {
  const h = new Date().getHours()
  if (h < 12) return 'good morning'
  if (h < 17) return 'good afternoon'
  return 'good evening'
}

function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 }
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000) / 60000),
      secs:  Math.floor((diff % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [])
  return t
}

function useClock() {
  const [t, setT] = useState(timeStr())
  useEffect(() => { const id = setInterval(() => setT(timeStr()), 1000); return () => clearInterval(id) }, [])
  return t
}

function QuickCapture({ onDone }) {
  const [mode, setMode] = useState('task')
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!val.trim() || saving) return
    setSaving(true)
    if (mode === 'task') await api.post('/tasks', { title: val, priority: 'medium' })
    if (mode === 'note') await api.post('/notes', { title: val, content: '' })
    setVal('')
    setSaving(false)
    onDone()
  }

  return (
    <div className="card" style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {['task', 'note'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', border: 'none',
            background: mode === m ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            color: mode === m ? '#fff' : 'var(--dim)', fontFamily: 'JetBrains Mono, monospace',
          }}>{m}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input className="input" style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
          placeholder={mode === 'task' ? 'quick task...' : 'quick note...'}
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()} />
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: '8px 14px' }}>
          {saving ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState({ notes: 0, tasks: 0, links: 0, todayTasks: [], habits: [], habitLogs: [] })
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  const cd = useCountdown(AWS_EXPIRE)
  const clock = useClock()

  const load = async () => {
    const [n, t, l, h, hl] = await Promise.all([
      api.get('/notes').then(r => r.data),
      api.get('/tasks').then(r => r.data),
      api.get('/links').then(r => r.data),
      api.get('/habits').then(r => r.data),
      api.get('/habits/logs/today').catch(() => ({ data: [] })).then(r => r.data || []),
    ])
    const today = todayStr()
    const todayTasks = t.filter(x => x.status !== 'done' && (
      x.due_date === today ||
      (x.due_date && x.due_date < today)
    )).slice(0, 3)
    const fallback = todayTasks.length === 0 ? t.filter(x => x.status !== 'done').slice(0, 3) : todayTasks
    setData({ notes: n.length, tasks: t.filter(x => x.status !== 'done').length, links: l.length, todayTasks: fallback, habits: h, habitLogs: hl })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const urgency = cd.days < 30 ? 'var(--danger)' : cd.days < 60 ? 'var(--warn)' : 'var(--dim)'
  const pct = Math.max(0, Math.min(100, (cd.days / 365) * 100))

  const toggleHabit = async (habit) => {
    const logged = data.habitLogs.some(l => l.habit_id === habit.id)
    if (logged) return
    await api.post(`/habits/${habit.id}/log`, { date: todayStr() })
    load()
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* header */}
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{GREET()}</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: '2px 0 0' }}>
              Overview<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{clock}</div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '2px' }}>{todayStr()}</div>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { label: 'Notes',  value: data.notes, color: 'var(--accent)',  path: '/notes' },
          { label: 'Tasks',  value: data.tasks, color: 'var(--accent2)', path: '/tasks' },
          { label: 'Links',  value: data.links, color: 'var(--warn)',     path: '/links' },
        ].map(s => (
          <div key={s.label} className="card" onClick={() => nav(s.path)}
            style={{ padding: '12px 14px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.color }} />
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>
              {loading ? '—' : String(s.value).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AWS countdown — compact bar */}
      <div className="card fade-up fade-up-2" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AWS credit</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[['d', cd.days], ['h', cd.hours], ['m', cd.mins], ['s', cd.secs]].map(([l, v]) => (
              <span key={l} style={{ fontSize: '11px', color: urgency, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                {String(v).padStart(2, '0')}<span style={{ fontSize: '9px', color: 'var(--dim)', marginLeft: '1px' }}>{l}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ height: '2px', background: 'var(--border)', borderRadius: '1px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: urgency, borderRadius: '1px', transition: 'width 1s' }} />
        </div>
      </div>

      {/* today tasks */}
      <div className="fade-up fade-up-3">
        <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>▸ today's tasks</span>
          <span onClick={() => nav('/tasks')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>all →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.todayTasks.length === 0 && !loading && (
            <div className="card" style={{ padding: '12px 14px', color: 'var(--dim)', fontSize: '12px', textAlign: 'center' }}>all clear ✓</div>
          )}
          {data.todayTasks.map(t => {
            const overdue = t.due_date && t.due_date < todayStr()
            return (
              <div key={t.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  background: overdue ? 'var(--danger)' : t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warn)' : 'var(--dim)' }} />
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', overflowWrap: 'anywhere' }}>{t.title}</span>
                {overdue && <span style={{ fontSize: '9px', color: 'var(--danger)' }}>overdue</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* habit check-in */}
      {data.habits.length > 0 && (
        <div className="fade-up fade-up-4">
          <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>▸ habits today</span>
            <span onClick={() => nav('/habits')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>all →</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.habits.map(h => {
              const done = data.habitLogs.some(l => l.habit_id === h.id)
              return (
                <button key={h.id} onClick={() => toggleHabit(h)} style={{
                  padding: '6px 12px', borderRadius: '20px', cursor: done ? 'default' : 'pointer',
                  border: `1px solid ${done ? h.color : 'var(--border)'}`,
                  background: done ? `${h.color}22` : 'transparent',
                  color: done ? h.color : 'var(--dim)', fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <span>{done ? '✓' : '○'}</span>
                  <span>{h.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* quick capture */}
      <div className="fade-up fade-up-5">
        <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>▸ capture</div>
        <QuickCapture onDone={load} />
      </div>

    </div>
  )
}
