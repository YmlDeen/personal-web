import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')

  const load = () => api.get('/tasks').then(r => setTasks(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!title.trim()) return
    await api.post('/tasks', { title, status: 'pending' })
    setTitle('')
    load()
  }

  const toggle = async t => {
    await api.put(`/tasks/${t.id}`, { status: t.status === 'done' ? 'pending' : 'done' })
    load()
  }

  const del = async id => { await api.delete(`/tasks/${id}`); load() }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-white text-2xl font-bold">Tasks</h1>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-800 text-white px-3 py-2 rounded"
          placeholder="New task..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded" onClick={add}>Add</button>
      </div>
      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className="bg-gray-900 rounded-lg p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} className="w-4 h-4" />
              <span className={t.status === 'done' ? 'line-through text-gray-500' : ''}>{t.title}</span>
            </div>
            <button className="text-red-400 text-sm" onClick={() => del(t.id)}>del</button>
          </div>
        ))}
      </div>
    </div>
  )
}
