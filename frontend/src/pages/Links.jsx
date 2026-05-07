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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-white text-2xl font-bold">Links</h1>
      <div className="space-y-2">
        <input
          className="w-full bg-gray-800 text-white px-3 py-2 rounded"
          placeholder="Title (optional)"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded"
            placeholder="https://..."
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded" onClick={add}>Add</button>
        </div>
      </div>
      <div className="space-y-2">
        {links.map(l => (
          <div key={l.id} className="bg-gray-900 rounded-lg p-4 text-white flex justify-between items-center">
            <a href={l.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
              {l.title || l.url}
            </a>
            <button className="text-red-400 text-sm" onClick={() => del(l.id)}>del</button>
          </div>
        ))}
      </div>
    </div>
  )
}
