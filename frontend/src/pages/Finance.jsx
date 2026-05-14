import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

const CATEGORIES = ['food','transport','shopping','health','entertainment','salary','freelance','other']

export default function Finance() {
  const now = new Date()
  const qc = useQueryClient()
  const [year, setYear]       = useState(now.getFullYear())
  const [month, setMonth]     = useState(now.getMonth() + 1)
  const [type, setType]       = useState('expense')
  const [amount, setAmount]   = useState('')
  const [category, setCategory] = useState('other')
  const [note, setNote]       = useState('')

  const { data: entries = [] } = useQuery({
    queryKey: ['finance', year, month],
    queryFn: () => api.get(`/finance?year=${year}&month=${month}`).then(r => r.data),
  })

  const { data: summary = { income: 0, expense: 0, balance: 0 } } = useQuery({
    queryKey: ['finance-summary', year, month],
    queryFn: () => api.get(`/finance/summary?year=${year}&month=${month}`).then(r => r.data),
  })

  const addMutation = useMutation({
    mutationFn: () => api.post('/finance', { type, amount: parseFloat(amount), category, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', year, month] })
      qc.invalidateQueries({ queryKey: ['finance-summary', year, month] })
      setAmount('')
      setNote('')
    },
  })

  const delMutation = useMutation({
    mutationFn: (id) => api.delete(`/finance/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['finance', year, month] })
      const prev = qc.getQueryData(['finance', year, month])
      qc.setQueryData(['finance', year, month], old => old.filter(e => e.id !== id))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(['finance', year, month], ctx.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['finance', year, month] })
      qc.invalidateQueries({ queryKey: ['finance-summary', year, month] })
    },
  })

  const add = () => {
    if (!amount || isNaN(amount)) return
    addMutation.mutate()
  }

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const prevMonth = () => { if (month === 1) { setYear(y => y-1); setMonth(12) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 12) { setYear(y => y+1); setMonth(1) } else setMonth(m => m+1) }

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          monthly tracker
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Finance<span style={{ color: '#F5A623' }}>.</span>
        </h1>
      </div>

      <div className="fade-up fade-up-1" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <button className="nm-btn" onClick={prevMonth} style={{ padding: '4px 10px' }}>‹</button>
        <span style={{ fontSize: '13px', color: 'var(--text)', letterSpacing: '0.05em', minWidth: '80px', textAlign: 'center' }}>
          {monthNames[month-1]} {year}
        </span>
        <button className="nm-btn" onClick={nextMonth} style={{ padding: '4px 10px' }}>›</button>
      </div>

      <div className="fade-up fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'INCOME', value: summary.income, color: '#00C896' },
          { label: 'EXPENSE', value: summary.expense, color: '#E05C5C' },
          { label: 'BALANCE', value: summary.balance, color: summary.balance >= 0 ? '#00C896' : '#E05C5C' },
        ].map(c => (
          <div key={c.label} className="nm-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', marginBottom: '6px' }}>{c.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: c.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {summary.balance < 0 && c.label === 'BALANCE' ? '-' : ''}{Math.abs(c.value).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="fade-up fade-up-3 nm-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {['expense','income'].map(t => (
            <button key={t} onClick={() => setType(t)} className="nm-btn" style={{
              background: type === t ? (t === 'income' ? '#00C896' : '#E05C5C') : 'transparent',
              color: type === t ? '#000' : 'var(--dim)', fontSize: '11px', padding: '4px 12px',
              border: `1px solid ${t === 'income' ? '#00C896' : '#E05C5C'}`
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input className="nm-input" placeholder="amount" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ width: '100px' }} type="number" />
          <select className="nm-input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1 }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="nm-input" placeholder="note (optional)" value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 2 }} />
          <button className="nm-btn btn-primary" onClick={add}>+ add</button>
        </div>
      </div>

      <div className="fade-up fade-up-4">
        {entries.length === 0 ? (
          <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
            no entries yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entries.map((e, i) => (
              <div key={e.id} className="nm-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${i * 0.03}s` }}>
                <span style={{ fontSize: '10px', color: 'var(--dim)', minWidth: '60px' }}>{e.date}</span>
                <span style={{ fontSize: '10px', color: 'var(--dim)', minWidth: '70px' }}>{e.category}</span>
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--dim)' }}>{e.note || '—'}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: e.type === 'income' ? '#00C896' : '#E05C5C', fontFamily: 'JetBrains Mono, monospace', minWidth: '80px', textAlign: 'right' }}>
                  {e.type === 'income' ? '+' : '-'}{Number(e.amount).toLocaleString()}
                </span>
                <button className="nm-btn btn-danger" onClick={() => delMutation.mutate(e.id)} style={{ fontSize: '10px', padding: '2px 8px' }}>del</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
