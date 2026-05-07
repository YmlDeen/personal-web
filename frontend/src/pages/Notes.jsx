import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState({ title: '', content: '' })
  const [editing, setEditing] = useState(null)

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
    load()
  }

  const del = async id => { await api.delete(`/notes/${id}`); load() }

  const edit = n => { setEditing(n.id); setForm({ title: n.title, content: n.content }) }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-white text-2xl font-bold">Notes</h1>
      <div className="space-y-2">
        <input
          className="w-full bg-gray-800 text-white px-3 py-2 rounded"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
        <textarea
          className="w-full bg-gray-800 text-white px-3 py-2 rounded"
          placeholder="Content"
          rows={3}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded" onClick={save}>
          {editing ? 'Update' : 'Add'}
        </button>
        {editing && (
          <button className="ml-2 bg-gray-700 text-white px-4 py-2 rounded" onClick={() => { setEditing(null); setForm({ title: '', content: '' }) }}>
            Cancel
          </button>
        )}
      </div>
      <div className="space-y-2">
        {notes.map(n => (
          <div key={n.id} className="bg-gray-900 rounded-lg p-4 text-white flex justify-between">
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-gray-400 text-sm">{n.content}</p>
            </div>
            <div className="space-x-2 shrink-0">
              <button className="text-indigo-400 text-sm" onClick={() => edit(n)}>edit</button>
              <button className="text-red-400 text-sm" onClick={() => del(n.id)}>del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
