import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

const COLORS = ['#7C6AF7','#00C896','#F5A623','#E05C5C','#5CB8E4','#C47AF7']

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export default function Habits() {
  const now = new Date()
  const qc = useQueryClient()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [name, setName]   = useState('')
  const [color, setColor] = useState(COLORS[0])

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits').then(r => r.data),
  })

  const { data: logs = [] } = useQuery({
    queryKey: ['habit-logs', year, month],
    queryFn: () => api.get(`/habits/logs?year=${year}&month=${month}`).then(r => r.data),
  })

  const addMutation = useMutation({
    mutationFn: () => api.post('/habits', { name, color }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      setName('')
    },
  })

  const delMutation = useMutation({
    mutationFn: (id) => api.delete(`/habits/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['habits'] })
      const prev = qc.getQueryData(['habits'])
      qc.setQueryData(['habits'], old => old.filter(h => h.id !== id))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(['habits'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ habitId, date }) => api.post(`/habits/${habitId}/log`, { date }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit-logs', year, month] }),
  })

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
        <input className="nm-input" placeholder="new habit..." value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && addMutation.mutate()} style={{ flex: 1, minWidth: '160px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid var(--text)' : '2px solid transparent', transition: 'all 0.15s' }} />
          ))}
        </div>
        <button className="nm-btn btn-primary" onClick={() => name.trim() && addMutation.mutate()}>+ add</button>
      </div>

      <div className="fade-up fade-up-2" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <button className="nm-btn" onClick={prevMonth} style={{ padding: '4px 10px' }}>‹</button>
        <span style={{ fontSize: '13px', color: 'var(--text)', letterSpacing: '0.05em', minWidth: '80px', textAlign: 'center' }}>
          {monthNames[month-1]} {year}
        </span>
        <button className="nm-btn" onClick={nextMonth} style={{ padding: '4px 10px' }}>›</button>
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
              <button className="nm-btn btn-danger" onClick={() => delMutation.mutate(h.id)} style={{ fontSize: '10px', padding: '2px 8px' }}>del</button>
            </div>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const checked = isChecked(h.id, d)
                const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                const isToday = dateStr === todayStr
                return (
                  <div key={d} onClick={() => toggleMutation.mutate({ habitId: h.id, date: dateStr })} style={{
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
