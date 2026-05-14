import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

const PRIORITY = {
  high:   { label: 'high', color: 'var(--nm-danger)' },
  medium: { label: 'med',  color: 'var(--nm-warn)' },
  low:    { label: 'low',  color: 'var(--nm-dim)' },
}
const REPEAT_ICON = { daily: '↻d', weekly: '↻w', monthly: '↻m' }

function priorityOrder(p) { return p === 'high' ? 0 : p === 'medium' ? 1 : 2 }

function formatDue(due) {
  if (!due) return null
  const d = new Date(due)
  const today = new Date(new Date().toDateString())
  const diff = Math.round((d - today) / 86400000)
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: 'var(--nm-danger)' }
  if (diff === 0) return { text: 'today', color: 'var(--nm-warn)' }
  if (diff === 1) return { text: 'tomorrow', color: 'var(--nm-accent2)' }
  return { text: `${diff}d left`, color: 'var(--nm-dim)' }
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

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; setSwiping(true) }
  const onTouchMove = (e) => {
    if (startX.current === null) return
    setSwipeX(Math.max(-110, Math.min(110, e.touches[0].clientX - startX.current)))
  }
  const onTouchEnd = () => {
    if (swipeX > THRESHOLD) { setFlash('done'); setTimeout(() => { setFlash(null); onToggle(t) }, 220) }
    else if (swipeX < -THRESHOLD) { setFlash('del'); setTimeout(() => { setFlash(null); onDel(t.id) }, 220) }
    setSwipeX(0); setSwiping(false); startX.current = null
  }

  const flashBg = flash === 'done' ? 'rgba(60,184,122,0.15)' : flash === 'del' ? 'rgba(224,85,85,0.15)' : undefined

  return (
    <div
      style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {swipeX > 20 && (
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontFamily: 'var(--nm-mono)', color: 'var(--nm-success)', opacity: Math.min(1, swipeX / 60), pointerEvents: 'none', letterSpacing: '0.06em' }}>✓ done</div>
      )}
      {swipeX < -20 && (
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontFamily: 'var(--nm-mono)', color: 'var(--nm-danger)', opacity: Math.min(1, Math.abs(swipeX) / 60), pointerEvents: 'none', letterSpacing: '0.06em' }}>del ✕</div>
      )}
      <div style={{
        background: flashBg || 'var(--nm-bg)',
        boxShadow: done ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: done ? 0.5 : 1,
        transform: `translateX(${swipeX}px)`,
        transition: swiping ? 'none' : 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, opacity 0.2s',
      }}>
        {/* checkbox */}
        <div onClick={() => onToggle(t)} style={{
          width: '20px', height: '20px', flexShrink: 0, cursor: 'pointer',
          background: 'var(--nm-bg)',
          boxShadow: done ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px',
          color: done ? 'var(--nm-success)' : 'transparent',
          transition: 'all 0.2s',
        }}>{done ? '✓' : ''}</div>

        <span style={{
          flex: 1, fontSize: '13px', fontWeight: 600,
          color: done ? 'var(--nm-dim)' : 'var(--nm-text)',
          textDecoration: done ? 'line-through' : 'none',
          fontFamily: 'var(--nm-font)',
          overflowWrap: 'anywhere',
        }}>{t.title}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {t.repeat && !done && (
            <span style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-accent)', letterSpacing: '0.04em' }}>{REPEAT_ICON[t.repeat]}</span>
          )}
          {due && !done && (
            <span style={{
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-inset-sm)',
              borderRadius: '50px',
              fontSize: '9px', fontFamily: 'var(--nm-mono)',
              color: due.color, padding: '3px 8px', letterSpacing: '0.06em',
            }}>{due.text}</span>
          )}
          <span style={{
            background: 'var(--nm-bg)',
            boxShadow: 'var(--nm-inset-sm)',
            borderRadius: '50px',
            fontSize: '9px', fontFamily: 'var(--nm-mono)',
            color: p.color, padding: '3px 8px', letterSpacing: '0.06em',
          }}>{p.label}</span>
          <button onClick={() => onDel(t.id)} style={{
            background: 'transparent', border: 'none',
            color: 'var(--nm-danger)', fontFamily: 'var(--nm-mono)',
            fontSize: '10px', cursor: 'pointer', padding: '4px 6px',
            borderRadius: '6px', letterSpacing: '0.04em',
          }}>del</button>
        </div>
      </div>
    </div>
  )
}

function BottomSheet({ open, onClose, children }) {
  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 300,
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--nm-bg)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(80px + env(safe-area-inset-bottom))',
        zIndex: 301,
        animation: 'nmSlideUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{
          width: '36px', height: '4px', borderRadius: '2px',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-inset-sm)',
          margin: '0 auto 20px',
        }} />
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
    <div style={{ padding: '24px 16px 100px', maxWidth: '700px' }}>

      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {pending.length} pending · {done.length} done
          </div>
          <h1 style={{ fontFamily: 'var(--nm-font)', fontSize: '26px', fontWeight: 900, color: 'var(--nm-text)', letterSpacing: '-0.02em', margin: 0 }}>
            Tasks<span style={{ color: 'var(--nm-accent2)' }}>.</span>
          </h1>
        </div>
        <button onClick={() => setOpen(true)} style={{
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-raised-sm)',
          border: 'none', borderRadius: '10px',
          padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'var(--nm-mono)', fontSize: '11px',
          fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--nm-accent)',
          transition: 'box-shadow 0.15s',
        }}
          onPointerDown={e => e.currentTarget.style.boxShadow = 'var(--nm-inset-sm)'}
          onPointerUp={e => e.currentTarget.style.boxShadow = 'var(--nm-raised-sm)'}
          onPointerLeave={e => e.currentTarget.style.boxShadow = 'var(--nm-raised-sm)'}
        >+ add</button>
      </div>

      {pending.length > 0 && (
        <div className="fade-up fade-up-2" style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>▸ pending</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pending.map(t => <TaskRow key={t.id} t={t} onToggle={t => toggleMutation.mutate(t)} onDel={id => delMutation.mutate(id)} />)}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="fade-up fade-up-3">
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>▸ completed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {done.map(t => <TaskRow key={t.id} t={t} onToggle={t => toggleMutation.mutate(t)} onDel={id => delMutation.mutate(id)} />)}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div style={{
          background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset)',
          borderRadius: '16px', padding: '32px',
          textAlign: 'center', color: 'var(--nm-dim)',
          fontFamily: 'var(--nm-mono)', fontSize: '11px', letterSpacing: '0.08em',
        }}>no tasks yet</div>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>new task</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input className="nm-input" placeholder="task title..." value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && add()} autoFocus />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="nm-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ flex: 1 }}>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <input className="nm-input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <select className="nm-input" value={form.repeat} onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}>
            <option value="">no repeat</option>
            <option value="daily">↻ daily</option>
            <option value="weekly">↻ weekly</option>
            <option value="monthly">↻ monthly</option>
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nm-btn-primary" style={{ flex: 1 }} onClick={add}>↑ save</button>
            <button className="nm-btn" onClick={() => setOpen(false)}>cancel</button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
