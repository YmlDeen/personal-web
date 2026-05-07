import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [counts, setCounts] = useState({ notes: 0, tasks: 0, links: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/notes'),
      api.get('/tasks'),
      api.get('/links'),
    ]).then(([n, t, l]) => {
      setCounts({ notes: n.data.length, tasks: t.data.length, links: l.data.length })
    })
  }, [])

  const cards = [
    { label: 'Notes', count: counts.notes, color: 'bg-indigo-600' },
    { label: 'Tasks', count: counts.tasks, color: 'bg-emerald-600' },
    { label: 'Links', count: counts.links, color: 'bg-amber-600' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-white text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4 text-white`}>
            <p className="text-3xl font-bold">{c.count}</p>
            <p className="text-sm">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
