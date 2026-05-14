import { useEffect, useState } from 'react'
import api from '../api/client'

const today = () => new Date().toISOString().split('T')[0]
const MOODS = [
  { val: 5, label: '◆', color: 'var(--success)' },
  { val: 4, label: '◆', color: 'var(--accent2)' },
  { val: 3, label: '◆', color: 'var(--warn)' },
  { val: 2, label: '◆', color: 'var(--danger)' },
  { val: 1, label: '◆', color: 'var(--dim)' },
]

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({ content: '', mood: 3 })
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/logs').then(r => {
    const journal = r.data.filter(l => l.action === 'journal').reverse()
    setEntries(journal)
  })

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.content.trim() || saving) return
    setSaving(true)
    await api.post('/logs', {
      action: 'journal',
      detail: JSON.stringify({ content: form.content, mood: form.mood, date: today() })
    })
    setForm({ content: '', mood: 3 })
    setSaving(false)
    load()
  }

  const parseDetail = (detail) => { try { return JSON.parse(detail) } catch { return { content: detail, mood: 3 } } }

  const moodColor = (m) => MOODS.find(x => x.val === m)?.color || 'var(--dim)'

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {today()} · {entries.length} entries
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Journal<span style={{ color: 'var(--success)' }}>.</span>
        </h1>
      </div>

      <div className="nm-card fade-up fade-up-1" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>▸ today</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {MOODS.map(m => (
            <button key={m.val} onClick={() => setForm(f => ({ ...f, mood: m.val }))} style={{
              fontSize: '20px', color: form.mood === m.val ? m.color : 'var(--border2)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px',
              transition: 'color 0.15s', transform: form.mood === m.val ? 'scale(1.3)' : 'scale(1)',
            }}>{m.label}</button>
          ))}
          <span style={{ fontSize: '10px', color: 'var(--dim)', alignSelf: 'center', marginLeft: '4px' }}>
            {['', 'rough', 'meh', 'okay', 'good', 'great'][form.mood]}
          </span>
        </div>
        <textarea className="nm-input" placeholder="what's on your mind..." rows={4}
          value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          style={{ width: '100%', resize: 'vertical', marginBottom: '8px' }} />
        <button className="nm-btn btn-primary" onClick={save} disabled={saving}>
          {saving ? '...' : '↑ save entry'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entries.length === 0 && (
          <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
            no entries yet — write your first one above
          </div>
        )}
        {entries.map((e, i) => {
          const d = parseDetail(e.detail)
          return (
            <div key={e.id} className="nm-card fade-up" style={{ animationDelay: `${i * 0.04}s`, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.06em' }}>{d.date || e.created_at?.slice(0, 10)}</span>
                <span style={{ fontSize: '16px', color: moodColor(d.mood) }}>◆</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{d.content}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
