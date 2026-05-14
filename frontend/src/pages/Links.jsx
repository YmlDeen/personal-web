import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client.js'

const CATEGORIES = ['All', 'AI Tools', 'Dev Tools', 'Android', 'iOS', 'Social', 'Videos', 'News', 'Reference', 'Tools', 'Other']

// ─── API ─────────────────────────────────────────────────────────────────────

const fetchLinks  = () => api.get('/links').then(r => r.data)
const scrapeUrl   = (url) => api.post('/links/scrape', { url }).then(r => r.data)
const postLink    = (data) => api.post('/links', data).then(r => r.data)
const putLink     = ({ id, ...data }) => api.put(`/links/${id}`, data).then(r => r.data)
const removeLink  = (id) => api.delete(`/links/${id}`).then(r => r.data)

// ─── Component ───────────────────────────────────────────────────────────────

export default function Links() {
  const qc = useQueryClient()
  const { data: links = [], isLoading } = useQuery({ queryKey: ['links'], queryFn: fetchLinks })

  const [url, setUrl]         = useState('')
  const [scraping, setScraping] = useState(false)
  const [draft, setDraft]     = useState(null)   // { title, url, description, category, tags, favicon, image }
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const addMutation = useMutation({
    mutationFn: postLink,
    onSuccess: () => { qc.invalidateQueries(['links']); setDraft(null); setUrl(''); setShowForm(false) },
  })

  const toggleFav = useMutation({
    mutationFn: ({ id, favorite }) => putLink({ id, favorite }),
    onSuccess: () => qc.invalidateQueries(['links']),
  })

  const delMutation = useMutation({
    mutationFn: removeLink,
    onSuccess: () => qc.invalidateQueries(['links']),
  })

  // ─── Scrape ───────────────────────────────────────────────────────────────

  async function handleScrape() {
    if (!url.trim()) return
    setScraping(true)
    try {
      const meta = await scrapeUrl(url.trim())
      setDraft({ ...meta, url: url.trim() })
    } catch {
      setDraft({ title: '', url: url.trim(), description: '', category: 'Other', tags: [], favicon: '', image: '' })
    } finally {
      setScraping(false)
    }
  }

  function handleAdd() {
    if (!draft?.title || !draft?.url) return
    addMutation.mutate(draft)
  }

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = links
    if (category !== 'All') list = list.filter(l => l.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (l.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [links, category, search])

  const favorites = filtered.filter(l => l.favorite)
  const all       = filtered.filter(l => !l.favorite)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div className="nm-label">Links</div>
          <div style={{ color: 'var(--nm-dim)', fontSize: '0.78rem', marginTop: 2 }}>
            {links.length} saved
          </div>
        </div>
        <button className="nm-btn-primary" onClick={() => setShowForm(v => !v)} style={{ fontSize: '0.85rem' }}>
          {showForm ? '✕ Close' : '+ Add'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="nm-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              className="nm-input"
              style={{ flex: 1 }}
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScrape()}
            />
            <button className="nm-btn-primary" onClick={handleScrape} disabled={scraping} style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
              {scraping ? '...' : 'Fetch'}
            </button>
          </div>

          {draft && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {draft.image && (
                <img src={draft.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display = 'none'} />
              )}
              <input
                className="nm-input"
                placeholder="Title"
                value={draft.title}
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              />
              <input
                className="nm-input"
                placeholder="Description (optional)"
                value={draft.description}
                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              />
              <select
                className="nm-input"
                value={draft.category}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {(draft.tags || []).map(t => (
                  <span key={t} className="nm-pill" style={{ fontSize: '0.72rem' }}>{t}</span>
                ))}
              </div>
              <button
                className="nm-btn-primary"
                onClick={handleAdd}
                disabled={addMutation.isPending}
                style={{ marginTop: '0.25rem' }}
              >
                {addMutation.isPending ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <input
        className="nm-input"
        placeholder="Search links..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '0.75rem', width: '100%' }}
      />

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={category === c ? 'nm-btn-primary' : 'nm-btn'}
            style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <div style={{ color: 'var(--nm-dim)', textAlign: 'center', padding: '2rem' }}>Loading...</div>}

      {/* Favorites */}
      {favorites.length > 0 && (
        <>
          <div className="nm-label" style={{ marginBottom: '0.6rem' }}>★ Favorites</div>
          <div style={gridStyle}>
            {favorites.map(link => <LinkCard key={link.id} link={link} onFav={toggleFav} onDel={delMutation} />)}
          </div>
          <div style={{ marginBottom: '1rem' }} />
        </>
      )}

      {/* All Links */}
      {all.length > 0 && (
        <>
          {favorites.length > 0 && <div className="nm-label" style={{ marginBottom: '0.6rem' }}>All Links</div>}
          <div style={gridStyle}>
            {all.map(link => <LinkCard key={link.id} link={link} onFav={toggleFav} onDel={delMutation} />)}
          </div>
        </>
      )}

      {!isLoading && filtered.length === 0 && (
        <div style={{ color: 'var(--nm-dim)', textAlign: 'center', padding: '3rem' }}>
          {search || category !== 'All' ? 'No results' : 'No links yet — add one above'}
        </div>
      )}
    </div>
  )
}

// ─── Link Card ────────────────────────────────────────────────────────────────

function LinkCard({ link, onFav, onDel }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="nm-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 100, background: 'var(--nm-bg-dark)', overflow: 'hidden', flexShrink: 0 }}>
        {link.image && !imgErr
          ? <img src={link.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {link.favicon
                ? <img src={link.favicon} alt="" style={{ width: 32, height: 32, borderRadius: 6 }} onError={e => e.target.style.display='none'} />
                : <span style={{ fontSize: '1.5rem' }}>🔗</span>
              }
            </div>
        }
        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 6, left: 6,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: '0.65rem', padding: '2px 7px',
          borderRadius: 999, fontFamily: 'var(--nm-mono)',
        }}>
          {link.category || 'Other'}
        </span>
        {/* Favorite star */}
        <button
          onClick={() => onFav.mutate({ id: link.id, favorite: !link.favorite })}
          style={{
            position: 'absolute', top: 4, right: 4,
            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
            width: 26, height: 26, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem',
          }}
        >
          {link.favorite ? '★' : '☆'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0.65rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {link.favicon && <img src={link.favicon} alt="" style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--nm-text)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {link.title}
          </span>
        </div>
        {link.description && (
          <p style={{ color: 'var(--nm-dim)', fontSize: '0.72rem', margin: 0, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {link.description}
          </p>
        )}
        {/* Tags */}
        {link.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 2 }}>
            {link.tags.slice(0, 4).map(t => (
              <span key={t} className="nm-pill" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--nm-border)', flexShrink: 0 }}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.3rem', padding: '0.45rem', color: 'var(--nm-accent)',
            textDecoration: 'none', fontSize: '0.78rem', fontWeight: 500 }}
        >
          <span>↗</span> Open
        </a>
        <div style={{ width: 1, background: 'var(--nm-border)' }} />
        <button
          onClick={() => onDel.mutate(link.id)}
          style={{ padding: '0.45rem 0.7rem', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--nm-danger)', fontSize: '0.78rem' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '0.75rem',
}
