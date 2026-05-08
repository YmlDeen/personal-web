import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

  const startX = useRef(null)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [flash, setFlash] = useState(null)

  const THRESHOLD = 72

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  const onTouchMove = (e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    setSwipeX(Math.max(-110, Math.min(110, dx)))
  }

  const onTouchEnd = () => {
    if (swipeX > THRESHOLD) {
      setFlash('done')
      setTimeout(() => { setFlash(null); onToggle(t) }, 220)
    } else if (swipeX < -THRESHOLD) {
      setFlash('del')
      setTimeout(() => { setFlash(null); onDel(t.id) }, 220)
    }
    setSwipeX(0)
    setSwiping(false)
    startX.current = null
  }

  const bg = flash === 'done'
    ? 'rgba(45,212,191,0.18)'
    : flash === 'del'
    ? 'rgba(248,113,113,0.18)'
    : swipeX > 30
    ? `rgba(45,212,191,${Math.min(0.15, swipeX / 500)})`
    : swipeX < -30
    ? `rgba(248,113,113,${Math.min(0.15, Math.abs(swipeX) / 500)})`
    : undefined

  return (
    <div
      style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {swipeX > 20 && (
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--accent2)', opacity: Math.min(1, swipeX / 60), pointerEvents: 'none' }}>✓ done</div>
      )}
      {swipeX < -20 && (
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--danger)', opacity: Math.min(1, Math.abs(swipeX) / 60), pointerEvents: 'none' }}>del ✕</div>
      )}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          opacity: done ? 0.45 : 1,
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s',
          background: bg || undefined,
        }}
      >
        <div onClick={() => onToggle(t)} style={{
          width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer',
          border: `1px solid ${done ? 'var(--accent2)' : 'var(--muted)'}`,
          borderRadius: '2px', background: done ? 'var(--accent2)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', transition: 'all 0.15s',
        }}>{done ? '✓' : ''}</div>
        <span style={{ flex: 1, fontSize: '13px', color: done ? 'var(--dim)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', overflowWrap: 'anywhere' }}>{t.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {t.repeat && !done && <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '0.04em' }}>{REPEAT_ICON[t.repeat]}</span>}
          {due && !done && <span style={{ fontSize: '10px', color: due.color, letterSpacing: '0.04em' }}>{due.text}</span>}
          <span style={{ fontSize: '9px', color: p.color, border: `1px solid ${p.color}`, borderRadius: '3px', padding: '1px 5px', letterSpacing: '0.06em', opacity: 0.85 }}>{p.label}</span>
          <button className="btn btn-danger" onClick={() => onDel(t.id)}>del</button>
        </div>
      </div>
    </div>
  )
}

function BottomSheet({ open, onClose, children }) {
  if (!open) return null
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 300, animation: 'fadeIn 0.2s ease both' }}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(12,12,22,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px 16px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom))',
        zIndex: 301,
        animation: 'slideUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
        {children}
      </div>
    </>
  )
}

export default function Tasks() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', repeat: '' })
  const [open, setOpen] = useState(false)

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  })

  const addMutation = useMutation({
    mutationFn: (body) => api.post('/tasks', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setForm({ title: '', priority: 'medium', due_date: '', repeat: '' })
      setOpen(false)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (t) => api.put(`/tasks/${t.id}`, { status: t.status === 'done' ? 'todo' : 'done' }),
    onMutate: async (t) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const prev = qc.getQueryData(['tasks'])
      qc.setQueryData(['tasks'], old => old.map(x => x.id === t.id ? { ...x, status: x.status === 'done' ? 'todo' : 'done' } : x))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(['tasks'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const delMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const prev = qc.getQueryData(['tasks'])
      qc.setQueryData(['tasks'], old => old.filter(x => x.id !== id))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(['tasks'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const add = () => {
    if (!form.title.trim()) return
    addMutation.mutate({ title: form.title, priority: form.priority, due_date: form.due_date || null, repeat: form.repeat || null })
  }

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
    <div style={{ padding: '32px 16px', maxWidth: '700px' }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {pending.length} pending · {done.length} done
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
            Tasks<span style={{ color: 'var(--accent2)' }}>.</span>
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ add task</button>
      </div>

      {pending.length > 0 && (
        <div className="fade-up fade-up-2" style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>▸ pending</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pending.map(t => <TaskRow key={t.id} t={t} onToggle={t => toggleMutation.mutate(t)} onDel={id => delMutation.mutate(id)} />)}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="fade-up fade-up-3">
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>▸ completed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {done.map(t => <TaskRow key={t.id} t={t} onToggle={t => toggleMutation.mutate(t)} onDel={id => delMutation.mutate(id)} />)}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
          no tasks yet
        </div>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>new task</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={add}>↑ save</button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>cancel</button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
