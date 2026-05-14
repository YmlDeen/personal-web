import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const todayStr = () => new Date().toISOString().split('T')[0]
const timeStr = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
const AWS_EXPIRE = new Date('2026-08-21T00:00:00+07:00')
const GREET = () => {
  const h = new Date().getHours()
  return h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : 'good evening'
}

function useCountdown(target) {
  const calc = () => {
    const d = target - Date.now()
    if (d <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 }
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      mins: Math.floor((d % 3600000) / 60000),
      secs: Math.floor((d % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function useClock() {
  const [t, setT] = useState(timeStr())
  useEffect(() => {
    const id = setInterval(() => setT(timeStr()), 1000)
    return () => clearInterval(id)
  }, [])
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
    setVal('')
    setSaving(false)
    onDone()
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

// ── Finance summary card ──
function FinanceCard({ finance, loading, onClick }) {
  const balance = finance?.balance ?? null
  const expense = finance?.expense_today ?? null

  return (
    <NmCard onClick={onClick} style={{ padding: '16px 14px', gridColumn: 'span 2' }}>
      <div style={{
        fontFamily: 'var(--nm-mono)', fontSize: '9px',
        color: 'var(--nm-dim)', letterSpacing: '0.12em',
        textTransform: 'uppercase', marginBottom: '10px',
      }}>▸ finance</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {/* Balance */}
        <div>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '8px',
            color: 'var(--nm-dim)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '4px',
          }}>balance</div>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '20px', fontWeight: 500,
            color: balance !== null && balance < 0 ? 'var(--nm-danger)' : 'var(--nm-success)',
            lineHeight: 1,
          }}>
            {loading ? '—' : balance !== null ? `฿${balance.toLocaleString()}` : '—'}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '1px', height: '32px',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-inset-sm)',
          borderRadius: '1px',
          margin: '0 12px',
        }} />

        {/* Today's expense */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '8px',
            color: 'var(--nm-dim)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '4px',
          }}>today</div>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '20px', fontWeight: 500,
            color: 'var(--nm-accent2)', lineHeight: 1,
          }}>
            {loading ? '—' : expense !== null ? `฿${expense.toLocaleString()}` : '฿0'}
          </div>
        </div>

        {/* Arrow */}
        <div style={{
          marginLeft: 'auto',
          paddingLeft: '12px',
          fontFamily: 'var(--nm-mono)', fontSize: '14px',
          color: 'var(--nm-dim)',
        }}>→</div>
      </div>
    </NmCard>
  )
}

