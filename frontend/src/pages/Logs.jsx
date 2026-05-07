import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Logs() {
  const [logs, setLogs] = useState([])

  useEffect(() => { api.get('/logs').then(r => setLogs(r.data)) }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-white text-2xl font-bold">Logs</h1>
      <div className="space-y-2">
        {logs.map(l => (
          <div key={l.id} className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300 flex gap-4">
            <span className="text-gray-500 shrink-0">{l.created_at}</span>
            <span>{l.message}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-500 text-sm">ยังไม่มี log</p>}
      </div>
    </div>
  )
}
