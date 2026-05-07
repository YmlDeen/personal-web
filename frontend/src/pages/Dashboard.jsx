import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19)
const AWS_EXPIRE = new Date('2026-08-21T00:00:00+07:00')

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

function QuickCapture({ onDone }) {
  const [mode, setMode] = useState('task')
  const [val, setVal] = useState('')

  const mutation = useMutation({
    mutationFn: () => mode === 'task'
      ? api.post('/tasks', { title: val, priority: 'medium' })
      : api.post('/notes', { title: val, content: '' }),
    onSuccess: () => {
      setVal('')
      onDone()
    },
  })

  const save = () => {
    if (!val.trim() || mutation.isPending) return
    mutation.mutate()
  }

  return (
    <div className="card fade-up" style={{ padding: '12px 16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {['task', 'note'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', border: 'none',
            background: mode === m ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            color: mode === m ? '#fff' : 'var(--dim)', fontFamily: 'JetBrains Mono, monospace',
            transition: 'all 0.15s',
          }}>{m}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          className="input" style={{ flex: 1 }}
          placeholder={mode === 'task' ? 'quick task...' : 'quick note title...'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
        />
        <button className="btn btn-primary" onClick={save} disabled={mutation.isPending} style={{ padding: '8px 14px' }}>
          {mutation.isPending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const qc = useQueryClient()
  const nav = useNavigate()
  const cd = useCountdown(AWS_EXPIRE)

  const { data: notesData = [], isLoading: ln } = useQuery({
    queryKey: ['notes'],
    queryFn: () => api.get('/notes').then(r => r.data),
  })

  const { data: tasksData = [], isLoading: lt } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  })

  const { data: linksData = [], isLoading: ll } = useQuery({
    queryKey: ['links'],
    queryFn: () => api.get('/links').then(r => r.data),
  })

  const loading = ln || lt || ll

  const counts = {
    notes: notesData.length,
    tasks: tasksData.length,
    links: linksData.length,
  }

  const recent = {
    notes: notesData.slice(0, 3),
    tasks: tasksData.filter(t => t.status !== 'done').slice(0, 3),
  }

  const onDone = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] })
    qc.invalidateQueries({ queryKey: ['notes'] })
  }

  const stats = [
    { label: 'Notes',  value: counts.notes, color: 'var(--accent)',  path: '/notes' },
    { label: 'Tasks',  value: counts.tasks, color: 'var(--accent2)', path: '/tasks' },
    { label: 'Links',  value: counts.links, color: 'var(--warn)',     path: '/links' },
  ]

  const urgency = cd.days < 30 ? 'var(--danger)' : cd.days < 60 ? 'var(--warn)' : 'var(--dim)'

  return (
    <div style={{ padding: '20px 16px', maxWidth: '900px' }}>
      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {now()}
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Overview<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
      </div>

      <QuickCapture onDone={onDone} />

      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {stats.map(s => (
          <div key={s.label} className="card" onClick={() => nav(s.path)}
            style={{ padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.color }} />
            <div style={{ fontSize: '32px', fontWeight: 700, color: s.color, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>
              {loading ? '—' : String(s.value).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card fade-up fade-up-2" style={{ marginBottom: '24px', padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: urgency }} />
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
          ▸ AWS credit expires — Aug 21, 2026
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
          {[['days', cd.days], ['hrs', cd.hours], ['min', cd.mins], ['sec', cd.secs]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: urgency, lineHeight: 1 }}>
                {String(val).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up fade-up-3" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>▸ recent notes</span>
          <span onClick={() => nav('/notes')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>view all →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recent.notes.length === 0 && !loading && (
            <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '12px', border: '1px dashed var(--border)', borderRadius: '2px' }}>no notes yet</div>
          )}
          {recent.notes.map((n, i) => (
            <div key={n.id} className={`card fade-up fade-up-${i + 1}`}
              style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => nav('/notes')}>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{n.title}</span>
              <span style={{ fontSize: '11px', color: 'var(--dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up fade-up-4">
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>▸ pending tasks</span>
          <span onClick={() => nav('/tasks')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>view all →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recent.tasks.length === 0 && !loading && (
            <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '12px', border: '1px dashed var(--border)', borderRadius: '2px' }}>no pending tasks</div>
          )}
          {recent.tasks.map((t, i) => (
            <div key={t.id} className={`card fade-up fade-up-${i + 1}`}
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              onClick={() => nav('/tasks')}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent2)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