export default function Dashboard() {
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(true)
  const [briefError, setBriefError] = useState(false)
  const [data, setData] = useState({
    notes: 0, tasks: 0, links: 0,
    todayTasks: [],
    finance: null,
  })
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  const cd = useCountdown(AWS_EXPIRE)
  const clock = useClock()

  const loadBrief = async () => {
    setBriefLoading(true)
    setBriefError(false)
    try {
      const r = await api.get('/brief')
      setBrief(r.data)
    } catch {
      setBriefError(true)
    }
    setBriefLoading(false)
  }

  const load = useCallback(async () => {
    const today = todayStr()
    try {
      const [n, t, l, fin] = await Promise.all([
        api.get('/notes').then(r => r.data),
        api.get('/tasks').then(r => r.data),
        api.get('/links').then(r => r.data),
        api.get('/finance/summary').then(r => r.data).catch(() => null),
      ])
      const pending = t.filter(x => x.status !== 'done')
      const overdue = pending.filter(x => x.due_date && x.due_date < today)
      const dueToday = pending.filter(x => x.due_date === today)
      const todayTasks = [...overdue, ...dueToday].slice(0, 3)
      const fallback = todayTasks.length === 0 ? pending.slice(0, 3) : todayTasks
      setData({
        notes: n.length,
        tasks: pending.length,
        links: l.length,
        todayTasks: fallback,
        finance: fin,
      })
    } catch {}
    setLoading(false)
  }, [])

  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(load)

  useEffect(() => { load(); loadBrief() }, [])

  const urgency = cd.days < 30 ? 'var(--nm-danger)' : cd.days < 60 ? 'var(--nm-warn)' : 'var(--nm-dim)'
  const pct = Math.max(0, Math.min(100, (cd.days / 365) * 100))

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        padding: '0 16px 80px',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '100vh',
      }}
    >
      <PullIndicator pullY={pullY} refreshing={refreshing} />

      {/* ── Header ── */}
      <div
        className="fade-up"
        style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', padding: '20px 2px 0',
        }}
      >
        <div>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '9px',
            color: 'var(--nm-dim)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: '4px',
          }}>{GREET()}</div>
          <h1 style={{
            fontFamily: 'var(--nm-font)', fontSize: '28px',
            fontWeight: 900, color: 'var(--nm-text)',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            Overview<span style={{ color: 'var(--nm-accent)' }}>.</span>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '24px',
            fontWeight: 500, color: 'var(--nm-text)', lineHeight: 1,
          }}>{clock}</div>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '9px',
            color: 'var(--nm-dim)', letterSpacing: '0.1em', marginTop: '4px',
          }}>{todayStr()}</div>
        </div>
      </div>

      {/* ── Stats grid: Notes | Tasks | Links + Finance ── */}
      <div
        className="fade-up fade-up-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}
      >
        {[
          { label: 'Notes', value: data.notes, color: 'var(--nm-accent)',  path: '/notes' },
          { label: 'Tasks', value: data.tasks, color: 'var(--nm-accent2)', path: '/tasks' },
          { label: 'Links', value: data.links, color: 'var(--nm-warn)',    path: '/links' },
        ].map(s => (
          <NmCard key={s.label} onClick={() => nav(s.path)} style={{ padding: '16px 14px', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--nm-mono)', fontSize: '30px',
              fontWeight: 500, color: s.color, lineHeight: 1, marginBottom: '6px',
            }}>
              {loading ? '—' : String(s.value).padStart(2, '0')}
            </div>
            <div style={{
              fontFamily: 'var(--nm-mono)', fontSize: '9px',
              color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>{s.label}</div>
          </NmCard>
        ))}

        {/* Finance spans full width below */}
        <FinanceCard
          finance={data.finance}
          loading={loading}
          onClick={() => nav('/finance')}
        />
      </div>

      {/* ── AWS Countdown ── */}
      <NmCard className="fade-up fade-up-2" style={{ padding: '14px 16px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '10px',
        }}>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '9px',
            color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>AWS credit · Aug 21, 2026</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[['d', cd.days], ['h', cd.hours], ['m', cd.mins], ['s', cd.secs]].map(([l, v]) => (
              <span key={l} style={{
                fontFamily: 'var(--nm-mono)', fontSize: '13px',
                fontWeight: 500, color: urgency,
              }}>
                {String(v).padStart(2, '0')}
                <span style={{ fontSize: '9px', color: 'var(--nm-dim)', marginLeft: '2px' }}>{l}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{
          background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)',
          borderRadius: '50px', height: '8px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, ${urgency}88, ${urgency})`,
            borderRadius: '50px', transition: 'width 1s ease',
          }} />
        </div>
      </NmCard>

      {/* ── Today's Tasks ── */}
      <div className="fade-up fade-up-3">
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '8px',
        }}>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '9px',
            color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>▸ today's tasks</div>
          <span
            onClick={() => nav('/tasks')}
            style={{
              fontFamily: 'var(--nm-mono)', fontSize: '9px',
              color: 'var(--nm-accent)', letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >all →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.todayTasks.length === 0 && !loading && (
            <NmCard style={{
              textAlign: 'center', color: 'var(--nm-dim)',
              fontSize: '13px', padding: '16px', fontWeight: 600,
            }}>all clear ✓</NmCard>
          )}
          {data.todayTasks.map(t => {
            const overdue = t.due_date && t.due_date < todayStr()
            const dotColor = overdue || t.priority === 'high'
              ? 'var(--nm-danger)'
              : t.priority === 'medium'
                ? 'var(--nm-warn)'
                : 'var(--nm-dim)'
            return (
              <NmCard
                key={t.id}
                onClick={() => nav('/tasks')}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--nm-bg)',
                  boxShadow: `2px 2px 5px var(--nm-shadow-d), -2px -2px 5px var(--nm-shadow-l), inset 0 0 0 3px ${dotColor}`,
                }} />
                <span style={{
                  flex: 1, fontSize: '13px',
                  color: 'var(--nm-text)', fontWeight: 600, overflowWrap: 'anywhere',
                }}>{t.title}</span>
                {overdue && (
                  <span style={{
                    background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)',
                    borderRadius: '50px', fontSize: '8px',
                    fontFamily: 'var(--nm-mono)', color: 'var(--nm-danger)',
                    padding: '3px 8px', letterSpacing: '0.08em', flexShrink: 0,
                  }}>overdue</span>
                )}
              </NmCard>
            )
          })}
        </div>
      </div>

      {/* ── Daily Brief ── */}
      <NmCard
        className="fade-up fade-up-4"
        style={{ padding: '16px 18px', borderLeft: '3px solid var(--nm-accent)' }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '10px',
        }}>
          <div style={{
            fontFamily: 'var(--nm-mono)', fontSize: '9px',
            color: 'var(--nm-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>✦ daily brief</div>
          <button
            onClick={loadBrief}
            disabled={briefLoading}
            style={{
              background: 'var(--nm-bg)',
              boxShadow: briefLoading ? 'var(--nm-inset-sm)' : 'var(--nm-raised-sm)',
              border: 'none', borderRadius: '50%',
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: briefLoading ? 'default' : 'pointer',
              fontFamily: 'var(--nm-mono)', fontSize: '13px',
              color: 'var(--nm-accent)',
              transition: 'box-shadow 0.15s, transform 0.3s',
              transform: briefLoading ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >↺</button>
        </div>

        {briefLoading ? (
          <div style={{
            background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)',
            borderRadius: '8px', height: '40px', animation: 'nmPulse 1.5s infinite',
          }} />
        ) : briefError ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset-sm)',
            borderRadius: '10px', padding: '10px 14px',
          }}>
            <span style={{ fontSize: '16px' }}>✕</span>
            <span style={{
              fontFamily: 'var(--nm-mono)', fontSize: '11px',
              color: 'var(--nm-dim)', letterSpacing: '0.05em',
            }}>ไม่สามารถสร้าง brief ได้</span>
          </div>
        ) : (
          <div style={{
            margin: 0, fontSize: '13px', color: 'var(--nm-text)',
            lineHeight: 1.7, fontFamily: 'var(--nm-mono)', fontStyle: 'normal', fontWeight: 400,
          }}>
            {dangerouslySetInnerHTML={{__html: (brief?.brief ?? "ไม่มีข้อมูลเพียงพอ").replace(/\n/g, "<br/>")}}> style={{display:"block"}}>{line}</span>)}
          </div>
        )}
      </NmCard>

      {/* ── Quick Capture ── */}
      <div className="fade-up fade-up-5">
        <div style={{
          fontFamily: 'var(--nm-mono)', fontSize: '9px',
          color: 'var(--nm-dim)', letterSpacing: '0.12em',
          textTransform: 'uppercase', marginBottom: '8px',
        }}>▸ capture</div>
        <QuickCapture onDone={load} disabled={refreshing} />
      </div>
    </div>
  )
}
