import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const todayStr = () => new Date().toISOString().split('T')[0]
const timeStr = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
const AWS_EXPIRE = new Date('2026-08-21T00:00:00+07:00')
const GREET = () => { const h = new Date().getHours(); return h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : 'good evening' }

function useCountdown(target) {
  const calc = () => { const d = target - Date.now(); if (d <= 0) return { days:0,hours:0,mins:0,secs:0 }; return { days:Math.floor(d/86400000), hours:Math.floor((d%86400000)/3600000), mins:Math.floor((d%3600000)/60000), secs:Math.floor((d%60000)/1000) } }
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [])
  return t
}

function useClock() {
  const [t, setT] = useState(timeStr())
  useEffect(() => { const id = setInterval(() => setT(timeStr()), 1000); return () => clearInterval(id) }, [])
  return t
}

function usePullToRefresh(onRefresh) {
  const startY = useRef(0)
  const pulling = useRef(false)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const THRESHOLD = 72

  const onTouchStart = useCallback((e) => {
    if (window.scrollY > 0) return
    startY.current = e.touches[0].clientY
    pulling.current = true
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return
    const dy = e.touches[0].clientY - startY.current
    if (dy < 0) return
    setPullY(Math.min(dy * 0.45, THRESHOLD + 20))
  }, [refreshing])

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false
    if (pullY >= THRESHOLD) {
      setRefreshing(true)
      setPullY(THRESHOLD)
      await onRefresh()
      setRefreshing(false)
    }
    setPullY(0)
  }, [pullY, onRefresh])

  return { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd }
}

function PullIndicator({ pullY, refreshing, threshold = 72 }) {
  const pct = Math.min(pullY / threshold, 1)
  const ready = pullY >= threshold
  return (
    <div style={{
      height: `${pullY}px`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: refreshing ? 'height 0.2s ease' : 'none',
    }}>
      <div style={{
        width: '36px', height: '36px',
        background: 'var(--nm-bg)',
        boxShadow: ready ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pct,
        transform: `scale(${0.6 + pct * 0.4}) rotate(${refreshing ? 0 : pullY * 3}deg)`,
        transition: refreshing ? 'transform 0.1s linear' : 'none',
        animation: refreshing ? 'nmSpin 0.8s linear infinite' : 'none',
        fontSize: '16px',
        color: ready ? 'var(--nm-accent)' : 'var(--nm-dim)',
      }}>
        {refreshing ? '↻' : '↓'}
      </div>
    </div>
  )
}

