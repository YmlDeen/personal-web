import { useEffect, useState } from 'react'
import api from '../api/client'

const COLORS = ['#7C6AF7','#00C896','#F5A623','#E05C5C','#5CB8E4','#C47AF7']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export default function Habits() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [habits, setHabits] = useState([])
  const [logs, setLogs]     = useState([])
  const [name, setName]     = useState('')
  const [color, setColor]   = useState(COLORS[0])

  const load = async () => {
    const [h, l] = await Promise.all([
      api.get('/habits'),
      api.get(`/habits/logs?year=${year}&month=${month}`)
    ])
    setHabits(h.data)
    setLogs(l.data)
  }

  useEffect(() => { load() }, [year, month])

  const add = async () => {
    if (!name.trim()) return
    await api.post('/habits', { name, color })
    setName('')
    load()
  }

  const del = async id => { await api.delete(`/habits/${id}`); load() }

  const toggle = async (habitId, date) => {
    await api.post(`/habits/${habitId}/log`, { date })
    load()
  }

  const isChecked = (habitId, day) => {
    const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return logs.some(l => l.habit_id === habitId && l.date === date)
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

  const daysInMonth = getDaysInMonth(year, month)
  const today = now.getDate()
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const prevMonth = () => { if (month === 1) { setYear(y => y-1); setMonth(12) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 12) { setYear(y => y+1); setMonth(1) } else setMonth(m => m+1) }

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {habits.length} habits tracked
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Habits<span style={{ color: '#00C896' }}>.</span>
        </h1>
      </div>

      <div className="fade-up fade-up-1" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input className="input" placeholder="new habit..." value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 1, minWidth: '160px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid var(--text)' : '2px solid transparent', transition: 'all 0.15s' }} />
          ))}
        </div>
        <button className="btn btn-primary" onClick={add}>+ add</button>
      </div>

      <div className="fade-up fade-up-2" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <button className="btn" onClick={prevMonth} style={{ padding: '4px 10px' }}>‹</button>
        <span style={{ fontSize: '13px', color: 'var(--text)', letterSpacing: '0.05em', minWidth: '80px', textAlign: 'center' }}>
          {monthNames[month-1]} {year}
        </span>
        <button className="btn" onClick={nextMonth} style={{ padding: '4px 10px' }}>›</button>
      </div>

      {habits.length === 0 && (
        <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
          no habits yet
        </div>
      )}

      {habits.map((h, hi) => {
        const streak = (() => {
          let s = 0
          for (let d = today; d >= 1; d--) {
            if (year === now.getFullYear() && month === now.getMonth()+1 && isChecked(h.id, d)) s++
            else break
          }
          return s
        })()
        return (
          <div key={h.id} className="fade-up card" style={{ marginBottom: '12px', padding: '16px', animationDelay: `${hi * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{h.name}</span>
              {streak > 0 && <span style={{ fontSize: '10px', color: h.color, letterSpacing: '0.05em' }}>🔥 {streak}d</span>}
              <button className="btn btn-danger" onClick={() => del(h.id)} style={{ fontSize: '10px', padding: '2px 8px' }}>del</button>
            </div>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const checked = isChecked(h.id, d)
                const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                const isToday = dateStr === todayStr
                return (
                  <div key={d} onClick={() => toggle(h.id, dateStr)} style={{
                    width: '24px', height: '24px', borderRadius: '3px', cursor: 'pointer',
                    background: checked ? h.color : 'var(--surface2, #1a1a2e)',
                    border: isToday ? `1px solid ${h.color}` : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', color: checked ? '#000' : 'var(--dim)',
                    transition: 'all 0.1s', opacity: d > today && year === now.getFullYear() && month === now.getMonth()+1 ? 0.3 : 1
                  }}>
                    {d}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
