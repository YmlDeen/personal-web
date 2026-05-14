import { useEffect, useState } from 'react'
import api from '../api/client'

const PRESET_TAGS = ['dev', 'read', 'tool', 'ref', 'video', 'other']

export default function Links() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState({ title: '', url: '', tags: [] })
  const [filter, setFilter] = useState('')

  const load = () => api.get('/links').then(r => setLinks(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.url.trim()) return
    await api.post('/links', { title: form.title || form.url, url: form.url, tags: form.tags })
    setForm({ title: '', url: '', tags: [] })
    load()
  }

  const del = async id => { await api.delete(`/links/${id}`); load() }

  const toggleTag = (tag) => setForm(f => ({
    ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
  }))

  const domain = url => { try { return new URL(url).hostname.replace('www.', '') } catch { return url } }

  const parseTags = (raw) => { try { return JSON.parse(raw) } catch { return [] } }

  const allTags = [...new Set(links.flatMap(l => parseTags(l.tags)))]
  const filtered = filter ? links.filter(l => parseTags(l.tags).includes(filter)) : links

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {links.length} saved
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Links<span style={{ color: 'var(--warn)' }}>.</span>
        </h1>
      </div>

      <div className="nm-card fade-up fade-up-1" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input className="nm-input" placeholder="title (optional)" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="nm-input" placeholder="https://..." value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 1 }} />
            <button className="nm-btn btn-primary" onClick={add}>+ save</button>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESET_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} style={{
                fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: '4px', cursor: 'pointer',
                border: `1px solid ${form.tags.includes(tag) ? 'var(--warn)' : 'var(--border)'}`,
                background: form.tags.includes(tag) ? 'rgba(251,191,36,0.12)' : 'transparent',
                color: form.tags.includes(tag) ? 'var(--warn)' : 'var(--dim)',
                fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
              }}>{tag}</button>
            ))}
          </div>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="fade-up" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button onClick={() => setFilter('')} style={{
            fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: '4px', cursor: 'pointer',
            border: `1px solid ${!filter ? 'var(--accent)' : 'var(--border)'}`,
            background: !filter ? 'rgba(124,106,247,0.12)' : 'transparent',
            color: !filter ? 'var(--accent)' : 'var(--dim)',
            fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
          }}>all</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilter(tag === filter ? '' : tag)} style={{
              fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: '4px', cursor: 'pointer',
              border: `1px solid ${filter === tag ? 'var(--warn)' : 'var(--border)'}`,
              background: filter === tag ? 'rgba(251,191,36,0.12)' : 'transparent',
              color: filter === tag ? 'var(--warn)' : 'var(--dim)',
              fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
            }}>{tag}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.length === 0 && (
          <div style={{ color: 'var(--dim)', fontSize: '12px', padding: '24px', border: '1px dashed var(--border)', borderRadius: '2px', textAlign: 'center' }}>
            {filter ? `no links tagged "${filter}"` : 'no links saved yet'}
          </div>
        )}
        {filtered.map((l, i) => {
          const tags = parseTags(l.tags)
          return (
            <div key={l.id} className="nm-card fade-up" style={{ animationDelay: `${i * 0.04}s`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '2px', background: 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', color: 'var(--dim)', flexShrink: 0, fontWeight: 700,
              }}>{domain(l.url)[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={l.url} target="_blank" rel="noreferrer"
                  style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >{l.title || l.url}</a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--dim)' }}>{domain(l.url)}</span>
                  {tags.map(tag => (
                    <span key={tag} style={{ fontSize: '9px', color: 'var(--warn)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '3px', padding: '0px 5px', letterSpacing: '0.06em' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <button className="nm-btn btn-danger" onClick={() => del(l.id)}>del</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
