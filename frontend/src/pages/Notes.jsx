import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState({ title: '', content: '' })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const load = () => api.get('/notes').then(r => setNotes(r.data))
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    if (editing) {
      await api.put(`/notes/${editing}`, form)
      setEditing(null)
    } else {
      await api.post('/notes', form)
    }
    setForm({ title: '', content: '' })
    setOpen(false)
    load()
  }

  const del = async id => { await api.delete(`/notes/${id}`); load() }

  const edit = n => {
    setEditing(n.id)
    setForm({ title: n.title, content: n.content })
    setOpen(true)
  }

  const cancel = () => {
    setEditing(null)
    setForm({ title: '', content: '' })
    setOpen(false)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      {/* header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {notes.length} entries
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
            Notes<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>
          {open ? '✕ close' : '+ new note'}
        </button>
      </div>

      {/* form */}
      {open && (
        <div className="card fade-up" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            ▸ {editing ? 'editing note' : 'new note'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              className="input"
              placeholder="title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="input"
              placeholder="content..."
              rows={4}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={save}>
                {editing ? '↑ update' : '↑ save'}
              </button>
              <button className="btn btn-ghost" onClick={cancel}>cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notes.length === 0 && (
          <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
            no notes yet — create one above
          </div>
        )}
        {notes.map((n, i) => (
          <div key={n.id} className={`card fade-up`} style={{ animationDelay: `${i * 0.04}s`, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.content}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button className="btn btn-ghost" onClick={() => edit(n)} style={{ padding: '4px 10px', fontSize: '11px' }}>edit</button>
                <button className="btn btn-danger" onClick={() => del(n.id)}>del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