function NmCard({ children, style = {}, onClick, className = '' }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div
      onClick={onClick}
      onPointerDown={() => onClick && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={className}
      style={{
        background: 'var(--nm-bg)',
        boxShadow: pressed ? 'var(--nm-inset)' : 'var(--nm-raised)',
        borderRadius: '16px',
        border: 'none',
        padding: '14px 16px',
        transition: 'box-shadow 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function QuickCapture({ onDone, disabled }) {
  const [mode, setMode] = useState('task')
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!val.trim() || saving || disabled) return
    setSaving(true)
    if (mode === 'task') await api.post('/tasks', { title: val, priority: 'medium' })
    if (mode === 'note') await api.post('/notes', { title: val, content: '' })
    setVal(''); setSaving(false); onDone()
  }
  return (
    <NmCard style={{ padding: '14px 16px', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {['task', 'note'].map(m => (
          <button key={m} onClick={() => setMode(m)} disabled={disabled} style={{
            background: 'var(--nm-bg)',
            boxShadow: mode === m ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
            border: 'none', borderRadius: '50px',
            fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 14px', cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--nm-mono)', fontWeight: 700,
            color: mode === m ? 'var(--nm-accent)' : 'var(--nm-dim)',
            transition: 'all 0.2s',
          }}>{m}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          style={{
            flex: 1, background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset)',
            borderRadius: '12px', border: 'none', outline: 'none',
            fontSize: '13px', padding: '10px 14px',
            color: 'var(--nm-text)', fontFamily: 'var(--nm-font)', fontWeight: 600,
          }}
          placeholder={mode === 'task' ? 'quick task...' : 'quick note...'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          disabled={disabled}
        />
        <button onClick={save} disabled={saving || disabled} style={{
          width: '40px', height: '40px', background: 'var(--nm-bg)',
          boxShadow: saving ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
          border: 'none', borderRadius: '50%', cursor: 'pointer',
          fontSize: '16px', color: 'var(--nm-accent)', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'box-shadow 0.15s',
        }}>{saving ? '·' : '↑'}</button>
      </div>
    </NmCard>
  )
}

export default function Dashboard() {
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(true)
  const [data, setData] = useState({ notes:0, tasks:0, links:0, todayTasks:[], habits:[], habitLogs:[] })
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  const cd = useCountdown(AWS_EXPIRE)
  const clock = useClock()

  const loadBrief = async () => {
    try { const r = await api.get('/brief'); setBrief(r.data) } catch {}
    setBriefLoading(false)
  }

  const load = useCallback(async () => {
    const today = todayStr()
    const [year, month] = today.split('-')
    const [n, t, l, h, hl] = await Promise.all([
      api.get('/notes').then(r => r.data),
      api.get('/tasks').then(r => r.data),
      api.get('/links').then(r => r.data),
      api.get('/habits').then(r => r.data),
      api.get(`/habits/logs?year=${year}&month=${month}`).then(r => r.data).catch(() => []),
    ])
    const pending = t.filter(x => x.status !== 'done')
    const overdue = pending.filter(x => x.due_date && x.due_date < today)
    const dueToday = pending.filter(x => x.due_date === today)
    const todayTasks = [...overdue, ...dueToday].slice(0, 3)
    const fallback = todayTasks.length === 0 ? pending.slice(0, 3) : todayTasks
    const todayLogs = hl.filter(l => l.date === today)
    setData({ notes:n.length, tasks:pending.length, links:l.length, todayTasks:fallback, habits:h, habitLogs:todayLogs })
    setLoading(false)
  }, [])

  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(load)

  useEffect(() => { load(); loadBrief() }, [])

  const urgency = cd.days < 30 ? 'var(--nm-danger)' : cd.days < 60 ? 'var(--nm-warn)' : 'var(--nm-dim)'
  const pct = Math.max(0, Math.min(100, (cd.days / 365) * 100))

  const toggleHabit = async (habit) => {
    const done = data.habitLogs.some(l => l.habit_id === habit.id)
    if (done) return
    await api.post(`/habits/${habit.id}/log`, { date: todayStr() })
    load()
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ padding: '0 16px 80px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '100vh' }}
    >
      <PullIndicator pullY={pullY} refreshing={refreshing} />

      <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 2px 0' }} className="fade-up">
        <div>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{GREET()}</div>
          <h1 style={{ fontFamily: 'var(--nm-font)', fontSize: '28px', fontWeight: 900, color: 'var(--nm-text)', letterSpacing: '-0.02em', margin: 0 }}>
            Overview<span style={{ color: 'var(--nm-accent)' }}>.</span>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '24px', fontWeight: 500, color: 'var(--nm-text)', lineHeight: 1 }}>{clock}</div>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.1em', marginTop: '4px' }}>{todayStr()}</div>
        </div>
      </div>

      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          { label: 'Notes',  value: data.notes, color: 'var(--nm-accent)',  path: '/notes' },
          { label: 'Tasks',  value: data.tasks, color: 'var(--nm-accent2)', path: '/tasks' },
          { label: 'Links',  value: data.links, color: 'var(--nm-warn)',    path: '/links' },
        ].map(s => (
          <NmCard key={s.label} onClick={() => nav(s.path)} style={{ padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '30px', fontWeight: 500, color: s.color, lineHeight: 1, marginBottom: '6px' }}>
              {loading ? '—' : String(s.value).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.label}</div>
          </NmCard>
        ))}
      </div>

      <NmCard className="fade-up fade-up-2" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AWS credit · Aug 21, 2026</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[['d',cd.days],['h',cd.hours],['m',cd.mins],['s',cd.secs]].map(([l,v]) => (
              <span key={l} style={{ fontFamily: 'var(--nm-mono)', fontSize: '13px', fontWeight: 500, color: urgency }}>
                {String(v).padStart(2,'0')}<span style={{ fontSize: '9px', color: 'var(--nm-dim)', marginLeft: '2px' }}>{l}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)', borderRadius: '50px', height: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${urgency}88, ${urgency})`, borderRadius: '50px', transition: 'width 1s ease' }} />
        </div>
      </NmCard>

      <div className="fade-up fade-up-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>▸ today's tasks</div>
          <span onClick={() => nav('/tasks')} style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>all →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.todayTasks.length === 0 && !loading && (
            <NmCard style={{ textAlign: 'center', color: 'var(--nm-dim)', fontSize: '13px', padding: '16px', fontWeight: 600 }}>all clear ✓</NmCard>
          )}
          {data.todayTasks.map(t => {
            const overdue = t.due_date && t.due_date < todayStr()
            const dotColor = overdue ? 'var(--nm-danger)' : t.priority==='high' ? 'var(--nm-danger)' : t.priority==='medium' ? 'var(--nm-warn)' : 'var(--nm-dim)'
            return (
              <NmCard key={t.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--nm-bg)',
                  boxShadow: `2px 2px 5px var(--nm-shadow-d), -2px -2px 5px var(--nm-shadow-l), inset 0 0 0 3px ${dotColor}`,
                }} />
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--nm-text)', fontWeight: 600, overflowWrap: 'anywhere' }}>{t.title}</span>
                {overdue && (
                  <span style={{ background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)', borderRadius: '50px', fontSize: '8px', fontFamily: 'var(--nm-mono)', color: 'var(--nm-danger)', padding: '3px 8px', letterSpacing: '0.08em' }}>overdue</span>
                )}
              </NmCard>
            )
          })}
        </div>
      </div>

      {data.habits.length > 0 && (
        <div className="fade-up fade-up-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>▸ habits today</div>
            <span onClick={() => nav('/habits')} style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>all →</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.habits.map(h => {
              const done = data.habitLogs.some(l => l.habit_id === h.id)
              return (
                <button key={h.id} onClick={() => toggleHabit(h)} style={{
                  background: 'var(--nm-bg)',
                  boxShadow: done ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
                  border: 'none', borderRadius: '50px',
                  padding: '7px 16px', cursor: done ? 'default' : 'pointer',
                  fontSize: '12px', fontFamily: 'var(--nm-font)', fontWeight: 700,
                  color: done ? h.color : 'var(--nm-dim)',
                  transition: 'all 0.25s ease',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ fontSize: '13px' }}>{done ? '✓' : '○'}</span>
                  <span>{h.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <NmCard className="fade-up fade-up-5" style={{ padding: '16px 18px', borderLeft: '3px solid var(--nm-accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>✦ daily brief</div>
          <span onClick={loadBrief} style={{ fontFamily: 'var(--nm-mono)', fontSize: '14px', color: 'var(--nm-accent)', cursor: 'pointer' }}>{briefLoading ? '·' : '↺'}</span>
        </div>
        {briefLoading ? (
          <div style={{ background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)', borderRadius: '8px', height: '40px', animation: 'nmPulse 1.5s infinite' }} />
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--nm-text)', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 600 }}>
            {brief?.brief ?? 'ไม่มีข้อมูลเพียงพอ'}
          </p>
        )}
      </NmCard>

      <div className="fade-up fade-up-6">
        <div style={{ fontFamily: 'var(--nm-mono)', fontSize: '9px', color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>▸ capture</div>
        <QuickCapture onDone={load} disabled={refreshing} />
      </div>

    </div>
  )
}
