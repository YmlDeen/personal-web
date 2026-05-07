import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Links() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState({ title: '', url: '' })

  const load = () => api.get('/links').then(r => setLinks(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.url.trim()) return
    await api.post('/links', form)
    setForm({ title: '', url: '' })
    load()
  }

  const del = async id => { await api.delete(`/links/${id}`); load() }

  const domain = url => {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      {/* header */}
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {links.length} saved
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Links<span style={{ color: 'var(--warn)' }}>.</span>
        </h1>
      </div>

      {/* form */}
      <div className="card fade-up fade-up-1" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            className="input"
            placeholder="title (optional)"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="input"
              placeholder="https://..."
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={add}>+ save</button>
          </div>
        </div>
      </div>

      {/* list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {links.length === 0 && (
          <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
            no links saved yet
          </div>
        )}
        {links.map((l, i) => (
          <div key={l.id} className="card fade-up" style={{ animationDelay: `${i * 0.04}s`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '2px', background: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: 'var(--dim)', flexShrink: 0, fontWeight: 700,
            }}>
              {domain(l.url)[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <a href={l.url} target="_blank" rel="noreferrer"
                style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--text)'}
              >
                {l.title || l.url}
              </a>
              <div style={{ fontSize: '11px', color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {domain(l.url)}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => del(l.id)}>del</button>
          </div>
        ))}
      </div>
    </div>
  )
}
